var setup = function() {

    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    if (ENV.cameraBehind) {
        camera.position.z = 10 // pull back
        camera.position.y = 6 // put up to make it look like you're looking downhill.
    }
    else {
        camera.position.y = 2;
        camera.position.x = -5;
        camera.position.z = -5
    }
    var renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true;

    document.body.appendChild(renderer.domElement)

    var world = new World();
    world.init(scene, camera);

    function render() {
        requestAnimationFrame( render );
        world.updateStep();
        var newCamPos = world.player.position.clone();
        if (ENV.cameraBehind) {
            camera.position.y = newCamPos.y + 3;

            camera.position.x = newCamPos.x + world.adjustCam.x;
            camera.up.x = world.adjustCam.x*-0.2;

            camera.position.z = newCamPos.z + 10 + world.adjustCam.z;

            camera.updateProjectionMatrix();

        }
        else {
            camera.position.z = newCamPos.z
        }
        camera.lookAt(world.player.position);
        renderer.render( scene, camera );
    }

    render()
}


setup()
