"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mixin = void 0;
function mixin(baseObj, mixinObject) {
    const typedObj = Object.assign(baseObj, mixinObject);
    const prototype = Object.getPrototypeOf(mixinObject);
    const props = Object.getOwnPropertyDescriptors(prototype);
    Object.entries(props)
        .filter(([prop]) => prop !== 'constructor')
        .forEach((entry) => {
        const prop = entry[0];
        const descriptor = entry[1];
        if (!(prop in baseObj)) {
            Object.defineProperty(baseObj, prop, descriptor);
        }
    });
    return typedObj;
}
exports.mixin = mixin;
//# sourceMappingURL=mixin.js.map