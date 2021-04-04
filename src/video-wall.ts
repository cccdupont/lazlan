import * as THREE from 'three';
import { VideoMesh, loadVideo } from './loaders';

export class VideoWall extends THREE.Group {

    videoMeshes: VideoMesh[] = []

    constructor(paths: string[]) {
        super();
        const positions = [
            [-1,-1],[-1, 0],[-1, 1],
            [ 0,-1],[ 0, 0],[ 0, 1],
            [ 1,-1],[ 1, 0],[ 1, 1],
        ].map((e) => ([e[0]*0.5, e[1]*0.5]));

        paths.forEach((p, idx) => {
            loadVideo(p).then((v) => {
                v.play();
                v.mesh.scale.set(0.2,0.2,0.2);
                v.mesh.position.set(positions[idx][1], positions[idx][0], 0);
                this.videoMeshes.push(v);
                this.add(v.mesh);
            });
        });
    }

    play() {
        this.videoMeshes.forEach((v) => v.play());
    }

    pause() {
        this.videoMeshes.forEach((v) => v.pause());
    }

    update() {
        this.videoMeshes.forEach((v) => v.update());
    }
}