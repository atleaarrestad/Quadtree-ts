

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
		console.log(`trying to insert point`);
		if (!this.boundary.containsPoint(point))
			return false;


		if (this.pointCount < this.nodeCapacity) {
			this.points.push(point);
			this.pointCount += 1;
			console.log(`Point ${ point.x }, ${ point.y } consumed by ${ this.boundary.origin.x }, ${ this.boundary.origin.y }`);

			return true;
		}

		if (!this.hasChildren) {
			console.log('subdividing..');
			this.subdivide();
		}


		//Insert point to children if no space in this node
		this.northWest.insert(point);
		this.northEast.insert(point);
		this.southWest.insert(point);
		this.southEast.insert(point);

		//if (this.northWest.insert(point))
		//	return true;
		//if (this.northEast.insert(point))
		//	return true;
		//if (this.southWest.insert(point))
		//	return true;
		//if (this.southEast.insert(point))
		//	return true;

		return false;
	}

	public subdivide() {
		if (!this.hasChildren) {
			let x = this.boundary.origin.x;
			let y = this.boundary.origin.y;
			this.northWest = new Quadtree(new Rectangle({ x: x, y: y }, this.boundary.width / 2), this.nodeCapacity);
			this.northEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y }, this.boundary.width / 2), this.nodeCapacity);
			this.southWest = new Quadtree(new Rectangle({ x: x, y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2), this.nodeCapacity);
			this.southEast = new Quadtree(new Rectangle({ x: x + Math.floor(this.boundary.width / 2), y: y + Math.floor(this.boundary.width / 2) }, this.boundary.width / 2),  this.nodeCapacity);
			this.hasChildren = true;
		}
		else {
			throw new Error('Duplicate subdivision');
		}
	}

	public queryRange(range: Rectangle) {

	}

	public draw(ctx: CanvasRenderingContext2D) {
		ctx.strokeRect(this.boundary.origin.x, this.boundary.origin.y, this.boundary.width, this.boundary.width);
		ctx.fillStyle = 'yellow';
		ctx.fill();
		this.points.forEach((point) =>{
			ctx.beginPath();
			ctx.arc(point.x + 2, point.y + 2, 4, 0, 2 * Math.PI);
			ctx.stroke();
		});

		//ctx.fillRect(this.boundary.origin.x, this.boundary.origin.y, this.boundary.width, this.boundary.width);
		if (this.hasChildren) {
			this.northWest.draw(ctx);
			this.northEast.draw(ctx);
			this.southWest.draw(ctx);
			this.southEast.draw(ctx);
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
		return (point.x > this.origin.x && point.x < (this.origin.x + this.width) &&
				point.y > this.origin.y && point.y < (this.origin.y + this.width));
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
