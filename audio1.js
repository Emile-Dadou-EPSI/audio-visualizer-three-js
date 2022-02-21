// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

var noise = new SimplexNoise();
var vizInit = function (){
  
  var file = document.getElementById("thefile");
  var audio = document.getElementById("audio");
  var fileLabel = document.querySelector("label.file");
  
  document.onload = function(e){
    console.log(e);
    audio.play();
    play();
  }
  file.onchange = function(){
    fileLabel.classList.add('normal');
    audio.classList.add('active');
    var files = this.files;
    
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    play();
  }
  
function play() {
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    var scene = new THREE.Scene();
    var group = new THREE.Group();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,0,100);
    camera.lookAt(scene.position);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    var planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        side: THREE.DoubleSide,
        wireframe: true
    });
    
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, 30, 0);
    group.add(plane);
    
    var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.set(0, -30, 0);
    group.add(plane2);
    
    // var model = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane2.rotation.x = -0.5 * Math.PI;
    // plane2.position.set(0, -30, 0);
    // group.add(plane2);



    var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
    var lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    

    var geom = new THREE.BoxGeometry(1, 1, 1);
    

    const material = new THREE.MeshBasicMaterial( { 
        // color: 0x00ff69,
        // transparent: true,
        // opacity: 1,
        // wireframe: true,
        // wireframeLinewidth: 5
        // wireFrameLinejoin:'round',
        // wireframeLinecap:'round'
        map: new THREE.TextureLoader().load('./res/neon.png')
    } );


    var box = new THREE.Mesh( geom, material );
    // creating a scene
    var scene = new THREE.Scene();

    // add the box mesh to the scene
    scene.add(box);

    box.position.z = -5;
    box.rotation.x = 10;
    box.rotation.y = 5;

    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(box);
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    scene.add(group);

    document.getElementById('out').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    render();

    function render() {
      analyser.getByteFrequencyData(dataArray);

      var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
      var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

      var overallAvg = avg(dataArray);
      var lowerMax = max(lowerHalfArray);
      var lowerAvg = avg(lowerHalfArray);
      var upperMax = max(upperHalfArray);
      var upperAvg = avg(upperHalfArray);

      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var lowerAvgFr = lowerAvg / lowerHalfArray.length;
      var upperMaxFr = upperMax / upperHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;

      makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
      makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
    //   render3DModel();
    //   makeRoughBall(box, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
      
    //   makeRoughBall(box, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
      makeRoughCube(box, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
    box.rotation.y += 0.01;
    console.log(dataArray)

      group.rotation.y += 0.005;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function makeRoughCube(mesh, bassFr, treFr) {
        console.log(bassFr);
        console.log(treFr);
        mesh.scale.y = 1;
        mesh.scale.x = 1;
        mesh.scale.z = 1;

        mesh.scale.y = mesh.scale.y + bassFr / 10;
        mesh.scale.z = mesh.scale.z + treFr;
        console.log(mesh.scale.y);
        console.log(mesh.scale.x);
        // mesh.translateY( bassFr / 2 );
        // mesh.translateX(treFr / 2);
        // mesh.geometry.vertices.forEach(function (vertex, i) {
        //     var offset = mesh.geometry.parameters.radius;
        //     console.log(offset);
        //     var amp = 7;
        //     var time = window.performance.now();
        //     vertex.normalize();
        //     var rf = 0.00001;
        //     var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
        //     vertex.multiplyScalar(distance);
        // });
        // mesh.geometry.verticesNeedUpdate = true;
        // mesh.geometry.normalsNeedUpdate = true;
        // mesh.geometry.computeVertexNormals();
        // mesh.geometry.computeFaceNormals();
    }

    function makeRoughBall(mesh, bassFr, treFr) {
        mesh.geometry.vertices.forEach(function (vertex, i) {
            var offset = mesh.geometry.parameters.radius;
            var amp = 7;
            var time = window.performance.now();
            vertex.normalize();
            var rf = 0.00001;
            var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
            vertex.multiplyScalar(distance);
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }

    function makeRoughGround(mesh, distortionFr) {
        mesh.geometry.vertices.forEach(function (vertex, i) {
            var amp = 2;
            var time = Date.now();
            var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
            vertex.z = distance;
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }

    // const material = new THREE.MeshNormalMaterial();

    // function render3DModel() {
    //     const fbxLoader = new FBXLoader()
    //     fbxLoader.load(
    //         './res/source/BreakdanceFreezes.fbx',
    //         (object) => {
    //             var shader = THREE.ShaderLib[ "normalmap" ];
    //             var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
                
    //             uniforms["tNormal"] = {
    //                 texture: normalMap
    //             };

    //             // uniforms[ "tNormal" ].texture = normalMap;
    //             // uniforms[ "tDiffuse" ].texture = surfaceMap;
    //             // uniforms[ "tSpecular" ].texture = specularMap;

    //             // uniforms[ "enableDiffuse" ].value = true;
    //             // uniforms[ "enableSpecular" ].value = true;
    //             // object.traverse(function (child) {
    //             //     if ((child as THREE.Mesh).isMesh) {
    //             //         // (child as THREE.Mesh).material = material
    //             //         if ((child as THREE.Mesh).material) {
    //             //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
    //             //         }
    //             //     }
    //             // })
    //             // object.scale.set(.01, .01, .01)
    //             scene.add(object)
    //         },
    //         (xhr) => {
    //             console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    //         },
    //         (error) => {
    //             console.log(error)
    //         }
    //     )
    }

    // var loader = new GLTFLoader();

    // var obj;
    // loader.load('./scene.gltf', function (gltf) {
    //     group.add(gltf.scene);
    // })

    audio.play();
  };


window.onload = vizInit();

document.body.addEventListener('touchend', function(ev) { context.resume(); });





function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}





// class LoadModelDemo {
//     constructor() {
//       this._Initialize();
//     }
  
//     _Initialize() {
//       this._threejs = new THREE.WebGLRenderer({
//         antialias: true,
//       });
//       this._threejs.shadowMap.enabled = true;
//       this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
//       this._threejs.setPixelRatio(window.devicePixelRatio);
//       this._threejs.setSize(window.innerWidth, window.innerHeight);
  
//       document.body.appendChild(this._threejs.domElement);
  
//       window.addEventListener('resize', () => {
//         this._OnWindowResize();
//       }, false);
  
//       const fov = 60;
//       const aspect = 1920 / 1080;
//       const near = 1.0;
//       const far = 1000.0;
//       this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//       this._camera.position.set(75, 20, 0);
  
//       this._scene = new THREE.Scene();
  
//       let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
//       light.position.set(20, 100, 10);
//       light.target.position.set(0, 0, 0);
//       light.castShadow = true;
//       light.shadow.bias = -0.001;
//       light.shadow.mapSize.width = 2048;
//       light.shadow.mapSize.height = 2048;
//       light.shadow.camera.near = 0.1;
//       light.shadow.camera.far = 500.0;
//       light.shadow.camera.near = 0.5;
//       light.shadow.camera.far = 500.0;
//       light.shadow.camera.left = 100;
//       light.shadow.camera.right = -100;
//       light.shadow.camera.top = 100;
//       light.shadow.camera.bottom = -100;
//       this._scene.add(light);
  
//       light = new THREE.AmbientLight(0xFFFFFF, 4.0);
//       this._scene.add(light);
  
//       const controls = new OrbitControls(
//         this._camera, this._threejs.domElement);
//       controls.target.set(0, 20, 0);
//       controls.update();
  
//       const loader = new THREE.CubeTextureLoader();
//       const texture = loader.load([
//           './resources/posx.jpg',
//           './resources/negx.jpg',
//           './resources/posy.jpg',
//           './resources/negy.jpg',
//           './resources/posz.jpg',
//           './resources/negz.jpg',
//       ]);
//       this._scene.background = texture;
  
//       const plane = new THREE.Mesh(
//           new THREE.PlaneGeometry(100, 100, 10, 10),
//           new THREE.MeshStandardMaterial({
//               color: 0x202020,
//             }));
//       plane.castShadow = false;
//       plane.receiveShadow = true;
//       plane.rotation.x = -Math.PI / 2;
//       this._scene.add(plane);
  
//       this._mixers = [];
//       this._previousRAF = null;
  
//       this._LoadAnimatedModel();
//       // this._LoadAnimatedModelAndPlay(
//       //     './resources/dancer/', 'girl.fbx', 'dance.fbx', new THREE.Vector3(0, -1.5, 5));
//       // this._LoadAnimatedModelAndPlay(
//       //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(12, 0, -10));
//       // this._LoadAnimatedModelAndPlay(
//       //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(-12, 0, -10));
//       this._RAF();
//     }
  
//     _LoadAnimatedModel() {
//       const loader = new FBXLoader();
//       loader.setPath('./res/source/');
//       loader.load('mremireh_o_desbiens.fbx', (fbx) => {
//         fbx.scale.setScalar(0.1);
//         fbx.traverse(c => {
//           c.castShadow = true;
//         });
  
//         const params = {
//           target: fbx,
//           camera: this._camera,
//         }
//         this._controls = new BasicCharacterControls(params);
  
//         const anim = new FBXLoader();
//         anim.setPath('./resources/zombie/');
//         anim.load('Breakdance Freezes.fbx', (anim) => {
//           const m = new THREE.AnimationMixer(fbx);
//           this._mixers.push(m);
//           const idle = m.clipAction(anim.animations[0]);
//           idle.play();
//         });
//         this._scene.add(fbx);
//       });
//     }
  
//     _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
//       const loader = new FBXLoader();
//       loader.setPath(path);
//       loader.load(modelFile, (fbx) => {
//         fbx.scale.setScalar(0.1);
//         fbx.traverse(c => {
//           c.castShadow = true;
//         });
//         fbx.position.copy(offset);
  
//         const anim = new FBXLoader();
//         anim.setPath(path);
//         anim.load(animFile, (anim) => {
//           const m = new THREE.AnimationMixer(fbx);
//           this._mixers.push(m);
//           const idle = m.clipAction(anim.animations[0]);
//           idle.play();
//         });
//         this._scene.add(fbx);
//       });
//     }
  
//     _LoadModel() {
//       const loader = new GLTFLoader();
//       loader.load('./resources/thing.glb', (gltf) => {
//         gltf.scene.traverse(c => {
//           c.castShadow = true;
//         });
//         this._scene.add(gltf.scene);
//       });
//     }
  
//     _OnWindowResize() {
//       this._camera.aspect = window.innerWidth / window.innerHeight;
//       this._camera.updateProjectionMatrix();
//       this._threejs.setSize(window.innerWidth, window.innerHeight);
//     }
  
//     _RAF() {
//       requestAnimationFrame((t) => {
//         if (this._previousRAF === null) {
//           this._previousRAF = t;
//         }
  
//         this._RAF();
  
//         this._threejs.render(this._scene, this._camera);
//         this._Step(t - this._previousRAF);
//         this._previousRAF = t;
//       });
//     }
  
//     _Step(timeElapsed) {
//       const timeElapsedS = timeElapsed * 0.001;
//       if (this._mixers) {
//         this._mixers.map(m => m.update(timeElapsedS));
//       }
  
//       if (this._controls) {
//         this._controls.Update(timeElapsedS);
//       }
//     }
//   }
  
  
//   let _APP = null;
  
//   window.addEventListener('DOMContentLoaded', () => {
//     _APP = new LoadModelDemo();
//   });