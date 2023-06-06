
import { arrayBuffer } from 'stream/consumers';

import { QuadTree } from '../quadtree/quadtree-cmp.js';
import { ImageData, Point, Quadtree2, RGB } from './quadtree2.js';

export const addImageToQuadtree = (data: globalThis.ImageData, quadtree: Quadtree2) =>{
	let rowLength = data.width * 4;
	let columnHeight = data.height;
	for (let column = 0; column < columnHeight; column++) {
		for (let pixel = 0; pixel < rowLength; pixel += 4) {
			let base = column * rowLength;
			quadtree.insert({
				width: 1,
				point: { x: pixel / 4, y: column },
				color: {
					red:   data.data[base + pixel]!,
					green: data.data[base + pixel + 1]!,
					blue:  data.data[base + pixel + 2]!,
				},
			});
		}
	}
};

export const compressQuadtree = async (quadtree: Quadtree2, maxColorDelta: number, recursion = 0) => {
	//console.log(`compressing quadtree with maxColorDelta: ${ maxColorDelta }`);

	//send ud recursively på 4 children og vent på promise resolve før prøva og merga!!
	if (quadtree.hasChildren && quadtree.northWest!.hasChildren) {
		Promise.all([
			compressQuadtree(quadtree.northWest!, maxColorDelta, recursion + 1),
			compressQuadtree(quadtree.northEast!, maxColorDelta, recursion + 1),
			compressQuadtree(quadtree.southWest!, maxColorDelta, recursion + 1),
			compressQuadtree(quadtree.southEast!, maxColorDelta, recursion + 1),
		]);
	}
	if (quadtree.hasChildren && (quadtree.northWest!.data && quadtree.northEast!.data && quadtree.southWest!.data && quadtree.southEast!.data))
		tryMergeChildren(quadtree, maxColorDelta);


	return;
};

const tryMergeChildren = (quadtree: Quadtree2, maxColorDelta: number) => {
	let nw_color = quadtree.northWest!.data!.color;
	let ne_color = quadtree.northEast!.data!.color;
	let se_color = quadtree.southEast!.data!.color;
	let sw_color = quadtree.southWest!.data!.color;

	let colourDifference = getColourDifference([ nw_color, ne_color, se_color, sw_color ]);
	if (colourDifference <= maxColorDelta) {
		let newColor = blendColours([ nw_color, ne_color, se_color, sw_color ]);
		let data: ImageData = {
			width: quadtree.northWest!.data!.width * 2,
			point: {
				x: quadtree.northWest!.data!.point.x,
				y: quadtree.northWest!.data!.point.y,
			},
			color: {
				red:   newColor.red,
				green: newColor.green,
				blue:  newColor.blue,
			},
		};
		quadtree.clearChildren();
		quadtree.data = data;

		return true;
	}

	return false;
};

export const getColourDifference = (colors: RGB[]) => {
	let reds: number[] = [];
	let greens: number[] = [];
	let blues: number[] = [];

	colors.map((color) => {
		reds.push(color.red);
		greens.push(color.green);
		blues.push(color.blue);
	});

	let red = ((Math.max(...reds) - Math.min(...reds)) ** 2);
	let green = ((Math.max(...greens) - Math.min(...greens)) ** 2);
	let blue = ((Math.max(...blues) - Math.min(...blues)) ** 2);

	return Math.sqrt(red + green + blue);
};

export const blendColours = (colors: RGB[]) =>{
	let reds: number[] = [];
	let greens: number[] = [];
	let blues: number[] = [];
	colors.map((color) => {
		reds.push(color.red);
		greens.push(color.green);
		blues.push(color.blue);
	});

	let red = 0;
	let green = 0;
	let blue = 0;
	reds.map((value) => { red += value * (1 / reds.length); });
	greens.map((value) => { green += value * (1 / greens.length); });
	blues.map((value) => { blue += value * (1 / blues.length); });

	return {
		red:   Math.round(red),
		green: Math.round(green),
		blue:  Math.round(blue),
	};
};

export const quadtreeToImageData = (quadtree: Quadtree2, width: number, height: number): globalThis.ImageData => {
	let buffer = new ArrayBuffer(width * 4 * height);
	let view = new DataView(buffer);
	extractPixelData(quadtree, buffer, view);

	return new globalThis.ImageData(new Uint8ClampedArray(buffer), 1024, 1024);
};

const extractPixelData = (quadtree: Quadtree2, buffer: ArrayBuffer, view: DataView) => {
	if (quadtree.hasChildren) {
		extractPixelData(quadtree.northWest!, buffer, view);
		extractPixelData(quadtree.northEast!, buffer, view);
		extractPixelData(quadtree.southWest!, buffer, view);
		extractPixelData(quadtree.southEast!, buffer, view);
	}
	if (!quadtree.data)
		return;
	if ((quadtree.data.width! ** 2) > 255)
		console.log(`extracting total: ${ quadtree.data.width! ** 2 } pixels}`);

	//dis wrong lmao
	let baseY = (quadtree.data.point.y!) * quadtree.data.width!;
	let baseX = quadtree.data.point.x!;
	let base = baseX + baseY;
	for (let column = 0; column < quadtree.data!.width; column++) {
		for (let row = 0; row < quadtree.data!.width * 4; row += 4) {
			view.setInt8(base + (column * quadtree.data.width!) + row, quadtree.data!.color.red);
			view.setInt8(base + (column * quadtree.data.width!) + row + 1, quadtree.data!.color.green);
			view.setInt8(base + (column * quadtree.data.width!) + row + 2, quadtree.data!.color.blue);
			view.setInt8(base + (column * quadtree.data.width!) + row + 3, 255);
		}
	}
};
