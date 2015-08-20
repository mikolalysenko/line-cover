'use strict'

var vec2 = require('vec2')
var segment2 = require('segment2')
var mouseChange = require('mouse-change')
var fit = require('canvas-fit')
var coverDistance = require('../is-covered')

var ALGORITHMS = {
  'Dumb O(n)': function(lines) {
    var ids = new Array(lines.length)
    for(var i=0; i<lines.length; ++i) {
      ids[i] = i
    }
    return ids
  },
  'Divide & conquer O(n log n)': require('../random-longest'),
  'Greedy, longest O(n^2)': require('../greedy-longest'),
  'Greedy, max cover O(n^3)': require('../greedy-max-cover')
}

//Create canvas and context
var canvas = document.createElement('canvas')
var context = canvas.getContext('2d')
document.body.appendChild(canvas)
window.addEventListener('resize', fit(canvas), false)

var optionDiv = document.createElement('div')
optionDiv.style.position = 'absolute'
optionDiv.style.left = '5px'
optionDiv.style.top = '5px'
optionDiv.style.width = '30%'
optionDiv.style['z-index'] = '10'
document.body.appendChild(optionDiv)

var numEdgeDiv = document.createElement('p')

var NUM_EDGES = 50

var ALGORITHM   = ALGORITHMS[Object.keys(ALGORITHMS)[0]]
var SCALE       = 0.1
var edges       = [[[0,Math.random()], [Math.random()/NUM_EDGES,Math.random()]]]
var cover       = []

for(var i=1; i<NUM_EDGES; ++i) {
  var e0 = edges[i-1][1]
  var x0 = e0[0]
  var y0 = e0[1]
  var x1 = (i+Math.random()) / NUM_EDGES
  var y1 = Math.random()
  edges.push([[x0,y0], [x1,y1]])
}

function dataChanged() {
  cover = ALGORITHM(edges, SCALE)
  numEdgeDiv.innerHTML = 'cover size: ' + cover.length
}

dataChanged()

var scaleSlider = document.createElement('input')
scaleSlider.type = 'range'
scaleSlider.min  = 0
scaleSlider.max  = 1
scaleSlider.step = 0.001
scaleSlider.value = SCALE
scaleSlider.style.width = '100%'

function scaleChanged() {
  SCALE = +scaleSlider.value
  dataChanged()
}

scaleSlider.addEventListener('input', scaleChanged)
scaleSlider.addEventListener('change', scaleChanged)
var scaleP = document.createElement('p')
scaleP.appendChild(scaleSlider)
optionDiv.appendChild(scaleP)

var radioForm = document.createElement('form')
Object.keys(ALGORITHMS).forEach(function(algname, i) {
  var line = document.createElement('p')
  var button = document.createElement('input')
  button.type = 'radio'
  button.name = 'algorithm'
  button.checked = !i
  line.appendChild(button)
  button.addEventListener('change', function() {
    if(button.checked) {
      ALGORITHM = ALGORITHMS[algname]
      dataChanged()
    }
  })
  line.appendChild(document.createTextNode(algname))
  radioForm.appendChild(line)
})
optionDiv.appendChild(radioForm)


var resetButton = document.createElement('input')
resetButton.type = 'button'
resetButton.value = 'reset'
resetButton.addEventListener('click', function() {
  edges.length = 0
  dataChanged()
})
var resetP = document.createElement('p')
resetP.appendChild(resetButton)
optionDiv.appendChild(resetP)
optionDiv.appendChild(numEdgeDiv)

var description = document.createElement('p')
description.innerHTML = 'drag to add edges'
optionDiv.appendChild(description)

function edgeDistance(a, b, c) {
  var p = vec2(c[0], c[1])
  return segment2(vec2(a[0], a[1]), vec2(b[0], b[1])).closestPointTo(p).distance(p)
}

var lastButtons = 0,
  startPoint = null,
  highlightEdge = -1,
  activeEdge = null
mouseChange(canvas, function(buttons, x, y) {
  var s = Math.min(canvas.width, canvas.height)
  var lx = (x - canvas.width/2)  / s + 0.5
  var ly = (y - canvas.height/2) / s + 0.5
  var closestDist = 0.0125
  highlightEdge = -1

  for(var i=0; i<edges.length; ++i) {
    var e = edges[i]
    var d2 = edgeDistance(e[0], e[1], [lx, ly])
    if(d2 < closestDist) {
      highlightEdge = i
      closestDist = d2
    }
  }

  if(!lastButtons && !!buttons) {
    if(highlightEdge >= 0) {
      edges.splice(highlightEdge, 1)
      activeEdge = null
      highlightEdge = -1
      dataChanged()
    } else {
      startPoint = [lx, ly]
      activeEdge = [ [lx, ly], [lx, ly] ]
    }
  } else if(!!lastButtons && !buttons) {
    if(activeEdge) {
      edges.push(activeEdge)
      activeEdge = null
      highlightEdge = -1
      dataChanged()
    }
  } else if(!!buttons) {
    if(activeEdge) {
      activeEdge[1] = [lx, ly]
    }
  }
  lastButtons = buttons
})

function line(a, b) {
  var x0 = a[0]-0.5
  var y0 = a[1]-0.5
  var x1 = b[0]-0.5
  var y1 = b[1]-0.5
  var w = canvas.width
  var h = canvas.height
  var s = Math.min(w, h)
  context.beginPath()
  context.moveTo(s*x0 + w/2, s*y0 + h/2)
  context.lineTo(s*x1 + w/2, s*y1 + h/2)
  context.stroke()
}

function circle(x, y, r) {
  var w = canvas.width
  var h = canvas.height
  var s = Math.min(w, h)
  context.beginPath()
  context.moveTo(s*x, s*y)
  context.arc(s*(x-0.5) + w/2, s*(y-0.5) + h/2, r, 0.0, 2.0*Math.PI)
  context.fill()
}

function capsule(a, b, radius) {

  var x0 = a[0]-0.5
  var y0 = a[1]-0.5
  var x1 = b[0]-0.5
  var y1 = b[1]-0.5
  var w = canvas.width
  var h = canvas.height
  var s = Math.min(w, h)

  x0 = s*x0 + w/2
  y0 = s*y0 + h/2
  x1 = s*x1 + w/2
  y1 = s*y1 + h/2

  var dx = x1 - x0
  var dy = y1 - y0

  var l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))

  var ox = s * dx / l * radius
  var oy = s * dy / l * radius

  var nx =  oy
  var ny = -ox

  context.beginPath()

  context.moveTo(x0+nx,y0+ny)

  context.lineTo(x1+nx,y1+ny)
  context.arcTo(x1+nx+ox,y1+ny+oy, x1+ox,y1+oy, s*radius)
  context.arcTo(x1+ox-nx,y1+oy-ny, x1-nx,y1-ny, s*radius)

  context.lineTo(x0-nx,y0-ny)
  context.arcTo(x0-nx-ox,y0-ny-oy, x0-ox,y0-oy, s*radius)
  context.arcTo(x0+nx-ox,y0+ny-oy, x0+nx,y0+ny, s*radius)

  context.fill()
}

var EDGE_PALETTE = [
  'rgba(255,0,0,0.25)',
  'rgba(0,255,0,0.25)',
  'rgba(0,0,255,0.25)',
  'rgba(255,255,0,0.25)',
  'rgba(255,0,255,0.25)',
  'rgba(0,255,255,0.25)'
]

function draw() {
  requestAnimationFrame(draw)

  var w = canvas.width
  var h = canvas.height
  context.fillStyle = '#fff'
  context.fillRect(0, 0, w, h)

  context.strokeStyle = '#aaa'
  for(var i=0; i<edges.length; ++i) {
    var e = edges[i]
    var a = e[0]
    var b = e[1]
    context.lineWidth = 1
    line(a, b)
  }

  context.fillStyle = 'rgba(0,0,255,0.1)'
  context.strokeStyle = '#000'
  for(var i=0; i<cover.length; ++i) {
    var e = edges[cover[i]]
    capsule(e[0], e[1], SCALE)
    line(e[0], e[1])
  }

  if(!!activeEdge) {
    context.strokeStyle = '#f00'
    line(activeEdge[0], activeEdge[1])
  } else if(highlightEdge >= 0) {
    var e = edges[highlightEdge]
    context.strokeStyle = '#f00'
    for(var i=0; i<edges.length; ++i) {
      var f = edges[i]
      var dist = coverDistance(e[0][0], e[0][1], e[1][0], e[1][1],
                               f[0][0], f[0][1], f[1][0], f[1][1])
      if(dist < SCALE) {
        line(f[0], f[1])
      }
    }
    context.fillStyle = 'rgba(255,0,0,0.15)'
    capsule(e[0], e[1], SCALE)
  }
}

draw()
