export declare function safelyWrite(file: string, contents: string): Promise<void>;
export declare function readTemplate(name: string): Promise<string>;
export declare function copyTemplate(name: string, to?: string): Promise<string>;
