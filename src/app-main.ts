import { css, html, LitElement } from 'lit';
import { query, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { CanvasControls } from './canvas-controls.js';
import { CanvasElement } from './canvas-element.js';

CanvasControls;
CanvasElement;

@customElement('app-main')
export class AppMain extends LitElement {

	@state() public canvasQry: CanvasElement;
	@query('canvas-controls') public controlsQry: CanvasControls;


	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		this.canvasQry = this.renderRoot.querySelector('canvas-element')!;
		console.log(this.canvasQry);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render(): unknown {
		return html`
			<canvas-element></canvas-element>
			<canvas-controls .canvas=${ this.canvasQry }></canvas-controls>
		`;
	}


	private applyNoise = ()=> {
		console.log('applying noise');
	};

	public static override styles = css`
		:host {
			display: grid;
			overflow: hidden;
    		grid-auto-rows: max-content;
			place-content: center;
		}
	`;

}
