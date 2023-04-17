import { css, CSSResultGroup, html, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { drawQuadtree } from './draw-quadtree.js';


@customElement('canvas-element')
export class CanvasElement extends LitElement {

	@query('canvas') public canvasEl: HTMLCanvasElement;

	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.canvasEl.width = this.offsetWidth;
		this.canvasEl.height = this.offsetHeight;
		drawQuadtree(this.canvasEl);
	}

	protected override render(): unknown {
		return html`
			<canvas></canvas>
		`;
	}

	public static override styles = css`
		:host {
			border: 1px solid black;
			display: grid;
			height: 800px;
			overflow: hidden;
		}
		canvas {
			height: 100%;
			width: 100%;
		}
	`;

}
