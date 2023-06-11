import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';


@customElement('aa-image-input')
export class ImageInput extends LitElement {

	@property()
	public image?: File;

	public override connectedCallback(): void {
		super.connectedCallback();
		this.renderRoot.addEventListener('dragover', (event) => { event.preventDefault(); });
		this.renderRoot.querySelector('.image-container')?.addEventListener('drop', (e) => { this.addFileFromDrop(e as DragEvent); });
	}

	protected override render() {
		return html`
		<div class="image-container" @drop=${ this.addFileFromDrop.bind(this) }>
			<p>[Drop image here]</p>
			<input @change=${ this.addFileFromInput.bind(this) } type="file" class="file" accept="image/jpeg, image/png, image/jpg">
		</div>
		
		<output></output>
		`;
	}

	private addFileFromInput = (e: Event) => {
		let input: HTMLInputElement = e.currentTarget as object as HTMLInputElement;
		let fileArray = input.files;

		if (!fileArray || !fileArray[0])
			return;

		this.image = fileArray[0] as File;
		this.imageChanged();
	};

	private addFileFromDrop = (e: DragEvent) =>{
		e.preventDefault();
		let files = e.dataTransfer?.files;
		if (!files || !files[0])
			return;
		if (files[0]?.type.match('image'))
			this.image = files[0] as File;


		this.imageChanged();
	};

	private imageChanged() {
		this.dispatchEvent(new CustomEvent('image-changed', {
			bubbles:  true,
			composed: true,
			detail:   this.image,
		}));
	}

	private deleteImage = () => {
		this.image = undefined;
	};

	private getImagefolderFilenames(): Array<string> {
		return [ 'src/components/image_compression/images/1-original.jpg' ];
	}

	public static override styles = [
		sharedStyles, css`
		:host{

		}
		.image-container{
			width: 100%;
			height: 150px;
			display: grid;
			place-items: center;
		}
		.image-container:hover{
			background-color: #bbb;
		}



		`,
	];


}
