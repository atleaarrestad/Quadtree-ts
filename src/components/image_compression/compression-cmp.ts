import { debug } from 'console';
import  { readdirSync } from 'fs';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { UntilDirective } from 'lit/directives/until.js';
import { buffer } from 'stream/consumers';

import { sharedStyles } from '../../styles/styles.js';
import { compress, computeCompressedSizeInBytes, computeHowManyIntegers, uncompress } from './fast-int-compression.js';
import { ImageDetail } from './image-details-cmp.js';
import { ImageInput } from './image-input-cmp.js';
import { ImageData, Quadtree2, Rectangle, RGB } from './quadtree2.js';
import { addImageToQuadtree, blendColours, calculateQuadtreeSizeAfterSave, calculateQuadtreeSizeAfterSaveOptimized, calculateQuadtreeSizeAfterSaveOptimizedMonochrome, compressQuadtree, getColourDifference, quadtreeToImageData, QuadtreeToImageDataSettings } from './quadtree2-helper.js';

ImageInput;
ImageDetail;
@customElement('aa-compression')
export class Compression extends LitElement {

	@query('#compression-slider') public sliderQuery: HTMLInputElement;
	@query('#draw-sequence-cbox') public drawSequenceQuery: HTMLInputElement;
	@query('#draw-border-cbox') public drawBordersQuery: HTMLInputElement;
	@query('#border-cutoff') public borderCutoffQuery: HTMLInputElement;
	@query('#border-color') public borderColorQuery: HTMLInputElement;
	@query('#input-canvas') public inputCanvas: HTMLCanvasElement;
	@query('#output-canvas') public outputCanvas: HTMLCanvasElement;


	@property()
	public outputCtx: CanvasRenderingContext2D;

	@property()
	public inputCtx: CanvasRenderingContext2D;

	@property()
	public image: File;

	@property()
	public imageBitmap: ImageBitmap;

	@property()
	public inputFileSize = 0;

	@property()
	public outputFileSize = 0;

	@property()
	public imageSizes: ImageSizes = {};

	@property()
	public shouldDrawBorders = false;


	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.outputCtx = this.outputCanvas.getContext('2d')!;
		this.inputCtx = this.inputCanvas.getContext('2d')!;
		this.drawBordersQuery.addEventListener('click', () =>{ this.shouldDrawBorders = this.drawBordersQuery.checked; });

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
			<div class="flexbox-col">
				<div class="border">
					<aa-image-input 	aa-image-input @image-changed=${ (e: CustomEvent) => this.imageReceivedHandler(e) } id="image-input"></aa-image-input>
					<hr>
					<div class="flexbox-row">
						<div class="flexbox-row-child center-children left-align-text">
							<div>
								<label for="compression-slider">Compression strength</label>
								<input type="range" min="0" max="416" value="50" class="slider" id="compression-slider">
							</div>
							<div>
								<label for="draw-sequence-cbox">Show compression sequence</label>
								<input type="checkbox" min="0" max="416" value="checked" class="" id="draw-sequence-cbox">
								
							</div>
							<div>
								<label for="draw-border-cbox">Draw borders</label>
								<input type="checkbox" min="0" max="416" value="checked" class="" id="draw-border-cbox">
								<input ?disabled=${ !this.shouldDrawBorders } type="color" value="#000" class="" id="border-color">
							</div>
							<div >
								
								<label for="border-cutoff">Border cutoff</label>
								<select ?disabled=${ !this.shouldDrawBorders } name="border-cutoff" id="border-cutoff" value="4">
									<option value="1">1</option>
									<option value="2">2</option>
									<option selected value="4">4</option>
									<option value="8">8</option>
									<option value="16">16</option>
									<option value="32">32</option>
									<option value="64">64</option>
									<option value="128">128</option>
									<option value="256">256</option>
								</select>
							</div>
							<div>
								<button @click=${ this.compressImageSequence.bind(this) }>Compress! </button>
							</div>
						</div>
						<div class="flexbox-row-child center-children">
							<table>
								<thead>
									<tr>
										<th>Algorithm</th>
										<th>Size KB</th>
										<th>Quality</th>
										<th>Lossless</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>bmp 24bit</td>
										<td>${ this.imageSizes.bmp24! }</td>
										<td>n/a</td>
										<td>Yes</td>
									</tr>
									<tr>
										<td>Png</td>
										<td>${ this.imageSizes.png! }</td>
										<td>n/a</td>
										<td>Yes</td>
									</tr>
									<tr>
										<td>Quadtree</td>
										<td>${ this.imageSizes.quadtree! }</td>
										<td>n/a</td>
										<td>Yes/No</td>
									</tr>
									<tr>
										<td>Jpeg</td>
										<td>${ this.imageSizes.jpeg100! }</td>
										<td>100%</td>
										<td>No</td>
									</tr>
									<tr>
										<td>Jpeg</td>
										<td>${ this.imageSizes.jpeg90! }</td>
										<td>90% (default)</td>
										<td>No</td>
									</tr>
									<tr>
										<td>webP</td>
										<td>${ this.imageSizes.webP100! }</td>
										<td>100%</td>
										<td>No</td>
									</tr>
									<tr>
										<td>webP</td>
										<td>${ this.imageSizes.webP75! }</td>
										<td>75% (default)</td>
										<td>No</td>
									</tr>

								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="gapdiv"></div>
				<div class="flexbox-row border">
					<div class="center-children flexbox-row-child">
						<div class="center-children">
							<h1>${ 'Uncompressed' }</h1>
							<span href="">${ this.inputFileSize }KB</span>
						</div>
						<canvas id="input-canvas"></canvas>
					</div>
					<div class="center-children flexbox-row-child">
						<div class="center-children">
							<h1>${ 'Compressed' }</h1>
							<span href="">${ this.imageSizes.quadtree }KB [${ this.imageSizes.quadtree_optimized }KB v2 | ${ this.imageSizes.quadtree_optimized_monochrome }KB v2 monochrome]</span>
						</div>
						<canvas id="output-canvas"></canvas>
					</div>
				</div>
			</div>
		`;
	}

	private clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
	private async imageReceivedHandler(e: CustomEvent) {
		if (!e.detail)
			return;

		this.image = e.detail as File;
		this.inputFileSize = Math.round(this.image.size / 1024);
		this.imageBitmap = await createImageBitmap(this.image!);
		this.inputCanvas.width = this.imageBitmap.width;
		this.inputCanvas.height = this.imageBitmap.height;
		this.outputCanvas.width = this.imageBitmap.width;
		this.outputCanvas.height = this.imageBitmap.height;
		this.inputCtx.drawImage(this.imageBitmap, 0, 0);
	}

	private async compressImageSequence() {
		if (!this.image)
			return;

		let settings = this.getQuadtreeToImageDataSettings();
		let compressionStrength = this.clamp(parseInt(this.sliderQuery.value), 0, 416);
		let data = this.inputCtx.getImageData(0, 0, this.inputCanvas.width, this.inputCanvas.height);
		this.getImageSizes();

		let quadtree = new Quadtree2(new Rectangle({ x: 0, y: 0 }, data.width));
		addImageToQuadtree(data, quadtree);
		compressQuadtree(quadtree, compressionStrength);
		this.imageSizes.quadtree = Math.round((calculateQuadtreeSizeAfterSave(quadtree) / 1024));
		this.imageSizes.quadtree_optimized = Math.round((calculateQuadtreeSizeAfterSaveOptimized(quadtree) / 1024));
		this.imageSizes.quadtree_optimized_monochrome = Math.round((calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree) / 1024 / 8));
		this.outputCtx.putImageData(quadtreeToImageData(quadtree, data.width, data.height, settings), 0, 0);
	}

	private async getImageSizes()  {
		this.imageSizes.bmp24 = Math.round((this.inputCanvas.width * this.inputCanvas.height * 3) / 1024);
		this.inputCanvas.toBlob(async (blob) => { this.imageSizes.png = Math.round((blob!.size! / 1024)); this.requestUpdate('imageSizes'); }, 'image/png');
		this.inputCanvas.toBlob(async (blob) => { this.imageSizes.jpeg100 = Math.round((blob!.size! / 1024)); this.requestUpdate('imageSizes'); }, 'image/jpeg', 1);
		this.inputCanvas.toBlob(async (blob) => { this.imageSizes.jpeg90 = Math.round((blob!.size! / 1024)); this.requestUpdate('imageSizes'); }, 'image/jpeg', .9);
		this.inputCanvas.toBlob(async (blob) => { this.imageSizes.webP100 = Math.round((blob!.size! / 1024)); this.requestUpdate('imageSizes'); }, 'image/webP', 1);
		this.inputCanvas.toBlob(async (blob) => { this.imageSizes.webP75 = Math.round((blob!.size! / 1024)); this.requestUpdate('imageSizes'); }, 'image/webP', .75);
	}

	private hexToRGB(hex: string): RGB | null {
		if (hex.length === 7) {
			return {
				red:   parseInt(hex.slice(1, 3), 16),
				green: parseInt(hex.slice(3, 5), 16),
				blue:  parseInt(hex.slice(5, 7), 16),
			};
		}

		return null;
	}

	private getQuadtreeToImageDataSettings(): QuadtreeToImageDataSettings {
		return {
			borderCutoff:      parseInt(this.borderCutoffQuery.value),
			shouldDrawBorders: this.drawBordersQuery.checked,
			borderColor:       this.hexToRGB(this.borderColorQuery.value)!,
		};
	}


	public static override styles = [
		sharedStyles, css`
		:host{
			display: grid;
			justify-self: center;
			align-self: center;
			background-color: white;
			height: fit-content;
			background-color: wheat;
			
		}
		
		canvas{
			background-color: red;
			border-radius: 16px;
			border: #ced3d9 solid 1px;
			box-shadow: rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;
			margin-left: 32px;
			margin-right: 32px;
			margin-bottom: 32px;
		}

		.flexbox-row{
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			margin: 16px 16px 16px 16px;

		}
		.flexbox-row-child{
			flex-grow: 1;
		}
		.flexbox-col{
			display: flex;
			flex-wrap: wrap;
			flex-direction: column;
			flex:1;
		}
		.center-children{
			display: grid;
			place-content: center;
			text-align: center;
		}
		.left-align-text{
			text-align: left;
		}
		label{
			display: inline-block;
			width:200px;

		}
		.settings{
			border: 2px solid whitesmoke;
			border-radius: 4px;
		}
		table {
			border: 2px solid whitesmoke;
			border-radius: 4px;
		}
		td{
			padding-right:15px;
			padding-left:15px;
			text-align: center;
		}
		thead tr{
			background-color:#ced3d9;
		}
		tr:nth-child(even){
			background-color: whitesmoke;
		}
		.gapdiv{
			height:50px;
		}
		.border{
			border-radius: 16px;
			border: #ced3d9 solid 1px;
			box-shadow: rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;
			background-color:white;
		}
		`,
	];


}

type ImageSizes = {
	bmp24?: number;
	quadtree?: number;
	quadtree_optimized?: number;
	quadtree_optimized_monochrome?: number;
	png?: number;
	jpeg100?: number;
	jpeg90?: number;
	webP100?: number;
	webP75?: number;
	tiff?: number;
}
