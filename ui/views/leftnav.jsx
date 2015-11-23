'use babel'
import React from 'react'
import { Link } from 'react-router'
import { verticalFilled } from '../com'
import Issues from '../com/issues'
import { InviteModalBtn } from '../com/modals'
import u from '../lib/util'

class NavLink extends React.Component {
  render() {
    var selected = (this.props.to === this.props.location)
    let content = this.props.children
    if (!content)
      content = <span><i className={'fa fa-'+this.props.icon} /> {this.props.label} {this.props.count ? ' ('+this.props.count+')' : ''}</span>
    return <Link className={'leftnav-item '+(selected?'selected':'')} to={this.props.to}>{content}</Link>
  }
}

class LeftNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = { indexCounts: app.indexCounts||{} }
    this.refreshState = () => {
      this.setState({ indexCounts: app.indexCounts })
    }
  }
  componentDidMount() {
    // setup event stream
    app.on('update:all', this.refreshState)
    app.on('update:indexCounts', this.refreshState)
  }
  componentWillUnmount() {
    // abort streams
    app.removeListener('update:all', this.refreshState)
    app.removeListener('update:indexCounts', this.refreshState)
  }

  onClickBack() {
    window.history.back()
  }

  nameOf(id) {
    return this.props.names[id] || u.shortString(id||'', 6)
  }
  render() {
    const isWifiMode = this.props.isWifiMode
    let renderProfLink = (id, name, icon) => {
      return <NavLink key={id} to={'/profile/'+encodeURIComponent(id)} location={this.props.location}>
        <i className={'fa fa-'+icon} /> {typeof name == 'string' ? name : this.nameOf(id)}
      </NavLink>
    }

    return <div id="leftnav" style={{height: this.props.height}}>

      <div className="titlebar">
        <a className="back" onClick={this.onClickBack}><span>back</span> <i className="fa fa-arrow-circle-o-left" /></a>
      </div>
      <NavLink to="/" location={this.props.location} icon="newspaper-o" label="Feed" />
      <NavLink to="/notifications" location={this.props.location} icon="rss" label="Updates" count={this.state.indexCounts.notificationsUnread} />
      <NavLink to="/inbox" location={this.props.location} icon="inbox" label="Inbox" count={this.state.indexCounts.inboxUnread} />
      <NavLink to="/bookmarks" location={this.props.location} icon="bookmark-o" label="Bookmarked" count={this.state.indexCounts.bookmarksUnread} />

      <hr/>
      <NavLink to="/profile" location={this.props.location} icon="at" label="Contacts" />
      <NavLink to="/sync" location={this.props.location} icon={isWifiMode?'wifi':'globe'} label='Network' />
      <Issues />
    </div>
  }
}
export default verticalFilled(LeftNav)
