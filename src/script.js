import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import globle from '../assets/images/Globe.jpeg'
//Shaders 
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
        float intensity = 1.0 - dot(vertexNormal, vec3(0.0,0.0,1.0));
        vec3 atmosphere = vec3(0.3,0.6,1.0) * pow(intensity,1.5);
        gl_FragColor = vec4(vec3(0.2,0,0.2) + texture2D(globeTexture, vertexUV).xyz , 1.0);
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
        gl_FragColor = vec4(1.3, 0.6, 2.0, 1.0) * intensity;
    }
    `



//! Debug
const gui = new dat.GUI()

//! Canvas
const canvas = document.querySelector('canvas.webgl')

//! Scene
const scene = new THREE.Scene()


//Atmosphere and Planet
const planet = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.MeshBasicMaterial({
        color: 0x800080
            //map: new THREE.TextureLoader().load('/models/globe.jpeg')
    })
)

/**
 * 
 * 

  new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            globeTexture: {
                value: new THREE.TextureLoader().load(globle)
            },
        }

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

//Get Stary Stars in your color babes
const getGalexy = (color, numOfstars, size) => {
    //! Objects
    const geometry = new THREE.SphereGeometry(5, 55, 55);

    const particlesGeo = new THREE.BufferGeometry;
    const particlesCount = numOfstars;

    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = Math.random() - 0.5
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    //! Materials

    const material = new THREE.PointsMaterial({
        color: color,
        size: size,
    })


    //! Mesh

    return new THREE.Points(particlesGeo, material)
}

const purpleStars = getGalexy(0xffffff, 50, 0.04)
const blueStars = getGalexy(0xffffff, 100, 0.08)
const redStars = getGalexy(0xffffff, 200, 0.07)

purpleStars.scale.set(22, 12, 32)
blueStars.scale.set(12, 22, 82)
redStars.scale.set(32, 35, 12)

const StarGroup = new THREE.Group()
StarGroup.add(atmosphere)
StarGroup.add(purpleStars)
StarGroup.add(blueStars)
StarGroup.add(redStars)
scene.add(StarGroup)
    //const sphere = new THREE.Points(geometry, material)
    //scene.add(sphere)



const group = new THREE.Group()
group.add(planet)
scene.add(group)

//! Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

//! Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    //! Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //! Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //! Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//! Camera

//! Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 20
scene.add(camera)

//! Controls
//! const controls = new OrbitControls(camera, canvas)
//! controls.enableDamping = true

//! Renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//! Animate 
const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    StarGroup.rotation.y = 1.0 * elapsedTime
    StarGroup.rotation.x = 1.0 * elapsedTime
    StarGroup.rotation.z = 1.0 * elapsedTime

    //! Update objects
    //sphere.rotation.y = 1.0 * elapsedTime
    //sphere.rotation.x = 1.0 * elapsedTime
    //sphere.rotation.z = 1.0 * elapsedTime

    //planet.rotation.y += 0.01
    //particlesMesh.rotation.y = 1.0 * elapsedTime
    //particlesMesh.rotation.x = 1.0 * elapsedTime
    //particlesMesh.rotation.z = 1.0 * elapsedTime






    //! Update Orbital Controls
    //! controls.update()

    //! Render
    renderer.render(scene, camera)

    //! Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()