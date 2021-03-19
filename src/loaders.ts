import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export class VideoMesh extends EventTarget {

    mesh: THREE.Mesh = new THREE.Mesh();

    videoTexture: THREE.Texture | null = null;

    video: HTMLVideoElement = document.createElement( 'video' );

    videoImage: HTMLCanvasElement = document.createElement( 'canvas' );

    videoImageContext: CanvasRenderingContext2D = this.videoImage.getContext( '2d' )!;

    constructor(src: string) {
        super();
        this.video.src = src;
        this.video.muted = true;
        this.video.loop = true;
        this.video.load();
        this.video.addEventListener( "loadedmetadata", () => {
            const width = this.video.videoWidth;
            const height = this.video.videoHeight;
            this.videoImage.width = width;
            this.videoImage.height = height;
            // background color if no video present
            this.videoImageContext.fillStyle = '#000000';
            this.videoImageContext.fillRect( 0, 0, this.videoImage.width, this.videoImage.height );

            this.videoTexture = new THREE.Texture( this.videoImage );
            this.videoTexture.minFilter = THREE.LinearFilter;
            this.videoTexture.magFilter = THREE.LinearFilter;

            var movieMaterial = new THREE.MeshBasicMaterial( { map: this.videoTexture, side:THREE.DoubleSide } );
            // the geometry on which the movie will be displayed;
            // movie image will be scaled to fit these dimensions.
            var movieGeometry = new THREE.PlaneGeometry( 2, 2*height/width, 4, 4 );
            this.mesh = new THREE.Mesh( movieGeometry, movieMaterial );
            this.dispatchEvent(new Event('load'));

        }, false );  

    }

    update() {
        if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {
            this.videoImageContext.drawImage( this.video, 0, 0 );
            if ( this.videoTexture ) 
                this.videoTexture.needsUpdate = true;
        }
    }

    play() {
        this.video.play();
    }

    pause() {
        this.video.pause();
    }
}


export function loadVideo(path: string): Promise<VideoMesh> {

    return new Promise((res) => {

        const vid = new VideoMesh(path);
        vid.addEventListener('load', () => {
            res(vid)
        })  
    })
}

export function loadGlb(path: string): Promise<THREE.Group> {
    const gltfLoader = new GLTFLoader();
    return new Promise((res) => {
        gltfLoader.load(path, (gltf) => {
            gltf.scene.traverse( ( child ) => {
                // console.log('child', child)
                if ( child instanceof THREE.Mesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    (child.material as THREE.Material).fog = true;
                    //@ts-ignore
                    // (child.material as THREE.Material).color.setHex( 0xFFC0CB );
                    // (child.material as any).transparent = true;
                    child.traverse((c) => (c as any).material.metalness = 0)
                }
            } );
            const object = gltf.scene;

            // rescale object to be around 40m
            const initSize = new THREE.Box3()
                            .setFromObject( object )
                            .getSize( new THREE.Vector3() )
                            .length();
            object.scale.set(3/initSize,3/initSize,3/initSize);
            
            // gltf.animations.forEach((animation) => {
            //     const mixer = new THREE.AnimationMixer( object );
            //     mixer.clipAction( animation ).setDuration( 1 ).play();
            //     mixers.push( mixer );
            // })
            res(object);
        })
    })
}

export function loadFbx(path: string) {
    const fbxfLoader = new FBXLoader();
    return new Promise((res) => {
        fbxfLoader.load(path, (gltf) => {
            gltf.traverse( ( child ) => {
                if ( child instanceof THREE.Mesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    (child.material as THREE.Material).fog = true;
                    // (child.material as any).transparent = true;
                }
            } );
            const object = gltf;
            // rescale object to be around 40m
            const initSize = new THREE.Box3()
                            .setFromObject( object )
                            .getSize( new THREE.Vector3() )
                            .length();
            object.scale.set(40/initSize,40/initSize,40/initSize);
            res(object);
        })
    })
}


export function createCould() {

    const group = new THREE.Group();

    const cloudGeo = new THREE.SphereGeometry(5, 4, 6);
    const cloud = new THREE.Mesh(cloudGeo, new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true }));
    cloud.scale.set(1, 0.8, 1);

    const cloud2 = cloud.clone();
    cloud2.scale.set(.55, .35, 1);
    cloud2.position.set(5, -1.5, 2);

    const cloud3 = cloud.clone();
    cloud3.scale.set(.75, .5, 1);
    cloud3.position.set(-5.5, -2, -1);

    group.add(cloud);
    group.add(cloud2);
    group.add(cloud3);

    group.traverse( ( child ) => {
        
        if ( child instanceof THREE.Mesh ) {
            // console.log('child', child)
            child.castShadow = true;
            child.receiveShadow = true;
            (child.material as THREE.Material).fog = true;
            
            //@ts-ignore
            // child.geometry.computeFaceNormals();
        }
    } );
    group.scale.set(0.1, 0.1, 0.1);

    return group;
}