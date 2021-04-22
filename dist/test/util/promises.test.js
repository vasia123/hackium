"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("../../src/util/promises");
const chai_1 = require("chai");
describe('Promises', function () {
    it('onlySettled() should act like allSettled + filtering out rejections', async () => {
        const results = await promises_1.onlySettled([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]);
        chai_1.expect(results).to.deep.equal([1, 3]);
    });
    it('defer() should yield value after timeout', async () => {
        const value = await promises_1.defer(() => 2, 100);
        chai_1.expect(value).to.equal(2);
    });
    it('defer() should take non-function as input', async () => {
        const value = await promises_1.defer(22, 100);
        chai_1.expect(value).to.equal(22);
    });
    it('delay() should resolve after the passed timeout', async () => {
        const value = await promises_1.delay(100);
        chai_1.expect(value).to.be.greaterThan(99);
    });
    it('waterfallMap() should run a series of promises in order', async function () {
        const array = ['something', 1, { other: 'this' }];
        const arrayIndex = [];
        function promiseGenerator(el, i) {
            return new Promise((res, rej) => {
                setTimeout(() => res(el), Math.random() * 200);
            });
        }
        function promiseGeneratorIndex(el, i) {
            return new Promise((res, rej) => {
                setTimeout(() => {
                    arrayIndex[i] = el;
                    res();
                }, Math.random() * 200);
            });
        }
        const newArray = await promises_1.waterfallMap(array, promiseGenerator);
        chai_1.expect(newArray).to.deep.equal(array);
        await promises_1.waterfallMap(array, promiseGeneratorIndex);
        chai_1.expect(arrayIndex).to.deep.equal(array);
        chai_1.expect(arrayIndex).to.deep.equal(newArray);
    });
    it('waterfallMap() should tolerate non-promise values', async function () {
        const array = ['something', 1, { other: 'this' }];
        const newArray = await promises_1.waterfallMap(array, (x) => x);
        chai_1.expect(newArray).to.deep.equal(array);
    });
});
//# sourceMappingURL=promises.test.js.map