import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../styles/styles.js';


@customElement('aa-home')
export class Home extends LitElement {

	public override connectedCallback(): void {
		super.connectedCallback();
	}

	protected override render() {
		return html`
		<h1>This is home yes</h1>
		<h2>This is home yes</h2>
		<h3>This is home yes</h3>
		<h4>This is home yes</h4>
		<h5>This is home yes</h5>
		<h6>This is home yes</h6>
		<h6>Eat ass</h6>
		`;
	}


	public static override styles = [
		sharedStyles, css`
		:host{

		}
		

		`,
	];


}
