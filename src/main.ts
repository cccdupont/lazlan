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
            height: 6000px;
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

        loader.load( 'models/optimer_regular.typeface.json', ( font ) => {

            const geometry = new THREE.TextGeometry( 'Hello three.js!', {
                font: font,
                size: 0.1,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: false
            } );
            const materials = [
                new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
                new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
            ];
            const m = new THREE.Mesh( geometry, materials );
            m.position.y = -5.5;
            this.viewer.scene.add(m);
        } );
    }

    firstUpdated() {
        //@ts-ignore
        const container = this.shadowRoot!.getElementById("size") as HTMLElement;
        // this.cameraControls.setContainer(this.shadowRoot!.querySelector("main")!);

        setTimeout(() => this.loaded = true, 1000);
        container.appendChild(this.viewer.domElement);
        container.addEventListener('wheel', () => {
            if (showreelVideo && this.viewer.isOffScreen(showreelVideo.mesh)) {
                showreelVideo.play();
            } else {
                showreelVideo.pause();
            }
            // if (wallVideo && this.viewer.isOffScreen(wallVideo)) {
            //     wallVideo.play();
            // } else {
            //     wallVideo.pause();
            // }
            // t is 0 to 1
            const t = window.scrollY / (5000 - window.innerHeight);
            this.viewer.camera.position.y = 0.2 - 5 * t;
        })
        this.viewer.fitWindow();

        this.animate3d();
    }


    animate3d () {

        requestAnimationFrame( this.animate3d.bind(this) );
        // (mesh as any).rotation.x += 0.01;
        // (mesh as any).rotation.y += 0.02;
        showreelVideo?.update();
        wallVideo?.update();
        this.viewer.renderer.render( this.viewer.scene, this.viewer.camera );
    }

    render() {
        return html`
        <div id="size"></div></div>
        `
    }

}