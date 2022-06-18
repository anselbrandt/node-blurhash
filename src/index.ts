import * as fs from "fs";
import {
  createCanvas,
  createImageData,
  loadImage,
} from "../node_modules/canvas";
import decode from "./decode";
import encode from "./encode";

async function main() {
  const image = await loadImage("./public/limecat.jpg");
  const { naturalWidth: width, naturalHeight: height } = image;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx?.getImageData(0, 0, image.width, image.height);
  const imageHash = encode(
    imageData.data,
    imageData.width,
    imageData.height,
    4,
    4
  );
  console.log(imageHash);
  const decoded = decode(imageHash, width, height);
  const newImage = createImageData(decoded, width, height);

  const newCanvas = createCanvas(width, height);
  const newCtx = newCanvas.getContext("2d");
  newCtx.putImageData(newImage, 0, 0);
  const out = fs.createWriteStream(`./public/out.png`);
  const stream = newCanvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The PNG file was created."));
}

main().catch((error) => console.log(error));
