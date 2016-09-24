import * as events from "./events/index.js";
import { EventEmitter } from "events";
import { attachEvents } from "./utils.js";

export default class Sandwich extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = typeof canvas === "string" ? document.querySelector(canvas) : canvas;
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.layers = [];

    attachEvents(this, {
      redraw: events.redraw.sandwich
    });
  }

  redraw(rect) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.forEach(layer => {
      layer.emit("redraw-rect", rect);
    });
    this.forEach(layer => {
      layer.process(this.ctx, rect);
    });
  }

  add(layer) {
    this.layers.push(layer);
    layer.parent = this;

    return this;
  }

  addAt(layer, index) {
    this.layers.splice(index, 0, layer);
    layer.parent = this;

    return this;
  }

  get(index) {
    return this.layers[index];
  }

  indexOf(layer) {
    return this.layers.indexOf(layer);
  }

  moveLayerTo(layer, to) {
    let index = this.indexOf(layer);

    if(index !== -1) {
      this.moveFromTo(index, to);
    }

    return this;
  }

  moveLayerFromTo(fro, to) {
    let layer = this.layers.splice(fro, 1)[0];
    this.layers.splice(to, 0, layer);

    return this;
  }

  replace(old, n) {
    let index = this.indexOf(old);

    if(index !== -1) {
      removeAt(index);
      addAt(n, index);
    }

    return this;
  }

  remove(layer) {
    let index = this.indexOf(layer);

    if(index !== -1) {
      this.removeAt(index);
    }

    return this;
  }

  removeAt(index) {
    let layer = this.get(index);
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
}
