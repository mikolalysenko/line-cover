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

  ids.sort(function(a,b) {
    return (lines[a][0][0] - lines[b][0][0]) ||
           (lines[a][1][0] - lines[b][1][0])
  })

  function longestLine(ids) {
    var l2 = 0.0
    var longest = 0
    for(var i=0; i<ids.length; ++i) {
      var j = ids[i]
      var L = lines[j]
      var l2i = len2(L[0], L[1])
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

  function partitionRecursive(ids) {
    if(ids.length <= 0) {
      return
    }
    var longest = longestLine(ids)
    cover.push(longest)
    filterCover(ids, lines[longest])
    partitionRecursive(ids.slice(0, ids.length>>>1))
    partitionRecursive(ids.slice(ids.length>>>1, ids.length))
  }
  partitionRecursive(ids)

  return cover
}
