
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

export const quadtreeToImageData = (quadtree: Quadtree2, width: number, height: number, settings: QuadtreeToImageDataSettings): globalThis.ImageData => {
	let buffer = new ArrayBuffer(width * 4 * height);
	let view = new DataView(buffer);
	if (settings.shouldDrawBorders)
		extractPixelDataWithBorders(quadtree, view, width, settings);

	else
		extractPixelData(quadtree, view, width);


	return new globalThis.ImageData(new Uint8ClampedArray(buffer), width, height);
};

const extractPixelData = (quadtree: Quadtree2, view: DataView, imageWidth: number) => {
	if (quadtree.hasChildren) {
		extractPixelData(quadtree.northWest!, view, imageWidth);
		extractPixelData(quadtree.northEast!, view, imageWidth);
		extractPixelData(quadtree.southWest!, view, imageWidth);
		extractPixelData(quadtree.southEast!, view, imageWidth);
	}
	if (!quadtree.data)
		return;

	for (let column = 0; column < quadtree.data!.width; column++) {
		//convert offset to 1 dimension for the DataView
		let offsetY = quadtree.data.point.y! * imageWidth * 4;
		let offsetX = quadtree.data.point.x! * 4;
		let localOffsetY = column * imageWidth * 4;
		let offset = offsetX + offsetY + localOffsetY;

		for (let currentSubPixel = 0; currentSubPixel < quadtree.data!.width * 4; currentSubPixel += 4) {
			view.setInt8(offset + currentSubPixel, quadtree.data!.color.red);
			view.setInt8(offset + currentSubPixel + 1, quadtree.data!.color.green);
			view.setInt8(offset + currentSubPixel + 2, quadtree.data!.color.blue);
			view.setInt8(offset + currentSubPixel + 3, 255);
		}
	}
};


const extractPixelDataWithBorders = (quadtree: Quadtree2, view: DataView, imageWidth: number, settings: QuadtreeToImageDataSettings) => {
	if (quadtree.hasChildren) {
		extractPixelDataWithBorders(quadtree.northWest!, view, imageWidth, settings);
		extractPixelDataWithBorders(quadtree.northEast!, view, imageWidth, settings);
		extractPixelDataWithBorders(quadtree.southWest!, view, imageWidth, settings);
		extractPixelDataWithBorders(quadtree.southEast!, view, imageWidth, settings);
	}
	if (!quadtree.data)
		return;

	for (let row = 0; row < quadtree.data!.width; row++) {
		//convert offset to 1 dimension for the DataView
		let offsetY = quadtree.data.point.y! * imageWidth * 4;
		let offsetX = quadtree.data.point.x! * 4;
		let localOffsetY = row * imageWidth * 4;
		let offset = offsetX + offsetY + localOffsetY;

		for (let currentSubPixel = 0; currentSubPixel < quadtree.data!.width * 4; currentSubPixel += 4) {
			//if left border draw borderColor
			if (currentSubPixel == 0 && quadtree.data!.width >= settings.borderCutoff) {
				view.setInt8(offset + currentSubPixel, settings.borderColor.red);
				view.setInt8(offset + currentSubPixel + 1, settings.borderColor.green);
				view.setInt8(offset + currentSubPixel + 2, settings.borderColor.blue);
				view.setInt8(offset + currentSubPixel + 3, 255);
			}
			//if right border draw borderColor
			else if ((currentSubPixel / 4) + 1 == quadtree.data!.width && quadtree.data!.width >= settings.borderCutoff) {
				view.setInt8(offset + currentSubPixel, settings.borderColor.red);
				view.setInt8(offset + currentSubPixel + 1, settings.borderColor.green);
				view.setInt8(offset + currentSubPixel + 2, settings.borderColor.blue);
				view.setInt8(offset + currentSubPixel + 3, 255);
			}
			//if first row draw borderColor
			else if (row == 0 && quadtree.data!.width >= settings.borderCutoff) {
				view.setInt8(offset + currentSubPixel, settings.borderColor.red);
				view.setInt8(offset + currentSubPixel + 1, settings.borderColor.green);
				view.setInt8(offset + currentSubPixel + 2, settings.borderColor.blue);
				view.setInt8(offset + currentSubPixel + 3, 255);
			}
			//if last row draw borderColor
			else if (row == quadtree.data!.width - 1 && quadtree.data!.width >= settings.borderCutoff) {
				view.setInt8(offset + currentSubPixel, settings.borderColor.red);
				view.setInt8(offset + currentSubPixel + 1, settings.borderColor.green);
				view.setInt8(offset + currentSubPixel + 2, settings.borderColor.blue);
				view.setInt8(offset + currentSubPixel + 3, 255);
			}
			else {
				view.setInt8(offset + currentSubPixel, quadtree.data!.color.red);
				view.setInt8(offset + currentSubPixel + 1, quadtree.data!.color.green);
				view.setInt8(offset + currentSubPixel + 2, quadtree.data!.color.blue);
				view.setInt8(offset + currentSubPixel + 3, 255);
			}
		}
	}
};

export const calculateQuadtreeSizeAfterSave = (quadtree: Quadtree2): number => {
	// width:2 x:2 y:2 r:1 g:1 b:1
	let total = 0;
	if (quadtree.hasChildren) {
		total += calculateQuadtreeSizeAfterSave(quadtree.northWest!);
		total += calculateQuadtreeSizeAfterSave(quadtree.northEast!);
		total += calculateQuadtreeSizeAfterSave(quadtree.southWest!);
		total += calculateQuadtreeSizeAfterSave(quadtree.southEast!);
	}
	if (!quadtree.data)
		return total;


	return (total + 2 + 2 + 2 + 1 + 1 + 1); // bytes
};


export const calculateQuadtreeSizeAfterSaveOptimized = (quadtree: Quadtree2): number => {
	// This calculates theoretical size if centain optimalizations are made (not currently made)
	let total = 0;
	if (quadtree.hasChildren) {
		total += calculateQuadtreeSizeAfterSaveOptimized(quadtree.northWest!);
		total += calculateQuadtreeSizeAfterSaveOptimized(quadtree.northEast!);
		total += calculateQuadtreeSizeAfterSaveOptimized(quadtree.southWest!);
		total += calculateQuadtreeSizeAfterSaveOptimized(quadtree.southEast!);
	}
	if (!quadtree.data)
		return total;


	return (total + 1 + 1 + 1 + 1); // bytes
};
export const calculateQuadtreeSizeAfterSaveOptimizedMonochrome = (quadtree: Quadtree2): number => {
	// Monochrome + optimized.
	let total = 0;
	if (quadtree.hasChildren) {
		total += calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree.northWest!);
		total += calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree.northEast!);
		total += calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree.southWest!);
		total += calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree.southEast!);
	}
	if (!quadtree.data)
		return total;


	return (total + 8 + 1); //PS! returned as bits not bytes
};
export interface QuadtreeToImageDataSettings {
	borderColor: RGB,
	shouldDrawBorders: boolean
	borderCutoff: number
}
