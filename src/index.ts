import * as fs from "fs";
import {
  createCanvas,
  createImageData,
  loadImage,
} from "../node_modules/canvas";
import decode from "./decode";
import encode from "./encode";

interface Size {
  width: number;
  height: number;
  newWidth?: number;
  scale?: boolean;
}
const resize = ({ width, height, newWidth = 32, scale = true }: Size) => {
  if (!scale) return { width, height };
  if (width <= 32) return { width, height };
  const scaledHeight = Math.round((newWidth / width) * height);
  return { width: newWidth, height: scaledHeight };
};

const hashGen = async (filename: string, scale = true) => {
  const image = await loadImage(`./public/${filename}`);
  const { naturalWidth: width, naturalHeight: height } = image;
  const { width: scaledWidth, height: scaledHeight } = resize({
    width,
    height,
    scale,
  });
  const canvas = createCanvas(scaledWidth, scaledHeight);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
  const imageData = ctx?.getImageData(0, 0, scaledWidth, scaledHeight);
  const hash = encode(imageData.data, scaledWidth, scaledHeight, 4, 4);
  return { hash, width, height, filename, scale };
};

interface Options {
  hash: string;
  width: number;
  height: number;
  filename: string;
  scale?: boolean;
}

const imageGen = async ({ hash, width, height, filename, scale }: Options) => {
  const { width: scaledWidth, height: scaledHeight } = resize({
    width,
    height,
    scale,
  });
  const decoded = decode(hash, scaledWidth, scaledHeight);
  const newImage = createImageData(decoded, scaledWidth, scaledHeight);
  const newCanvas = createCanvas(scaledWidth, scaledHeight);
  const newCtx = newCanvas.getContext("2d");
  newCtx.putImageData(newImage, 0, 0);
  const newFilename = filename.split(".").slice(0, -1).join(".") + "-blur.jpg";
  const out = fs.createWriteStream(`./public/${newFilename}`);
  const stream = newCanvas.createJPEGStream();
  stream.pipe(out);
  out.on("finish", () => console.log(`${hash} -> ${newFilename}`));
};

async function main() {
  const imageHash = await hashGen("charmaine.jpg");
  console.log(imageHash);
  await imageGen(imageHash);
}

main().catch((error) => console.log(error));
