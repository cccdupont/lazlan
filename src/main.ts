import { customElement, html, LitElement, property } from 'lit-element';
import { SceneView } from './scene-view';
//@ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//@ts-ignore
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { CameraControls } from './CameraControls';
//@ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const mixers: any[] = [];
const clock = new THREE.Clock();

// step [0, 1, 2, ..., 50, 51, ..., 100]
// rad  [0, 0,       , Math.PI/2, ... Math.PI]
// dist [500, ...    , 150, ....., 500]
// function getPositionFromStep(s: number) {
//     return {
//         angle: s*Math.PI/100,
//         radius: 150 + (1/7.14285714286)*(s-50)*(s-50)
//     }
// }

function getPositionFromStep(s: number) {
    return {
        angle: Math.PI/4,
        radius: 4*s
    }
}

@customElement('lzl-app' as any)
export class App extends LitElement {
    controls: OrbitControls | null = null;
    viewer: SceneView;
    cameraControls: CameraControls;
    mesh: THREE.Mesh = new THREE.Mesh();
    object: THREE.Object3D = new THREE.Object3D();

    @property({type: Number})
    public step: number = 15;

    constructor() {
        super();
        this.viewer = new SceneView();
        this.cameraControls = new CameraControls(this.viewer.domElement);
    }

    firstUpdated() {
        const container = this.shadowRoot!.getElementById("root") as HTMLElement;
        container.addEventListener('wheel', (evt) => {
            // console.log(evt.deltaY);
            this.step += evt.deltaY * 0.05;
            this.step = Math.max(this.step, 0);
            const {angle, radius} = getPositionFromStep(this.step%100);
            this.viewer.rotateZ(angle, radius); 
        });
        container.appendChild(this.viewer.domElement);
        this.viewer.onResize();

        // Instantiate a loader
        const gltfLoader = new GLTFLoader();//FBXLoader();GLTFLoader
        // const filename = "SambaDancing.fbx"
        const filename = "models/Slampadaire_Test_Web.glb"; //"models/Chemin_Champignon_test4.glb";
        // const filename = "GroundVehicle.glb";
        // const filename = "https://threejsfundamentals.org/threejs/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf";
        // const filename = "DJ_Cube_swag.gltf";
        // const filename = "LeePerrySmith.glb";
        
        // gltfLoader.load(filename, (object) => {
        //     const mixer = new THREE.AnimationMixer( object );
        //     //@ts-ignore
        //     const action = mixer.clipAction( object.animations[ 0 ] );
        //     action.play();
        //     this.object = object;
        //     object.traverse( ( child ) => {
        //         //@ts-ignore
        //         if ( child.isMesh ) {

        //             child.castShadow = true;
        //             child.receiveShadow = true;

        //         }

        //     } );

        //     this.viewer.scene.add( object );
        // });
        const objects: THREE.Object3D[] = [];
        gltfLoader.load(filename, (gltf) => {
            gltf.scene.traverse( ( child ) => {
                if ( child instanceof THREE.Mesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );
            console.log('gltf.scene', gltf.scene.children.length)
            const object = gltf.scene.children[1];

            gltf.scene.scale.set(0.1,0.1,0.1);
            
            // automatically center model and adjust camera
            const box = new THREE.Box3().setFromObject( gltf.scene );
            const size = box.getSize( new THREE.Vector3() ).length();
            const center = box.getCenter( new THREE.Vector3() );

            this.viewer.frameArea(size, size, center);
            // object.position.y += 20;
            this.viewer.scene.add(gltf.scene);
            this.object= gltf.scene;
            console.log(this.object)
            objects.push(object);
            
            // const controls = new OrbitControls( this.viewer.camera, this.viewer.renderer.domElement );
            // controls.rotateSpeed = 2;
            // controls.autoRotate = true;
            // controls.update();
            // this.controls = controls;

            const {angle, radius} = getPositionFromStep(this.step%100);
            this.viewer.rotateZ(angle, radius);

            gltf.animations.forEach((animation) => {
                const mixer = new THREE.AnimationMixer( objects[0] );
                mixer.clipAction( animation ).setDuration( 1 ).play();
                mixers.push( mixer );
            })


        });
        this.animate3d();
        
    }

    createScene( object: THREE.Object3D) {
        // const material = new THREE.MeshPhongMaterial( {
        //     color: 0x552811,
        //     specular: 0x222222,
        //     shininess: 25,
        //     bumpScale: 12
        // } );
        
        //@ts-ignore
        // this.mesh = new THREE.Mesh( object.geometry );

        // compute the box that contains all the stuff
        // from root and below
        // const box = new THREE.Box3().setFromObject(object);
        // const size = box.getSize(new THREE.Vector3()).length();
        // const center = box.getCenter(new THREE.Vector3());

        // // this.mesh.position.y = - 50;
        // // this.mesh.scale.set( scale, scale, scale );
        // this.viewer.frameArea(size, size, center);

        this.object = object;
        this.object.castShadow = true;
        this.object.receiveShadow = true;

        this.viewer.scene.add( this.object );

    }

    animate3d () {
        requestAnimationFrame( this.animate3d.bind(this) );
    
        // // required if controls.enableDamping or controls.autoRotate are set to true
        // // this.cameraControls.update();
        const targetX = this.cameraControls.mouseX * .001;
        // const targetY = this.cameraControls.mouseY * .001;

        if ( this.object && this.object.children.length == 2) {
            const eye = this.object.children[0];
            const body = this.object.children[1];
            body.rotation.y += 0.02 * ( targetX - body.rotation.y );
            eye.rotation.y += 0.2 * ( targetX - eye.rotation.y );
            //this.object.rotation.x += 0.05 * ( targetY - this.object.rotation.x );

        }
        // if (this.controls) {
        //     this.controls?.update();
        // }
        const delta = clock.getDelta();

				for ( let i = 0; i < mixers.length; i ++ ) {

					mixers[ i ].update( delta );

				}
        this.viewer.renderer.render( this.viewer.scene, this.viewer.camera );
    }

    render() {
        return html`
        <div>
            <p style="position: absolute;">Section: ${Math.trunc(this.step/100)}</p>
            <div id="root" style="height: 100%; background: linear-gradient(#FBDDE1, #3f87a6);"></div>
        </div>
        `
    }

}