import { createNoise2D } from 'simplex-noise';

import { Point, Quadtree } from './quadtree.js';

const ticks: Array<number> = [];
export let fps = 0;
export const calculateFPS = () =>{
	let now = performance.now();
	while (ticks.length > 0 && ticks[0]! <= now - 1000)
		ticks.shift();
	ticks.push(now);
	fps = ticks.length;
};

export const populateWithPerlinNoise = (quad: Quadtree, cutoff: number, every_n_pixels: number, maxDeviation: number) => {
	let dimension = quad.boundary.width;
	let finalX: number;
	let finalY: number;
	(every_n_pixels < 1) ? every_n_pixels = 1 : Math.floor(every_n_pixels);

	const noise2D = createNoise2D();

	for (let x = 0; x < dimension; x += every_n_pixels) {
		for (let y = 0; y < dimension; y += every_n_pixels) {
			let noise = noise2D(x / dimension, y / dimension);
			if (noise > cutoff) {
				finalX = (Math.round(Math.random() * (maxDeviation * 2)) - maxDeviation) + x;
				finalY = (Math.round(Math.random() * (maxDeviation * 2)) - maxDeviation) + y;

				if (finalX > dimension)
					finalX = dimension;
				if (finalX < 0)
					finalX = 0;
				if (finalY > dimension)
					finalY = dimension;
				if (finalY < 0)
					finalY = 0;

				quad.insert({ x: finalX, y: finalY });
			}
		}
	}
};

export const populateWithNoise = (quad: Quadtree, amount: number) => {
	let dimension = quad.boundary.width;
	for (let i = 0; i < amount; i++)
		quad.insert({ x: Math.random() * dimension, y: Math.random() * dimension });
};

export const insertPoint = (quad: Quadtree, x: number, y: number) => {
	quad.insert({ x, y });
};

export const drawQuadtree = (quad: Quadtree, canvas: HTMLCanvasElement, drawBbox = true, drawPoints = true, drawHeatMap = true, drawFPS = true) => {
	let stop = false;
	const draw = () => {
		if (stop)
			return;

		console.log('repainting');
		const ctx = canvas.getContext('2d')!;
		//ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		draw_quad(quad, ctx, 1, drawBbox, drawPoints, drawHeatMap);


		if (drawFPS)
			calculateFPS();

		requestAnimationFrame(draw);
	};
	draw();

	return () => stop = true;
};

const draw_quad = (quad: Quadtree, ctx: CanvasRenderingContext2D, thickness = 1, drawBbox = true, drawPoints = true, drawHeatMap = true) =>{
	console.log(quad.requiresRepaint);
	if (quad.requiresRepaint) {
		quad.requiresRepaint = false;
		ctx.clearRect(quad.boundary.origin.x, quad.boundary.origin.y, quad.boundary.width, quad.boundary.width);// mulig eg må cleara thicknessen på borderen og!
		if (drawBbox)
			drawQuadOutline(quad, ctx);
		if (drawHeatMap)
			drawQuadHeatMap(quad, ctx, 0);
		if (drawPoints)
			drawQuadPoints(quad, ctx);
	}
	if (quad.childRequiresRepaint) {
		quad.childRequiresRepaint = false;
		draw_quad(quad.northWest, ctx, 1, drawBbox, drawPoints, drawHeatMap);
		draw_quad(quad.northEast, ctx, 1, drawBbox, drawPoints, drawHeatMap);
		draw_quad(quad.southWest, ctx, 1, drawBbox, drawPoints, drawHeatMap);
		draw_quad(quad.southEast, ctx, 1, drawBbox, drawPoints, drawHeatMap);
	}
};

const drawQuadOutline = (quad: Quadtree, ctx: CanvasRenderingContext2D, thickness = 1) =>{
	ctx.lineWidth = thickness;
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeRect(quad.boundary.origin.x, quad.boundary.origin.y, quad.boundary.width, quad.boundary.width);
	console.log('drawing recursively');
};

const drawQuadHeatMap = (quad: Quadtree, ctx: CanvasRenderingContext2D, alpha = 0) =>{
	ctx.globalCompositeOperation = 'multiply';
	ctx.fillStyle = `rgb(255,55,55, ${ alpha })`;
	alpha += .05;
	ctx.fillRect(quad.boundary.origin.x, quad.boundary.origin.y, quad.boundary.width, quad.boundary.width);
};

const drawQuadPoints = (quad: Quadtree, ctx: CanvasRenderingContext2D, radius = 8) =>{
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = 'yellow';

	quad.points.forEach((point) =>{
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	});
};
