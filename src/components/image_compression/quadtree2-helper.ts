
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

export const compressQuadtree = async (quadtree: Quadtree2, maxColorDelta: number) => {
	//console.log(`compressing quadtree with maxColorDelta: ${ maxColorDelta }`);

	//send ud recursively på 4 children og vent på promise resolve før prøva og merga!!

	Promise.all([
		//lots of promises
	]);

	// if this is the parent of the most inner node
	if (quadtree.hasChildren && !quadtree.northWest!.hasChildren) {
		tryMergeChildren(quadtree, maxColorDelta);
	}

	else {
		compressQuadtree(quadtree.northWest!, maxColorDelta);
		compressQuadtree(quadtree.northEast!, maxColorDelta);
		compressQuadtree(quadtree.southWest!, maxColorDelta);
		compressQuadtree(quadtree.southEast!, maxColorDelta);
	}
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
		//console.log('merged successfully');
	}
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
