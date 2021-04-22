export declare const command = "init [file]";
export declare const desc = "Create boilerplate configuration/scripts";
export declare const builder: {
    file: {
        default: string;
        description: string;
        choices: string[];
    };
};
export declare const handler: (argv: any) => Promise<void>;
