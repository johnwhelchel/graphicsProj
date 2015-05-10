

var World = function(spec) {

    var that = {}

/***************** PRIVATE METHODS **************/

    that._initFloor = function() {

        var geo = new THREE.PlaneBufferGeometry(ENV.planeSize, ENV.planeSize, 1, 1)
        var material = new THREE.MeshPhongMaterial( {color: ENV.planeColor })
        var floor = new THREE.Mesh(geo, material);
        that._scene.add(floor);

        floor.rotation.x = - Math.PI/2.0 // Get it with normal facing 'up'
        that._floor = floor
    }

    that._initLights = function() {

        that._lights = []

        var dLight1 = new THREE.DirectionalLight(ENV.white, 1)
        dLight1.position.set(0,1,0) // one above
        that._lights.push(dLight1);

        var dLight2 = new THREE.DirectionalLight(ENV.white, 1)
        dLight2.position.set(0,1,5) // one above behind camera
        that._scene.add(dLight2)
        that._lights.push(dLight2)

        var spotLight = new THREE.PointLight(ENV.white, 1, 1000);
        spotLight.position.set(0, 20, -100);
        that._scene.add(spotLight);
        that._lights.push(spotLight);
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

        // Bugfix: floating point error when raycasting to south pole of sphere.
        sphere.rotation.x = - Math.PI/2.0 

        sphere.isPlayer = true;
        eObj(sphere);
        that.player = sphere;
    }

    that._initOtherSphere = function() {
        var sphereGeo = new THREE.SphereGeometry(.3, 30, 30);

        var texture = new THREE.ImageUtils.loadTexture('images/wood.jpg', THREE.SphericalReflectionMapping)

        var material = new THREE.MeshPhongMaterial( {
            map: texture
        })

        var oSphere = new THREE.Mesh(sphereGeo, material);
        that._scene.add(oSphere);
        oSphere.position.y = 2;
        oSphere.position.z = -5;
        eObj(oSphere);
        that.objects.push(oSphere);
    }

    that._initGroupsOfSpheres = function() {
        that._initOtherSphere;
    }

    that._initKeyboard = function() {
        that.adjustCam = 0.0;
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === ENV.leftKey) { 
                that.keyPressed = true;
                that.player.pushLeft = true;
                that.player.pushRight = false;
                that.adjustCam = Math.min(1, that.adjustCam + ENV.cameraSpeed);
            }
            else if (e.keyCode === ENV.rightKey) {
                that.keyPressed = true;
                that.player.pushLeft = false;
                that.player.pushRight = true;
                that.adjustCam = Math.max(-1, that.adjustCam - ENV.cameraSpeed);
            }
        })
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === ENV.leftKey || e.keyCode === ENV.rightKey) { 
                that.keyPressed = false;
                that.player.pushRight = false;
                that.player.pushLeft = false;
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
                that.objects.splice(i, 1);
            }
        }
    }

    // Fix camera slowly when key released
    that._adjustCamera = function() {
        if (!that.keyPressed) {
            if (that.adjustCam < 0.0) {
                that.adjustCam += ENV.cameraSpeed
            }
            else that.adjustCam -= ENV.cameraSpeed
        }
    }

/***************** END PRIVATE METHODS  **************/




/***************** PUBLIC METHODS       **************/


    // Do physics updates, rotation, etc.
    that.updateStep = function() {


        // Move objects and update velocities

        for(var i = 0; i < that.objects.length; i++) {
            that.objects[i].euler();
        }

        // Move player
        var p = that.player;
        p.euler();


        that._catchOthers(p);

        that._adjustCamera()
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
        that._initOtherSphere();
        //that._initGroupsOfSpheres();

    }

    return that;
}