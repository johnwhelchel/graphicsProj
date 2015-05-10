

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

        var dLight1 = new THREE.DirectionalLight(ENV.white, 1)
        dLight1.position.set(0,1,0) // one above
        //that._lights.push(dLight1);

        var dLight2 = new THREE.DirectionalLight(ENV.white, 1)
        dLight2.position.set(0,1,5) // one above behind camera
        that._scene.add(dLight2)
        //that._lights.push(dLight2)

        var spotLight;
        for (var i = 0; i < 4; i++) {
            spotLight = new THREE.SpotLight(ENV.white, 1, 10000);
            spotLight.position.set(100*(i%2-.5), 10, -300*i);
            spotLight.castShadow = true;
            spotLight.shadowDarkness = 0.5;
            that._scene.add(spotLight);
            that._lights.push(spotLight);
        }
        console.log(that._lights.length);
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

        for(var i = 0; i < that._lights.length; i++) {
            that._lights[i].target = that.player
        }
    }


    that.init = function(scene, camera) {
        that.objects = []
        that._scene = scene;
        that._camera = camera;

        // Create Environment
        that._initFloor();
        that._initLights();
        that._initPlayer();
        that._initKeyboard();
        //that._initOtherSphere();
        that._initGroupsOfSpheres(10);
        that._initTree();

    }

    return that;
}