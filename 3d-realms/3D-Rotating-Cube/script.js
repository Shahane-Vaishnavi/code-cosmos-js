const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 3D Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
    color: 0x00ffdd,
    metalness: 0.7,
    roughness: 0.2
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lights
const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(2, 3, 4);
scene.add(light);

camera.position.z = 3;

// Animation
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.position.y = Math.sin(Date.now() * 0.002) * 0.2;

    renderer.render(scene, camera);
}

animate();

// Resize Fix
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
