import DrawingLayer from "../src/layer-draw.js";
import Mask from "../src/mask.js";
import Sandwich from "../src/sandwich.js";
import Rectangle from "../src/rectangle.js";

export class TestLayer extends DrawingLayer {
  constructor(color) {
    let rect = new Rectangle(10, 10, 50, 50);
    super(300, 150, rect);

    this.ctx.fillStyle = color || "black";
    this.ctx.fillRect(10, 10, 50, 50);
  }
}

export class TestMask extends Mask {
  constructor() {
    super();
    this.ctx.fillRect(0, 0, 25, 25);
  }
}

export class TestLayerWithMask extends TestLayer {
  constructor(color) {
    super(color);
    this.masks.add(new TestMask());
  }
}

export class TestSandwich extends Sandwich {
  constructor($canvas) {
    super($canvas)
    let layer = new TestLayer();
    let masked = new TestLayerWithMask("green");
    this.addLayer(layer).addLayer(masked);
  }
}
