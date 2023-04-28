import { css, html, LitElement } from 'lit';
import { query, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { CanvasControls } from './canvas-controls.js';
import { CanvasElement } from './canvas-element.js';
import { Quadtree, Rectangle } from './quadtree.js';
import { drawQuadtree, insertPoint } from './quadtree-helper.js';


CanvasControls;
CanvasElement;

@customElement('app-main')
export class AppMain extends LitElement {

	@state() public canvasQry: CanvasElement;
	@query('canvas-controls') public controlsQry: CanvasControls;
	private stopDraw?: () => void;

	public dimension = 1024;
	@state() public quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, this.dimension), 1);

	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.canvasQry = this.renderRoot.querySelector('canvas-element')!;
		this.stopDraw = drawQuadtree(this.quad, this.canvasQry.canvasEl);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render(): unknown {
		return html`
			<h2 style="text-align: center;">Quad tree visualizer</h2>
			<div class="flex-box">
				<canvas-controls .canvas=${ this.canvasQry } .quad=${ this.quad } .dimension=${ this.dimension } @reset-quad=${ this.resetQuad.bind(this) }></canvas-controls>
				<canvas-element @click=${ this.onCanvasClick.bind(this) }></canvas-element>
			</div>	
			
		`;
	}

	private applyNoise = ()=> {
		console.log('applying noise');
	};

	public resetQuad({ detail:{ dimension, nodeCapacity } }: CustomEvent<{dimension: number, nodeCapacity: number}>) {
		this.stopDraw?.();
		this.quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, dimension), nodeCapacity);
		this.stopDraw = drawQuadtree(this.quad, this.canvasQry.canvasEl);
	}

	public onCanvasClick(e: MouseEvent) {
		insertPoint(this.quad, e.pageX - this.canvasQry.canvasEl.offsetLeft, e.pageY - this.canvasQry.canvasEl.offsetTop);
	}

	public static override styles = css`
		:host {
			display: grid;
			overflow: hidden;
    		grid-auto-rows: max-content;
			place-content: center;
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
