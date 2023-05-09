import { createNoise2D } from 'simplex-noise';

export class Quadtree {

	public points: Array<Point> = new Array<Point>();
	public hasChildren = false;
	public requiresRepaint = true;
	public childRequiresRepaint = false;
	private parent?: Quadtree;

	public northWest: Quadtree;
	public northEast: Quadtree;
	public southWest: Quadtree;
	public southEast: Quadtree;

	constructor(public readonly boundary: Rectangle, public readonly nodeCapacity: number = 4, parent?: Quadtree) {
		if (parent)
			this.parent = parent;
	}

	public insert(point: Point) {
		if (!this.boundary.containsPoint(point))
			return false;


		if ((!this.hasChildren && (this.points.length < this.nodeCapacity)) || this.hasHitRecursionLimit()) {
			this.points.push(point);
			if (this.parent)
				this.parent.childRequiresRepaint = true;

			this.requiresRepaint = true;

			console.log('setting repaint true');

			return true;
		}

		if (!this.hasChildren) {
			this.subdivide();
			this.shakeNode();
		}

		//Insert point to children if no space in this node
		if (this.northWest.insert(point)) {
			this.childRequiresRepaint = true;

			return true;
		}
		if (this.northEast.insert(point)) {
			this.childRequiresRepaint = true;

			return true;
		}
		if (this.southWest.insert(point)) {
			this.childRequiresRepaint = true;

			return true;
		}
		if (this.southEast.insert(point)) {
			this.childRequiresRepaint = true;

			return true;
		}

		return true;
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
		this.points.length = 0;

		return true;
	}

	public subdivide(): boolean {
		if (!this.hasChildren) {
			let x = this.boundary.origin.x;
			let y = this.boundary.origin.y;
			this.northWest = new Quadtree(new Rectangle({ x: x, y: y }, this.boundary.width / 2), this.nodeCapacity, this);
			this.northEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y }, this.boundary.width / 2), this.nodeCapacity, this);
			this.southWest = new Quadtree(new Rectangle({ x: x, y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2), this.nodeCapacity, this);
			this.southEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2),  this.nodeCapacity, this);
			this.hasChildren = true;

			return true;
		}
		else {
			return false;
		}
	}

	public hasHitRecursionLimit() {
		return (this.boundary.width < 2);
	}

	public queryRange(range: Rectangle) {

	}


}
export type Point = {
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
