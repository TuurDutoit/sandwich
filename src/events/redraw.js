export function bubble(rect) {
  if(this.parent && this.parent.emit) {
    this.parent.emit("redraw", rect);
  }
}

export function sandwich(rect) {
  this.redraw(rect);
}
