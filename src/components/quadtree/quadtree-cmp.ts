import { css, html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { Quadtree, Rectangle } from '../../quadtree.js';
import { drawQuadtree, fps, insertPoint } from '../../quadtree-helper.js';
import { sharedStyles } from '../../styles/styles.js';
import { CanvasControls } from './canvas-controls-cmp.js';
import { CanvasElement } from './canvas-element-cmp.js';


CanvasControls;
CanvasElement;

@customElement('aa-quadtree')
export class QuadTree extends LitElement {

	@property()
	public fpsCounter = 0;

	@property()
	public bboxState = true;

	@property()
	public heatmapState = true;

	@property()
	public pointsState = true;

	@state() public canvasQry: CanvasElement;

	@query('canvas-controls') public controlsQry: CanvasControls;
	private stopDraw?: () => void;

	public dimension = 1024;
	private timer: NodeJS.Timer;
	@state() public quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, this.dimension), 1);

	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.canvasQry = this.renderRoot.querySelector('canvas-element-cmp')!;
		this.restartDraw();
		this.timer = setInterval(() => {
			this.fpsCounter = fps;
		}, 1000);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render(): unknown {
		return html`
			<h2 style="text-align: center;">Quad tree visualizer</h2>
			<h4 style="text-align: center;">FPS: ${ this.fpsCounter }</h4>
			<div class="flex-box">
				<canvas-controls 	.canvas=${ this.canvasQry }
								 	.quad=${ this.quad }
									.dimension=${ this.dimension }
									@reset-quad=${ this.resetQuad.bind(this) }
									@draw-bbox=${ this.setBbox.bind(this) }
									@draw-heatmap=${ this.setHeatmap.bind(this) }
									@draw-points=${ this.setPoints.bind(this) }
				></canvas-controls>
				<canvas-element-cmp @click=${ this.onCanvasClick.bind(this) } ></canvas-element-cmp>
			</div>	
			
		`;
	}

	public resetQuad({ detail:{ dimension, nodeCapacity } }: CustomEvent<{dimension: number, nodeCapacity: number}>) {
		this.quad = new Quadtree(new Rectangle({ x: 0, y: 0 }, dimension), nodeCapacity);
		this.restartDraw();
	}

	public setBbox({ detail:{ state } }: CustomEvent<{state: boolean}>) {
		this.bboxState = state;
		this.restartDraw();
	}

	public setHeatmap({ detail:{ state } }: CustomEvent<{state: boolean}>) {
		this.heatmapState = state;
		this.restartDraw();
	}

	public setPoints({ detail:{ state } }: CustomEvent<{state: boolean}>) {
		this.pointsState = state;
		this.restartDraw();
	}

	public onCanvasClick(e: MouseEvent) {
		insertPoint(this.quad, e.pageX - this.canvasQry.canvasEl.offsetLeft, e.pageY - this.canvasQry.canvasEl.offsetTop);
	}

	private restartDraw() {
		if (this.stopDraw != undefined)
			this.stopDraw?.();

		this.stopDraw = drawQuadtree(this.quad, this.canvasQry.canvasEl, this.bboxState, this.pointsState, this.heatmapState, true);
	}

	public static override styles = [
		sharedStyles, css`
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
	`,
	];

}
