var setup = function() {

    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    camera.position.z = 10 // pull back
    camera.position.y = 8 // put up to make it look like you're looking downhill.

    var renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight)

    document.body.appendChild(renderer.domElement)

    var world = new World();
    world.init(scene, camera);

    function render() {
        requestAnimationFrame( render );
        world.updateStep();
        var newCamPos = world.player.position.clone();
        newCamPos.z += 10;
        camera.position.x = newCamPos.x + world.adjustCam;
        
        camera.position.z = newCamPos.z;
        camera.lookAt(world.player.position);
        renderer.render( scene, camera );
    }

    render()
}


setup()
