interface Prng {
    (): number;
    int32(): number;
    quick(): number;
    double(): number;
}
export declare class Random {
    seed: number;
    rng: Prng;
    static rng: Random;
    static seedSingleton(seed: number): void;
    constructor(seed?: number);
    int(min?: number, max?: number): number;
    oddInt(min?: number, max?: number): number;
    float(min?: number, max?: number): number;
    decision(probability: number, decision: () => void): void;
    listItem<T>(list: T[]): T;
    oneIn(num: number): boolean;
}
export {};
