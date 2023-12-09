// Mapeamento de Ambiente

import * as THREE from 'three';
import { OrbitControls } from 'orb-cam-ctrl';
import { GUI } from 'gui'
import { HDRCubeTextureLoader } from 'hdr-cube-loaders';


const rendSize = new THREE.Vector2();

let renderer,
    scene,
    camera,
    cameraControl;

const params = {
    envMap: 'HDR',
    roughness: 0.0,
    metalness: 0.0,
    exposure: 1.0,
    debug: false
};

let torusMesh, planeMesh;
let ldrCubeRenderTarget, hdrCubeRenderTarget;
let ldrCubeMap, hdrCubeMap;


function main() {

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    
    
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    document.body.appendChild(renderer.domElement);

	// renderer.toneMapping = THREE.ReinhardToneMapping;
	// renderer.toneMapping = THREE.CineonToneMapping;
	// renderer.toneMapping = THREE.ACESFilmicToneMapping;
	// renderer.toneMapping = THREE.CustomToneMapping;
	renderer.toneMapping = THREE.LinearToneMapping;

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 0, 120);

    cameraControl = new OrbitControls(camera, renderer.domElement);
    cameraControl.enablePan = false;

    let geometry = new THREE.SphereGeometry( 10, 10, 10 );
	let material = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		metalness: params.metalness,
		roughness: params.roughness
	});

    torusMesh = new THREE.Mesh(geometry, material);
    scene.add(torusMesh);

    geometry = new THREE.PlaneGeometry(200, 200);
    material = new THREE.MeshBasicMaterial();

    const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
	hdrCubeMap = new HDRCubeTextureLoader()
		.setPath('./textures/SwedishRoyalCastle/hdr/')
		.load(hdrUrls, function () {
			hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
			hdrCubeMap.magFilter = THREE.LinearMipmapNearestFilter;
			hdrCubeMap.needsUpdate = true;
		});

    const ldrUrls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];
	ldrCubeMap = new THREE.CubeTextureLoader()
        .setPath('./textures/SwedishRoyalCastle/ldr/')
		.load(ldrUrls, function () {
			ldrCubeRenderTarget = pmremGenerator.fromCubemap(ldrCubeMap);
		});

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    // Luz ambiente
    let ambientLight = new THREE.AmbientLight(0x111111);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    // Luz do sol
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 3, 3).normalize();
    directionalLight.name = 'directional';
    scene.add(directionalLight);

	const gui = new GUI();

	gui.add(params, 'envMap', ['LDR', 'HDR']);
	gui.add(params, 'roughness', 0, 1, 0.01);
	gui.add(params, 'metalness', 0, 1, 0.01);
	gui.add(params, 'exposure', 0, 2, 0.01);
	gui.open();

    render();
}

function render() {
    torusMesh.material.roughness = params.roughness;
	torusMesh.material.metalness = params.metalness;

	let renderTarget, cubeMap;

	switch (params.envMap) {
		case 'LDR':
			renderTarget = ldrCubeRenderTarget;
			cubeMap = ldrCubeMap;
			break;
		case 'HDR':
			renderTarget = hdrCubeRenderTarget;
			cubeMap = hdrCubeMap;
			break;

	}

    torusMesh.rotation.y += 0.005;
	scene.background = cubeMap;
	renderer.toneMappingExposure = params.exposure;	torusMesh.rotation.y += 0.005;

    renderer.render(scene, camera);
    requestAnimationFrame(render);

	renderer.render(scene, camera);
};

main();
