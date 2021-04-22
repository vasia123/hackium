"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
function merge(dest, ...others) {
    if (dest === undefined || dest === null)
        return dest;
    const newObject = {};
    for (let other of others) {
        const allKeys = Object.keys(dest).concat(Object.keys(other));
        for (let key of allKeys) {
            if (key in dest) {
                if (Array.isArray(dest[key])) {
                    newObject[key] = [...dest[key]];
                    if (key in other) {
                        newObject[key].push(...other[key]);
                    }
                }
                else if (typeof dest[key] === 'object') {
                    if (key in other)
                        newObject[key] = merge(dest[key], other[key]);
                }
                else {
                    if (key in dest && dest[key] !== undefined)
                        newObject[key] = dest[key];
                    if (key in other && other[key] !== undefined)
                        newObject[key] = other[key];
                }
            }
            else if (key in other) {
                if (Array.isArray(other[key])) {
                    newObject[key] = [...other[key]];
                }
                else if (typeof dest[key] === 'object') {
                    newObject[key] = other[key];
                }
                else {
                    newObject[key] = other[key];
                }
            }
        }
    }
    return newObject;
}
exports.merge = merge;
//# sourceMappingURL=object.js.map