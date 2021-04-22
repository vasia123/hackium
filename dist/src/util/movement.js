"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatedMovement = exports.Vector = void 0;
const random_1 = require("./random");
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    distanceTo(b) {
        return this.subtract(b).magnitude();
    }
    multiply(b) {
        return typeof b === 'number' ? new Vector(this.x * b, this.y * b) : new Vector(this.x * b.x, this.y * b.y);
    }
    divide(b) {
        return typeof b === 'number' ? new Vector(this.x / b, this.y / b) : new Vector(this.x / b.x, this.y / b.y);
    }
    subtract(b) {
        return typeof b === 'number' ? new Vector(this.x - b, this.y - b) : new Vector(this.x - b.x, this.y - b.y);
    }
    add(b) {
        return typeof b === 'number' ? new Vector(this.x + b, this.y + b) : new Vector(this.x + b.x, this.y + b.y);
    }
    magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    unit() {
        return this.divide(this.magnitude());
    }
}
exports.Vector = Vector;
class SimulatedMovement {
    constructor(drag = 4, impulse = 2, targetRadius = 20) {
        this.drag = drag;
        this.impulse = impulse;
        this.targetRadius = targetRadius;
    }
    generatePath(start, end) {
        let velocity = new Vector(0, 0), force = new Vector(0, 0);
        const sqrt3 = Math.sqrt(3);
        const sqrt5 = Math.sqrt(5);
        const totalDistance = start.distanceTo(end);
        let hiccupDistance = this.impulse / 2;
        const points = [[start.x, start.y]];
        let done = false;
        while (!done) {
            let remainingDistance = Math.max(start.distanceTo(end), 1);
            this.impulse = Math.min(this.impulse, remainingDistance);
            let hiccup = random_1.Random.rng.oneIn(6);
            // if we're further than the target area then go full speed, otherwise slow down.
            if (remainingDistance >= this.targetRadius) {
                force = force.divide(sqrt3).add(random_1.Random.rng.float(this.impulse, this.impulse * 2 + 1) / sqrt5);
            }
            else {
                force = force.divide(Math.SQRT2);
            }
            velocity = velocity.add(force).add(end.subtract(start).multiply(this.drag).divide(remainingDistance));
            let maxStep = Math.min(remainingDistance, hiccup ? hiccupDistance : remainingDistance);
            if (velocity.magnitude() > maxStep) {
                let randomDist = maxStep / 2 + random_1.Random.rng.float(0, maxStep / 2);
                velocity = velocity.unit().multiply(randomDist);
            }
            start = start.add(velocity);
            points.push([Math.round(start.x), Math.round(start.y)]);
            done = start.distanceTo(end) < 5;
        }
        // make sure our destination is our final point;
        points.push([end.x, end.y]);
        return points;
    }
}
exports.SimulatedMovement = SimulatedMovement;
//# sourceMappingURL=movement.js.map