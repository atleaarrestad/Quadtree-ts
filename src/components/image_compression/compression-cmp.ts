import { debug } from 'console';
import { writeFile } from 'fs';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { UntilDirective } from 'lit/directives/until.js';
import { buffer } from 'stream/consumers';

import { sharedStyles } from '../../styles/styles.js';
import { compress, computeCompressedSizeInBytes, computeHowManyIntegers, uncompress } from './fast-int-compression.js';
import { ImageInput } from './image-input-cmp.js';
import { ImageData, Quadtree2, Rectangle } from './quadtree2.js';
import { addImageToQuadtree, blendColours, compressQuadtree, getColourDifference } from './quadtree2-helper.js';

ImageInput;
@customElement('aa-compression')
export class Compression extends LitElement {

	@property()
	public inputCanvas: HTMLCanvasElement;

	@property()
	public outputCanvas: HTMLCanvasElement;

	@property()
	public images: File[];


	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.inputCanvas = this.renderRoot.querySelector('#input-canvas')!;
		this.outputCanvas = this.renderRoot.querySelector('#output-canvas')!;

		/*
		let arraybuff = new ArrayBuffer(4);
		let view = new DataView(arraybuff);
		view.setInt8(0, 250); 	// store width
		view.setInt8(1, 65); 	// store r
		view.setInt8(2, 111); 	// store g
		view.setInt8(3, 2); 	// store b
		console.log(new Uint8Array(arraybuff).toString());
		let b = new Blob([ arraybuff ]);
		let blobUrl = URL.createObjectURL(b);
		let link = document.createElement('a'); // Or maybe get it from the current document
		link.href = blobUrl;
		link.download = 'aDefaultFileName.txt';
		link.innerHTML = 'Click here to download the file';
		document.body.appendChild(link); // Or append it whereever you want
		*/
	}

	protected override render() {
		return html`
			<h1>This is express compress</h1>
			<aa-image-input @image-array-changed=${ (e: CustomEvent) => this.imageReceivedHandler(e) } id="image-input"></aa-image-input>
			<canvas id="input-canvas"></canvas>
			<canvas id="output-canvas"></canvas>
		`;
	}

	private imageReceivedHandler(e: CustomEvent) {
		if (!e.detail)
			return;

		this.images = e.detail as File[];
		this.compressImageSequence();
	}

	private async compressImageSequence() {
		let data: globalThis.ImageData = await this.extractDataFromImage();
		let quadtree = new Quadtree2(new Rectangle({ x: 0, y: 0 }, data.width));
		addImageToQuadtree(data, quadtree);
		compressQuadtree(quadtree, 5);


		console.log(quadtree);
	}

	private async extractDataFromImage() {
		let ctx = this.inputCanvas.getContext('2d')!;
		let image = await createImageBitmap(this.images[0]!);
		this.inputCanvas.width = image.width;
		this.inputCanvas.height = image.height;
		ctx.drawImage(image, 0, 0);

		return ctx.getImageData(0, 0, this.inputCanvas.width, this.inputCanvas.height);
	}

	public static override styles = [
		sharedStyles, css`
		:host{

		}
		
		canvas{
			background-color: red;
		}
		`,
	];


}
