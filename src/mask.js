import * as scratch from "./scratch.js";
import * as events from "./events/index.js";
import {EventEmitter} from "events";
import {attachEvents} from "./utils.js";

export default class Mask extends EventEmitter {
  constructor(w, h) {
    super();
    this.w = w;
    this.h = h;
    this.ctx = scratch.get(w, h);
    this.active = false;
    this.selected = false;

    this.attachEvents({
      resize: events.resize.ctx,
      redraw: events.redraw.bubble,
      activate: events.activate.vars,
      deactivate: events.deactivate.vars,
      select: events.select.vars,
      deselect: events.deselect.vars
    });
  }

  getContext() {
    return this.ctx;
  }

  redraw(rect) {
    this.emit("redraw", rect);
    return this;
  }

  attachEvents(events) {
    return attachEvents(this, events);
  }
}
