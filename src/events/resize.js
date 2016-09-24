import * as scratch from "../scratch.js";

export function layerMasks(w, h, x, y) {
  this.masks.emit("resize", w, h, x, y);
}

export function masks(w, h, x, y) {
  this.masks.forEach(mask => {
    mask.emit("resize", w, h, x, y);
  });
}

export function position(w, h, x, y) {
  this.aabb.moveBy(x, y);
}

export function ctx(w, h, x, y) {
  let old = this.ctx;
  this.ctx = scratch.get(w, h);
  this.ctx.drawImage(old.canvas, x, y);
  old.release();
}

export function cache(w, h, x, y) {
  let old = this.cache;
  this.cache = scratch.get(w, h);
  this.cache.drawImage(old.canvas, x, y);
  old.release();
}
