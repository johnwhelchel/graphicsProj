// CONSTANTS for WORLD behavior

// TODO
// Make other objects interact with one another
    // Seems to work! CHECK

// Add keyboard controls for front and back
    // CHECK

// Get rid of camera movement. 
    // FIXED

// Make it pretty
    // Sub goals:
        // Pretty background image
        // Sunlight
        // Grass



// have it fall off the edge
// Make it possible to pick up via children, i.e. nesting.
// Have a lot more

var ENV = {

    // Camera
    cameraSpeed: 0.02,
    cameraBehind: true,

    gravity: new THREE.Vector3(0, -24/2.0, -7/2.0), //  negative in z to simulate downhill


    // Adjust to change the way time behaves
    timeScalar: .05,

    // Player variables
    playerRadius: 2,
    playerMass: 500,
    playerFidelity: 20,
    playerStartingHeight: 5,
    playerPushForce: 4,
    playerCastShadow: true,

    // Physics damping
    bounceDamp: 0.6,
    rotDamp: 0.1,
    physicsDamp: 0.1,

    nonPlayerMass: 500,
    nonPlayerRadius: .2,
    nonPlayerCastShadow: true,
    captureMass: 10,

    // Floor variables
    planeSize: 2000,
    bgSize: 200,
    bgDist: 200,
    planeColor: 0x115511,

    // Lights
    sunShadowOffset: new THREE.Vector3(-90, 10, -100),

    // Useful Constants
    down: new THREE.Vector3(0, -1, 0),
    up: new THREE.Vector3(0, 1, 0),
    left: new THREE.Vector3(1, 0, 0),
    right: new THREE.Vector3(0, 1, 0),
    origin: new THREE.Vector3(0, 0, 0),

    leftKey: 37,
    rightKey: 39,
    upKey: 38,
    downKey: 40,

    sunColor: 0xFCFCAE,
    defaultMass: 100,

}