import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';


@customElement('aa-image-input')
export class ImageInput extends LitElement {

	@property()
	public images: any[] = [];

	public override connectedCallback(): void {
		super.connectedCallback();
	}

	protected override render() {
		return html`
		<div class="image-container">
			<p>Drop image here</p>
			<input @change=${ this.addFileFromInput.bind(this) } type="file" class="file" multiple accept="image/jpeg, image/png, image/jpg">
			<output></output>
		</div>
		`;
	}

	private addFileFromInput = (input: HTMLInputElement) => {
		console.log('adding files from input: ');
		console.log(input.files);
		let fileArray = input.files;
		if (!fileArray)
			return;

		for (let index = 0; index < fileArray.length; index++)
			this.images.push(fileArray[index]);
		this.displayImages();
	};

	private addFileFromDrop = (e: DragEvent) =>{
		console.log('adding files from drop: ');
		console.log(e);
		e.preventDefault();
		let files = e.dataTransfer?.files;
		if (!files)
			return;

		for (let i = 0; i < files.length; i++) {
			if (files[i] && files[i]?.type.match('image')) {
				if (this.images.every(image => image.name !== files![i]!.name))
					this.images.push(files[i]);
			}
		}
		this.displayImages();
	};

	private displayImages = () => {
		let images = '';
		this.images.forEach((image, index) => {
			images += `<div class="image">
						<img src="${ URL.createObjectURL(image) }" alt="image">
						<span onclick="deleteImage(${ index })">&times;</span>
					  </div>`;
		});
		let output = this.querySelector('output');
		if (output)
			output.innerHTML = images;
	};

	private deleteImage = (index: number) => {
		this.images.splice(index, 1);
		this.displayImages();
	};

	public static override styles = [
		sharedStyles, css`
		:host{

		}
		.image-container{
			background-color: #ddd;
			width: 300px;
			height: 150px;
			border: 2px solid #aaa;
			border-radius: 16px;
			display: grid;
			place-items: center;
		}
		.image-container:hover{
			opacity: .55;
			font-size: 18px;
			border: 3px solid #111;
		}
		div{
			background-color: red;
		}
		

		`,
	];


}
