
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';


@customElement('aa-image-detail')
export class ImageDetail extends LitElement {

	@property()
	public titleText: string;

	public override connectedCallback(): void {
		super.connectedCallback();
	}

	protected override render() {
		return html`
			<div class="flexbox">
				<h1>${ this.titleText }</h1>
				<a href="" >download @ ${ '360KB' } </a>
			</div>
		`;
	}


	public static override styles = [
		sharedStyles, css`
		:host{

		}
		.flexbox{
			display: flex;
			flex-direction: column;
		}
		
		div{
			text-align: center;
		}

		a{
			font-size: 20px;
		}

		`,
	];


}
