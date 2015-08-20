'use strict'

module.exports = coverDistance

function hypot2(a, b) {
  return Math.pow(a,2) + Math.pow(b,2)
}

function segDistance(l2, bax, bay, bx, by, pax, pay, px, py) {
  var t = pax * bax + pay * bay
  if(t < 0) {
    return hypot2(pax, pay)
  }
  if(t > l2) {
    return hypot2(px-bx, py-by)
  }
  t /= l2
  return hypot2(t * bax - pax, t * bay - pay)
}

function coverDistance(ax0, ay0, ax1, ay1,
                       bx0, by0, bx1, by1) {
  var dx = ax1 - ax0
  var dy = ay1 - ay0
  var l2 = hypot2(dx, dy)

  var dx0 = bx0 - ax0
  var dy0 = by0 - ay0

  var dx1 = bx1 - ax0
  var dy1 = by1 - ay0

  if(l2 < 1e-8) {
    return Math.sqrt(Math.max(hypot2(dx0, dy0), hypot2(dx1, dy1)))
  }

  return Math.sqrt(Math.max(
    segDistance(l2, dx, dy, ax1, ay1, dx0, dy0, bx0, by0) ,
    segDistance(l2, dx, dy, ax1, ay1, dx1, dy1, bx1, by1)
  ))
}
