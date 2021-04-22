export declare function resolve(parts: string[], pwd?: string): string;
export declare function watch(file: string, callback: Function): void;
export declare function read(parts: string | string[], pwd?: string): Promise<string>;
export declare function write(parts: string | string[], contents: string, pwd?: string): Promise<void>;
export declare function remove(parts: string | string[], pwd?: string): Promise<void>;
export declare function getRandomDir(prefix?: string): Promise<string>;
