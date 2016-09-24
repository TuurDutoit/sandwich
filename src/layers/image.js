import DrawingLayer from "../layer-draw.js";
import Rectangle from "../rectangle.js";

export default class ImageLayer extends DrawingLayer {
  constructor(opts) {
    let url = URL.createObjectUrl(opts.file);
    let image = new Image();
    image.src = url;
    opts.aabb = new Rectangle(opts.x, opts.y, image.width, image.height);
    opts.bb = opts.aabb.clone();

    super(opts);

    this.file = file;
    this.url = url;
    this.image = image;
    this.angle = 0;

    this.ctx.drawImage(this.image, this.x, this.y);
  }

  moveBy(x, y) {
    let orig = this.aabb.clone();
    this.x += x;
    this.y += y;
    this.aabb.moveBy(x, y);
    this.emit("redraw", orig);
    this.emit("redraw", this.aabb);

    return this;
  }

  moveTo(x, y) {
    let diffX = x - this.x;
    let diffY = y - this.y;
    return this.moveBy(diffX, diffY);
  }
}
