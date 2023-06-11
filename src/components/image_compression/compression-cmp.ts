import { debug } from 'console';
import  { readdirSync } from 'fs';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { UntilDirective } from 'lit/directives/until.js';
import { buffer } from 'stream/consumers';
import { setTimeout } from 'timers/promises';

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
	@query('#select-output') public selectOutput: HTMLSelectElement;


	@property()
	public outputCtx: CanvasRenderingContext2D;

	@property()
	public inputCtx: CanvasRenderingContext2D;

	@property()
	public image?: File;

	@property()
	public imageBitmap: ImageBitmap;

	@property()
	public inputFileSize = 0;

	@property()
	public outputFileSize = 0;

	@property()
	public images: Images = {};

	@property()
	public shouldDrawBorders = false;

	@property()
	public outputSizeText = '0 KB';

	@property()
	public inputSizeText = '0 KB';

	@property()
	public inputImageSelectIndex = 0;


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
										<td>${ this.images.bmp24_size! }</td>
										<td>n/a</td>
										<td>Yes</td>
									</tr>
									<tr>
										<td>Png</td>
										<td>${ this.images.png_size! }</td>
										<td>n/a</td>
										<td>Yes</td>
									</tr>
									<tr>
										<td>Quadtree</td>
										<td>${ this.images.quadtree_size! }</td>
										<td>n/a</td>
										<td>Yes/No</td>
									</tr>
									<tr>
										<td>Jpeg</td>
										<td>${ this.images.jpeg100_size! }</td>
										<td>100%</td>
										<td>No</td>
									</tr>
									<tr>
										<td>Jpeg</td>
										<td>${ this.images.jpeg90_size! }</td>
										<td>90% (default)</td>
										<td>No</td>
									</tr>
									<tr>
										<td>webP</td>
										<td>${ this.images.webP100_size! }</td>
										<td>100%</td>
										<td>No</td>
									</tr>
									<tr>
										<td>webP</td>
										<td>${ this.images.webP75_size! }</td>
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
							<h1>${ 'Input' }</h1>
							<select disabled @change=${ this.outputImageChanged.bind(this) } name="select-input" id="select-input">
								<option ?selected=${ this.inputImageSelectIndex == 0 } value="0">TBD</option>
								<option ?selected=${ this.inputImageSelectIndex == 1 } value="1">PNG</option>
								<option ?selected=${ this.inputImageSelectIndex == 2 } value="2">Jpeg</option>
								<option ?selected=${ this.inputImageSelectIndex == 3 } value="3">webP</option>
								<option ?selected=${ this.inputImageSelectIndex == 4 } value="4">GIF</option>
							</select>
							<span href="">${ this.inputSizeText }</span>
						</div>
						<canvas id="input-canvas"></canvas>
					</div>
					<div class="center-children flexbox-row-child">
						<div class="center-children">
							<h1>${ 'Output' }</h1>
							<select ?disabled=${ this.images.bmp24_size == undefined } @change=${ this.outputImageChanged.bind(this) } name="select-output" id="select-output">
								<option value="1">Quadtree</option>
								<option value="2">PNG</option>
								<option value="3">Jpeg 100%</option>
								<option value="4">Jpeg 90%</option>
								<option value="5">webP 100%</option>
								<option value="6">webP 75%</option>
							</select>
							<span href="">${ this.outputSizeText }</span>
						</div>
						<canvas id="output-canvas"></canvas>
					</div>
				</div>
			</div>
		`;
	}

	private clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
	private async imageReceivedHandler(e: CustomEvent, image?: Blob) {
		if (e.detail)
			this.image = e.detail as File;
		else if (image)
			this.image = image as File;
		else
			return;

		this.setInputImageSelectIndex(this.image.type);
		this.inputSizeText = Math.round(this.image.size / 1024) + ' KB';
		this.outputSizeText = '0 KB';
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
		this.compressToAllFormats();

		let quadtree = new Quadtree2(new Rectangle({ x: 0, y: 0 }, data.width));
		addImageToQuadtree(data, quadtree);
		compressQuadtree(quadtree, compressionStrength);
		this.images.quadtree_size = Math.round((calculateQuadtreeSizeAfterSave(quadtree) / 1024));
		this.images.quadtree_optimized_size = Math.round((calculateQuadtreeSizeAfterSaveOptimized(quadtree) / 1024));
		this.images.quadtree_optimized_monochrome_size = Math.round((calculateQuadtreeSizeAfterSaveOptimizedMonochrome(quadtree) / 1024 / 8));
		this.outputSizeText = this.images.quadtree_size! + ` KB [${ this.images.quadtree_optimized_size } KB V2  |  ${ this.images.quadtree_optimized_monochrome_size } KB V2 mono]`;
		this.images.quadtree = quadtreeToImageData(quadtree, data.width, data.height, settings);
		this.outputCtx.putImageData(this.images.quadtree, 0, 0);
		this.selectOutput.selectedIndex = 0;
		console.log(this.selectOutput);
	}

	private async compressToAllFormats()  {
		this.images.bmp24_size = Math.round((this.inputCanvas.width * this.inputCanvas.height * 3) / 1024);
		this.inputCanvas.toBlob(async (blob) => { this.images.png_size = Math.round(blob!.size! / 1024); this.images.png = blob!; this.requestUpdate('images'); }, 'image/png');
		this.inputCanvas.toBlob(async (blob) => { this.images.jpeg100_size = Math.round((blob!.size! / 1024)); this.images.jpeg100 = blob!; this.requestUpdate('images'); }, 'image/jpeg', 1);
		this.inputCanvas.toBlob(async (blob) => { this.images.jpeg90_size = Math.round((blob!.size! / 1024)); this.images.jpeg90 = blob!; this.requestUpdate('images'); }, 'image/jpeg', .9);
		this.inputCanvas.toBlob(async (blob) => { this.images.webP100_size = Math.round((blob!.size! / 1024)); this.images.webP100 = blob!; this.requestUpdate('images'); }, 'image/webP', 1);
		this.inputCanvas.toBlob(async (blob) => { this.images.webP75_size = Math.round((blob!.size! / 1024)); this.images.webP75 = blob!; this.requestUpdate('images'); }, 'image/webP', .75);
	}

	private async outputImageChanged(e: Event) {
		let value = (e.target as HTMLSelectElement).value;
		if (value) {
			switch (value) {
			case '1': // this is quadtree as ImageData
				this.outputSizeText = this.images.quadtree_size! + ` KB [${ this.images.quadtree_optimized_size } KB V2  |  ${ this.images.quadtree_optimized_monochrome_size } KB V2 mono]`;
				this.outputCtx.putImageData(this.images.quadtree!, 0, 0);
				break;
			case '2':
				this.outputSizeText = this.images.png_size! + ' KB';
				this.setOutputCanvasImage(this.images.png!);
				break;
			case '3':
				this.outputSizeText = this.images.jpeg100_size! + ' KB';
				this.setOutputCanvasImage(this.images.jpeg100!);
				break;
			case '4':
				this.outputSizeText = this.images.jpeg90_size! + ' KB';
				this.setOutputCanvasImage(this.images.jpeg90!);
				break;
			case '5':
				this.outputSizeText = this.images.webP100_size! + ' KB';
				this.setOutputCanvasImage(this.images.webP100!);
				break;
			case '6':
				this.outputSizeText = this.images.webP75_size! + ' KB';
				this.setOutputCanvasImage(this.images.webP75!);
				break;

			default: // this is any other file as Blob
				this.outputSizeText = 'NaN KB';
				break;
			}
		}
	}

	private setInputImageSelectIndex(imageType: string) {
		switch (imageType) {
		case 'image/png':
			this.inputImageSelectIndex = 1;
			break;
		case 'image/jpeg':
			this.inputImageSelectIndex = 2;
			break;
		case 'image/webp':
			this.inputImageSelectIndex = 3;
			break;
		case 'image/gif':
			this.inputImageSelectIndex = 4;
			break;
		default:
			this.inputImageSelectIndex = 0;
			break;
		}
	}

	private async setOutputCanvasImage(blob: Blob) {
		this.imageBitmap = await createImageBitmap(blob);
		this.outputCanvas.width = this.imageBitmap.width;
		this.outputCanvas.height = this.imageBitmap.height;
		this.outputCtx.drawImage(this.imageBitmap, 0, 0);
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

type Images = {
	bmp24?: Blob;
	bmp24_size?: number;
	quadtree?: globalThis.ImageData;
	quadtree_size?: number;
	quadtree_optimized_size?: number;
	quadtree_optimized_monochrome_size?: number;
	png?: Blob;
	png_size?: number;
	jpeg100?: Blob;
	jpeg100_size?: number;
	jpeg90?: Blob;
	jpeg90_size?: number;
	webP100?: Blob;
	webP100_size?: number;
	webP75?: Blob;
	webP75_size?: number;
	tiff?: Blob;
	tiff_size?: number;
}
