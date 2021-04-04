/**
 * @copyright CEA-LIST/DIASI/SIALV/LVA (2019)
 * @author CEA-LIST/DIASI/SIALV/LVA <pixano@cea.fr>
 * @license CECILL-C
 */

import * as THREE from 'three';
// import { CameraControls } from './CameraControls';

/** Combination of a scene, a camera, a renderer and the rendered canvas. */
export class SceneView {

  readonly scene : THREE.Scene;

  readonly camera: THREE.PerspectiveCamera;

  readonly renderer: THREE.WebGLRenderer;

  farFog: number = 100;

  indicatorPosition: number = 0;

  scrollHeight: number = 0;

  // ground: THREE.Mesh;

  // cameraControls: CameraControls;

  /** The canvas element that shows the rendering result. */
  get domElement() {
    return this.renderer.domElement;
  }

  constructor() {

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    this.renderer.setClearColor(0xc5f5f5, .7 );

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    this.camera.position.z = 1;
    this.scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );
    // this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 1000, 0 );
    this.scene.add( hemiLight );

    // const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    // const material = new THREE.MeshNormalMaterial();

    // const mesh = new THREE.Mesh( geometry, material );

    // this.scene.add( mesh );
  }

  updateCameraPosition() {
    const scrollOffset = window.pageYOffset;
    const scrollPercent = scrollOffset/this.scrollHeight || 0;

    this.indicatorPosition += (scrollPercent - this.indicatorPosition)*0.1;
    this.camera.position.y = 0.2 -  this.indicatorPosition*6;
}

  /**
   * Recompute camera and renderer and canvas after a window resize.
   * @listens UIEvent#onresize
   */
  onResize() {
    this.scrollHeight = window.innerHeight*4;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  }

  public isOffScreen(object: THREE.Object3D) {
    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();

    // every time the camera or objects change position (or every frame)

    this.camera.updateMatrixWorld(); // make sure the camera matrix is updated
    this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
    cameraViewProjectionMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
    frustum.setFromProjectionMatrix( cameraViewProjectionMatrix );

    // frustum is now ready to check all the objects you need
    return frustum.intersectsObject( object );
  }

  /**
   * Intersection between click and rendered objects
   * @param x screen x
   * @param y screen y
   * @returns closest intersected object and the intersection point if any,
   *    otherwise [null, null]
   */
  public raycast(x: number, y: number, ...objects: THREE.Object3D[]) : [THREE.Object3D, THREE.Intersection] | [null, null] {
   const canvasBounds = this.renderer.domElement.getBoundingClientRect();
   const mouse = new THREE.Vector2();
   const raycaster = new THREE.Raycaster();
   // linePrecision is deprecated:
   // raycaster.linePrecision = 0.0;
   raycaster.params.Line!.threshold = 0.0;
   mouse.x = (x - canvasBounds.left) / canvasBounds.width * 2 - 1;
   mouse.y = - (y - canvasBounds.top) / canvasBounds.height * 2 + 1;
   raycaster.setFromCamera(mouse, this.camera);

   let out : [THREE.Object3D, THREE.Intersection] | [null, null] = [null, null];
   let distance = Infinity;
   for (const o of objects) {
     const m = raycaster.intersectObject(o, true);
     if (m.length > 0 && m[0].distance < distance) {
       out = [o, m[0]];
       distance = m[0].distance;
     }
   }
   return out;
 }
}
