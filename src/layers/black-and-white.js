import TransformLayer from "../layer-transform";

export default class BlackAndWhiteTranformLayer extends TransformLayer {
  transform(ctx) {
    let img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let data = img.data;

    for(let i = 0, len = data.length; i < len; i += 4) {
      let light = data[i] * .3 + data[i+1] * .59 + data[i+2] * .11;
      data[i] = data[i+1] = data[i+2] = light;
    }

    ctx.putImageData(img, 0, 0);
  }
}
