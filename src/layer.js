import * as events from "./events/index.js";
import Rectangle from "./rectangle.js";
import Masks from "./masks.js";
import {EventEmitter} from "events";
import {attachEvents} from "./utils.js";

export default class Layer extends EventEmitter {
  constructor(w, h, aabb) {
    super();
    this.aabb = aabb;
    this.blendMode = "source-over";
    this.opacity = 1;
    this.masks = new Masks(w, h, this);
    this.selected = false;
    this.active = false;

    attachEvents(this, {
      resize: [events.resize.position, events.resize.layerMasks],
      redraw: events.redraw.bubble,
      activate: events.activate.vars,
      deactivate: events.deactivate.vars,
      select: events.select.vars,
      deselect: events.deselect.vars
    });
  }

  process(ctx, rect) {
    //DBG "process"
    if(this.aabb.collides(rect)) {
      //DBG "needs redraw"
      ctx.globalCompositeOperation = this.blendMode;
      ctx.globalAlpha = this.opacity;
      this.draw(ctx, rect);
    }
    else {
      //DBG "doesn't need redraw"
    }
  }
}
