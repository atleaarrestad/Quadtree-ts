import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';


@customElement('aa-image-input')
export class ImageInput extends LitElement {

	@property()
	public images: File[] = [];

	public override connectedCallback(): void {
		super.connectedCallback();
		this.renderRoot.addEventListener('dragover', (event) => { event.preventDefault(); });
		this.renderRoot.querySelector('.image-container')?.addEventListener('drop', (e) => { this.addFileFromDrop(e as DragEvent); });
	}

	protected override render() {
		return html`
		<div class="image-container" @drop=${ this.addFileFromDrop.bind(this) }>
			<p>Drop image here</p>
			<input @change=${ this.addFileFromInput.bind(this) } type="file" class="file" multiple accept="image/jpeg, image/png, image/jpg">
		</div>
		<output></output>
		`;
	}

	private addFileFromInput = (e: Event) => {
		let input: HTMLInputElement = e.currentTarget as object as HTMLInputElement;
		let fileArray = input.files;

		if (!fileArray)
			return;

		for (let index = 0; index < fileArray.length; index++)
			this.images.push(fileArray[index] as File);

		this.imageArrayChanged();
	};

	private addFileFromDrop = (e: DragEvent) =>{
		e.preventDefault();
		let files = e.dataTransfer?.files;
		if (!files)
			return;

		for (let i = 0; i < files.length; i++) {
			if (files[i] && files[i]?.type.match('image')) {
				if (this.images.every(image => image.name !== files![i]!.name))
					this.images.push(files[i] as File);
			}
		}
		this.imageArrayChanged();
	};

	private displayImages() {
		let images = '';
		this.images.forEach((image, index) => {
			images += `<div class="image">
					  <img src="${ URL.createObjectURL(image) }" alt="image">
					</div>`;
		});
		let output = this.renderRoot?.querySelector('output');
		if (output)
			output.innerHTML = images;
	}

	private imageArrayChanged() {
		this.dispatchEvent(new CustomEvent('image-array-changed', {
			bubbles:  true,
			composed: true,
			detail:   this.images,
		}));
		this.displayImages();
	}

	private deleteImage = (index: number) => {
		//unfinished
		this.images.splice(index, 1);
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



		`,
	];


}
