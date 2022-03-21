/* eslint no-undef: "off", no-unused-vars: "off" */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/TransformControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

const definition = 'PI_RecreationModule.gh'

//SINGLE MODULE SCALE
const inhabitants_slider = document.getElementById( 'scalemodule' )
inhabitants_slider.addEventListener( 'mouseup', onSliderChange, false )
inhabitants_slider.addEventListener( 'touchend', onSliderChange, false )

//MODULE DESIGN
//Base Module
const windowbm_slider = document.getElementById( 'basemodule' )
windowbm_slider.addEventListener( 'mouseup', onSliderChange, false )
windowbm_slider.addEventListener( 'touchend', onSliderChange, false )
const window_aperture_bm_silder = document.getElementById( 'windowbm' )
window_aperture_bm_silder.addEventListener( 'mouseup', onSliderChange, false )
window_aperture_bm_silder.addEventListener( 'touchend', onSliderChange, false )

//Second Module
const windowm02_slider = document.getElementById( 'module02' )
windowm02_slider.addEventListener( 'mouseup', onSliderChange, false )
windowm02_slider.addEventListener( 'touchend', onSliderChange, false )
const window_aperture_m02_slider = document.getElementById( 'window02' )
window_aperture_m02_slider.addEventListener( 'mouseup', onSliderChange, false )
window_aperture_m02_slider.addEventListener( 'touchend', onSliderChange, false )

//Third Module
const windowm03_slider = document.getElementById( 'module03' )
windowm03_slider.addEventListener( 'mouseup', onSliderChange, false )
windowm03_slider.addEventListener( 'touchend', onSliderChange, false )
const window_aperture_m03_slider = document.getElementById( 'window03' )
window_aperture_m03_slider.addEventListener( 'mouseup', onSliderChange, false )
window_aperture_m03_slider.addEventListener( 'touchend', onSliderChange, false )

//SOLAR PANELS
//BASE MODULE - missingtoggle
const bmpanels = document.getElementById('panelscntr');
const panelsdisbm_slider = document.getElementById( 'dispanelscntr' )
panelsdisbm_slider.addEventListener( 'mouseup', onSliderChange, false )
panelsdisbm_slider.addEventListener( 'touchend', onSliderChange, false )
const panels_placebm_slider = document.getElementById( 'sedpanelscntr' )
panels_placebm_slider.addEventListener( 'mouseup', onSliderChange, false )
panels_placebm_slider.addEventListener( 'touchend', onSliderChange, false )

//MODEL02 - missingtoggle
const m02panels = document.getElementById('panels');
const panelsdis02_slider = document.getElementById( 'dispanels' )
panelsdis02_slider.addEventListener( 'mouseup', onSliderChange, false )
panelsdis02_slider.addEventListener( 'touchend', onSliderChange, false )
const panels_place02_slider = document.getElementById( 'sedpanels' )
panels_place02_slider.addEventListener( 'mouseup', onSliderChange, false )
panels_place02_slider.addEventListener( 'touchend', onSliderChange, false )

//MODEL03 - missingtoggle
const m03panels = document.getElementById('panelsright');
const panelsdis03_slider = document.getElementById( 'dispanelsright' )
panelsdis03_slider.addEventListener( 'mouseup', onSliderChange, false )
panelsdis03_slider.addEventListener( 'touchend', onSliderChange, false )
const panels_place03_slider = document.getElementById( 'sedpanelsright' )
panels_place03_slider.addEventListener( 'mouseup', onSliderChange, false )
panels_place03_slider.addEventListener( 'touchend', onSliderChange, false )


rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  compute()
})


/**
 * Call appserver
 */
async function compute () {

  showSpinner(true)

  // initialise 'data' object that will be used by compute()
  const data = {
    definition: definition,
    inputs: {
      
      //SINGLE MODULE SCALE
      'scalemodule': inhabitants_slider.valueAsNumber,   
      
      //MODULE DESIGN
      //Base Module
      'basemodule': windowbm_slider.valueAsNumber,
      'windowbm': window_aperture_bm_silder.valueAsNumber,

      //MODULE02
      'module02': windowm02_slider.valueAsNumber,
      'window02': window_aperture_m02_slider.valueAsNumber,

      //MODULE02
      'module03': windowm03_slider.valueAsNumber,
      'window03': window_aperture_m03_slider.valueAsNumber,

      //SOLAR PANELS
      //Base Module - AGREGAR PANELES SOLARES

      'dispanelscntr': panelsdisbm_slider.valueAsNumber,
      'sedpanelscntr': panels_placebm_slider.valueAsNumber,

      //MODULE02

      'dispanels': panelsdis02_slider.valueAsNumber,
      'sedpanels': panels_place02_slider.valueAsNumber,

      //MODULE02

      'dispanelsright': panelsdis03_slider.valueAsNumber,
      'sedpanelsright': panels_place03_slider.valueAsNumber,
    }
  }

  console.log(data.inputs)

  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  try {
    const response = await fetch('/solve', request)

    if(!response.ok)
      throw new Error(response.statusText)

    const responseJson = await response.json()
    collectResults(responseJson)

  } catch(error){
    console.error(error)
  }
}

/**
 * Parse response
 */
 function collectResults(responseJson) {

  const values = responseJson.values

  console.log(values)

  // clear doc
  try {
    if( doc !== undefined)
        doc.delete()
  } catch {}

  //console.log(values)
  doc = new rhino.File3dm()

  // for each output (RH_OUT:*)...
  for ( let i = 0; i < values.length; i ++ ) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path]
      // ...and for each branch...
      for( let j = 0; j < branch.length; j ++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          // console.log(rhinoObject)
          doc.objects().add(rhinoObject, null)
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    showSpinner(false)
    return
  }

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {

      // clear objects from scene
      scene.traverse(child => {
        if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm') {
          scene.remove( child )
        }
      })

      ///////////////////////////////////////////////////////////////////////
      
      // color crvs
      object.traverse(child => {
        if (child.isLine) {
          if (child.userData.attributes.geometry.userStringCount > 0) {
            //console.log(child.userData.attributes.geometry.userStrings[0][1])
            const col = child.userData.attributes.geometry.userStrings[0][1]
            const threeColor = new THREE.Color( "rgb(" + col + ")")
            const mat = new THREE.LineBasicMaterial({color:threeColor})
            child.material = mat
          }
        }
      })

      ///////////////////////////////////////////////////////////////////////
      // add object graph from rhino model to three.js scene
      scene.add( object )

      // hide spinner and enable download button
      showSpinner(false)
      //downloadButton.disabled = false

  })
}

/**
* Attempt to decode data tree item to rhino geometry
*/
function decodeItem(item) {
const data = JSON.parse(item.data)
if (item.type === 'System.String') {
  // hack for draco meshes
  try {
      return rhino.DracoCompression.decompressBase64String(data)
  } catch {} // ignore errors (maybe the string was just a string...)
} else if (typeof data === 'object') {
  return rhino.CommonObject.decode(data)
}
return null
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  // show spinner
  showSpinner(true)
  compute()
}

/**
 * Shows or hides the loading spinner
 */
 function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}

// BOILERPLATE //

var scene, camera, renderer, controls

function init () {

  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

  scene = new THREE.Scene()
  scene.background = new THREE.Color(1,1,1)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 )
  camera.position.x = 1000
  camera.position.y = 1000
  camera.position.z = 1000

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild(renderer.domElement)

  controls = new OrbitControls( camera, renderer.domElement  )

  window.addEventListener( 'resize', onWindowResize, false )

  animate()
}

var animate = function () {
  requestAnimationFrame( animate )
  renderer.render( scene, camera )
}
  
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
 function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}
