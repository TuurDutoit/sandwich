import Layer from "./layer.js";
import * as scratch from "./scratch.js";

export default class DrawingLayer extends Layer {
  constructor(w, h, aabb) {
    super(w, h, aabb);
    this.ctx = scratch.get(w, h);
    this.cache = scratch.get(w, h);
    this.cacheValid = false;
    this.scalable = false;
  }

  draw(ctx, rect) {
    //DBG "drawing"
    let overlap = this.aabb.overlap(rect);
    //DBG "overlap:", overlap

    if(this.active) {
      //DBG "layer is active; bypassing cache"
      this.drawDirect(ctx, overlap);
    }
    else {
      if(!this.cacheValid) {
        //DBG "cache needs update"
        this.updateCache();
      }
      /*DBG else { console.log("cache is OK"); }*/

      this.drawFromCache(ctx, overlap);
    }

    overlap.release();
  }

  drawFromCache(ctx, o) {
    //DBG "drawing from cache"
    ctx.drawImage(this.cache.canvas, o.x, o.y, o.w, o.h, o.x, o.y, o.w, o.h);
  }

  drawDirect(ctx, o) {
    //DBG "drawing directly on target"
    let src = this.ctx;

    if(this.masks.size()) {
      //DBG "masked"
      src = this.masks.getContext();
      src.drawImage(this.ctx.canvas, 0, 0);
    }
    /*DBG else { console.log("not masked"); }*/

    ctx.drawImage(src.canvas, o.x, o.y, o.w, o.h, o.x, o.y, o.w, o.h);
  }

  updateCache() {
    //DBG "update cache"
    let src = this.ctx;

    if(this.masks.size()) {
      //DBG "masked"
      src = this.masks.getContext();
      src.drawImage(this.ctx.canvas, 0, 0);
    }
    /*DBG else { console.log("not masked"); }*/

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
