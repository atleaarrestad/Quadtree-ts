import { createNoise2D } from 'simplex-noise';

import { Quadtree } from './quadtree.js';

const ticks: Array<number> = [];
export let fps = 0;
export const calculateFPS = () =>{
	let now = performance.now();
	while (ticks.length > 0 && ticks[0]! <= now - 1000)
		ticks.shift();
	ticks.push(now);
	fps = ticks.length;
};

export const populateWithPerlinNoise = (quad: Quadtree, cutoff: number) => {
	let dimension = quad.boundary.width;
	const noise2D = createNoise2D();

	for (let x = 0; x < dimension; x += 16) {
		for (let y = 0; y < dimension; y += 16) {
			let noise = noise2D(x / dimension, y / dimension);
			if (noise > cutoff)
				quad.insert({ x, y });
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

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		if (drawBbox)
			drawQuadOutline(quad, ctx);
		if (drawHeatMap)
			drawQuadHeatMap(quad, ctx, 0);
		if (drawPoints)
			drawQuadPoints(quad, ctx);
		if (drawFPS)
			calculateFPS();

		requestAnimationFrame(draw);
	};
	draw();

	return () => stop = true;
};

const drawQuadOutline = (quad: Quadtree, ctx: CanvasRenderingContext2D, thickness = 1) =>{
	ctx.lineWidth = thickness;
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeRect(quad.boundary.origin.x, quad.boundary.origin.y, quad.boundary.width, quad.boundary.width);
	if (quad.hasChildren && !quad.hasHitRecursionLimit()) {
		drawQuadOutline(quad.northWest, ctx, thickness);
		drawQuadOutline(quad.northEast, ctx, thickness);
		drawQuadOutline(quad.southWest, ctx, thickness);
		drawQuadOutline(quad.southEast, ctx, thickness);
	}
};

const drawQuadHeatMap = (quad: Quadtree, ctx: CanvasRenderingContext2D, alpha = 0) =>{
	ctx.globalCompositeOperation = 'multiply';
	ctx.fillStyle = `rgb(255,55,55, ${ alpha })`;
	alpha += .05;
	ctx.fillRect(quad.boundary.origin.x, quad.boundary.origin.y, quad.boundary.width, quad.boundary.width);
	if (quad.hasChildren && !quad.hasHitRecursionLimit()) {
		drawQuadHeatMap(quad.northWest, ctx, alpha);
		drawQuadHeatMap(quad.northEast, ctx, alpha);
		drawQuadHeatMap(quad.southWest, ctx, alpha);
		drawQuadHeatMap(quad.southEast, ctx, alpha);
	}
};

const drawQuadPoints = (quad: Quadtree, ctx: CanvasRenderingContext2D, radius = 32) =>{
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = 'yellow';

	quad.points.forEach((point) =>{
		ctx.beginPath();
		ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	});
	if (quad.hasChildren && !quad.hasHitRecursionLimit()) {
		drawQuadPoints(quad.northWest, ctx, radius * .75);
		drawQuadPoints(quad.northEast, ctx, radius * .75);
		drawQuadPoints(quad.southWest, ctx, radius * .75);
		drawQuadPoints(quad.southEast, ctx, radius * .75);
	}
};
