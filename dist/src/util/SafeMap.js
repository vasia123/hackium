"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeMap = void 0;
const assert_1 = __importDefault(require("assert"));
class SafeMap extends Map {
    get(key) {
        assert_1.default(this.has(key), `SafeMap key ${key} not found in ${this}`);
        const value = super.get(key);
        if (value === undefined || value === null)
            throw new Error(`SafeMap value for key ${key} is null or undefined.`);
        return value;
    }
}
exports.SafeMap = SafeMap;
//# sourceMappingURL=SafeMap.js.map