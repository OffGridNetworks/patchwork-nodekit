'use babel'
import React from 'react'
import pull from 'pull-stream'
import mlib from 'ssb-msgs'
import { LocalStoragePersistedComponent } from '../com'
import LeftNav from '../com/leftnav'
import DropdownBtn from '../com/dropdown'
import MsgList from '../com/msg-list'
import Card from '../com/msg-view/card'
import Oneline from '../com/msg-view/oneline'
import Summary from '../com/msg-view/summary'
import app from '../lib/app'

const LISTITEMS = [
  { label: <span><i className="fa fa-list"/> View: Inline</span>, Component: Card },
  { label: <span><i className="fa fa-list"/> View: Large</span>, Component: Summary },
  { label: <span><i className="fa fa-list"/> View: Compact</span>, Component: Oneline }
]
const LISTITEM_CARD = LISTITEMS[0]
const LISTITEM_ONELINE = LISTITEMS[1]

export default class Inbox extends LocalStoragePersistedComponent {
  constructor(props) {
    super(props, 'msgList', {
      currentMsgView: 0
    })
  }

  cursor (msg) {
    if (msg)
      return [msg.value.timestamp, msg.value.author]
  }

  onSelectMsgView(v, index) {
    this.setState({ currentMsgView: index })
  }

  onMarkAllRead() {
    alert('todo')    
  }

  render() {
    const listItem = LISTITEMS[this.state.currentMsgView]
    const ListItem = listItem.Component

    const Toolbar = props => {    
      return <div className="flex light-toolbar">
        <div className="flex-fill"/>
        <a onClick={this.onMarkAllRead.bind(this)}><i className="fa fa-check-square" /> Mark All Read</a>
        <DropdownBtn items={LISTITEMS} right onSelect={this.onSelectMsgView.bind(this)}>{listItem.label}</DropdownBtn>
      </div>
    }

    // composer composerProps={{placeholder: 'Write a new private message'}}
    return <div id="inbox">
      <MsgList
        ref="list"
        threads
        dateDividers
        Hero={Toolbar}
        ListItem={ListItem} listItemProps={{ userPic: true }}
        LeftNav={LeftNav} leftNavProps={{location: this.props.location}}
        live={{ gt: [Date.now(), null] }}
        emptyMsg="Your inbox is empty."
        source={app.ssb.patchwork.createInboxStream}
        cursor={this.cursor} />
    </div>
  }
}