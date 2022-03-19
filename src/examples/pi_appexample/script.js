// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { RhinoCompute } from 'https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'

//GH script
const definitionName = 'PI_Example_ModuleAggGr'

// setup input change events
const inhabitants_slider = document.getElementById( 'Number_People' )
inhabitants_slider.addEventListener( 'mouseup', onSliderChange, false )
inhabitants_slider.addEventListener( 'touchend', onSliderChange, false )

const face_slider = document.getElementById( 'Fase_Extrusion' )
face_slider.addEventListener( 'mouseup', onSliderChange, false )
face_slider.addEventListener( 'touchend', onSliderChange, false )

const windowbm_slider = document.getElementById( 'Windows_Module_Base' )
windowbm_slider.addEventListener( 'mouseup', onSliderChange, false )
windowbm_slider.addEventListener( 'touchend', onSliderChange, false )

const Window_Aperture_BM = document.getElementById( 'Window_Aperture_MB' )
Window_Aperture_BM.addEventListener( 'mouseup', onSliderChange, false )
Window_Aperture_BM.addEventListener( 'touchend', onSliderChange, false )

const windowm02_slider = document.getElementById( 'Windows_Module02' )
windowm02_slider.addEventListener( 'mouseup', onSliderChange, false )
windowm02_slider.addEventListener( 'touchend', onSliderChange, false )

const Window_Aperture_M02 = document.getElementById( 'Window_Aperture_M02' )
Window_Aperture_M02.addEventListener( 'mouseup', onSliderChange, false )
Window_Aperture_M02.addEventListener( 'touchend', onSliderChange, false )

const windowm03_slider = document.getElementById( 'Windows_Module03' )
windowm03_slider.addEventListener( 'mouseup', onSliderChange, false )
windowm03_slider.addEventListener( 'touchend', onSliderChange, false )

const Window_Aperture_M03 = document.getElementById( 'Window_Aperture_M03' )
Window_Aperture_M03.addEventListener( 'mouseup', onSliderChange, false )
Window_Aperture_M03.addEventListener( 'touchend', onSliderChange, false )



//Set up run and download buttons
const runButton = document.getElementById("runButton")
runButton.onclick = run
const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download 

//Rhino compute
const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')

let rhino, definition, doc
rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global

    //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
    //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.
    RhinoCompute.url = 'http://localhost:8081/' //if debugging locally.
    

    // load a grasshopper file!
    const url = definitionName
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const arr = new Uint8Array(buffer)
    definition = arr

    init()
    compute()
    percentage()
})




function onSliderChange() {
    document.getElementById("aggregation").checked = false;
}

async function compute() {

    //Slider parameters
    const param1 = new RhinoCompute.Grasshopper.DataTree('Number_People');
    param1.append([0], [inhabitants_slider.valueAsNumber]);
    const param2 = new RhinoCompute.Grasshopper.DataTree('Fase_Extrusion');
    param2.append([0], [face_slider.valueAsNumber]);

    //Slider parameters Base Module
    const param3 = new RhinoCompute.Grasshopper.DataTree('Windows_Module_Base');
    param3.append([0], [windowbm_slider.valueAsNumber]);
    const param4 = new RhinoCompute.Grasshopper.DataTree('Window_Aperture_MB');
    param4.append([0], [Window_Aperture_BM.valueAsNumber]);

    //Slider parameters Module 02
    const param5 = new RhinoCompute.Grasshopper.DataTree('Windows_Module02');
    param4.append([0], [windowm02_slider.valueAsNumber]);
    const param6 = new RhinoCompute.Grasshopper.DataTree('Window_Aperture_M02');
    param4.append([0], [Window_Aperture_M02.valueAsNumber]);

    //Slider parameters Module 03
    const param7 = new RhinoCompute.Grasshopper.DataTree('Windows_Module03');
    param4.append([0], [windowm03_slider.valueAsNumber]);
    const param8 = new RhinoCompute.Grasshopper.DataTree('Window_Aperture_M03');
    param4.append([0], [Window_Aperture_M03.valueAsNumber]);
    
    


    // clear values
    const trees = []
    trees.push(param1);
    trees.push(param2);
    trees.push(param3);
    trees.push(param4);
    trees.push(param5);
    trees.push(param6);
    trees.push(param7);
    trees.push(param8);
    

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(
        definition, 
        trees
    );

    doc = new rhino.File3dm();

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    //decode GH objects and put them into rhino document
    for (let i = 0; i < res.values.length; i++) {

        for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
            for (const d of value) {

                const data = JSON.parse(d.data)
                const rhinoObject = rhino.CommonObject.decode(data)
                doc.objects().add(rhinoObject, null)

            }
        }
    }


    

    // clear objects from scene
    scene.traverse(child => {
        if (!child.isLight) {
            scene.remove(child)
        }
    })


    const buffer = new Uint8Array(doc.toByteArray()).buffer;
    loader.parse(buffer, function (object) {
  
      // go through all objects, check for userstrings and assing colors
  
        // object.traverse((child) => {

        //     if ( rhinoObject.geometry().userStringCount > 0 ) {

        //         // if (child.userData.attributes.geometry.userStringCount > 0)

        //         const material = new THREE.MeshBasicMaterial ( { color: "rgb(255,255,0)", wireframe: true} )
        //         child.material = material

        //         console.log(object)
        //         console.log(child.userData.attributes.userStrings[0])
        //         // const mat = new THREE.LineBasicMaterial( { 
        //         //     color: "rgb(255,255,0)",
        //         //     linewidth: 1
        //         // } )
        //         // child.material = mat;

        //         // const geometry = loader.parse(mesh.toThreejsJSON())
        //         // const edges = new THREE.EdgesGeometry( geometry );
        //         // const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: rgb(255,255,0)}));
        //         // scene.add(line);

        //     }
        // });

        ///////////////////////////////////////////////////////////////////////
        // add object graph from rhino model to three.js scene
        scene.add(object);

    });

    //Enable download button
    downloadButton.disabled = false;
    runButton.disabled = false;

}


//Download button
//function download (){
    //let buffer = doc.toByteArray()
    //let blob = new Blob([ buffer ], { type: "application/octect-stream" })
    //let link = document.createElement('a')
    //link.href = window.URL.createObjectURL(blob)
    //link.download = 'spatialGreenhouse.3dm'
    //link.click()
//}






// BOILERPLATE //

let scene, camera, renderer, controls

function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    //scene.background = new THREE.Color(0x000000, 0)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.x = - 50
    camera.position.y = - 50
    camera.position.z = - 50

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true }) //alpha: true to set transparent background
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.intensity = 2
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    let cubeMap

    cubeMap = new THREE.CubeTextureLoader()
        .setPath('textures/cube/earth/')
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
    
    scene.background = cubeMap

    animate()
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}

//const material = new THREE.MeshNormalMaterial()

function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader()
    const geometry = loader.parse(mesh.toThreejsJSON())
    //how do I give a material to the wireframe?
    //const material = new THREE.material({ wireframe: true })
    return new THREE.Mesh(geometry, material)
}

function animate() {
    requestAnimationFrame(animate)

    // //rotate shape a bit
    // meshToThreejs.rotation.x += 0.01
    // meshToThreejs.rotation.y += 0.01

    renderer.render(scene, camera)
}