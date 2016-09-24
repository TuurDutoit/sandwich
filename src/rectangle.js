const unused = [];

function rotateX(sin, cos, x1, y1, x2, y2) {
  return cos * (x1 - x2) - sin * (y1 - y2) + x2;
}

function rotateY(sin, cos, x1, y1, x2, y2) {
  return sin * (x1 - x2) + cos * (y1 - y2) + y2;
}

export default class Rectangle {
  constructor(x, y, w, h, angle) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w;
    this.h = h;
    this.a = angle || 0;
  }

  static get(x, y, w, h, angle) {
    if(unused.length) {
      return unused.pop().reset(x, y, w, h, angle);
    }
    else {
      return new Rectangle(x, y, w, h, angle);
    }
  }

  moveBy(x, y) {
    this.x += x;
    this.y += y;

    return this;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  resizeBy(w, h) {
    this.w += w;
    this.h += h;

    return this;
  }

  resizeTo(w, h) {
    this.w = w;
    this.h = h;

    return this;
  }

  rotateBy(angle) {
    this.a += angle;
    return this;
  }

  rotateTo(angle) {
    this.a = angle;
    return this;
  }

  rotateByAround(angle, x, y) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let newX = rotateX(sin, cos, this.x, this.y, x, y);
    let newY = rotateY(sin, cos, this.x, this.y, x, y);
    this.a += angle;
    this.x = newX;
    this.y = newY;

    return this;
  }

  rotateToAround(angle, x, y) {
    let diff = angle - this.a;
    return this.rotateByAround(diff, x, y);
  }

  scale(x, y) {
    this.w *= x;
    this.h *= typeof y === "number" ? y : x;

    return this;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.w
        && y >= this.y && y <= this.y + this.h;
  }

  containsRect(rect) {
    return this.contains(rect.x, rect.y)
        && this.contains(rect.x + rect.w, rect.y + rect.h);
  }

  touches(rect) {
    return this.x <= rect.x + rect.w
        && this.x + this.w >= rect.x
        && this.y <= rect.y + rect.h
        && this.y + this.h >= rect.y;
  }

  collides(rect) {
    return this.x < rect.x + rect.w
        && this.x + this.w > rect.x
        && this.y < rect.y + rect.h
        && this.y + this.h > rect.y;
  }

  overlap(rect, dest) {
    let x = Math.max(this.x, rect.x);
    let y = Math.max(this.y, rect.y);
    let w = Math.min(this.x + this.w, rect.x + rect.w) - x;
    let h = Math.min(this.y + this.h, rect.y + rect.h) - y;
    return dest ? dest.reset(x, y, w, h) : Rectangle.get(x, y, w, h);
  }

  aabb(dest) {
    let sin = Math.sin(this.a);
    let cos = Math.cos(this.a);
    let x1 = rotateX(sin, cos, this.x + this.w, this.y, this.x, this.y);
    let y1 = rotateY(sin, cos, this.x + this.w, this.y, this.x, this.y);
    let x2 = rotateX(sin, cos, this.x + this.w, this.y + this.h, this.x, this.y);
    let y2 = rotateY(sin, cos, this.x + this.w, this.y + this.h, this.x, this.y);
    let x3 = rotateX(sin, cos, this.x, this.y + this.h, this.x, this.y);
    let y3 = rotateY(sin, cos, this.x, this.y + this.h, this.x, this.y);
    let minX = Math.min(this.x, x1, x2, x3);
    let minY = Math.min(this.y, y1, y2, y3);
    let maxX = Math.max(this.x, x1, x2, x3);
    let maxY = Math.max(this.y, y1, y2, y3);

    if(!dest) {
      dest = unused.pop();
    }

    dest.reset(minX, minY, maxX - minX, maxY - minY);
    return dest;
  }

  clone() {
    return Rectangle.get(this.x, this.y, this.w, this.h, this.a);
  }

  copy(other) {
    other.x = this.x;
    other.y = this.y;
    other.w = this.w;
    other.h = this.h;
    other.a = this.a;

    return other;
  }

  reset(x, y, w, h, angle) {
    return this.moveAndResizeTo(x, y, w, h, angle);
  }

  release() {
    unused.push(this);

    return this;
  }
}
