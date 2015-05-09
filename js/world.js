

var World = function(spec) {

    var that = {}

/***************** PRIVATE METHODS **************/

    that._initFloor = function(scene, camera) {

        var geo = new THREE.PlaneBufferGeometry(ENV.planeSize, ENV.planeSize, 1, 1)
        var material = new THREE.MeshPhongMaterial( {color: ENV.planeColor })
        var floor = new THREE.Mesh(geo, material);
        scene.add(floor);

        floor.rotation.x = - Math.PI/2.0 // Get it with normal facing 'up'
        that._floor = floor
    }

    that._initLights = function(scene, camera) {

        that._lights = []

        var dLight1 = new THREE.DirectionalLight(ENV.white, 1)
        dLight1.position.set(0,1,0) // one above
        that._lights.push(dLight1);

        var dLight2 = new THREE.DirectionalLight(ENV.white, 1)
        dLight2.position.set(0,1,5) // one above behind camera
        scene.add(dLight2)
        that._lights.push(dLight2)

        var spotLight = new THREE.PointLight(ENV.white, 1, 1000);
        spotLight.position.set(0, 20, -100);
        scene.add(spotLight);
        that._lights.push(spotLight);
    }

    // Tball texture -> http://tpreclik.dd-dns.de/codeblog/wp-content/uploads/2007/02/tennisball-texture.jpg
    // Wood texture ->http://libnoise.sourceforge.net/examples/textures/images/wood/sphere.jpg
    that._initPlayer = function(scene, camera) {
        var geo = new THREE.SphereGeometry(ENV.playerRadius, ENV.playerFidelity, ENV.playerFidelity)
        
        var texture = new THREE.ImageUtils.loadTexture('images/wood.jpg', THREE.SphericalReflectionMapping)

        var material = new THREE.MeshPhongMaterial( {
            map: texture
        })

        var sphere = new THREE.Mesh(geo, material);
        scene.add(sphere);
        sphere.position.y = ENV.playerStartingHeight
        sphere.mass = ENV.playerMass;

        // Bugfix: floating point error when raycasting to south pole of sphere.
        sphere.rotation.x = - Math.PI/2.0 

        eObj(sphere);
        that.player = sphere;
    }

    that._initBox = function(scene, camera) {
        var boxGeo = new THREE.BoxGeometry(2, 2, 2);
        var cube = new THREE.Mesh(boxGeo, material);
        scene.add(cube);
        cube.position.y = 2;
        cube.position.z = -100;
        eObj(cube);
        that.objects.push(cube);
    }

    that._initKeyboard = function() {
        that.adjustCam = 0.0;
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === ENV.leftKey) { 
                that.keyPressed = true;
                that._pushBall('left')
                that.adjustCam = Math.min(1, that.adjustCam + ENV.cameraSpeed);
            }
            else if (e.keyCode === ENV.rightKey) {
                that.keyPressed = true;
                that._pushBall('right')
                that.adjustCam = Math.max(-1, that.adjustCam - ENV.cameraSpeed);
            }
        })
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === ENV.leftKey || e.keyCode === ENV.rightKey) { 
                that.keyPressed = false;
            }
        })
    }

    that._pushBall = function(dir) {
        var p = that.player;
        if (dir === 'left') {
            p.velocity.x = Math.max(-2.5, p.velocity.x - 0.3 + (Math.random() - 1.0)*.01);
        }
        else {
            p.velocity.x = Math.min(2.5, p.velocity.x + 0.3 + (Math.random() - 1.0)*.01);
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

        for(var i = 0; i < that.objects; i++) {
            that.objects[i].euler();
        }

        // Move player
        var p = that.player;
        p.euler();

        // Going to try something a little different. If any vertex is negative y...
        for (var i = 0; i < p.geometry.vertices.length; i++) {
            var v = p.geometry.vertices[i].clone();
            v.applyMatrix4(p.matrixWorld);
            if (v.y < 0.0) {
                p.velocity.reflect(ENV.down);

                // Rotate
                
                p.rotation.x += p.velocity.z * ENV.rotDamp;
                p.rotation.z += p.velocity.x * ENV.rotDamp;
                
                // Prevent thrashing
                if (p.velocity.y < 0.1) p.velocity.y = 0;
                else p.velocity.y *= ENV.bounceDamp;
                break;
            }
        }

        that._adjustCamera()
    }


    that.init = function(scene, camera) {
        that.objects = []

        // Create Environment
        that._initFloor(scene, camera);
        that._initLights(scene, camera);
        that._initPlayer(scene, camera);
        that._initKeyboard(scene, camera);
        // that._initBox

    }

    return that;
}