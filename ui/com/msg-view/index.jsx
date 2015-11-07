'use babel'
import React from 'react'
import mlib from 'ssb-msgs'
import { MsgLink, UserLink, UserLinks, UserPic, NiceDate, VerticalFilledContainer } from '../index'
import { Block as BlockContent, Inline as InlineContent } from '../msg-content'
import { isaReplyTo } from '../../lib/msg-relation'
import Composer from '../composer'
import DropdownBtn from '../dropdown'
import app from '../../lib/app'
import u from '../../lib/util'

const FLAG_DROPDOWN = [
  { value: 'spam',  label: <span><i className="fa fa-flag" /> Spam</span> },
  { value: 'abuse', label: <span><i className="fa fa-flag" /> Abuse</span> },
]
const UNFLAG_DROPDOWN = [
  { value: 'unflag',  label: <span><i className="fa fa-times" /> Unflag</span> }
]

function getUpvotes (msg) {
  if (!msg.votes) return []
  return Object.keys(msg.votes).filter(k => (msg.votes[k] === 1))
}

class DigBtn extends React.Component {
  onClick(e) {
    e.stopPropagation()
    this.props.onClick()
  }
  render() {
    let label = this.props.isUpvoted ? 'Dug it' : 'Dig it'
    return <a className={'vote'+(this.props.isUpvoted?' selected':'')} title={label} onClick={this.onClick.bind(this)}>
      <i className="fa fa-hand-peace-o" /> {label}
    </a>
  }
}

export class MsgView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { collapsed: false }
  }
  componentDidMount() {
    this.setState({ collapsed: this.props.msg.isRead && !this.props.forceOpen })
  }
  onToggleCollapsed() {
    this.setState({ collapsed: !this.state.collapsed })
  }

  renderCollapsed() {
    const msg = this.props.msg
    return <div className="msg-view-collapsed" onClick={this.onToggleCollapsed.bind(this)}>
      <div className="avatar"><UserPic id={msg.value.author} /></div>
      <div className="content">
        <div className="col">{u.getName(msg.value.author)}</div>
        <div className="col"><InlineContent msg={msg} forceRaw={this.props.forceRaw} /></div>
      </div>
    </div>
  }

  renderExpanded() {
    let msg = this.props.msg
    let recps = mlib.links(msg.value.content.recps).map(recp => u.getName(recp.link))
    let upvoters = getUpvotes(this.props.msg)
    let isUpvoted = msg.votes[app.user.id] > 0
    let isDownvoted = msg.votes[app.user.id] < 0
    return <div className="msg-view">
      <div className="avatar"><UserPic id={msg.value.author} /></div>
      <div className="content">
        <div className="header" onClick={this.onToggleCollapsed.bind(this)}>
          <div>
            <UserLink id={msg.value.author} />{' '}
            { msg.plaintext ?
              <span style={{color: '#aaa'}}>public</span> :
              (recps && recps.length) ?
                <span style={{color: '#aaa'}}>to {recps.join(', ')}</span> :
                <span style={{color: '#aaa'}}><i className="fa fa-lock" /></span>}
          </div>
          <div><NiceDate ts={msg.value.timestamp} /></div>
        </div>
        <div className="body">
          {this.props.forceRaw ? <div>{msg.key}</div> : ''}
          <BlockContent msg={msg} forceRaw={this.props.forceRaw} />
        </div>
        <div className="signallers">
          <DigBtn onClick={()=>this.props.onToggleStar(msg)} isUpvoted={isUpvoted} />
          <DropdownBtn className="flag" items={isDownvoted ? UNFLAG_DROPDOWN : FLAG_DROPDOWN} right onSelect={(reason)=>this.props.onFlag(msg, reason)}><i className="fa fa-flag" /></DropdownBtn>
        </div>
        <div className="signals">
          { upvoters.length ? <div className="upvoters"><i className="fa fa-hand-peace-o"/> by <UserLinks ids={upvoters}/></div> : ''}
        </div>
      </div>
    </div>
  }

  render() {
    if (this.props.msg.value.content.type !== 'post')
      return this.renderCollapsed()
    if (this.state.collapsed)
      return this.renderCollapsed()
    return this.renderExpanded()
  }
}

export class Thread extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      thread: null,
      forceRaw: false,
      msgs: []
    }
    this.liveStream = null
  }

  // helper to do setup on thread-change
  constructState(thread) {
    // collapse thread into a flat message-list
    var added = new Set()
    this.setState({
      thread: thread,
      isReplying: (this.state.thread && thread.key === this.state.thread.key) ? this.state.isReplying : false,
      msgs: [thread].concat((thread.related||[]).filter(msg => {
        if (added.has(msg.key)) return false // messages can be in the thread multiple times if there are >1 links
        added.add(msg.key)
        return true
        /*added.add(msg.key)
        return (msg.value.content.type == 'post') && isaReplyTo(msg, thread)*/
      }))
    })
  }
  componentDidMount() {
    this.constructState(this.props.thread)
    // listen for new replies
    if (this.props.live) {
      pull(
        // listen for all new messages
        (this.liveStream = app.ssb.createLogStream({ live: true, gt: Date.now() })),
        // decrypt (as needed)
        pull.asyncMap((msg, cb) => { u.decryptThread(msg, () => { cb(null, msg) }) }),
        // read...
        pull.drain((msg) => {
          var c = msg.value.content
          var root = mlib.lib(c.root, 'msg')
          // reply post to this thread?
          if (c.type == 'post' && root && root.link === this.props.thread.key) {
            // add to thread and flatlist
            this.state.msgs.push(msg)
            this.state.thread.related = (this.state.thread.related||[]).concat(msg)
            this.setState({ thread: this.state.thread, msgs: this.state.msgs })
          }
        })
      )
    }
  }
  componentWillReceiveProps(newProps) {
    this.constructState(newProps.thread)
  }
  componentWillUnmount() {
    // abort the livestream
    if (this.liveStream)
      this.liveStream(true, ()=>{})
  }

  toggleRaw() {
    this.setState({ forceRaw: !this.state.forceRaw })
  }

  onSend(msg) {
    if (this.props.onNewReply)
      this.props.onNewReply(msg)
  }

  onSelectRoot() {
    let thread = this.props.thread
    let threadRoot = mlib.link(thread.value.content.root, 'msg')
    u.getPostThread(threadRoot.link, (err, thread) => this.props.onSelect(thread, true))
  }

  render() {
    let thread = this.props.thread
    let threadRoot = mlib.link(thread.value.content.root, 'msg')
    let forceRaw = this.state.forceRaw||this.props.forceRaw
    return <div className="msg-view-thread">
      <VerticalFilledContainer>
        <div className="toolbar flex">
          <a className="btn" onClick={this.props.onDeselect} title="Close"><i className="fa fa-close" /> Close</a>
          <a className="btn" onClick={this.props.onMarkSelectedUnread} title="Mark Unread"><i className="fa fa-eye-slash" /> Mark Unread</a>
          <a className={'btn'+(thread.isBookmarked?' highlighted':'')} onClick={this.props.onToggleSelectedBookmark} title="Save">
            { thread.isBookmarked ?
              <span><i className="fa fa-bookmark" /> Saved</span> :
              <span><i className="fa fa-bookmark-o" /> Save</span> }
          </a>
          <a className={'btn'+(this.state.forceRaw?' highlighted':'')} onClick={this.toggleRaw.bind(this)} title="View Raw Data"><i className="fa fa-code" /></a>
        </div>
        <div className="items">
          { threadRoot ? <div className="rootlink"><a onClick={this.onSelectRoot.bind(this)}>Replies to ↰</a></div> : '' }
          { this.state.msgs.map((msg, i) => {
            let forceOpen = (i === 0)
            return <MsgView key={msg.key} msg={msg} forceRaw={forceRaw} forceOpen={forceOpen} onToggleStar={()=>this.props.onToggleStar(msg)} onFlag={(msg, reason)=>this.props.onFlag(msg, reason)} />
          }) }
          <Composer key={thread.key} thread={thread} onSend={this.onSend.bind(this)} />
        </div>
      </VerticalFilledContainer>
    </div>
  }
}