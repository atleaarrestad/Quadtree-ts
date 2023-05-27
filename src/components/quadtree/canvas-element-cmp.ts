import { css, html, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';

@customElement('canvas-element-cmp')
export class CanvasElement extends LitElement {

	@query('canvas') public canvasEl: HTMLCanvasElement;

	public override connectedCallback() {
		super.connectedCallback();
		window.addEventListener('resize', this.resizeCanvas);
		this.updateComplete.then(()=>{
			this.canvasEl.width = 512;
			this.canvasEl.height = 512;
		});
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('resize', this.resizeCanvas);
	}

	protected override render(): unknown {
		return html`
			<canvas></canvas>
		`;
	}

	private resizeCanvas = ()=> {
		this.style.setProperty('height', this.offsetWidth + 'px');
	};


	public static override styles = [
		sharedStyles, css`
		:host {
			border: 1px solid black;
			display: grid;
			overflow: hidden;
			min-width: 512px;
			min-height: 512px;
			max-height: 1024px;
			max-width: 1024px;
		}
		canvas {
			height: 100%;
			width: 100%;
		}
	`,
	];

}
