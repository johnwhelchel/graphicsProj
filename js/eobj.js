var eObj = function(mesh) {
    mesh.velocity = mesh.velocity || new THREE.Vector3(0, 0, 0);
    mesh.angVelocity = new THREE.Vector3(0, 0, 0);
    mesh.movable = true;
    if (mesh.isPlayer) mesh.mass = ENV.playerMass;
    else mesh.mass = ENV.nonPlayerMass;

    // THIS ASSUMES ONLY GRAVITY and SPHERES
    mesh.euler = function(that) {


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
        if (mesh.pushUp) {
            mesh.velocity.z -= ENV.playerPushForce * ENV.timeScalar / mesh.mass;
            torque.z -= ENV.playerPushForce
        }
        if (mesh.pushDown) {
            mesh.velocity.z += ENV.playerPushForce * ENV.timeScalar / mesh.mass;
            torque.z += ENV.playerPushForce
        }

        mesh.angVelocity.x += torque.x * ENV.timeScalar / mesh.mass;
        mesh.angVelocity.y += torque.y * ENV.timeScalar / mesh.mass;
        mesh.angVelocity.z += torque.z * ENV.timeScalar / mesh.mass;

        if (mesh.position.y < mesh.geometry.parameters.radius ) {
            mesh.position.y = mesh.geometry.parameters.radius
            if (!mesh.isPlayer) mesh.velocity.y = - mesh.velocity.y
        }

        // Check children
        if(mesh.isPlayer) {
            var heightToAdd = 0.0
            for (var i = 0; i < mesh.children.length; i++) {
                var c = mesh.children[i];
                for (var j = 0; j < c.geometry.vertices.length; j++) {
                    var v = c.geometry.vertices[j].clone();
                    v.applyMatrix4(c.matrixWorld);
                    if (v.y < 0.0) {
                        heightToAdd += c.geometry.parameters.radius;
                        mesh.velocity.y *= 1.1 
                        break;
                    }
                }
            };
            mesh.position.y += heightToAdd
        }

        // Have children interact with one another
        else {
            for (var i = 0; i < that.objects.length; i++) {
                var o = that.objects[i]
                if (o.id === mesh.id) continue;
                var dist = o.position.clone().sub(mesh.position);
                if (dist < ENV.nonPlayerRadius*2) {
                    dist.normalize();
                    mesh.velocity.reflect(dist);
                    o.velocity.reflect(dist.multiplyScalar(-1));
                }
            }
        }
    }

    return mesh;
}