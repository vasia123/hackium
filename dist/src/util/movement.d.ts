export declare class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number);
    distanceTo(b: Vector): number;
    multiply(b: Vector | number): Vector;
    divide(b: Vector | number): Vector;
    subtract(b: Vector | number): Vector;
    add(b: Vector | number): Vector;
    magnitude(): number;
    unit(): Vector;
}
export declare class SimulatedMovement {
    drag: number;
    impulse: number;
    targetRadius: number;
    constructor(drag?: number, impulse?: number, targetRadius?: number);
    generatePath(start: Vector, end: Vector): number[][];
}
