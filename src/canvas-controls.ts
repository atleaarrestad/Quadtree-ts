import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { CanvasElement } from './canvas-element.js';


@customElement('canvas-controls')
export class CanvasControls extends LitElement {

	@property({ type: Object }) public canvas?: CanvasElement;
	@query('#noise-button') public noiseButton: HTMLButtonElement;

	@query('#random-button') public randomButton: HTMLButtonElement;


	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render(): unknown {
		return html`
			<button type="button" id="#noise-button">yoyo</button>
			<button type="button" id="#random-button" @click=${ this.applyNoise }>yoyo</button>
			<h1>sjiggelige h1</h1>
		`;
	}

	private applyNoise = ()=> {
		console.log(this.canvas);
	};

	public static override styles = css`
		:host {
			border: 1px solid black;
			display: grid;
			overflow: hidden;
		}

		
	`;

}
