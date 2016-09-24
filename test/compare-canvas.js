export default function (ctx1, ctx2) {
  let data1 = ctx1.getImageData(0, 0, 100, 100).data;
  let data2 = ctx2.getImageData(0, 0, 100, 100).data;

  for(let i = 0, len = data1.length; i < len; i++) {
    if(data1[i] !== data2[i]) {
      return false;
    }
  }

  return true;
}
