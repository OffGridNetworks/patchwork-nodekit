'use babel'
import React from 'react'
import app from './lib/app'
import LeftNav from './views/leftnav'
import ComposerSidePanel from './views/composer-sidepanel'
import { SetupModal, FABComposerModal } from './com/modals'
import FAB from './com/fab'
import Notifications from './com/msg-list/notifications'

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.buildState()

    // listen for app change-events that should update our state
    app.on('update:all', () => { this.setState(this.buildState()) })
    app.on('update:isComposerOpen', () => { this.setState(this.buildState()) })
    app.on('update:isWifiMode', () => { this.setState(this.buildState()) })
    app.on('modal:setup', (isOpen) => this.setState({ setupIsOpen: isOpen }))
  }
  componentWillReceiveProps() {
    // update state on view changes
    app.fetchLatestState()
  }
  buildState() {
    // copy over app state
    return {
      isWifiMode: app.isWifiMode,
      user: app.user,
      users: app.users,
      setupIsOpen: app.user.needsSetup,
      setupCantClose: app.user.needsSetup,
      isComposerOpen: app.isComposerOpen
    }
  }
  toggleComposerOpen() {
    app.isComposerOpen = !app.isComposerOpen
    app.emit('update:isComposerOpen', app.isComposerOpen)
  }
  
  render() {
    const composing = this.state.isComposerOpen
    return <div className="layout-rows">
      <SetupModal isOpen={this.state.setupIsOpen} cantClose={this.state.setupCantClose} />
      { composing ?
        <FAB className="expanded gray" onClick={this.toggleComposerOpen.bind(this)}>Close</FAB> :
        <FAB icon="pencil" onClick={this.toggleComposerOpen.bind(this)} /> }
      <div className="layout-columns">
        <LeftNav
          location={this.props.location.pathname}
          isWifiMode={this.state.isWifiMode}
          userid={this.state.user.id}
          names={this.state.users.names}
          friends={this.state.user.friends}
          following={this.state.user.nonfriendFolloweds}
          followers={this.state.user.nonfriendFollowers} />
        <div id="mainview">{this.props.children}</div>
        <div id="rightnav"><Notifications /></div>
      </div>
      <ComposerSidePanel isOpen={this.state.isComposerOpen} />
    </div>
  }
}