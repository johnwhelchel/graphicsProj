// CONSTANTS for WORLD behavior

// TODO
// Make rotation better math
// Do raytracing from plane, not other way around
    // To do this, need to have sphere math, copy the position adjustments, project, then do collision detection.
// Get it picking up objects

var ENV = {

    // Camera
    cameraSpeed: 0.0,

    forces: [
        // Gravity
        new THREE.Vector3(0, -9.8, -3), // slightly negative in z to simulate downhill
    ],

    // Adjust to change the way time behaves
    timeScalar: .01,

    // Player variables
    playerRadius: 2,
    playerMass: 500,
    playerFidelity: 20,
    playerStartingHeight: 15,

    // Physics damping
    bounceDamp: 0.6,
    rotDamp: 0.5,

    // Floor variables
    planeSize: 10000,
    planeColor: 0x0000ee,

    // Useful Constants
    down: new THREE.Vector3(0, -1, 0),
    up: new THREE.Vector3(0, 1, 0),
    left: new THREE.Vector3(1, 0, 0),
    right: new THREE.Vector3(0, 1, 0),

    leftKey: 37,
    rightKey: 39,

    white: 0xffffff,
    defaultMass: 100,

}