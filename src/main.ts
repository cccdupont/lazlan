import { css, customElement, html, LitElement, property } from 'lit-element';
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
        radius: s
    }
}

const videoImage = document.createElement( 'canvas' );
const video = document.createElement( 'video' );
const videoImageContext = videoImage.getContext( '2d' )!;
let videoTexture: any;

@customElement('lzl-app' as any)
export class App extends LitElement {
    controls: OrbitControls | null = null;
    viewer: SceneView;
    cameraControls: CameraControls;
    mesh: THREE.Mesh = new THREE.Mesh();
    // current object
    object: THREE.Object3D = new THREE.Object3D();

    @property({type: Number})
    public step: number = 90;

    targetSectionIdx: number = this.step;

    @property({type: Boolean})
    public loaded: boolean = false;

    @property({type: Number})
    public sectionIdx: number = 0;

    objects: any[] = [];

    ZOOM_SENSITIVITY: number = 0.1;

    userInteract: boolean = false;

    static get styles() {
        return css`
        main {
            -webkit-transition: opacity 1s ease-in-out;
            -moz-transition: opacity 1s ease-in-out;
            -ms-transition: opacity 1s ease-in-out;
            -o-transition: opacity 1s ease-in-out;
        }
        #text1 {
            position: absolute;
            opacity: 1;
            color: white;
            width: 100%;
            display: flex;
            align-items: center;
            margin: auto;
            text-align: center;
            flex-direction: column;
        }
        #text2 {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            position: fixed;
            z-index: 1;
            will-change: opacity;
            opacity: 0;
            top: 0;
            line-height: 1.2;
            font-size: 1.5rem;
            text-align: center;
            color: white;
            max-width: calc(100% - 80px);
            left: 50%;
            transform: translateX(-50%);
            padding: 0 40px;
            line-height: 1.2;
            font-size: 2.5vw;
        }
        .title {
            width: 100%;
            text-transform: uppercase;
            margin-bottom: 0px;
            background: linear-gradient(40deg, #fdf680 0%,#d6716d 50%, #a0fafb 100%);
            background-size: cover;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            font-weight: 100;
            font-size: 7vw;
            letter-spacing: 0.5vw;
            margin-block-start: 0.67em;
            margin-block-end: 0.67em;
            font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        .subtitle {
            font-size: 1.25rem;
            color: rgb(98 98 99);
            font-weight: 300;
            font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
            margin-block-start: 1em;
        }
        .section {
            -webkit-transition: opacity 0.5s ease-in-out;
            -moz-transition: opacity 0.5s ease-in-out;
            -ms-transition: opacity 0.5s ease-in-out;
            -o-transition: opacity 0.5s ease-in-out;
        }
          .lds-ripple {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
            top: 45vh;
            margin: auto;
            -webkit-transition: opacity 0.5s ease-in-out;
            -moz-transition: opacity 0.5s ease-in-out;
            -ms-transition: opacity 0.5s ease-in-out;
            -o-transition: opacity 0.5s ease-in-out;
            display: flex;
          }
          .lds-ripple div {
            position: absolute;
            border: 4px solid #fff;
            opacity: 1;
            border-radius: 50%;
            animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }
          .lds-ripple div:nth-child(2) {
            animation-delay: -0.5s;
          }
          @keyframes lds-ripple {
            0% {
              top: 36px;
              left: 36px;
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              top: 0px;
              left: 0px;
              width: 72px;
              height: 72px;
              opacity: 0;
            }
          }

          .arrow {
            margin-block-start: 7em;
            width: 24px;
            height: 24px;
            border-left: 1px solid rgb(255, 255, 255);
            border-bottom: 1px solid rgb(255, 255, 255);
            transform: rotate(-45deg);
            box-sizing: border-box;
          }
        
        `;
    }

    constructor() {
        super();
        this.viewer = new SceneView();
        this.cameraControls = new CameraControls(this.viewer.domElement);
        const files = [null, "models/Slampadaire_Test_Web.glb", "models/Bouboule_2D_Texture.mp4", "models/Slampadaire_Test_Web.glb"];
        const proms = files.map((f) => this.load(f));
        Promise.all(proms).then((objs) => {
            this.objects = objs;
            if (objs[0]) {
                this.object = objs[0];
                const { radius } = getPositionFromStep(this.step%100);
                this.object.position.set(0, 5, radius-40);
                this.viewer.scene.add(this.object);
            }
        });
    }

    load(f: string | null): Promise<any> {
        const gltfLoader = new GLTFLoader();
        if (f?.endsWith('.glb')) {
            return new Promise((res) => {
                gltfLoader.load(f, (gltf) => {
                    gltf.scene.traverse( ( child ) => {
                        if ( child instanceof THREE.Mesh ) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            (child.material as THREE.Material).fog = true;
                            // (child.material as any).transparent = true;
                        }
                    } );
                    const object = gltf.scene;
        
                    // rescale object to be around 40m
                    const initSize = new THREE.Box3()
                                    .setFromObject( object )
                                    .getSize( new THREE.Vector3() )
                                    .length();
                    object.scale.set(40/initSize,40/initSize,40/initSize);
                    

                    // gltf.animations.forEach((animation) => {
                    //     const mixer = new THREE.AnimationMixer( objects[0] );
                    //     mixer.clipAction( animation ).setDuration( 1 ).play();
                    //     mixers.push( mixer );
                    // })
                    res(object);
                })
            })
        } else if (f?.endsWith('.mp4')) {
            return new Promise((res) => {
                video.src = f;
                video.muted = true;
                video.loop = true;
                video.load(); // must call after setting/changing source
                video.play();
                
                videoImage.width = 1080;
                videoImage.height = 1080;

                // background color if no video present
                videoImageContext.fillStyle = '#000000';
                videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

                videoTexture = new THREE.Texture( videoImage );
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;
                
                var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, side:THREE.DoubleSide } );
                // the geometry on which the movie will be displayed;
                // 		movie image will be scaled to fit these dimensions.
                var movieGeometry = new THREE.PlaneGeometry( 50, 32, 4, 4 );
                var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
                res(movieScreen);
                
            })
        }
        return Promise.resolve(null);
    }

    firstUpdated() {
        //@ts-ignore
        const container = this.shadowRoot!.getElementById("root") as HTMLElement;
        
        setTimeout(() => this.loaded = true, 1000);
        
        window.addEventListener('wheel', (evt) => {
            // console.log(evt.deltaY);
            
            const deltaZoom = (evt as WheelEvent).deltaY *
                ((evt as WheelEvent).deltaMode == 1 ? 18 : 1) * this.ZOOM_SENSITIVITY;
            this.targetSectionIdx = deltaZoom > 0 ? Math.floor(this.step/100) + 1: Math.floor(this.step/100) - 1;
            console.log('wheel', this.sectionIdx, this.targetSectionIdx);

            this.userInteract = true;
            // this.step += deltaZoom;
            // this.step = Math.max(this.step, 0);

            // this.object.traverse( ( child ) => {
            //     if ( child instanceof THREE.Mesh ) {
                    
            //         // set opacity to 50%
            //         (child.material as any).opacity = radius < 20 ? (radius-15)/5 : 1;
            //     }
            // } );
             
        });
        container.appendChild(this.viewer.domElement);
        this.viewer.onResize();
        this.animate3d();
        
    }


    animate3d () {
        if (this.userInteract) {
            if (this.targetSectionIdx == this.sectionIdx && Math.abs(this.step % 100 - 55) < 5) {
                
                this.userInteract = false;
            } else {
                const delta = (this.targetSectionIdx*100 + 55) > this.step ?
                                Math.max(100 - (this.step % 100), 1) : -Math.max(this.step % 100, 1);
                this.step += 0.08 * delta;
                const { radius } = getPositionFromStep(this.step%100);
                this.object.position.set(0, 5, radius-40);
            }
        }

        requestAnimationFrame( this.animate3d.bind(this) );
    
        // // // required if controls.enableDamping or controls.autoRotate are set to true
        // // // this.cameraControls.update();
        // const targetX = this.cameraControls.mouseX * .001;
        // // const targetY = this.cameraControls.mouseY * .001;
        
        // if ( this.object && this.object.children.length == 2) {
        //     const eye = this.object.children[0];
        //     const body = this.object.children[1];
        //     body.rotation.y += 0.02 * ( targetX - body.rotation.y );
        //     eye.rotation.y += 0.2 * ( targetX - eye.rotation.y );
        //     //this.object.rotation.x += 0.05 * ( targetY - this.object.rotation.x );

        // }
        if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
        {
            videoImageContext.drawImage( video, 0, 0 );
            if ( videoTexture ) 
                videoTexture.needsUpdate = true;
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

    updated(changedProps: any) {
        if (changedProps.has('sectionIdx')) {
            this.viewer.scene.remove(this.object);
            if (this.objects[this.sectionIdx]) {
                this.object = this.objects[this.sectionIdx];
                const { radius } = getPositionFromStep(this.step%100);
                this.object.position.set(0, 5, radius-40);  
            } else {
                this.object = new THREE.Object3D();
            }
            this.viewer.scene.add(this.object);
        }
        if (changedProps.has('step')) {
            this.sectionIdx = Math.floor(this.step/100);
            const colors = [0xDC143C, 0xFFDC6B, 0xa2c7ff, 0xDC6BFF];
            const color = new THREE.Color(colors[this.sectionIdx%colors.length]);

            if ((this.step%100) > 15) {
                const colorInterp = (this.step%100-15)/85;
                color.lerp(new THREE.Color(colors[(this.sectionIdx+1)%colors.length]), colorInterp);
            }
            const { radius } = getPositionFromStep(this.step%100);
            this.object.position.set(0, 5, radius-40);
            const lightColor = new THREE.Color(color);

            const {h, l} = lightColor.getHSL({h: 0, s: 0, l: 0});
            lightColor.setHSL(h,1,l);
            (this.viewer.ground.material as THREE.MeshLambertMaterial).color = lightColor;
        }
    }

    render() {
        return html`
        <div style="background: black;">
            <div id="loader" class="lds-ripple" style="opacity: ${this.loaded ? "0" : "1"}"><div></div><div></div></div>
            <main style="height: 100%; opacity: ${this.loaded ? "1" : "0"}">
                <div class="section" id="text1" style="position: absolute; height: 100%; opacity: ${this.sectionIdx === 0 ? '1' : '0'}">
                    <div class="title">Motion Design</div>
                    <div class="subtitle">Guillaume Abramovici</div>
                    <div class="arrow"></div>
                    <p>Scroll</p>
                </div>
                <div class="section" id="text2" style="position: absolute; height: 100%; opacity: ${this.sectionIdx === 2 ? '1' : '0'}">
                    Blabla
                </div>
                <div id="root" style="height: 100%;"></div>
            </main>
        </div>
        `
    }

}