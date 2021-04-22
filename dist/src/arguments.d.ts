import { Plugin } from './util/types';
export declare const defaultSignal = "<default>";
export declare class Arguments {
    url?: string;
    adblock?: boolean;
    env?: string[];
    config?: string;
    inject?: string[];
    interceptor?: string[];
    pwd?: string;
    headless?: boolean;
    userDataDir?: string;
    devtools?: boolean;
    watch?: boolean;
    execute?: string[];
    plugins?: Plugin[];
    chromeOutput?: boolean;
    timeout?: number | string;
    _?: any[];
}
export declare class ArgumentsWithDefaults extends Arguments {
    url?: string;
    adblock: boolean;
    env: string[];
    config: string;
    inject: string[];
    interceptor: string[];
    pwd: string;
    headless: boolean;
    userDataDir: string;
    timeout: number;
    devtools: boolean;
    watch: boolean;
    execute: string[];
    plugins: Plugin[];
    chromeOutput: boolean;
    _: string[];
}
export declare function cliArgsDefinition(): {
    headless: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    pwd: {
        describe: string;
        default: string;
    };
    adblock: {
        describe: string;
        default: boolean;
    };
    url: {
        alias: string;
        describe: string;
        default: string | undefined;
    };
    env: {
        array: boolean;
        describe: string;
        default: string[];
    };
    inject: {
        alias: string;
        array: boolean;
        describe: string;
        default: string[];
    };
    execute: {
        alias: string;
        array: boolean;
        describe: string;
        default: string[];
    };
    interceptor: {
        alias: string;
        array: boolean;
        describe: string;
        default: string[];
    };
    userDataDir: {
        alias: string;
        describe: string;
        string: boolean;
        default: string;
    };
    devtools: {
        alias: string;
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    watch: {
        alias: string;
        describe: string;
        boolean: boolean;
        default: boolean;
    };
    plugin: {
        alias: string;
        describe: string;
        array: boolean;
        default: Plugin[];
    };
    timeout: {
        alias: string;
        describe: string;
        default: number;
    };
    chromeOutput: {
        describe: string;
        boolean: boolean;
        default: boolean;
    };
};
