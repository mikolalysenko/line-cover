'use strict'

module.exports = findCover

var coverDistance = require('./is-covered')

function len2(a, b) {
  return Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2)
}

function findCover(lines, h) {
  var cover = []
  var ids   = new Array(lines.length)
  for(var i=0; i<lines.length; ++i) {
    ids[i] = i
  }

  function numCovered(ids, f) {
    var count = 0
    for(var i=0; i<ids.length; ++i) {
      var j = ids[i]
      var e = lines[j]
      if(coverDistance(f[0][0], f[0][1], f[1][0], f[1][1],
                       e[0][0], e[0][1], e[1][0], e[1][1]) <= h) {
        count += 1
      }
    }
    return count
  }
  
  function longestLine(ids) {
    var l2 = 0.0
    var longest = 0
    for(var i=0; i<ids.length; ++i) {
      var j = ids[i]
      var L = lines[j]
      var l2i = numCovered(ids, L)
      if(l2i > l2) {
        l2 = l2i
        longest = j
      }
    }
    return longest
  }

  function filterCover(ids, f) {
    var ptr = 0
    for(var i=0; i<ids.length; ++i) {
      var j = ids[i]
      var e = lines[j]
      if(coverDistance(f[0][0], f[0][1], f[1][0], f[1][1],
                       e[0][0], e[0][1], e[1][0], e[1][1]) > h) {
        ids[ptr++] = j
      }
    }
    ids.length = ptr
  }

  while(ids.length > 0) {
    var longest = longestLine(ids)
    cover.push(longest)
    filterCover(ids, lines[longest])
  }

  return cover
}
