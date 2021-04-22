"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._runCli = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const repl_1 = __importDefault(require("repl"));
const util_1 = require("util");
const _1 = require("./");
const arguments_1 = require("./arguments");
const hackium_browser_1 = require("./hackium/hackium-browser");
const file_1 = require("./util/file");
const logger_1 = __importDefault(require("./util/logger"));
const object_1 = require("./util/object");
const yargs = require("yargs");
const log = new logger_1.default('hackium:cli');
const exists = util_1.promisify(fs_1.default.exists);
const DEFAULT_CONFIG_NAMES = ['hackium.json', 'hackium.config.js'];
function runCli() {
    const argParser = yargs
        .commandDir('cmds')
        .command('$0', 'Default command: start hackium browser & REPL', (yargs) => {
        yargs.options(arguments_1.cliArgsDefinition()).option('config', {
            alias: 'c',
            default: '',
            type: 'string',
        });
    }, (argv) => {
        if (argv.plugin) {
            argv.plugins = argv.plugin.map((pluginPath) => {
                const plugin = require(path_1.default.resolve(pluginPath));
                return plugin && plugin.default ? plugin.default : plugin;
            });
        }
        _runCli(argv);
    })
        .help();
    const args = argParser.argv;
    log.debug('parsed command line args into : %O', args);
}
exports.default = runCli;
async function _runCli(cliArgs, replOptions = {}) {
    const configFilesToCheck = [...DEFAULT_CONFIG_NAMES];
    if (cliArgs.config)
        configFilesToCheck.unshift(cliArgs.config);
    let config = undefined;
    for (let i = 0; i < configFilesToCheck.length; i++) {
        const fileName = configFilesToCheck[i];
        const location = path_1.default.join(process.env.PWD || '', fileName);
        if (!(await exists(location))) {
            log.debug(`no config found at ${location}`);
            continue;
        }
        try {
            const configFromFile = require(location);
            log.info(`using config found at %o`, location);
            log.debug(configFromFile);
            configFromFile.pwd = path_1.default.dirname(location);
            log.debug(`setting pwd to config dir: ${path_1.default.dirname(location)}`);
            config = configFromFile;
            log.debug(`merged with command line arguments`);
        }
        catch (e) {
            log.error(`error importing configuration:`);
            console.log(e);
        }
    }
    if (!config)
        config = cliArgs;
    else
        config = object_1.merge(config, cliArgs);
    const hackium = new _1.Hackium(config);
    return hackium
        .cliBehavior()
        .then(() => {
        log.info('Hackium launched');
    })
        .catch((e) => {
        log.error('Hackium failed during bootup and may be in an unstable state.');
        log.error(e);
    })
        .then(async () => {
        log.debug('starting repl');
        const browser = await hackium.getBrowser();
        const replInstance = repl_1.default.start({
            prompt: '> ',
            output: replOptions.stdout || process.stdout,
            input: replOptions.stdin || process.stdin,
        });
        log.debug('repl started');
        if (cliArgs.pwd) {
            const setupHistory = util_1.promisify(replInstance.setupHistory.bind(replInstance));
            const replHistoryPath = file_1.resolve(['.repl_history'], cliArgs.pwd);
            log.debug('saving repl history at %o', replHistoryPath);
            await setupHistory(replHistoryPath);
        }
        else {
            log.debug('pwd not set, repl history can not be saved');
        }
        replInstance.context.hackium = hackium;
        replInstance.context.browser = browser;
        replInstance.context.extension = browser.extension;
        const page = (replInstance.context.page = browser.activePage);
        if (page) {
            replInstance.context.cdp = await page.target().createCDPSession();
        }
        browser.on(hackium_browser_1.HackiumBrowserEmittedEvents.ActivePageChanged, (page) => {
            log.debug('active page changed');
            replInstance.context.page = page;
        });
        replInstance.on('exit', () => {
            log.debug('repl exited, closing browser');
            browser.close();
        });
        hackium.getBrowser().on('disconnected', () => {
            log.debug('browser disconnected, closing repl');
            replInstance.close();
        });
        log.debug('repl setup complete');
        return {
            repl: replInstance,
        };
    });
}
exports._runCli = _runCli;
//# sourceMappingURL=cli.js.map