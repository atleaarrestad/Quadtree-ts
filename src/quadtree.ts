import { createNoise2D } from 'simplex-noise';

export class Quadtree {

	private points: Array<Point> = new Array<Point>();
	private pointCount = 0;
	private hasChildren = false;

	public northWest: Quadtree;
	public northEast: Quadtree;
	public southWest: Quadtree;
	public southEast: Quadtree;

	constructor(private boundary: Rectangle, public readonly nodeCapacity: number = 4) {}

	public insert(point: Point) {
		if (!this.boundary.containsPoint(point))
			return false;


		if (!this.hasChildren && (this.pointCount < this.nodeCapacity)) {
			this.points.push(point);
			this.pointCount += 1;

			return true;
		}

		if (!this.hasChildren) {
			this.subdivide();
			this.shakeNode();
		}


		//Insert point to children if no space in this node
		if (this.northWest.insert(point))
			return true;
		if (this.northEast.insert(point))
			return true;
		if (this.southWest.insert(point))
			return true;
		if (this.southEast.insert(point))
			return true;

		return false;
	}

	public populateWithPerlinNoise(dimension: number, cutoff: number) {
		const noise2D = createNoise2D();

		for (let x = 0; x < dimension; x += 16) {
			for (let y = 0; y < dimension; y += 16) {
				let noise = noise2D(x / dimension, y / dimension);
				if (noise > cutoff)
					this.insert({ x, y });
			}
		}
	}

	//pushed all data in this node into the children instead
	public shakeNode() {
		if (!this.hasChildren && !this.subdivide())
			return false;

		this.points.forEach(element => {
			this.insert(element);
		});

		return true;
	}

	public subdivide(): boolean {
		if (!this.hasChildren) {
			let x = this.boundary.origin.x;
			let y = this.boundary.origin.y;
			this.northWest = new Quadtree(new Rectangle({ x: x, y: y }, this.boundary.width / 2), this.nodeCapacity);
			this.northEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y }, this.boundary.width / 2), this.nodeCapacity);
			this.southWest = new Quadtree(new Rectangle({ x: x, y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2), this.nodeCapacity);
			this.southEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2),  this.nodeCapacity);
			this.hasChildren = true;

			return true;
		}
		else {
			return false;
		}
	}

	public queryRange(range: Rectangle) {

	}

	public draw(ctx: CanvasRenderingContext2D, thickness = 1, recursiondepth = 0) {
		//source - over;
		ctx.lineWidth = thickness;
		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeRect(this.boundary.origin.x, this.boundary.origin.y, this.boundary.width, this.boundary.width);
		ctx.globalCompositeOperation = 'multiply';
		ctx.fillStyle = `rgb(255,55,55, ${ recursiondepth * 0.1 })`;
		ctx.fillRect(this.boundary.origin.x, this.boundary.origin.y, this.boundary.width, this.boundary.width);
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'yellow';
		ctx.fill();
		this.points.forEach((point) =>{
			ctx.beginPath();
			ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
			ctx.stroke();
		});

		//ctx.fillRect(this.boundary.origin.x, this.boundary.origin.y, this.boundary.width, this.boundary.width);
		if (this.hasChildren) {
			this.northWest.draw(ctx, thickness, recursiondepth + 1);
			this.northEast.draw(ctx, thickness, recursiondepth + 1);
			this.southWest.draw(ctx, thickness, recursiondepth + 1);
			this.southEast.draw(ctx, thickness, recursiondepth + 1);
		}
	}

}
type Point = {
	x: number;
	y: number;
}


export class Rectangle {

	constructor(public readonly origin: Point, public readonly width: number) {}

	// PS! not does not include edges! potential edge-case, literally :)
	public containsPoint(point: Point) {
		return (point.x >= this.origin.x && point.x < (this.origin.x + this.width) &&
				point.y >= this.origin.y && point.y < (this.origin.y + this.width));
	}

	public intersectsRectangle(other: Rectangle) {
		return (
			this.origin.x <= other.origin.x + other.width &&
			other.origin.x <= this.origin.x + this.width &&
			this.origin.y <= other.origin.y + other.width &&
			other.origin.y <= this.origin.y + this.width
		);
	}

}
