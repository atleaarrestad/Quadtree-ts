import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { sharedStyles } from '../styles/styles.js';


@customElement('nav-bar-cmp')
export class NavBar extends LitElement {

	@property({ type: Array }) public isSelected: boolean[] = [ true, false, false ];

	public override connectedCallback(): void {
		super.connectedCallback();
	}

	protected override render() {
		return html`
		<div class="navbar flexContainer">
			<a class = "${ this.isSelected[0] ? 'selected' : '' }" @click=${ () => this.select(0) } href="/">Home</a>
			<a class = "${ this.isSelected[1] ? 'selected' : '' }" @click=${ () => this.select(1) } href="/quadtree">Quadtree</a>
			<a class = "${ this.isSelected[2] ? 'selected' : '' }" @click=${ () => this.select(2) } href="/compression">Compression</a>
		</div>
		`;
	}

	private unselectAll = () => {
		for (let index = 0; index < this.isSelected.length; index++)
			this.isSelected[index] = false;
	};

	private select = (routeNumber: number) => {
		this.unselectAll();
		this.isSelected[routeNumber] = true;
		this.requestUpdate();
	};

	public static override styles = [
		sharedStyles, css`
		:host{

		}
		a{
			text-decoration: none;
			font-weight: bold;
			color: #fff;
			border-right: 2px solid #888;
			width: 125px;
			display: grid;
			place-items: center;
			
		}
		a:hover{
			background-color: #444;
			text-shadow: #ccc 1px 0 10px;
			font-size: 17px
		}
		.navbar{
			background-color: #222;
			min-height: 50px;
		}
		.flexContainer{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			align-items: stretch;
			flex: 1 1 0px;
		}
		.selected{
			background-color: #999 !important;
		}

		`,
	];


}
