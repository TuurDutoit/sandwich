import * as scratch from "./scratch.js";
import * as events from "./events/index.js";
import {EventEmitter} from "events";
import {attachEvents} from "./utils.js";

export default class Masks extends EventEmitter {
  constructor(w, h, parent) {
    super();
    this.w = w;
    this.h = h;
    this.ctx = scratch.get(w, h);
    this.cache = scratch.get(w, h);
    this.cacheValid = false;
    this.masks = [];
    this.parent = parent;

    attachEvents(this, {
      resize: [events.resize.cache, events.resize.masks],
      redraw: events.redraw.bubble
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
