import { TestLayer, TestMask, TestLayerWithMask, TestSandwich } from "./classes.js";
import { Tests } from "./framework.js";
import Rectangle from "../src/rectangle.js";
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
