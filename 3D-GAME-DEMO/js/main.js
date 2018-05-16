function init() {
    var clock = new THREE.Clock();

    // 场景
    var scene = new THREE.Scene();

    // 相机
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // 正交相机
    // var camera = new THREE.OrthographicCamera(window.innerWidth / -36, window.innerWidth / 36, window.innerHeight / 36, window.innerHeight / -36, -200, 500)
    // var camera = new THREE.OrthographicCamera(-2, 2, 1.5, -1.5, 1, 10);

    // 渲染
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xcccccc));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    var ambientLight = new THREE.AmbientLight('#0c0c0c');
    scene.add(ambientLight);

    // create the ground plane

    var planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    var plane = createMesh(planeGeometry, 'texture_block_1.jpg');

    plane.material.map.wrapS = THREE.RepeatWrapping;
    plane.material.map.wrapT = THREE.RepeatWrapping;
    plane.material.map.repeat.set(50, 50)

    plane.receiveShadow = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    var cubeGeometry = new THREE.BoxGeometry(2, 4, 2);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // var cube = createMesh(cubeGeometry, 'brick-wall.jpg');
    var cube_1 = createMesh(cubeGeometry, 'brick-wall.jpg');

    // position the cube
    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;

    cube_1.position.set(5, 2, 0);

    scene.add(cube);
    scene.add(cube_1);


    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // var light = new THREE.DirectionalLight();
    // light.position.set(0, 30, 20);
    // scene.add(light);

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    var trackballControls = new THREE.TrackballControls(camera);

    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.0;
    trackballControls.panSpeed = 1.0;
    // trackballControls.noZoom=false;
    // trackballControls.noPan=false;
    trackballControls.staticMoving = true;
    // trackballControls.dynamicDampingFactor=0.3

    $('#output').append(renderer.domElement);


    function createMesh(geom, imageFile) {
        var texture = THREE.ImageUtils.loadTexture("./img/" + imageFile);
        var mat = new THREE.MeshPhongMaterial();
        mat.map = texture;

        var mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    var step = 0.1;
    var jump_v = 15;
    var g = -9.8;
    var t = 0;
    
    var go = false;
    var move_x_head = false;
    var move_x_back = false;
    var move_z_head = false;
    var move_z_back = false;

    function jump() {
        if (go && cube.position.y>=2) {
            t += step;
            cube.position.y = jump_v*t + 1/2*g*t*t + 2;
        } else if (cube.position.y<2) {
            go = false;
            cube.position.y = 2;
            t = 0;
        }
    }

    function move() {
        if (move_z_head) {
            cube.position.z -= step;
        };
        if (move_z_back) {
            cube.position.z += step;
        };
        if (move_x_head) {
            cube.position.x -= step;
        };
        if (move_x_back) {
            cube.position.x += step;
        }
    }


    var render = function () {
        jump();
        move();

        var delta = clock.getDelta();
        trackballControls.update(delta);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    render();

    $(window).on('keydown', function(event) {
        console.log(event);
        
        if (event.key == ' ') {
            go = true;
        } else if (event.key == 'ArrowUp') {
            move_z_head = true;
        } else if(event.key == 'ArrowDown') {
            move_z_back = true;
        } else if(event.key == 'ArrowLeft' ) {
            move_x_head = true;
        } else if(event.key == 'ArrowRight') {
            move_x_back = true;
        }
    })

    $(window).on('keyup', function(event) {
        if (event.key == 'ArrowUp') {
            move_z_head = false;
        } else if(event.key == 'ArrowDown') {
            move_z_back = false;
        } else if(event.key == 'ArrowLeft' ) {
            move_x_head = false;
        } else if(event.key == 'ArrowRight') {
            move_x_back = false;
        }
    })

}

window.onload = init;