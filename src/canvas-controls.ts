import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { CanvasElement } from './canvas-element.js';
import { dimension, populateWithNoise, populateWithPerlinNoise, resetTree } from './quadtree-helper.js';

@customElement('canvas-controls')
export class CanvasControls extends LitElement {

	@property({ type: Object }) public canvas?: CanvasElement;
	@query('#clear-button') public clearButton: HTMLButtonElement;
	@query('#perlin-noise-button') public perlinButton: HTMLButtonElement;
	@query('#random-noise-button') public randomButton: HTMLButtonElement;
	@query('#capacity-slider') public capacitySlider: HTMLInputElement;
	@query('#capacity-text') public capacityText: HTMLSpanElement;


	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render(): unknown {
		return html`
			<div class="flex-box">
				<button style="flex-grow:0.5;" type="button" id="#noise-button" @click=${ () => resetTree(parseInt(this.capacitySlider.value)) }>Clear Quadtree</button>
				<div style="flex-grow:0.5;">
					<span id = "capacity-text">Node capacity [1]</span>
					<input type="range" min="1" max="10" value="1" id="capacity-slider" @change=${ () => this.updateCapacityText() } />
				</div>
				
			</div>
			
			<button type="button" id="#perlin-noise-button" @click=${ () => populateWithPerlinNoise(dimension, .54) }>Add perlin noise</button>
			<button type="button" id="#random-noise-button" @click=${ () => populateWithNoise(50) }>Add random noise</button>
		`;
	}

	private updateCapacityText() {
		this.capacityText.textContent = `Node capacity [${ this.capacitySlider.value }]`;
	}

	public static override styles = css`
		:host {
			border: 1px solid black;
			display: grid;
			overflow: hidden;
		}

		.flex-box{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			flex-grow: 1;
			justify-content: center;
		}
	`;

}
