'use babel'
import React from 'react'
import { findDOMNode } from 'react-dom'
import moment from 'moment'
import { Link } from 'react-router'
import Modal from 'react-modal'
import xtend from 'xtend'
import app from '../lib/app'
import u from '../lib/util'

export class UserLink extends React.Component {
  render() {
    var name = app.users.names[this.props.id] || u.shortString(this.props.id, 6)
    return <Link to={'/profile/'+encodeURIComponent(this.props.id)} className="user-link" title={name}>{name}</Link>
  }
}

export class MsgLink extends React.Component {
  render() {
    return <Link to={'/msg/'+encodeURIComponent(this.props.id)}>{this.props.name||this.props.id}</Link>
  }
}

export class BlobLink extends React.Component {
  render() {
    return <Link to={'/webview/'+encodeURIComponent(this.props.id)}>{this.props.name||this.props.id}</Link>
  }
}

export class UserLinks extends React.Component {
  render() {
    let n = this.props.ids.length
    return <span>
      {this.props.ids.map((id, i) => {
        let isLast = (i === n-1)
        return <span key={id} ><UserLink id={id} />{isLast ? '' : ', '}</span>
      })}
    </span>
  }
}

export class UserPic extends React.Component {
  render() {
    var name = app.users.names[this.props.id] || u.shortString(this.props.id, 6)
    return <Link to={'/profile/'+encodeURIComponent(this.props.id)} className="user-pic" title={name}>
      <img src={u.profilePicUrl(this.props.id)} />
    </Link>
  }
}

export class ModalBtn extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isOpen: false }
    this.on = {
      open: () => { this.setState({ isOpen: true }) },
      close: () => { this.setState({ isOpen: false }) }
    }
  }
  render() {
    let modalStyle = xtend({
      overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(255, 255, 255, 0.75)',
        zIndex            : 1000
      },
      content : {
        position                   : 'absolute',
        top                        : '40px',
        left                       : '40px',
        right                      : '40px',
        bottom                     : '40px',
        border                     : '1px solid #ccc',
        background                 : '#fff',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '20px'
      }
    }, this.props.modalStyle)
    let children = this.renderModal ? this.renderModal() : this.props.children
    return <a onClick={this.on.open} className={this.props.className}>
      {this.label || this.props.label}
      <Modal isOpen={this.state.isOpen} onRequestClose={this.on.close} style={modalStyle}>{children}</Modal>
    </a>
  }
}

const startOfDay = moment().startOf('day')
const lastWeek = moment().subtract(1, 'weeks')
const lastYear = moment().subtract(1, 'years')
export class NiceDate extends React.Component {
  render() {
    var d = moment(this.props.ts)
    if (d.isBefore(lastYear))
      d = d.format('')
    else if (d.isBefore(lastWeek))
      d = d.format('MMM D')
    else if (d.isBefore(startOfDay))
      d = d.format('ddd h:mma')
    else
      d = d.format('h:mma')
    return <span>{d}</span>
  }
}

// higher-order component, adds vertical-filling behavior (take all vertical space possible)
export function verticalFilled (Component) {
  const VerticalFilledCom = React.createClass({
    getInitialState() {
      return { height: window.innerHeight }
    },
    componentDidMount() {
      this.calcHeight()
      this.resizeListener = this.calcHeight
      window.addEventListener('resize', this.resizeListener)
    },
    componentWillUnmount() {
      window.removeEventListener('resize', this.resizeListener)
    },
    calcHeight() {
      var height = window.innerHeight
      if (this.refs && this.refs.el) {
        var rect = findDOMNode(this.refs.el).getClientRects()[0]
        if (!rect)
          return
        height = window.innerHeight - rect.top
      }
      this.setState({ height: height })
    },
    render() {
      return <Component ref="el" {...this.props} {...this.state} />
    }
  })
  return VerticalFilledCom;
}
class _VerticalFilledContainer extends React.Component {
  render() {
    return <div {...this.props} style={{height: this.props.height, overflow: 'auto'}}>{this.props.children||''}</div>
  }
}
export var VerticalFilledContainer = verticalFilled(_VerticalFilledContainer)