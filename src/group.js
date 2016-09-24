import Layer, {events} from "./layer";
import * as scratch from "./scratch";

onResize = function(w, h, x, y) {
  this.layers.forEach(layer => layer.emit("resize", w, h, x, y));
}

export default class Group extends Layer {
  constructor(w, h, x, y) {
    super(w, h, x, y);
    this.layers = [];
    this.ctx = scratch.get(w, h);
    this.on("resize", onResize);
    this.on("resize", events.resize.size);
    this.on("resize", events.resize.ctx);
  }

  drawMasked(ctx) {
    drawLayers();

    if(this.masks.size) {
      let masked = this.masks.getContext();
      masked.drawImage(this.ctx.canvas, 0, 0);
      ctx.drawImage(masked.canvas, 0, 0);
    }
    else {
      ctx.drawImage(this.ctx.canvas, 0, 0);
    }
  }

  drawLayers() {
    scratch.clear(this.ctx);
    this.layers.forEach(layer => {
      layer.process(this.ctx);
    });
  }

  hit(x, y) {
    for(let i = this.layers.length - 1; i > 0; i--) {
      let hit = layers[i].hit(x, y);
      if(hit) {
        return hit;
      }
    }

    return false;
  }

  add(layer) {
    this.layers.push(layer);
    return this;
  }

  addAt(layer, index) {
    this.layers.splice(index, 0, layer);

    return this;
  }

  remove(layer) {
    let index = this.layers.indexOf(layer);
    if(index !== -1) {
      this.layers.splice(index, 1);
    }

    return this;
  }

  removeAt(index) {
    this.layers.splice(inex, 1);

    return this;
  }

  get(index) {
    return this.layers[index];
  }
}
