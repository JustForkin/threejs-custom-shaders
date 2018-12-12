
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

export function radians(degrees) {
  return degrees * Math.PI / 180;
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

export function map(value, start1, stop1, start2, stop2) {
  return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

export function onDocumentMouseMove(mouse, event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
