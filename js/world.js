// CONSTANTS for WORLD behavior
var WORLD = {
    gravity: new THREE.Vector3(0, -9.8, -3), // slightly positive in z to simulate downhill
    timeScalar: 1,
    playerStartingSize: 2,
    down: new THREE.Vector3(0, -1, 0),
    up: new THREE.Vector3(0, 1, 0),
    left: new THREE.Vector3(1, 0, 0),
    right: new THREE.Vector3(0, 1, 0),
    bounceDamp: 0.6,
    rotDamp: 0.1,
    planeSize: 10000,
    playerMass: 500,
}

// Functions used for world... probably could better define API

WORLD.makeMove = function(obj) {
    obj.velocity = new THREE.Vector3(0, 0, 0)
    obj.rotationAdjuster = new THREE.Vector3(0, 0, 0);
    obj.movable = true;
}

WORLD.addFloor = function(scene, camera, world) {
    var geo = new THREE.PlaneBufferGeometry(WORLD.planeSize, WORLD.planeSize, 1, 1)
    var material = new THREE.MeshPhongMaterial( {color: 0x1144ee })
    var plane = new THREE.Mesh(geo, material);
    var floor = new THREE.Plane()
    scene.add(plane);

    plane.rotation.x = - Math.PI/2.0 // Get it with normal facing 'up'
    plane.position.y = -1
    world.floor = plane
}

WORLD.addSun = function(scene, camera) {
    var lights = []
    var dLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dLight1.position.set(0,1,0) // one above
    lights.push(dLight1);

    var dLight2 = new THREE.DirectionalLight(0xffffff, 0.8)
    dLight2.position.set(0,1,1) // one above behind camera
    scene.add(dLight2)
    lights.push(dLight2)

    var spotLight = new THREE.PointLight(0xffffff, 1, 1000);
    spotLight.position.set(0, 20, -1000);
    scene.add(spotLight);
    lights.push(spotLight);

    return lights;
}


WORLD.addBall = function(scene, camera) {
    var geo = new THREE.SphereGeometry(WORLD.playerStartingSize, 50, 50)
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x00ff00 // green
    })
    var sphere = new THREE.Mesh(geo, material);
    scene.add(sphere);
    sphere.position.y = 5
    WORLD.makeMove(sphere);
    sphere.mass = WORLD.playerMass;

    var g2 = new THREE.BoxGeometry(2, 2, 2);
    var cube = new THREE.Mesh(g2, material);
    scene.add(cube);
    cube.position.y = 2;
    sphere.add(cube);

    return sphere;
}

WORLD.pushBall = function(dir) {
    var p = this.world.player;
    if (dir === 'left') {
        p.velocity.x = Math.max(-.5, p.velocity.x - 0.05 + (Math.random() - 1.0)*.0001);
    }
    else {
        p.velocity.x = Math.min(.5, p.velocity.x + 0.05 + (Math.random() - 1.0)*.0001);
    }
}

WORLD.keyboard = function() {
    WORLD.world.adjustCam = 0;
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 37) { 
            WORLD.world.keyPressed = true;
            WORLD.pushBall('left')
            WORLD.world.adjustCam = Math.min(1, WORLD.world.adjustCam + .01);
        }
        else if (e.keyCode === 39) {
            WORLD.world.keyPressed = true;
            WORLD.pushBall('right')
            WORLD.world.adjustCam = Math.max(-1, WORLD.world.adjustCam - .01);
        }
    })
    document.addEventListener('keyup', function(e) {
        if (e.keyCode === 37 || e.keyCode === 39) { 
            WORLD.world.keyPressed = false;
        }
    })
}

WORLD.instantiateWorld = function(scene, camera) {
    var world = {}
    WORLD.world = world;
    world.objects = []
    world.math = [] // keeps doubled of meshes for collision detection

    // Create Environment

    WORLD.addFloor(scene, camera, world);
    world.sunlights = WORLD.addSun(scene, camera);

    // Create physical ball

    world.player = WORLD.addBall(scene, camera);
    world.objects.push(world.player);

    // Define forces

    world.forces = []
    world.forces.push(WORLD.gravity);

    // Capture keyboard

    this.keyboard();

    // Helper functions

    world.getMovableObjects = function() {
        var mo = []
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].movable) mo.push(this.objects[i])
        }
        return mo;
    }

    // Do physics updates

    world.updateStep = function() {

        // Move objects and update velocities
        var objs = this.getMovableObjects()

        for(var i = 0; i < objs.length; i++) {
            var o = objs[i]
            o.position.x += o.velocity.x
            o.position.y += o.velocity.y
            o.position.z += o.velocity.z
            for(var j = 0; j < this.forces.length; j++) {
                var f = this.forces[j];
                o.velocity.x += f.x * WORLD.timeScalar / o.mass;
                o.velocity.y += f.y * WORLD.timeScalar / o.mass;
                o.velocity.z += f.z * WORLD.timeScalar / o.mass;
            }
        }

        // Detect collisions with floor to simulate rolling
        var rc = new THREE.Raycaster(this.player.position, WORLD.down)
        var is = rc.intersectObject(this.floor, false);
        for (var i = 0; i < is.length; i++) {
            if (is[i].distance < WORLD.playerStartingSize) {
                o.velocity.reflect(WORLD.down);

                // rotate
                o.rotation.x += o.velocity.z*o.velocity.y;
                o.rotation.z += o.velocity.x*o.velocity.y;
                
                if (o.velocity.y < 0.1) o.velocity.y = 0;
                o.velocity.y *= WORLD.bounceDamp;
            }
        }

        // Fix camera slowly
        if (!world.keyPressed) {
            if (world.adjustCam < 0.0) {
                world.adjustCam += 0.02
            }
            else world.adjustCam -= 0.02
        }

    }


    return world
}