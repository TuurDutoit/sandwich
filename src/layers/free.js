import DrawingLayer from "../layer-draw.js";
import Rectangle from "../rectangle.js";

export default class FreeLayer extends DrawingLayer {
  constructor(opts) {
    opts.aabb = new Rectangle(0, 0, opts.w, opts.h);
    super(opts);
  }
}
