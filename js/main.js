var setup = function() {

    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    var renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setSize( window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement)

    var world = new World();
    world.init(scene, camera);
    var backgroundWorld = world.initBackground()

    if (ENV.cameraBehind) {
        backgroundWorld.camera.position.z = 20 // pull back
        backgroundWorld.camera.position.y = 6 // put up to make it look like you're looking downhill.
    }
    else {
        camera.position.y = 2;
        camera.position.x = -5;
        camera.position.z = -5
    }

    function render() {
        requestAnimationFrame( render );
        world.updateStep();
        var newCamPos = world.player.position.clone();
        if (ENV.cameraBehind) {
            camera.position.y = newCamPos.y + 3;
            backgroundWorld.camera.position.y = newCamPos.y + 3;


            camera.position.x = newCamPos.x + world.adjustCam.x;
            backgroundWorld.camera.position.x = newCamPos.x + world.adjustCam.x;

            camera.up.x = world.adjustCam.x*-0.2;
            backgroundWorld.camera.up.x = world.adjustCam.x*-0.2;

            camera.position.z = newCamPos.z + 10 + world.adjustCam.z;

            camera.updateProjectionMatrix();
            backgroundWorld.camera.updateProjectionMatrix();
        }
        else {
            camera.position.z = newCamPos.z
        }

        camera.lookAt(world.player.position);
        backgroundWorld.camera.lookAt(world.player.position);

        renderer.autoClear = false;
        renderer.clear();
        renderer.render( backgroundWorld.scene, backgroundWorld.camera );
        renderer.render( scene, camera );

    }

    render()
}


setup()
