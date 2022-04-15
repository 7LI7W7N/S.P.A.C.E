// Using old school three js to work around with importing stuff


import * as THREE from 'three';

var vertexShader = `
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
        vertexUV = uv;
        vertexNormal=normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `
    // The book of shaders
    // xy / uv coordinate for 2D texture that will map to 3D space
var fragmentShader = `
    uniform sampler2D globeTexture;
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
        float intensity = 1.05 - dot(vertexNormal, vec3(0.0,0.0,1.0));
        vec3 atmosphere = vec3(0.3,0.6,1.0) * pow(intensity,1.5);
        gl_FragColor = vec4(vec3(0,0.5,1) + texture2D(globeTexture, vertexUV).xyz , 1.0);
    }
    `


var atmosphereVertex = `
    varying vec3 vertexNormal;
    void main(){
        vertexNormal=normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `
    // The book of shaders
    // xy / uv coordinate for 2D texture that will map to 3D space
var atmosphereFragment = `
    varying vec3 vertexNormal;
    void main(){
        float intensity = pow(0.5 - dot(vertexNormal,vec3(0,0,1.0)),2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
    }
    `


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)


const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniform: {
            globeTexture: {
                value: new THREE.TextureLoader().load('/models/globe.jpeg')
            },
        }

    })

)

/**
 * 
    new THREE.MeshBasicMaterial({
        //            color: 0x663a82
        map: new THREE.TextureLoader().load('/models/globe.jpeg')
    })

    */
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),

    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)
atmosphere.scale.set(1.2, 1.2, 1.2)
scene.add(atmosphere)


camera.position.z = 15

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})

const starVertices = []
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 3000
    const y = (Math.random() - 0.5) * 3000
    const z = -Math.random()
    starVertices.push(x, y, z)
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))


const star = new THREE.Points(starGeometry, starMaterial)
scene.add(star)
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})



function animate() {
    requestAnimationFrame(animate)
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera)
}




const planet = document.getElementById('planet')
planet.appendChild(renderer.domElement)
animate()