var eObj = function(mesh) {
    mesh.velocity = new THREE.Vector3(0, 0, 0);
    mesh.movable = true;
    mesh.mass = ENV.defaultMass;

    mesh.euler = function() {
        mesh.position.x += mesh.velocity.x
        mesh.position.y += mesh.velocity.y
        mesh.position.z += mesh.velocity.z
        for(var j = 0; j < ENV.forces.length; j++) {
            var f = ENV.forces[j];
            mesh.velocity.x += f.x * ENV.timeScalar / mesh.mass;
            mesh.velocity.y += f.y * ENV.timeScalar / mesh.mass;
            mesh.velocity.z += f.z * ENV.timeScalar / mesh.mass;
        }
    }

    return mesh;
}