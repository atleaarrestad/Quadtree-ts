import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../../styles/styles.js';
import { ImageInput } from './image-input-cmp.js';

ImageInput;

@customElement('aa-compression')
export class Compression extends LitElement {


	public override connectedCallback(): void {
		super.connectedCallback();
	}

	protected override render() {
		return html`
		<h1>This is express compress</h1>
		<aa-image-input></aa-image-input>
		`;
	}


	public static override styles = [
		sharedStyles, css`
		:host{

		}
		

		`,
	];


}
