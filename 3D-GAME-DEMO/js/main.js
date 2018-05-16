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
    renderer.shadowMap.enabled = true;

    // 环境光
    var ambientLight = new THREE.AmbientLight('#0c0c0c');
    scene.add(ambientLight);

    // 创建地面
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

    // 创建玩家
    var player = createPlayer();
    player.position.set(0, 2, 0);
    scene.add(player);

    // 创建怪物
    var cubeGeometry = new THREE.BoxGeometry(2, 4, 2);
    var cube_1 = createMesh(cubeGeometry, 'brick-wall.jpg');
    cube_1.position.set(5, 2, 0);
    scene.add(cube_1);


    // 聚光灯光源
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -40);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // var light = new THREE.DirectionalLight();
    // light.position.set(0, 30, 20);
    // scene.add(light);

    camera.position.set(-30, 40, 30);
    camera.lookAt(scene.position);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.maxPolarAngle = Math.PI * 0.3;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.minDistance = 50;
    controls.maxDistance = 200;

    $('#output').append(renderer.domElement);

    var step = 0.1;
    var jump_v = 15;
    var g = -9.8;
    var t = 0;
    var bullet_inte = 0;

    var bullets = [];

    var go = false;
    var move_x_head = false;
    var move_x_back = false;
    var move_z_head = false;
    var move_z_back = false;

    render();

    // 随机生成十六位进制数函数
    function createHexRandom () {
        var num = '0x';
        for (var i = 0; i <= 5; i++) {
            var tmp = Math.ceil(Math.random() * 15);
            if (tmp > 9) {
                switch (tmp) {
                    case (10):
                        num += 'a';
                        break;
                    case (11):
                        num += 'b';
                        break;
                    case (12):
                        num += 'c';
                        break;
                    case (13):
                        num += 'd';
                        break;
                    case (14):
                        num += 'e';
                        break;
                    case (15):
                        num += 'f';
                        break;
                }
            } else {
                num += tmp;
            }
        }
        return Number(num);
    }

    // 创建玩家函数
    function createPlayer() {
        var playerGeometry = new THREE.BoxGeometry(2, 4, 2);
        var playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        var player = new THREE.Mesh(playerGeometry, playerMaterial);
        return player;
    }

    // 创建子弹函数
    function createBullet() {
        var bulletGeometry = new THREE.SphereGeometry(0.3, 20, 20);
        var bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        var bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.name = 'bullet'
        return bullet;
    }

    // 添加子弹函数
    function addBullet() {
        var bullet_t = createBullet();
        bullet_t.position.copy(player.position);

        bullets.push(bullet_t);
        scene.add(bullet_t);
    }

    function createMesh(geom, imageFile) {
        var texture = new THREE.TextureLoader().load("./img/" + imageFile);
        var mat = new THREE.MeshPhongMaterial({map: texture});

        var mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    function jump() {
        if (go && player.position.y >= 2) {
            t += step;
            player.position.y = jump_v * t + 1 / 2 * g * t * t + 2;
        } else if (player.position.y < 2) {
            go = false;
            player.position.y = 2;
            t = 0;
        }
    }

    function isCollide(originObj, otherObj) {
        var originPoint = originObj.position.clone();        

        for (var vertexIndex = 0; vertexIndex < originObj.geometry.vertices.length; vertexIndex++) {
            // 顶点原始坐标
            var localVertex = originObj.geometry.vertices[vertexIndex].clone();            
            // 顶点经过变换后的坐标
            var globalVertex = localVertex.applyMatrix4(originObj.matrix);            
            // 获得由中心指向顶点的向量
            var directionVector = globalVertex.sub(originObj.position);

            // 将方向向量初始化
            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            // 检测射线与多个物体的相交情况
            var collisionResults = ray.intersectObjects(otherObj);
            // 如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生了碰撞
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                return true;   // crash 是一个标记变量
            }
        }

        return false
    }

    function move() {
        if (move_z_head) {
            player.position.z -= step;
        };
        if (move_z_back) {
            player.position.z += step;
        };
        if (move_x_head) {
            player.position.x -= step;
        };
        if (move_x_back) {
            player.position.x += step;
        }
    }


    function render() {
        jump();
        move();

        if (bullets.length > 0) {
            for (const i of bullets) {
                if (isCollide(i, [cube_1])) {
                    cube_1.material.color.set(createHexRandom())                   
                }

                if (i.position.x > 50) {
                    scene.remove(i);
                    bullets.shift();
                    continue;
                }
                i.position.x += step * 5;
            }
        }

        if (bullet_inte > 0) {
            bullet_inte--;
        }


        var delta = clock.getDelta();
        controls.update(delta);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    $(window).on('keydown', function (event) {
        if (event.key == ' ') { // 开启跳跃
            go = true;
        }
        if (event.key == 'ArrowUp') { //开启移动
            move_z_head = true;
        }
        if (event.key == 'ArrowDown') { //开启移动
            move_z_back = true;
        }
        if (event.key == 'ArrowLeft') { //开启移动
            move_x_head = true;
        }
        if (event.key == 'ArrowRight') { //开启移动
            move_x_back = true;
        }
        if (event.key == 'a') {
            if (bullet_inte <= 0) {
                addBullet();
                bullet_inte = 5;
            }  
        }
    })

    $(window).on('keyup', function (event) {
        if (event.key == 'ArrowUp') { // 关闭移动
            move_z_head = false;
        }
        if (event.key == 'ArrowDown') { // 关闭移动
            move_z_back = false;
        }
        if (event.key == 'ArrowLeft') { // 关闭移动
            move_x_head = false;
        }
        if (event.key == 'ArrowRight') { // 关闭移动
            move_x_back = false;
        }
    })

}

window.onload = init;