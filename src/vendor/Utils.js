
// from the man himself: https://github.com/mrdoob/three.js/issues/758
export function getImageData(image) {
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  image.crossOrigin = "Anonymous";
  image.setAttribute("crossOrigin", "");
  return context.getImageData(0, 0, image.width, image.height);
}

export function getPixel(imagedata, x, y) {
  var position = (x + imagedata.width * y) * 4,
    data = imagedata.data;

  return {
    r: data[position],
    g: data[position + 1],
    b: data[position + 2],
    a: data[position + 3]
  };
}



