var mlib = require('ssb-msgs')
var multicb = require('multicb')
var EventEmitter = require('events').EventEmitter
var threadlib = require('patchwork-threads')

// helper to get the most reliable timestamp for a message
// - stops somebody from boosting their ranking (accidentally, maliciously) with a future TS
// - applies only when ordering by most-recent
module.exports.ts = function (msg) {
  return Math.min(msg.received, msg.value.timestamp)
}

module.exports.nonEmptyStr = function (str) {
  return (typeof str === 'string' && !!(''+str).trim())
}

// allow A-z0-9._-, dont allow a trailing .
var badNameCharsRegex = /[^A-z0-9\._-]/g
module.exports.makeNameSafe = function (str) {
  str = str.replace(badNameCharsRegex, '_')
  if (str.charAt(str.length - 1) == '.')
    str = str.slice(0, -1) + '_'
  return str
}

module.exports.index = function (name) {
  var index = new EventEmitter()
  index.name = name
  index.rows = []
  index.lastAccessed = Date.now()

  index.touch = function () {
    index.lastAccessed = Date.now()
  }

  index.sortedInsert = function (ts, key) {
    var row = (typeof ts == 'object') ? ts : { ts: ts, key: key }
    for (var i=0; i < index.rows.length; i++) {
      if (index.rows[i].ts < row.ts) {
        index.rows.splice(i, 0, row)
        index.emit('add', row)
        return row
      }
    }
    index.rows.push(row)
    index.emit('add', row)
    return row
  }

  index.sortedUpsert = function (ts, key) {
    var i = index.indexOf(key)
    if (i !== -1) {
      // readd to index at new TS
      if (index.rows[i].ts < ts) {
        var row = index.rows[i]
        // remove from old position
        index.rows.splice(i, 1)
        // update values
        row.ts = ts
        // reinsert
        index.sortedInsert(row)
        return row
      } else
        return index.rows[i]
    } else {
      // add to index
      return index.sortedInsert(ts, key)
    }
  }

  index.remove = function (key, keyname) {
    var i = index.indexOf(key, keyname)
    if (i !== -1)
      index.rows.splice(i, 1)
  }

  index.indexOf = function (key, keyname) {
    keyname = keyname || 'key'
    for (var i=0; i < index.rows.length; i++) {
      if (index.rows[i][keyname] === key)
        return i
    }
    return -1
  }

  index.find = function (key, keyname) {
    var i = index.indexOf(key, keyname)
    if (i !== -1)
      return index.rows[i]
    return null
  }

  index.contains = function (key) {
    return index.indexOf(index, key) !== -1
  }

  index.filter = index.rows.filter.bind(index.rows)

  // helper to count # of messages that are new
  index.countUntouched = function () {
    // iterate until we find a ts older than lastAccessed, then return that #
    for (var i=0; i < index.rows.length; i++) {
      if (index.rows[i].ts < index.lastAccessed)
        return i
    }
    return 0
  }

  return index
}

module.exports.getThreadHasUnread = function (sbot, msg, cb) {
  threadlib.getParentPostSummary(sbot, msg, { isRead: true }, function (err, thread) {
    if (err) return cb(err)
    cb(err, thread.hasUnread)
  })
}