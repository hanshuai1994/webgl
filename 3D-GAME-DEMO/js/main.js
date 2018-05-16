Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init() {
    var clock = new THREE.Clock();

    // 场景
    // var scene = new THREE.Scene();

    var scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3(0, -90, 0));

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

    // var planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    // var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // var plane = createMesh(planeGeometry, 'texture_block_1.jpg');

    // plane.material.map.wrapS = THREE.RepeatWrapping;
    // plane.material.map.wrapT = THREE.RepeatWrapping;
    // plane.material.map.repeat.set(50, 50)

    // plane.receiveShadow = true;

    // // rotate and position the plane
    // plane.rotation.x = -0.5 * Math.PI;
    // plane.position.x = 0;
    // plane.position.y = 0;
    // plane.position.z = 0;

    // // add the plane to the scene
    // scene.add(plane);


    // Materials
    ground_material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('./img/texture_block_1.jpg') }),
        .9, // high friction
        .6 // low restitution
    );
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set(30, 65);

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(60, 1, 130),
        ground_material,
        0 // mass
    );
    ground.receiveShadow = true;


    var borderLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, 130),
        ground_material,
        0 // mass
    );

    borderLeft.position.x = -31;
    borderLeft.position.y = 2;


    ground.add(borderLeft);

    var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 6, 130),
        ground_material,
        0 // mass
    );
    borderRight.position.x = 31;
    borderRight.position.y = 2;

    ground.add(borderRight);


    var borderBottom = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    );

    borderBottom.position.z = 65;
    borderBottom.position.y = 2;
    ground.add(borderBottom);

    var borderTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    );

    borderTop.position.z = -65;
    borderTop.position.y = 2;
    ground.add(borderTop);

    scene.add(ground);


    var cubeGeometry = new THREE.BoxGeometry(4, 2, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    var cube = new Physijs.BoxMesh(
        new THREE.BoxGeometry(4, 2, 4),
        //  new THREE.SphereGeometry( 2, 20 ),
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0xff0000,
                opacity: 0.8,
                transparent: true
                //  map: THREE.ImageUtils.loadTexture( '../assets/textures/general/stone.jpg' )
            }),
            0.5,
            0.5
        )
    );

    // cube.enableLinearMotor()

    // var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
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

    // var controls = new THREE.TrackballControls(camera);

    // trackballControls.rotateSpeed = 1.0;
    // trackballControls.zoomSpeed = 1.0;
    // trackballControls.panSpeed = 1.0;
    // trackballControls.noZoom=false;
    // trackballControls.noPan=false;
    // trackballControls.staticMoving = true;
    // trackballControls.dynamicDampingFactor=0.3

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.maxPolarAngle = Math.PI * 0.3;
    controls.minDistance = 50;
    controls.maxDistance = 200;

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
        if (go && cube.position.y >= 2) {
            t += step;
            cube.position.y = jump_v * t + 1 / 2 * g * t * t + 2;
        } else if (cube.position.y < 2) {
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
        controls.update(delta);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
        scene.simulate();
    }


    render();

    $(window).on('keydown', function (event) {
        // console.log(event);

        if (event.key == ' ') {
            go = true;
        } else if (event.key == 'ArrowUp') {
            move_z_head = true;
        } else if (event.key == 'ArrowDown') {
            move_z_back = true;
        } else if (event.key == 'ArrowLeft') {
            move_x_head = true;
        } else if (event.key == 'ArrowRight') {
            move_x_back = true;
        }
    })

    $(window).on('keyup', function (event) {
        if (event.key == 'ArrowUp') {
            move_z_head = false;
        } else if (event.key == 'ArrowDown') {
            move_z_back = false;
        } else if (event.key == 'ArrowLeft') {
            move_x_head = false;
        } else if (event.key == 'ArrowRight') {
            move_x_back = false;
        }
    })

}

window.onload = init;