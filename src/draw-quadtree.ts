import { createNoise2D } from 'simplex-noise';

import { Quadtree, Rectangle } from './quadtree.js';

const dimension = 1024;
const quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, dimension), 1);
quad.populateWithPerlinNoise(dimension, .54);

//for (let i = 0; i < 150; i++)
//	quad.insert({ x: Math.random() * 512, y: Math.random() * 512 });


export const drawQuadtree = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	//ctx.fillStyle = 'green';
	//ctx.fillRect(10, 10, 150, 100);
	//ctx.beginPath();
	//ctx.moveTo(0, 0);
	//ctx.lineTo(length, 150);
	//ctx.stroke();
	//length += 1;
	quad.draw(ctx);
	requestAnimationFrame(() => drawQuadtree(canvas));
};
