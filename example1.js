import * as THREE from 'three';
import { GUI } from 'gui';
import { RGBELoader } from 'rgbe-loaders';

let renderer, scene, camera;

const params = {
    exposicao: 4.0, // Parâmetro para controlar a exposição
    definicao: '1k' // Parâmetro para definir a resolução da textura (inicialmente '1k')
};

function initGUI() {
    const gui = new GUI();

    gui.add(params, 'exposicao', 0, 8, 0.01).onChange(render);
    gui.add(params, 'definicao', [ "1k", "2k", "4k", "8k_Noooo_please"]).onChange(clearScene);

    gui.open();
};

function loadTexture() {
    let filename=`textures/flower_road_${params.definicao}.hdr`;

    new RGBELoader().load(filename, function (texture, textureData) {
        // Cria um material e uma malha para a textura carregada
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const quad = new THREE.PlaneGeometry(2 * textureData.width / textureData.height, 2);
        const mesh = new THREE.Mesh(quad, material);
        scene.add(mesh);

        console.info('Carregando textura: ' + filename);
        console.info('Resolução: ' + textureData.width + 'x' + textureData.height);
        console.log('Número de pixels de configurados: ' + textureData.data.length);


        render();
    });
}

function init() {
    const aspect = window.innerWidth / window.innerHeight;
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = params.exposicao;

    document.body.appendChild(renderer.domElement);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera = new THREE.OrthographicCamera(- aspect, aspect, 1, - 1, 0, 1);

    loadTexture(); // Carrega a textura HDR

    window.addEventListener('resize', onWindowResize);
    render()
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = camera.top - camera.bottom;
    console.log(frustumHeight);
    camera.left = - frustumHeight * aspect / 2;
    camera.right = frustumHeight * aspect / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    renderer.toneMappingExposure = params.exposicao;
    renderer.render(scene, camera);
}

// Função para limpar a cena removendo todos os objetos Mesh
function clearScene() {
    scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
            scene.remove(child);
        }
    });
    
    // Carrega uma nova textura após limpar a cena
    loadTexture();
}

initGUI();
init();