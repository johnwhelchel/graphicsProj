

var World = function(spec) {

    var that = {}

/***************** PRIVATE METHODS **************/

    that._initFloor = function() {

        var geo = new THREE.PlaneBufferGeometry(ENV.planeSize, ENV.planeSize, 1, 1)
        var material = new THREE.MeshPhongMaterial( {color: ENV.planeColor })
        var floor = new THREE.Mesh(geo, material);
        that._scene.add(floor);

        floor.receiveShadow = true;
        floor.rotation.x = - Math.PI/2.0 // Get it with normal facing 'up'
        that._floor = floor
    }

    that._initLights = function() {

        that._lights = []

        // Sunlight
        var dLight1 = new THREE.DirectionalLight(ENV.sunColor, 3)
        dLight1.position.set(-9000,1000,-ENV.planeSize*2) 
        that._scene.add(dLight1)
        that._lights.push(dLight1);

        //Sun shadow
        var dLight2 = new THREE.SpotLight(ENV.sunColor, 3)
        dLight2.position.set(-90 + that.player.position.x,
                             10 + that.player.position.y,
                            -ENV.planeSize*.02 + that.player.position.z)
        dLight2.onlyShadow = true;
        dLight2.castShadow = true;
        that._scene.add(dLight2)
        that._lights.push(dLight2);
        that.sunShadow = dLight2;

        var aLight = new THREE.AmbientLight(0x9E946C);
        that._scene.add(aLight);
        that._lights.push(aLight)

        // var spotLight;
        // for (var i = 0; i < 4; i++) {
        //     spotLight = new THREE.SpotLight(ENV.white, 1, 10000);
        //     spotLight.position.set(100*(i%2-.5), 10, -300*i);
        //     spotLight.castShadow = true;
        //     spotLight.shadowDarkness = 0.5;
        //     that._scene.add(spotLight);
        //     that._lights.push(spotLight);
        // }
        // console.log(that._lights.length);
    }

    // Tball texture -> http://tpreclik.dd-dns.de/codeblog/wp-content/uploads/2007/02/tennisball-texture.jpg
    // Wood texture ->http://libnoise.sourceforge.net/examples/textures/images/wood/sphere.jpg
    that._initPlayer = function() {
        var geo = new THREE.SphereGeometry(ENV.playerRadius, ENV.playerFidelity, ENV.playerFidelity)
        
        var texture = new THREE.ImageUtils.loadTexture('images/wood.jpg', THREE.SphericalReflectionMapping)

        var material = new THREE.MeshPhongMaterial( {
            map: texture
        })

        var sphere = new THREE.Mesh(geo, material);
        that._scene.add(sphere);
        sphere.position.y = ENV.playerStartingHeight
        sphere.position.z = 3

        sphere.castShadow = ENV.playerCastShadow
        sphere.isPlayer = true;
        eObj(sphere);
        that.player = sphere;
    }

    that._initOtherSphere = function(loc, vel) {
        loc = loc || new THREE.Vector3(0, 2, -5);
        vel = vel || new THREE.Vector3(0, 0, 0);
        var sphereGeo = new THREE.SphereGeometry(ENV.nonPlayerRadius, 30, 30);

        var material = new THREE.MeshPhongMaterial( {
            color: 0xff0000
        })

        var oSphere = new THREE.Mesh(sphereGeo, material);
        that._scene.add(oSphere);
        oSphere.position.x = loc.x;
        oSphere.position.y = loc.y;
        oSphere.position.z = loc.z;

        oSphere.velocity = new THREE.Vector3(vel.x, vel.y, vel.z);
        oSphere.castShadow = ENV.nonPlayerCastShadow;

        eObj(oSphere);
        that.objects.push(oSphere);
    }

    that._initGroupsOfSpheres = function(count) {

        for(var i = 0; i < count; i++) {
            var loc = new THREE.Vector3((Math.random()-0.5)*20, Math.random()*2, Math.random()*-5 - 3)
            var vel = new THREE.Vector3(Math.random()*-.02, 0, Math.random()*-.002);
            that._initOtherSphere(loc, vel);
        }
    }

    that._initTree = function() {
        var boxGeo = new THREE.BoxGeometry(2, 10, 2);
        var material = new THREE.MeshPhongMaterial( {
            color: 0x00ff00,
        })
        var box = new THREE.Mesh(boxGeo, material);
        that._scene.add(box);
        box.position.x = -2;
        box.position.y = 1;
        box.position.z = -100;
        box.euler = function () {};
        that.objects.push(box);
    }

    that._initKeyboard = function() {
        that.adjustCam = new THREE.Vector3(0.0, 0.0, 0.0);
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === ENV.leftKey) { 
                that.player.pushLeft = true;
                that.player.pushRight = false;
                that.adjustCam.x = Math.min(1, that.adjustCam.x + ENV.cameraSpeed);
            }
            else if (e.keyCode === ENV.rightKey) {
                that.player.pushLeft = false;
                that.player.pushRight = true;
                that.adjustCam.x = Math.max(-1, that.adjustCam.x - ENV.cameraSpeed);
            }
            else if (e.keyCode === ENV.upKey) {
                that.player.pushUp = true;
                that.player.pushDown = false;
                that.adjustCam.z = Math.min(1, that.adjustCam.z + ENV.cameraSpeed);
            }
            else if (e.keyCode === ENV.downKey) {
                that.player.pushUp = false;
                that.player.pushDown = true;
                that.adjustCam.z = Math.min(1, that.adjustCam.z - ENV.cameraSpeed);
            }
        })
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === ENV.leftKey) {
                that.player.pushLeft = false;
            }
            else if (e.keyCode === ENV.rightKey) {
                that.player.pushRight = false;
            }
            else if (e.keyCode === ENV.upKey) {
                that.player.pushUp = false;
            }
            else if (e.keyCode === ENV.downKey) {
                that.player.pushDown = false;
            }
        })
    }

   
    // P is player
    that._catchOthers = function(p) {
        var r = p.geometry.parameters.radius;
        for (var i = 0; i < that.objects.length; i++) {
            var o = that.objects[i];
            var dir = o.position.clone().sub(p.position);

            // Why cast a ray? just check distance vs. sum of radii
            if (dir.length() < r + o.geometry.parameters.radius) {
                THREE.SceneUtils.attach(o, that._scene, p);
                o.castShadow = true;
                that.player.mass += ENV.captureMass;
                that.objects.splice(i, 1);
            }
        }
    }

    // Fix camera slowly when key released
    that._adjustCamera = function() {
        if (!that.player.pushLeft && that.adjustCam.x > 0.0) {
            that.adjustCam.x -= ENV.cameraSpeed
        }
        if (!that.player.pushRight && that.adjustCam.x < 0.0) {
            that.adjustCam.x += ENV.cameraSpeed
        }
        if (!that.player.pushUp && that.adjustCam.z > 0.0) {
            that.adjustCam.z -= ENV.cameraSpeed
        }
        if (!that.player.pushDown && that.adjustCam.z < 0.0) {
            that.adjustCam.z += ENV.cameraSpeed
        }
    }

    that._adjustSunshadow = function() {
        var s = that.sunShadow;
        s.target = that.player;
        s.position.x = that.player.position.x + ENV.sunShadowOffset.x;
        s.position.y = that.player.position.y + ENV.sunShadowOffset.y;
        s.position.z = that.player.position.z + ENV.sunShadowOffset.z;
    }

/***************** END PRIVATE METHODS  **************/




/***************** PUBLIC METHODS       **************/


    // Do physics updates, rotation, etc.
    that.updateStep = function() {


        // Move objects and update velocities

        for(var i = 0; i < that.objects.length; i++) {
            that.objects[i].euler(that);
        }

        // Move player
        var p = that.player;
        p.euler(that);


        that._catchOthers(p);

        that._adjustCamera()

        that._adjustSunshadow();

    }

    // https://upload.wikimedia.org/wikipedia/commons/2/2d/Pyramid_Lake_Panorama.jpg
    // https://stackoverflow.com/questions/19865537/three-js-set-background-image
    that.initBackground = function() {

        var background = {}
        background.scene = new THREE.Scene();
        background.camera = new THREE.PerspectiveCamera();


        var geo = new THREE.PlaneBufferGeometry(ENV.bgSize*1.5, ENV.bgSize, 1, 1)
        var texture = new THREE.ImageUtils.loadTexture("images/background.jpg", THREE.UVMapping);
        var material = new THREE.MeshBasicMaterial( {
            map:texture
        })

        material.depthTest = false;
        material.depthWrite = false;

        var mesh = new THREE.Mesh(geo, material);

        background.scene.add(background.camera);
        background.scene.add(mesh);

        mesh.position.y = 80
        mesh.position.z = -ENV.bgDist
        //mesh.rotation.x += Math.PI/10

        that._background = mesh;
        return background;
    }



    that.init = function(scene, camera) {
        that.objects = []
        that._scene = scene;
        that._camera = camera;

        // Create Environment
        that._initFloor();
        that._initPlayer();
        that._initLights();
        that._initKeyboard();
        
        that._initGroupsOfSpheres(10);
        that._initTree();
    }

    return that;
}