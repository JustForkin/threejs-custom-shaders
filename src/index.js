import 'normalize.css/normalize.css';
import './styles/index.scss';

let canvas, ctx, image;
let offCanvas, offCtx;

initCanvas();
initOffScreenCanvas();

for (let i = 0; i < canvas.width; i++) {
  for (let j = 0; j < canvas.height; j++) {
    let normalizedPos = {
      x: i / canvas.width,
      y: j / canvas.height
    };

    let pixelData = offCtx.getImageData(
      normalizedPos.x * image.width,
      normalizedPos.y * image.height,
      1,
      1
    );
    // i % 20 === 0 &&
    //   j % 20 === 0 &&
    //   console.log('pixelData.data:  ', pixelData.data);
    // pixelData.data = [255, 255, 255, 255]
    if (pixelData.data[0] > 250) {
      ctx.fillStyle = 'rgba(0, 0, 0, 255)';
      ctx.fillRect(i, j, 1, 1);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 255)';
      ctx.fillRect(i, j, 1, 1);
    }
  }
}

function initCanvas() {
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  image = document.getElementById('textTexture');
  canvas.id = 'canvas';
  document.body.appendChild(canvas);
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
}

function initOffScreenCanvas() {
  offCanvas = document.createElement('canvas');
  offCtx = offCanvas.getContext('2d');
  offCanvas.width = image.width;
  offCanvas.height = image.height;
  offCtx.drawImage(image, 0, 0, image.width, image.height);
}

// ctx.drawImage(image, 100, 100);
