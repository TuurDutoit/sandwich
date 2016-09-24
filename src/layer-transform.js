import Layer, {events} from "./layer";
import * as scratch from "./scratch";

export default class TransformLayer extends Layer {
  constructor(w, h, x, y) {
    this.on("resize", events.resize.size);
  }

  drawMasked(ctx) {
    let copy = scratch.copy(ctx);
    this.transform(copy);

    if(this.masks.size) {
      let masked = this.masks.getContext();
      masked.drawImage(copy.canvas, 0, 0);
      ctx.drawImage(masked.canvas, 0, 0);
    }
    else {
      ctx.drawImage(copy.canvas, 0, 0);
    }
    scratch.release(copy);
  }

  transform(ctx) {
    // Not implemented
  }
}
