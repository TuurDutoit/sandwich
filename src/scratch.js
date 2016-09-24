const unused = [];

export const get = (w, h, opts = {}) => {
  var { smoothing = true } = opts;
  
  if(unused.length) {
    let ctx = unused.pop();
    resize(ctx, w, h);
    clear(ctx);
    smooth(ctx, smoothing);
    return ctx;
  }
  else {
    return create(w, h, opts);
  }
}

export const copy = (ctx) => {
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let copy = get(w, h);
  smooth(copy, isSmooth(ctx));
  copy.drawImage(ctx.canvas, 0, 0);

  return copy;
}

export const create = (w, h, {smoothing = true} = {}) => {
  let canvas = document.createElement("canvas");
  canvas.width = w || 300;
  canvas.height = h || 150;
  let ctx = canvas.getContext("2d");
  smooth(ctx, smoothing);
  ctx.release = () => {
    release(ctx);
  }

  return ctx;
}

export const release = ctx => {
  unused.push(ctx);
}

export const resize = (ctx, w, h) => {
  ctx.canvas.width = w;
  ctx.canvas.height = h;
}

export const clear = ctx => {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(ctx.canvas.width, ctx.canvas.height);
}

export const smooth = (ctx, enabled = true) => {
  ctx.webkitImageSmoothingEnabled = enabled;
     ctx.mozImageSmoothingEnabled = enabled;
      ctx.msImageSmoothingEnabled = enabled;
        ctx.imageSmoothingEnabled = enabled;
}

export const isSmooth = ctx => {
  return ctx.imageSmoothingEnabled ||
   ctx.webkitImageSmoothingEnabled ||
      ctx.mozImageSmoothingEnabled ||
       ctx.msImageSmoothingEnabled;
}
