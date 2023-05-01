import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { CanvasElement } from './canvas-element.js';
import { Quadtree } from './quadtree.js';
import { populateWithNoise, populateWithPerlinNoise } from './quadtree-helper.js';

@customElement('canvas-controls')
export class CanvasControls extends LitElement {

	@property({ type: Object }) public canvas?: CanvasElement;
	@property({ type: Number }) private dimension: number;
	@property({ type: Quadtree }) public quad: Quadtree;
	@query('#clear-button') public clearButton: HTMLButtonElement;
	@query('#capacity-slider') public capacitySlider: HTMLInputElement;
	@query('#capacity-text') public capacityText: HTMLSpanElement;
	@query('#check-bbox') public checkBbox: HTMLInputElement;
	@query('#check-points') public checkPoints: HTMLInputElement;
	@query('#check-heatmap') public checkHeatmap: HTMLInputElement;


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
				<span id = "capacity-text" >Node capacity [1]</span>
				<input type="range" min="1" max="10" value="1" id="capacity-slider" @change=${ () => this.updateCapacityText() } />
			</div>
			<div class="flex-box">
				<input type="checkbox" id="check-bbox" name="check-bbox" @change=${ () => this.dispatchSetDrawBbox(this.checkBbox.checked) } checked>
      			<label for="check-bbox">Draw Bbox</label>
			</div>
			<div class="flex-box">
				<input type="checkbox" id="check-points" name="check-points" @change=${ () => this.dispatchSetPoints(this.checkPoints.checked) } checked>
      			<label for="check-points">Draw Points</label>
			</div>
			<div class="flex-box">
				<input type="checkbox" id="check-heatmap" name="check-heatmap" @change=${ () => this.dispatchSetHeatmap(this.checkHeatmap.checked) } checked>
      			<label for="check-heatmap">Draw heatmap</label>
			</div>
			
			<button type="button" id="#clear-button" @click=${ () => this.dispatchQuadReset(this.dimension, parseInt(this.capacitySlider.value)) }>Clear Quadtree</button>
			<button type="button" id="#perlin-noise-button" @click=${ () => populateWithPerlinNoise(this.quad, .55, 16, 10) }>Add perlin noise</button>
			<button type="button" id="#random-noise-button" @click=${ () => populateWithNoise(this.quad, 50) }>Add random noise</button>
		`;
	}

	private updateCapacityText() {
		this.capacityText.textContent = `Node capacity [${ this.capacitySlider.value }]`;
	}

	private dispatchQuadReset(newDimension: number, newNodeCapacity: number) {
		this.dispatchEvent(new CustomEvent('reset-quad', { bubbles: true, detail: { dimension: newDimension, nodeCapacity: newNodeCapacity } }));
	}

	private dispatchSetDrawBbox(state: boolean) {
		this.dispatchEvent(new CustomEvent('draw-bbox', { bubbles: true, detail: { state: state  } }));
	}

	private dispatchSetHeatmap(state: boolean) {
		console.log(`dispatching with value: ${ state }`);
		this.dispatchEvent(new CustomEvent('draw-heatmap', { bubbles: true, detail: { state: state  } }));
	}

	private dispatchSetPoints(state: boolean) {
		this.dispatchEvent(new CustomEvent('draw-points', { bubbles: true, detail: { state: state  } }));
	}

	public static override styles = css`
		:host {
			border: 1px solid black;
			display: grid;
			overflow: hidden;
			//block-size: fit-content;
		}

		.flex-box{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			flex-grow: 1;
			justify-content: center;
			align-items: center;
			max-height: 36px;
		}
	
	`;

}
