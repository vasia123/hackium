"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const movement_1 = require("../../src/util/movement");
describe('movement', function () {
    it('first and last points should be at start and end', async () => {
        const from = new movement_1.Vector(10, 10);
        const to = new movement_1.Vector(900, 900);
        const points = new movement_1.SimulatedMovement(4, 2, 5).generatePath(from, to);
        const first = points.shift() || [];
        const last = points.pop() || [];
        chai_1.expect(first[0]).to.equal(from.x);
        chai_1.expect(first[1]).to.equal(from.y);
        chai_1.expect(last[0]).to.equal(to.x);
        chai_1.expect(last[1]).to.equal(to.y);
    });
});
//# sourceMappingURL=movement.test.js.map