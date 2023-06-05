

export class Quadtree2 {

	public data?: ImageData;
	public hasChildren = false;
	public parent?: Quadtree2;

	public northWest?: Quadtree2;
	public northEast?: Quadtree2;
	public southWest?: Quadtree2;
	public southEast?: Quadtree2;

	constructor(public readonly boundary: Rectangle, parent?: Quadtree2) {
		if (parent)
			this.parent = parent;
	}

	public insert(data: ImageData) {
		if (!this.boundary.containsPoint(data.point))
			return false;


		if (!this.hasChildren && !this.data) {
			this.data = data;

			return true;
		}

		if (!this.hasChildren) {
			this.subdivide();
			this.shakeNode();
		}

		//Insert point to children if no space in this node
		if (this.northWest!.insert(data))
			return true;

		if (this.northEast!.insert(data))
			return true;

		if (this.southWest!.insert(data))
			return true;

		if (this.southEast!.insert(data))
			return true;


		return true;
	}

	//push data in this node into the children instead
	public shakeNode() {
		if (!this.hasChildren && !this.subdivide())
			return false;

		this.insert(this.data!);
		this.data = undefined;

		return true;
	}

	public clearChildren() {
		this.hasChildren = false;
		this.northWest = undefined;
		this.northEast = undefined;
		this.southWest = undefined;
		this.southEast = undefined;
	}

	//create children
	public subdivide(): boolean {
		if (!this.hasChildren) {
			let x = this.boundary.origin.x;
			let y = this.boundary.origin.y;
			this.northWest = new Quadtree2(new Rectangle({ x: x, y: y }, this.boundary.width / 2), this);
			this.northEast = new Quadtree2(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y }, this.boundary.width / 2), this);
			this.southWest = new Quadtree2(new Rectangle({ x: x, y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2), this);
			this.southEast = new Quadtree2(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2), this);
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

}
export type Point = {
	x: number;
	y: number;
}
export type RGB = {
	red: number;
	green: number;
	blue: number;
}
export type ImageData = {
	width: number;
	point: Point;
	color: RGB;
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
