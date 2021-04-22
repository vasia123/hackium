"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
const seedrandom_1 = __importDefault(require("seedrandom"));
class Random {
    constructor(seed) {
        if (!seed)
            seed = seedrandom_1.default().int32();
        this.seed = seed;
        this.rng = seedrandom_1.default(seed.toString());
    }
    static seedSingleton(seed) {
        Random.rng = new Random(seed);
    }
    int(min = 0, max = Number.MAX_SAFE_INTEGER) {
        return Math.floor(this.rng() * (max - min)) + min;
    }
    oddInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
        min = min % 2 === 0 ? min + 1 : min;
        max = max % 2 === 0 ? max - 1 : max;
        const delta = max - min;
        const rand = this.int(0, delta / 2);
        return min + rand * 2;
    }
    float(min = 0, max = 1) {
        return this.rng() * max - min;
    }
    decision(probability, decision) {
        if (this.float() < probability)
            decision();
    }
    listItem(list) {
        return list[this.int(0, list.length)];
    }
    oneIn(num) {
        return this.float() < 1 / num;
    }
}
exports.Random = Random;
Random.rng = new Random(0);
//# sourceMappingURL=random.js.map