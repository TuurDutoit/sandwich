(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
'use strict';

var events = require('events');

const unused = [];

const get = (w, h) => {
  if(unused.length) {
    let ctx = unused.pop();
    resize(ctx, w, h);
    clear(ctx);
    return ctx;
  }
  else {
    return create(w, h);
  }
}

const create = (w, h) => {
  let canvas = document.createElement("canvas");
  canvas.width = w || 300;
  canvas.height = h || 150;
  let ctx = canvas.getContext("2d");
  ctx.release = () => {
    release(ctx);
  }

  return ctx;
}

const release = ctx => {
  unused.push(ctx);
}

const resize = (ctx, w, h) => {
  ctx.canvas.width = w;
  ctx.canvas.height = h;
}

const clear = ctx => {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(ctx.canvas.width, ctx.canvas.height);
}

function layerMasks(w, h, x, y) {
  this.masks.emit("resize", w, h, x, y);
}

function masks(w, h, x, y) {
  this.masks.forEach(mask => {
    mask.emit("resize", w, h, x, y);
  });
}

function position(w, h, x, y) {
  this.aabb.moveBy(x, y);
}

function ctx(w, h, x, y) {
  let old = this.ctx;
  this.ctx = get(w, h);
  this.ctx.drawImage(old.canvas, x, y);
  old.release();
}

function cache(w, h, x, y) {
  let old = this.cache;
  this.cache = get(w, h);
  this.cache.drawImage(old.canvas, x, y);
  old.release();
}

function bubble(rect) {
  if(this.parent && this.parent.emit) {
    this.parent.emit("redraw", rect);
  }
}

function sandwich(rect) {
  this.redraw(rect);
}

function vars() {
  this.active = true;
}

function vars$1() {
  this.active = false;
}

function vars$2() {
  this.selected = true;
}

function vars$3() {
  this.selected = false;
}

const unused$1 = [];

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w;
    this.h = h;
  }

  static get(x, y, w, h) {
    if(unused$1.length) {
      return unused$1.pop().reset(x, y, w, h);
    }
    else {
      return new Rectangle(x, y, w, h);
    }
  }

  moveBy(x, y) {
    this.x += x;
    this.y += y;

    return this;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  resizeBy(w, h) {
    this.w += w;
    this.h += h;

    return this;
  }

  resizeTo(w, h) {
    this.w = w;
    this.h = h;

    return this;
  }

  moveAndResizeBy(x, y, w, h) {
    this.moveBy(x, y);
    this.resizeBy(w, h);

    return this;
  }

  moveAndResizeTo(x, y, w, h) {
    this.moveTo(x, y);
    this.resizeTo(w, h);

    return this;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.w
        && y >= this.y && y <= this.y + this.h;
  }

  containsRect(rect) {
    return this.contains(rect.x, rect.y)
        && this.contains(rect.x + rect.w, rect.y + rect.h);
  }

  touches(rect) {
    return this.x <= rect.x + rect.w
        && this.x + this.w >= rect.x
        && this.y <= rect.y + rect.h
        && this.y + this.h >= rect.y;
  }

  collides(rect) {
    return this.x < rect.x + rect.w
        && this.x + this.w > rect.x
        && this.y < rect.y + rect.h
        && this.y + this.h > rect.y;
  }

  overlap(rect, dest) {
    let x = Math.max(this.x, rect.x);
    let y = Math.max(this.y, rect.y);
    let w = Math.min(this.x + this.w, rect.x + rect.w) - x;
    let h = Math.min(this.y + this.h, rect.y + rect.h) - y;
    return dest ? dest.reset(x, y, w, h) : Rectangle.get(x, y, w, h);
  }

  clone() {
    return Rectangle.get(this.x, this.y, this.w, this.h);
  }

  copy(other) {
    other.x = this.x;
    other.y = this.y;
    other.w = this.w;
    other.h = this.h;

    return other;
  }

  reset(x, y, w, h) {
    return this.moveAndResizeTo(x, y, w, h);
  }

  release() {
    unused$1.push(this);

    return this;
  }
}

function attachEvents(obj, events) {
  let keys = Object.keys(events);
  for(let i = 0, len = keys.length; i < len; i++) {
    let event = keys[i];
    let listeners = events[event];

    if(typeof listeners === "function") {
      obj.on(event, listeners);
    }
    else {
      listeners.forEach(listener => obj.on(event, listener));
    }
  }

  return obj;
}

class Masks extends events.EventEmitter {
  constructor(w, h, parent) {
    super();
    this.w = w;
    this.h = h;
    this.ctx = get(w, h);
    this.cache = get(w, h);
    this.cacheValid = false;
    this.masks = [];
    this.parent = parent;

    attachEvents(this, {
      resize: [cache, masks],
      redraw: bubble
    });
  }

  getContext() {
    if(!this.cacheValid) {
      this.updateCache();
    }

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.cache.canvas, 0, 0);
    this.ctx.globalCompositeOperation = "source-out";

    return this.ctx;
  }

  updateCache() {
    this.masks.forEach(mask => {
      this.cache.drawImage(mask.getContext().canvas, 0, 0);
    });
  }

  add(mask) {
    this.masks.push(mask);
    mask.parent = this;
    return this;
  }

  addAt(mask, index) {
    this.masks.splice(index, 0, mask);
    mask.parent = this;

    return this;
  }

  get(index) {
    return this.masks[index];
  }

  indexOf(mask) {
    return this.masks.indexOf(mask);
  }

  moveMaskFromTo(from, to) {
    let mask = this.masks.splice(from, 1)[0];
    this.masks.splice(to, 0, mask);

    return this;
  }

  moveMaskTo(mask, to) {
    let index = this.indexOf(mask);

    if(index !== -1) {
      this.moveMaskFromTo(index, to);
    }

    return this;
  }

  replace(old, n) {
    let index = this.indexOf(old);

    if(index !== -1) {
      removeMaskAt(index);
      addMaskAt(n, index);
    }

    return this;
  }

  remove(mask) {
    let index = this.indexOf(mask);

    if(index !== -1) {
      this.removeMaskAt(index);
    }

    return this;
  }

  removeAt(index) {
    let mask = this.getMaskAt(index);
    this.masks.splice(index, 1);
    mask.parent = null;

    return this;
  }

  size() {
    return this.masks.length;
  }
}

class Layer extends events.EventEmitter {
  constructor(w, h, aabb) {
    super();
    this.aabb = aabb;
    this.blendMode = "source-over";
    this.opacity = 1;
    this.masks = new Masks(w, h, this);
    this.selected = false;
    this.active = false;

    attachEvents(this, {
      resize: [position, layerMasks],
      redraw: bubble,
      activate: vars,
      deactivate: vars$1,
      select: vars$2,
      deselect: vars$3
    });
  }

  process(ctx, rect) {
    console.log("process");
    if(this.aabb.collides(rect)) {
      console.log("needs redraw");
      ctx.globalCompositeOperation = this.blendMode;
      ctx.globalAlpha = this.opacity;
      this.draw(ctx, rect);
    }
    else {
      console.log("doesn't need redraw");
    }
  }
}

class DrawingLayer extends Layer {
  constructor(w, h, aabb) {
    super(w, h, aabb);
    this.ctx = get(w, h);
    this.cache = get(w, h);
    this.cacheValid = false;
    this.scalable = false;
  }

  draw(ctx, rect) {
    console.log("drawing");
    let overlap = this.aabb.overlap(rect);
    console.log("overlap:", overlap);

    if(this.active) {
      console.log("layer is active; bypassing cache");
      this.drawDirect(ctx, overlap);
    }
    else {
      if(!this.cacheValid) {
        console.log("cache needs update");
        this.updateCache();
      }
      else {
        console.log("cache is OK");
      }

      this.drawFromCache(ctx, overlap);
    }

    overlap.release();
  }

  drawFromCache(ctx, o) {
    console.log("drawing from cache");
    ctx.drawImage(this.cache.canvas, o.x, o.y, o.w, o.h, o.x, o.y, o.w, o.h);
  }

  drawDirect(ctx, o) {
    console.log("drawing directly on target");
    let src = this.ctx;

    if(this.masks.size()) {
      console.log("masked");
      src = this.masks.getContext();
      src.drawImage(this.ctx.canvas, 0, 0);
    }
    else {
      console.log("not masked");
    }

    ctx.drawImage(src.canvas, o.x, o.y, o.w, o.h, o.x, o.y, o.w, o.h);
  }

  updateCache() {
    console.log("update cache");
    let src = this.ctx;

    if(this.masks.size()) {
      console.log("masked");
      src = this.masks.getContext();
      src.drawImage(this.ctx.canvas, 0, 0);
    }
    else {
      console.log("not masked");
    }

    this.cache.drawImage(src.canvas, 0, 0);
    this.cacheValid = true;
  }

  invalidateCache() {
    this.cacheValid = false;
  }

  redraw(rect, invalidate) {
    if(invalidate !== false) {
      this.cacheValid = false;
    }

    this.emit("redraw", rect);
  }
}

class Mask extends events.EventEmitter {
  constructor(w, h) {
    super();
    this.w = w;
    this.h = h;
    this.ctx = get(w, h);
    this.active = false;
    this.selected = false;

    this.attachEvents({
      resize: ctx,
      redraw: bubble,
      activate: vars,
      deactivate: vars$1,
      select: vars$2,
      deselect: vars$3
    });
  }

  getContext() {
    return this.ctx;
  }

  redraw(rect) {
    this.emit("redraw", rect);
    return this;
  }

  attachEvents(events) {
    return attachEvents(this, events);
  }
}

class Sandwich extends events.EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = typeof canvas === "string" ? document.querySelector(canvas) : canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.scale = 2
    this.layers = [];

    this.attachEvents({
      redraw: sandwich
    });
  }

  redraw(rect) {
    let scaled = false;
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.forEach(layer => {
      layer.process(this.ctx, rect)
    });
  }

  addLayer(layer) {
    this.layers.push(layer);
    layer.parent = this;

    return this;
  }

  addLayerAt(layer, index) {
    this.layers.splice(index, 0, layer);
    layer.parent = this;

    return this;
  }

  getLayerAt(index) {
    return this.layers[index];
  }

  indexOf(layer) {
    return this.layers.indexOf(layer);
  }

  moveLayerTo(layer, to) {
    let index = this.indexOf(layer);

    if(index !== -1) {
      this.moveLayerFromTo(index, to);
    }

    return this;
  }

  moveLayerFromTo(from, to) {
    let layer = this.layers.splice(from, 1)[0];
    this.layers.splice(to, 0, layer);

    return this;
  }

  replaceLayer(old, n) {
    let index = this.indexOf(old);

    if(index !== -1) {
      removeLayerAt(index);
      addLayerAt(n, index);
    }

    return this;
  }

  removeLayer(layer) {
    let index = this.indexOf(layer);

    if(index !== -1) {
      this.removeLayerAt(index);
    }

    return this;
  }

  removeLayerAt(index) {
    let layer = this.getLayerAt(index);
    this.layers.splice(index, 1);
    layer.parent = null;

    return this;
  }

  size() {
    return this.layers.length;
  }

  forEach(cb, self) {
    this.layers.forEach(cb, self);

    return this;
  }

  attachEvents(events) {
    return attachEvents(this, events);
  }
}

class TestLayer extends DrawingLayer {
  constructor(color) {
    let rect = new Rectangle(10, 10, 50, 50);
    super(300, 150, rect);

    this.ctx.fillStyle = color || "black";
    this.ctx.fillRect(10, 10, 50, 50);
  }
}

class TestMask extends Mask {
  constructor() {
    super();
    this.ctx.fillRect(0, 0, 25, 25);
  }
}

class TestLayerWithMask extends TestLayer {
  constructor(color) {
    super(color);
    this.masks.add(new TestMask());
  }
}

class TestSandwich extends Sandwich {
  constructor($canvas) {
    super($canvas)
    let layer = new TestLayer();
    let masked = new TestLayerWithMask("green");
    this.addLayer(layer).addLayer(masked);
  }
}

function compare (ctx1, ctx2) {
  let data1 = ctx1.getImageData(0, 0, 100, 100).data;
  let data2 = ctx2.getImageData(0, 0, 100, 100).data;

  for(let i = 0, len = data1.length; i < len; i++) {
    if(data1[i] !== data2[i]) {
      return false;
    }
  }

  return true;
}

class Test {
  constructor(id, opts) {
    let $container = Test.createContainer(id);
    let $actual = Test.createCanvas("actual");
    let $title = Test.createTitle(opts.title);
    let $description = Test.createDescription(opts.description);
    let $goal = Test.createGoal(opts.goal);
    let $expected = Test.createCanvas("expected");
    let $results = Test.createResults();

    $results.appendChild($actual);
    $results.appendChild($expected);

    $container.appendChild($title);
    $container.appendChild($description);
    $container.appendChild($goal);
    $container.appendChild($results);

    this.id = id;
    this.logs = [];
    this._init = opts.init;
    this._test = opts.test;
    this._expected = opts.expected;
    this.title = opts.title;
    this.description = opts.description;
    this.goal = opts.goal;
    this.$container = $container;
    this.$title = $title;
    this.$description = $description;
    this.$actual = $actual;
    this.$expected = $expected;
    this.actualCtx = $actual.getContext("2d");
    this.expectedCtx = $expected.getContext("2d");
  }

  init() {
    this.state = "init";
    this._init();
    this.$container.classList.add("init");
  }

  test() {
    this.captureLogs();
    this.state = "test";

    test: {
      try {
        var res = this._test();
      }
      catch(e) {
        this.error = e;
        break test;
      }

      if(res === false) {
        this.error = new Error("Test returned false. That's all we know, please check the logs.");
        break test;
      }
      else if(res instanceof Error) {
        this.error = res;
        break test;
      }

      if(this._expected) {
        this.state = "expected";
        this._expected();
      }

      if(!compare(this.actualCtx, this.expectedCtx)) {
        this.error = new Error("Test canvas doesn't match expected. Happy bug hunting!");
      }
      else {
        this.error = null;
      }
    }

    this.success = !this.error;
    this.fail = !this.success;

    this.$container.classList.add("done");
    this.$container.classList.toggle("success", this.success);
    this.$container.classList.toggle("fail", this.fail);

    this.dontCaptureLogs();

    return this.success;
  }

  captureLogs() {
    console._log = console.log;
    console.log = (...messages) => {
      this.logs.push(messages);
      console._log.apply(console, messages);
    }
  }

  dontCaptureLogs() {
    console.log = console._log;
  }

  get ctx() {
    return this.state === "expected" ? this.expectedCtx : this.actualCtx;
  }

  get $canvas() {
    return this.state === "expected" ? this.$expected : this.$actual;
  }

  static createContainer(id) {
    let $container = document.createElement("div");
    $container.classList.add("test");
    $container.dataset.id = id;

    return $container;
  }

  static createCanvas(name) {
    let $canvas = document.createElement("canvas");
    $canvas.setAttribute("width", "100");
    $canvas.setAttribute("height", "100");
    $canvas.classList.add(name);

    return $canvas;
  }

  static createTitle(title) {
    let $title = document.createElement("h1");
    $title.classList.add("title");
    $title.textContent = title;

    return $title;
  }

  static createDescription(content) {
    let $description = document.createElement("p");
    $description.classList.add("description");
    $description.textContent = content;

    return $description;
  }

  static createGoal(content) {
    let $goal = document.createElement("p");
    $goal.classList.add("goal");
    $goal.textContent = content;

    return $goal;
  }

  static createResults() {
    let $results = document.createElement("div");
    $results.classList.add("results");

    return $results;
  }
}





class Tests {
  constructor($tests, $stats) {
    this.$tests = $tests;
    this.$stats = $stats;
    this.tests = {};
    this._id = 0;

    this.createStats();
  }

  add(opts) {
    let test = new Test(this.id(), opts);
    this.addTest(test);
  }

  addTest(test) {
    this.tests[test.id] = test;
    this.$tests.appendChild(test.$container);
    test.init();
  }

  test() {
    let passing = 0;
    let failing = 0;

    Object.keys(this.tests).forEach(id => {
      let test = this.tests[id];
      console.log("");
      console.log(test.title);
      console.log("=".repeat(test.title.length));
      let success = test.test();

      if(!success) {
        failing++;
        console.log("");
        console.log("ERROR:", test.error);
      }
      else {
        passing++;
      }
    });

    this.updateStats(passing, failing);
  }

  get(id) {
    return this.tests[id];
  }

  id() {
    return (this._id++)+"";
  }

  createStats() {
    this.$passing = this.$stats.querySelector(".passing-num");
    this.$failing = this.$stats.querySelector(".failing-num");
  }

  updateStats(passing, failing) {
    this.$passing.textContent = passing;
    this.$failing.textContent = failing;
  }
}

const $tests = document.querySelector("#tests");
const $stats = document.querySelector("#stats");
const tests = new Tests($tests, $stats);

tests.add({
  title: "Full canvas",
  description: "Call Layer.process for a redraw of the whole canvas.",
  goal: "The whole layer is drawn (because it's completely inside the canvas) and cached (it's not active).",
  init: function() {
    this.layer = new TestLayer();
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  },
  expected: function() {
    this.ctx.fillRect(10, 10, 50, 50);
  }
});

tests.add({
  title: "Corner",
  description: "Call Layer.process for a redraw of a corner of the canvas, partly outside and partly inside the layer.",
  goal: "Only a corner of the layer (20 by 20 at (10, 10)) is drawn.",
  init: function() {
    this.layer = new TestLayer();
    this.rect = new Rectangle(0, 0, 30, 30);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  },
  expected: function() {
    this.ctx.fillRect(10, 10, 20, 20);
  }
});

tests.add({
  title: "Touching edges",
  description: "Call Layer.process for a redraw of a corner of the canvas, where the edges touch, but don't overlap.",
  goal: "The layer is not drawn at all, because there is no overlap.",
  init: function() {
    this.layer = new TestLayer();
    this.rect = new Rectangle(0, 0, 10, 10);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  }
});

tests.add({
  title: "Rect contains layer",
  description: "Call Layer.process for a redraw of a rectangle that contains the whole layer.",
  goal: "The whole layer is drawn, because it is completely inside the redraw region.",
  init: function() {
    this.layer = new TestLayer();
    this.rect = new Rectangle(0, 0, 70, 70);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  },
  expected: function() {
    this.ctx.fillRect(10, 10, 50, 50);
  }
});

tests.add({
  title: "Layer contains rect",
  description: "Call Layer.process for a redraw of a rectangle that is completely inside the layer.",
  goal: "Only the part of the layer inside the Rectangle is drawn.",
  init: function() {
    this.layer = new TestLayer();
    this.rect = new Rectangle(20, 20, 10, 10);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  },
  expected: function() {
    this.ctx.fillRect(20, 20, 10, 10);
  }
});

tests.add({
  title: "Active layer",
  description: "The active layer should bypass the cache and draw to the destination directly.",
  goal: "The cache contains a green square, but ctx has a black one. Because the layer is active, the cache should be bypassed and the black square should be drawn.",
  init: function() {
    this.layer = new TestLayer();
    this.layer.active = true;
    this.layer.cache.fillStyle = "green";
    this.layer.cache.fillRect(10, 10, 50, 50);
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.layer.process(this.ctx, this.rect);
  },
  expected: function() {
    this.ctx.fillRect(10, 10, 50, 50);
  }
});

tests.add({
  title: "Redraw from Sandwich",
  description: "Start a redraw from the Sandwich object.",
  goal: "All the layers should be drawn properly.",
  init: function() {
    this.sandwich = new TestSandwich(this.$canvas);
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.sandwich.redraw(this.rect);
  },
  expected: function() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(10, 10, 50, 50);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(10, 10, 15, 15);
  }
});

tests.add({
  title: "Redraw from Layer",
  description: "Start a redraw from a Layer.",
  goal: "All the layers in the Sandwich should be drawn properly.",
  init: function() {
    this.sandwich = new TestSandwich(this.$canvas);
    this.layer = this.sandwich.layers[0];
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.layer.emit("redraw", this.rect);
  },
  expected: function() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(10, 10, 50, 50);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(10, 10, 15, 15);
  }
});

tests.add({
  title: "Redraw from Masks",
  description: "Start a redraw from a Masks object.",
  goal: "All the layers in the Sandwich should be drawn properly.",
  init: function() {
    this.sandwich = new TestSandwich(this.$canvas);
    this.masks = this.sandwich.layers[1].masks;
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.masks.emit("redraw", this.rect);
  },
  expected: function() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(10, 10, 50, 50);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(10, 10, 15, 15);
  }
});

tests.add({
  title: "Redraw from Mask",
  description: "Start a redraw from a Mask.",
  goal: "All the layers in the Sandwich should be drawn properly.",
  init: function() {
    this.sandwich = new TestSandwich(this.$canvas);
    this.mask = this.sandwich.layers[1].masks.masks[0];
    this.rect = new Rectangle(0, 0, 100, 100);
  },
  test: function() {
    this.mask.emit("redraw", this.rect);
  },
  expected: function() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(10, 10, 50, 50);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(10, 10, 15, 15);
  }
});

tests.test();
}).call(this,require('_process'))
},{"_process":3,"events":2}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
