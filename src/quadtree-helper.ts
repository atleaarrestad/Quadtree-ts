import { createNoise2D } from 'simplex-noise';

import { Quadtree, Rectangle } from './quadtree.js';

export const dimension = 1024;


export const populateWithPerlinNoise = (dimension: number, cutoff: number) => {
	const noise2D = createNoise2D();

	for (let x = 0; x < dimension; x += 16) {
		for (let y = 0; y < dimension; y += 16) {
			let noise = noise2D(x / dimension, y / dimension);
			if (noise > cutoff)
				quad.insert({ x, y });
		}
	}
};

export const populateWithNoise = (amount: number) => {
	for (let i = 0; i < amount; i++)
		quad.insert({ x: Math.random() * dimension, y: Math.random() * dimension });
};

export const insertPoint = (x: number, y: number) => {
	quad.insert({ x, y });
};

export const resetTree = (nodeCapacity: number) => {
	quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, dimension), nodeCapacity);
};


let quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, dimension), 1);
resetTree(1);

export const drawQuadtree = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	quad.draw(ctx);
	requestAnimationFrame(() => drawQuadtree(canvas));
};