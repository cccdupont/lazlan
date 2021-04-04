import { css, customElement, html, LitElement, property } from 'lit-element';
import { SceneView } from './scene-view';
import * as THREE from 'three';
// import { CameraControls } from './CameraControls';
//@ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Loaders from './loaders';
import { VideoWall } from './video-wall';
import '@material/mwc-linear-progress';

// const mixers: any[] = [];
let showreelVideo: any;
let wallVideo: any;

@customElement('lzl-app' as any)
export class App extends LitElement {
    controls: OrbitControls | null = null;
    viewer: SceneView;
    // cameraControls: CameraControls;
    mesh: THREE.Mesh = new THREE.Mesh();
    // current object
    object: THREE.Object3D = new THREE.Object3D();

    minStep: number = 50;

    @property({type: Number})
    public step: number = this.minStep;

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
        canvas {
            position: fixed; top: 0; left: 0;
        }
        
        div#size {
            height: 5000px;
        }
        header {
            position: fixed;
            width: 93vw;
            height: 10vw;
            top: 0;
            left: 0;
            opacity: 1;
            pointer-events: none;
            will-change: opacity;
            z-index: 1;
        }

        header > .logo {
            display: block;
            position: absolute;
            height: 5vw;
            width: 5vw;
            top: 2.5vw;
            left: 2.5vw;
            pointer-events: initial;
            will-change: transform;
            background: url(models/logo_min.png) no-repeat 50%;
            background-size: 100%;
        }
        header > .right {
            position: absolute;
            width: auto;
            height: auto;
            top: 5.5vw;
            right: 0;
            display: flex;
            align-items: center;
            align-content: center;
            color: #1f1f1f;
        }

        header > .right > p {
            width: auto;
            height: auto;
            padding: 0 .8vw;
            font-family: Inter;
            font-size: 15px;
            text-underline-offset: 5px;
            cursor: pointer;
            pointer-events: auto;
        }

        header > .right > .selected {
            text-decoration: underline #44c1f0 2px; 
        }        
        `;
    }

    constructor() {
        super();
        this.viewer = new SceneView();
        Loaders.loadGlb("models/Champ'Einstein_Dance_2_color_ggod.glb").then((obj) => {
            // obj.position.y = 5;
            this.viewer.scene.add(obj);
        });
        Loaders.loadVideo("models/showreel.mp4").then((vid) => {
            vid.mesh.position.y = -2;
            showreelVideo = vid;
            this.viewer.scene.add(vid.mesh);
        });
        const videoWall = new VideoWall([
            "models/champi.mp4", "models/Bouboule_2D_Texture.mp4", "models/drummer.mp4",
            "models/desert.mp4", "models/street.mp4", "models/2020.mp4",
            "models/lava_lamp.mp4", "models/robot.mp4", "models/planet.mp4"
        ]);
        videoWall.position.y = -3.5;
        wallVideo = videoWall;
        // wallVideo.play();
        this.viewer.scene.add(videoWall);
        Loaders.loadGlb("models/Slampadaire_Test_Web.glb").then((obj) => {
            obj.scale.x *= 0.4;
            obj.scale.y *= 0.4;
            obj.scale.z *= 0.4;
            obj.position.y = -5.5;
            obj.position.x = -0.5;
            this.viewer.scene.add(obj);
        });
        const loader = new THREE.FontLoader();

        loader.load( 'models/optimer_bold.typeface.json', ( font ) => {

            const params = {
                font: font,
                size: 0.2,
                height: 0, // depth
                curveSegments: 12,
                bevelEnabled: false
            }
            const materials = [
                new THREE.MeshPhongMaterial( { color: 0x70e192, flatShading: true } ), // front
                new THREE.MeshPhongMaterial( { color: 0x70e192 } ) // side
            ];

            const geometryName = new THREE.TextGeometry( 'Abr  movici', params );

            const geometryDescr = new THREE.TextGeometry( 'Hi!', params );

            
            const t1 = new THREE.Mesh( geometryName, materials );
            t1.position.x = -0.53;
            t1.position.y = 0;
            const t2 = new THREE.Mesh( geometryDescr, materials );
            t2.position.y = -5.5;

            this.viewer.scene.add(t1);
            this.viewer.scene.add(t2);
        } );

        Loaders.loadObj("models/insta.obj").then((obj) => {
            obj.position.y = -7;
            obj.position.x = -0.3;
            obj.traverse( ( child ) => {
                //@ts-ignore
                if ( child instanceof THREE.Mesh ) {
                    //@ts-ignore
                    (child.material as THREE.Material).color.setHex(0xdc4262);
                }
            } );
            this.viewer.scene.add(obj);
        });
        Loaders.loadStl("models/Twitter_Logo.stl").then((obj) => {
            obj.position.y = -6.45;
            obj.position.x = 0.13;
            this.viewer.scene.add(obj);
        });
        Loaders.loadGlb("models/vimeo-logo.glb").then((obj) => {
            obj.position.y = -6.55;
            obj.position.x = 0.5;
            obj.rotation.set( - Math.PI / 2, Math.PI / 2, 0 );
            obj.scale.set(0.1,0.1,0.1);
            obj.traverse( ( child ) => {
                //@ts-ignore
                if ( child instanceof THREE.Mesh ) {
                    //@ts-ignore
                    (child.material as THREE.Material).color.setHex(0x1ab7ea);
                }
            } );
            this.viewer.scene.add(obj);
        });
    }

    get container() {
        return this.shadowRoot!.getElementById("size") as HTMLElement;
    }

    firstUpdated() {
        // this.cameraControls.setContainer(this.shadowRoot!.querySelector("main")!);

        setTimeout(() => this.loaded = true, 1000);
        this.container.appendChild(this.viewer.domElement);
        this.container.addEventListener('wheel', (evt) => {
            if (showreelVideo && this.viewer.isOffScreen(showreelVideo.mesh)) {
                showreelVideo.play();
            } else {
                showreelVideo.pause();
            }
            // // if (wallVideo && this.viewer.isOffScreen(wallVideo)) {
            // //     wallVideo.play();
            // // } else {
            // //     wallVideo.pause();
            // // }
            // // t is 0 to 1
            // const t = window.scrollY / (5000 - window.innerHeight);
            // this.viewer.camera.position.y = 0.2 - 5 * t;
            this.onMouseMove(evt);
        });
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        // const t = window.scrollY / (5000 - window.innerHeight);
        // this.viewer.camera.position.y = 0.2 - 5 * t;
        window.addEventListener("resize", () => this.viewer.onResize());
        this.viewer.onResize();
        this.animate3d();
    }

    onMouseMove(evt: MouseEvent) {
        
        const plot = this.viewer.raycast(
            evt.clientX, evt.clientY, ...wallVideo.children)[0];
        if (plot) {
            this.container.style.cursor = 'pointer';
            plot.scale.set(0.25,0.25,0.25);
        } else {
            this.container.style.cursor = 'default';
            wallVideo.children.forEach((o: any) =>  o.scale.set(0.2,0.2,0.2));
        }
    }


    animate3d () {
        this.viewer.updateCameraPosition();
        this.sectionIdx = this.viewer.camera.position.y > -1 ? 0 :
                          this.viewer.camera.position.y > -3 ? 1 :
                          this.viewer.camera.position.y > -5 ? 2 :
                          this.viewer.camera.position.y > -6 ? 3 : 4;
        requestAnimationFrame( this.animate3d.bind(this) );
        showreelVideo?.update();
        wallVideo?.update();
        this.viewer.renderer.render( this.viewer.scene, this.viewer.camera );
    }
    //@ts-ignore
    setSection(idx: number = 0) {
        const pageOffset = idx === 0 ? 0 :
                           idx === 1 ? 1300 :
                           idx === 2 ? 2300 :
                           idx === 3 ? 3300 : 4300;
        window.scrollTo({top: pageOffset});
    }

    render() {
        return html`
        <header>
            <a class="logo"></a>
            <div class="right">
                <p class="${this.sectionIdx == 0 ? `selected` : ``}" @click="${() => this.setSection(0)}">Home</p>
                <p class="${this.sectionIdx == 1 ? `selected` : ``}" @click="${() => this.setSection(1)}">Showreel</p>
                <p class="${this.sectionIdx == 2 ? `selected` : ``}" @click="${() => this.setSection(2)}">Work</p>
                <p class="${this.sectionIdx == 3 ? `selected` : ``}" @click="${() => this.setSection(3)}">About</p>
                <p class="${this.sectionIdx == 4 ? `selected` : ``}" @click="${() => this.setSection(4)}">Contact</p>
            </div>
        </header>
        <div id="size"></div>
        `
    }

}