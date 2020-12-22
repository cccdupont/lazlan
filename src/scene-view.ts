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

  ground: THREE.Mesh;

  // cameraControls: CameraControls;

  /** The canvas element that shows the rendering result. */
  get domElement() {
    return this.renderer.domElement;
  }

  constructor() {
    this.scene = new THREE.Scene();
    // this.scene.add(new THREE.AmbientLight(0xffffff, 1));
    this.scene.background = new THREE.Color( 0xffffff ); // blue
    //this.scene.fog = new THREE.Fog( 0xffffff, 50, 70 );
    this.scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );
    // this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 1000, 0 );
    this.scene.add( hemiLight );



    // var plane = new THREE.GridHelper(100, 10);
    // this.scene.add(plane);
	
    // var worldAxis = new THREE.AxesHelper(20);
    // this.scene.add(worldAxis);

    // LIGHTS

    // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    // hemiLight.color.setHSL( 0.6, 1, 0.6 );
    // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    // hemiLight.position.set( 0, 50, 0 );
    // this.scene.add( hemiLight );

    // // const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // // this.scene.add( hemiLightHelper );

    // const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    // dirLight.color.setHSL( 0.1, 1, 0.95 );
    // dirLight.position.set( - 3, -1.75, 2 );
    // dirLight.position.multiplyScalar( 30 );
    // this.scene.add( dirLight );

    // dirLight.castShadow = true;

    // dirLight.shadow.mapSize.width = 300;
    // dirLight.shadow.mapSize.height = 300;

    // // shadow size
    // const d = 200;

    // dirLight.shadow.camera.left = - d;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = - d;

    // dirLight.shadow.camera.far = 500;
    // dirLight.shadow.bias = - 0.0001;

    // const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
    // this.scene.add( dirLightHelper );

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.setClearColor(0x000000, 0 );
    this.renderer = renderer;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 15, 50)

    // const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // // 20m height at scene center
    // // camera.rotation.x = Math.PI/4;
    // camera.position.set(0, 0, 15);
    // camera.lookAt(0,-50,0);
    this.camera = camera;
    // const axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
    window.addEventListener("resize", () => this.onResize());

    // ground
    // const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xBC4A6F, depthWrite: false } ) );
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.receiveShadow = true;
    // this.scene.add( mesh );
    const groundGeo = new THREE.PlaneBufferGeometry( 200, 200, 0 );
    const groundMat = new THREE.MeshLambertMaterial( { color: 0xDC143C, fog: true } );
    
    // var texture, material;

    // texture = THREE.ImageUtils.loadTexture( "./cyclo_emissive.png" );
    // texture.wrapT = THREE.RepeatWrapping;  // This doesn't seem to work;
    // material = new THREE.MeshLambertMaterial({ map : texture });
    // plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 3500), material);
    // plane.position.x = 100;
    // plane.rotation.z = 2;  // Not sure what this number represents.
    // scene.add(plane);


    this.ground = new THREE.Mesh( groundGeo, groundMat );
    this.ground.rotation.x = - Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add( this.ground );

//     var geometry = new THREE.PlaneBufferGeometry(100, 100, 0);
// var material = new THREE.MeshLambertMaterial({
//   color: 0x898989,
//   fog: true
// });
// var plane = new THREE.Mesh(geometry, material);
// this.scene.add(plane);
    

    // Event
    // this.orbitControls.addEventListener("change", () => {
    //     this.render();
    // });

    // const animate = () => {

    //   requestAnimationFrame( animate );
    
    //   // required if controls.enableDamping or controls.autoRotate are set to true
    //   this.cameraControls.update();
    
    //   renderer.render( this.scene, camera );
    
    // }

    // animate();
  }

  /** Trigger a rendering of the scene. */
  // public render() {
  //   if (this.renderPending) { return; }

  //   this.renderPending = true;
  //   requestAnimationFrame( () => {
  //     this.renderPending = false;
  //     this.renderer.render(this.scene, this.camera);
  //   });
  // }

  /**
   * Recompute camera and renderer and canvas after a window resize.
   * @listens UIEvent#onresize
   */
  public onResize() {
    // To be called when the parent changes.
    const parent = this.domElement.parentElement;
    if (parent) {
      this.renderer.setSize(parent.clientWidth, parent.clientHeight);
      const aspect = parent.clientWidth / parent.clientHeight;
      if (this.camera.type === "PerspectiveCamera") {
        this.camera.aspect = aspect;
      }
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(parent.clientWidth, parent.clientHeight);
      // this.render();
    }
  }

  /**
   * Rotate camera
   * @param rad rotation angle in radian
   */
  rotateZ(rad: number, dist: number) {
    // change position instead of camera rotation as orbitControls
    // does not take camera rotation into account
    // const x1 = this.camera.position.x;
    // const y1 = this.camera.position.y;
    // const x2 = x1*Math.cos(rad)-y1*Math.sin(rad);
    // const y2 = x1*Math.sin(rad)+y1*Math.cos(rad);
    // this.camera.position.x = x2;
    // this.camera.position.y = y2;
    // // alternative solution if you do not use orbitControls,
    // // rotate directly camera:
    // // this.camera.rotation.z += 0.01*Math.PI;
    // this.camera.updateProjectionMatrix();
    // this.camera.rotateY(rad);
    this.camera.position.x = 0 + dist * Math.cos( rad);         
    this.camera.position.z = 0 + dist * Math.sin( rad );
    this.camera.lookAt( 0,0,0 );

    //renderer.render( scene, camera );
  }

  public frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: THREE.Vector3) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(this.camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(this.camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    this.camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    this.camera.near = boxSize / 100;
    this.camera.far = boxSize * 100;

    this.camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    this.camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    // this.render();
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
