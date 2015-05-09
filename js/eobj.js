var eObj = function(mesh) {
    mesh.velocity = new THREE.Vector3(0, 0, 0);
    mesh.angVelocity = new THREE.Vector3(0, 0, 0);
    mesh.movable = true;
    if (mesh.isPlayer) mesh.mass = ENV.playerMass;
    else mesh.mass = ENV.nonPlayerMass;

    // THIS ASSUMES ONLY GRAVITY and SPHERES
    mesh.euler = function() {
        mesh.position.x += mesh.velocity.x
        mesh.position.y += mesh.velocity.y
        mesh.position.z += mesh.velocity.z

        mesh.rotation.x += mesh.angVelocity.z;
        mesh.rotation.z += mesh.angVelocity.x;

        var f = ENV.gravity
        mesh.velocity.x += f.x * ENV.timeScalar / mesh.mass;
        mesh.velocity.y += f.y * ENV.timeScalar / mesh.mass;
        mesh.velocity.z += f.z * ENV.timeScalar / mesh.mass;

        var torque = ENV.gravity.clone().multiplyScalar(mesh.geometry.parameters.radius * ENV.rotDamp);

        if (mesh.pushRight) {
            mesh.velocity.x += ENV.playerPushForce * ENV.timeScalar / mesh.mass;
            torque.x += ENV.playerPushForce
        }
        if (mesh.pushLeft) {
            mesh.velocity.x -= ENV.playerPushForce * ENV.timeScalar / mesh.mass;
            torque.x -= ENV.playerPushForce
        }

        mesh.angVelocity.x += torque.x * ENV.timeScalar / mesh.mass;
        mesh.angVelocity.y += torque.y * ENV.timeScalar / mesh.mass;
        mesh.angVelocity.z += torque.z * ENV.timeScalar / mesh.mass;


        // Check to see if beneath plane:

        for (var i = 0; i < mesh.geometry.vertices.length; i++) {
            var v = mesh.geometry.vertices[i].clone();
            v.applyMatrix4(mesh.matrixWorld);
            if (v.y < 0.0) {
                mesh.velocity.reflect(ENV.down);
                
                // Prevent thrashing
                if (mesh.velocity.y < 0.1) mesh.velocity.y = 0;
                else mesh.velocity.y *= ENV.bounceDamp;
                break;
            }
        }
    }

    return mesh;
}