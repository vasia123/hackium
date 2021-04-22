export declare function isPromise<T>(a: T | Promise<T>): a is Promise<T>;
export declare function waterfallMap<T, J>(array: J[], iterator: (el: J, i: number) => T | Promise<T>): Promise<T[]>;
export declare function onlySettled<T>(promises: Promise<T>[]): Promise<T[]>;
export declare function defer(fn: any, timeout?: number): Promise<unknown>;
export declare function delay(timeout?: number): Promise<unknown>;
