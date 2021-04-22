"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.defer = exports.onlySettled = exports.waterfallMap = exports.isPromise = void 0;
function isPromise(a) {
    return typeof a === 'object' && 'then' in a && typeof a.then === 'function';
}
exports.isPromise = isPromise;
function waterfallMap(array, iterator) {
    const reducer = (accumulator, next, i) => {
        return accumulator.then((result) => {
            const iteratorReturnValue = iterator(next, i);
            if (isPromise(iteratorReturnValue))
                return iteratorReturnValue.then((newNode) => result.concat(newNode));
            else
                return Promise.resolve(result.concat(iteratorReturnValue));
        });
    };
    return array.reduce(reducer, Promise.resolve([]));
}
exports.waterfallMap = waterfallMap;
function onlySettled(promises) {
    return Promise.allSettled(promises).then((results) => results
        .filter(((result) => result.status === 'fulfilled'))
        .map((result) => result.value));
}
exports.onlySettled = onlySettled;
function defer(fn, timeout = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(typeof fn === 'function' ? fn() : fn);
        }, timeout);
    });
}
exports.defer = defer;
function delay(timeout = 0) {
    const start = Date.now();
    return new Promise((resolve) => setTimeout(() => resolve(Date.now() - start), timeout));
}
exports.delay = delay;
//# sourceMappingURL=promises.js.map