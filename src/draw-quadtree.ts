import { Quadtree, Rectangle } from './quadtree.js';

const quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, 512), 1);


for (let index = 0; index < 150; index++)
	quad.insert({ x: Math.random() * 512, y: Math.random() * 512 });


console.log(quad);
let length = 0;

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
