// import * as THREE from 'three';
// import { Vector2 } from 'three';

export class CameraControls {
	mouseX: number = -1;
	mouseY: number = -1;
	domElement: HTMLElement;
	width: number = -1;
	height: number = -1;
	
	constructor(domElement: HTMLElement) {
		this.onMove = this.onMove.bind(this);
		this.domElement = domElement;
		this.domElement.addEventListener( 'mousemove', this.onMove, false );
		window.addEventListener("resize", () => this.onResize());
	}

	onResize() {
		// To be called when the parent changes.
		const parent = this.domElement.parentElement;
		if (parent) {
			this.width = 0.5*parent.clientWidth;
			this.height = 0.5*parent.clientHeight;
		}
	}

	onMove(event: any) {
		const parent = this.domElement.parentElement;
		if (parent) {
			this.mouseX = ( event.clientX - 0.5 * this.width );
			this.mouseY = ( event.clientY - 0.5 * this.height );
		}
	}
}