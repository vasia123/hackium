"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliArgsDefinition = exports.ArgumentsWithDefaults = exports.Arguments = exports.defaultSignal = void 0;
const path_1 = __importDefault(require("path"));
exports.defaultSignal = '<default>';
class Arguments {
}
exports.Arguments = Arguments;
class ArgumentsWithDefaults extends Arguments {
    constructor() {
        super(...arguments);
        this.url = undefined;
        this.adblock = false;
        this.env = [];
        this.config = '';
        this.inject = [];
        this.interceptor = [];
        this.pwd = process.cwd();
        this.headless = false;
        this.userDataDir = path_1.default.join(process.env.HOME || process.cwd(), '.hackium', 'chromium');
        this.timeout = 30000;
        this.devtools = false;
        this.watch = false;
        this.execute = [];
        this.plugins = [];
        this.chromeOutput = false;
        this._ = [];
    }
}
exports.ArgumentsWithDefaults = ArgumentsWithDefaults;
function cliArgsDefinition() {
    const defaultArguments = new ArgumentsWithDefaults();
    return {
        headless: {
            describe: 'start hackium in headless mode',
            boolean: true,
            default: defaultArguments.headless,
        },
        pwd: {
            describe: 'root directory to look for support modules',
            default: defaultArguments.pwd,
        },
        adblock: {
            describe: 'turn on ad blocker',
            default: defaultArguments.adblock,
            // demandOption: false,
        },
        url: {
            alias: 'u',
            describe: 'starting URL',
            default: defaultArguments.url,
            // demandOption: true,
        },
        env: {
            array: true,
            describe: 'environment variable name/value pairs (e.g. --env MYVAR=value)',
            default: defaultArguments.env,
        },
        inject: {
            alias: 'I',
            array: true,
            describe: 'script file to inject first on every page',
            default: defaultArguments.inject,
        },
        execute: {
            alias: 'e',
            array: true,
            describe: 'hackium script to execute',
            default: defaultArguments.execute,
        },
        interceptor: {
            alias: 'i',
            array: true,
            describe: 'interceptor module that will handle intercepted responses',
            default: defaultArguments.interceptor,
        },
        userDataDir: {
            alias: 'U',
            describe: 'Chromium user data directory',
            string: true,
            default: defaultArguments.userDataDir,
        },
        devtools: {
            alias: 'd',
            describe: 'open devtools automatically on every tab',
            boolean: true,
            default: defaultArguments.devtools,
        },
        watch: {
            alias: 'w',
            describe: 'watch for configuration changes',
            boolean: true,
            default: defaultArguments.watch,
        },
        plugin: {
            alias: 'p',
            describe: 'include plugin',
            array: true,
            default: defaultArguments.plugins,
        },
        timeout: {
            alias: 't',
            describe: 'set timeout for Puppeteer',
            default: defaultArguments.timeout,
        },
        chromeOutput: {
            describe: 'print Chrome stderr & stdout logging',
            boolean: true,
            default: defaultArguments.chromeOutput,
        },
    };
}
exports.cliArgsDefinition = cliArgsDefinition;
//# sourceMappingURL=arguments.js.map