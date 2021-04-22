"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hackium = void 0;
const events_1 = require("events");
const find_root_1 = __importDefault(require("find-root"));
const module_1 = require("module");
const path_1 = __importDefault(require("path"));
const extensionbridge_1 = require("../plugins/extensionbridge");
const Browser_1 = require("puppeteer/lib/cjs/puppeteer/common/Browser");
const vm_1 = __importDefault(require("vm"));
const arguments_1 = require("../arguments");
const puppeteer_1 = __importDefault(require("../puppeteer"));
const file_1 = require("../util/file");
const logger_1 = __importDefault(require("../util/logger"));
const promises_1 = require("../util/promises");
const hackium_browser_1 = require("./hackium-browser");
const hackium_page_1 = require("./hackium-page");
const repl_1 = __importDefault(require("repl"));
const object_1 = require("../util/object");
const ENVIRONMENT = ['GOOGLE_API_KEY=no', 'GOOGLE_DEFAULT_CLIENT_ID=no', 'GOOGLE_DEFAULT_CLIENT_SECRET=no'];
function setEnv(env = []) {
    env.forEach((e) => {
        const [key, val] = e.split('=');
        process.env[key] = val;
    });
}
Browser_1.Browser.create = async function (connection, contextIds, ignoreHTTPSErrors, defaultViewport, process, closeCallback) {
    const browser = new hackium_browser_1.HackiumBrowser(connection, contextIds, ignoreHTTPSErrors, defaultViewport, process, closeCallback);
    await connection.send('Target.setDiscoverTargets', { discover: true });
    return browser;
};
class Hackium extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.log = new logger_1.default('hackium');
        this.version = require(path_1.default.join(find_root_1.default(__dirname), 'package.json')).version;
        this.config = new arguments_1.ArgumentsWithDefaults();
        this.defaultChromiumArgs = [
            '--disable-infobars',
            '--no-default-browser-check',
            `--homepage=file://${path_1.default.join(find_root_1.default(__dirname), 'pages', 'homepage', 'index.html')}`,
            `file://${path_1.default.join(find_root_1.default(__dirname), 'pages', 'homepage', 'index.html')}`,
        ];
        this.launchOptions = {
            ignoreDefaultArgs: ['--enable-automation'],
        };
        this.log.debug('contructing Hackium instance');
        if (config)
            this.config = Object.assign({}, this.config, config);
        this.log.debug('Using config: %o', this.config);
        this.log.debug('running preInit on %o plugins', this.config.plugins.length);
        this.config.plugins.forEach((plugin) => plugin.preInit && plugin.preInit(this, this.config));
        hackium_page_1.HackiumPage.hijackCreate({
            interceptorFiles: this.config.interceptor,
            injectionFiles: this.config.inject,
            pwd: this.config.pwd,
            watch: this.config.watch,
        }, this.config.plugins);
        if ('devtools' in this.config) {
            this.launchOptions.devtools = this.config.devtools;
        }
        if ('timeout' in this.config) {
            this.launchOptions.timeout = typeof this.config.timeout === 'string' ? parseInt(this.config.timeout) : this.config.timeout;
        }
        setEnv(this.config.env);
        setEnv(ENVIRONMENT);
        if (this.config.headless) {
            this.log.debug('NOTE: headless mode disables devtools, the extension bridge, and other plugins.');
            this.launchOptions.headless = true;
            this.config.devtools = false;
        }
        else {
            this.launchOptions.headless = false;
            this.defaultChromiumArgs.push(`--load-extension=${path_1.default.join(find_root_1.default(__dirname), 'extensions', 'theme')}`);
            if (Array.isArray(this.launchOptions.ignoreDefaultArgs)) {
                this.launchOptions.ignoreDefaultArgs.push('--disable-extensions');
            }
            else if (!this.launchOptions.ignoreDefaultArgs) {
                this.launchOptions.ignoreDefaultArgs = ['--disable-extensions'];
            }
            this.config.plugins.push(extensionbridge_1.hackiumExtensionBridge);
        }
        if (this.config.userDataDir) {
            this.launchOptions.userDataDir = this.config.userDataDir;
        }
        this.launchOptions.args = this.defaultChromiumArgs;
        if (this.config.chromeOutput) {
            this.launchOptions.dumpio = true;
            this.defaultChromiumArgs.push('--enable-logging=stderr', '--v=1');
        }
        this.log.debug('running postInit on %o plugins', this.config.plugins.length);
        this.config.plugins.forEach((plugin) => plugin.postInit && plugin.postInit(this, this.config));
    }
    getBrowser() {
        if (!this.browser)
            throw new Error('Attempt to capture browser before initialized');
        return this.browser;
    }
    async launch(options = {}) {
        let launchOptions = object_1.merge(this.launchOptions, options);
        this.log.debug('running preLaunch on %o plugins', this.config.plugins.length);
        await promises_1.waterfallMap(this.config.plugins, (plugin) => plugin.preLaunch && plugin.preLaunch(this, launchOptions));
        const browser = (await puppeteer_1.default.launch(launchOptions));
        this.log.debug('running postLaunch on %o plugins', this.config.plugins.length);
        await promises_1.waterfallMap(this.config.plugins, (plugin) => plugin.postLaunch && plugin.postLaunch(this, browser, launchOptions));
        await browser.initialize();
        this.log.debug('running postBrowserInit on %o plugins', this.config.plugins.length);
        await promises_1.waterfallMap(this.config.plugins, (plugin) => plugin.postBrowserInit && plugin.postBrowserInit(this, browser, launchOptions));
        return (this.browser = browser);
    }
    startRepl(context = {}) {
        return new Promise((resolve) => {
            if (this.repl) {
                this.log.debug('closing old repl');
                this.repl.close();
                this.repl.on('exit', () => {
                    this.repl = undefined;
                    resolve(this.startRepl());
                });
            }
            else {
                this.log.debug('starting repl');
                this.repl = repl_1.default.start({
                    prompt: '> ',
                    output: process.stdout,
                    input: process.stdin,
                });
                Object.assign(this.repl.context, { hackium: this, unpause: this.unpause.bind(this) }, context);
                resolve();
            }
        });
    }
    closeRepl() {
        if (this.repl) {
            this.log.debug('closing repl');
            this.repl.close();
            this.repl = undefined;
        }
    }
    async pause(options = { repl: {} }) {
        if (this.unpauseCallback) {
            this.log.warn('pause called but Hackium thinks it is already paused. Maybe you forgot to add an "await"?');
            this.unpauseCallback();
            this.unpauseCallback = undefined;
        }
        if (options.repl) {
            this.log.info('starting REPL. Pass { repl: false } to pause() to skip the repl in the future.');
            await this.startRepl(options.repl);
        }
        this.log.debug('pausing');
        return new Promise((resolve) => {
            this.unpauseCallback = resolve;
        });
    }
    unpause() {
        if (this.unpauseCallback) {
            this.log.debug('unpausing');
            this.unpauseCallback();
            this.unpauseCallback = undefined;
        }
        else {
            this.log.warn(`unpause called but Hackium doesn't think it's paused. If this is a bug in Hackium, please submit an issue here: https://github.com/jsoverson/hackium.`);
        }
    }
    async cliBehavior() {
        const cliBehaviorLog = this.log.debug.extend('cli-behavior');
        cliBehaviorLog('running default cli behavior');
        cliBehaviorLog('launching browser');
        const browser = await this.launch();
        cliBehaviorLog('launched browser');
        const [page] = await browser.pages();
        if (this.config.url) {
            cliBehaviorLog(`navigating to ${this.config.url}`);
            await page.goto(this.config.url);
        }
        cliBehaviorLog(`running %o hackium scripts`, this.config.execute.length);
        await promises_1.waterfallMap(this.config.execute, (file) => {
            return this.runScript(file).then((result) => console.log(result));
        });
        cliBehaviorLog(`core cli behavior complete`);
        return browser;
    }
    async runScript(file, args = [], src) {
        const truePath = file_1.resolve([file], this.config.pwd);
        if (!src) {
            this.log.debug('reading in %o to run as a hackium script', truePath);
            src = await file_1.read([truePath]);
        }
        const browser = await this.getBrowser();
        const pages = await browser.pages();
        const [page] = pages;
        const context = {
            hackium: this,
            console,
            page,
            pages,
            browser,
            module,
            require: module_1.createRequire(truePath),
            __dirname: path_1.default.dirname(truePath),
            __filename: truePath,
            args: this.config._,
            __rootResult: null,
        };
        vm_1.default.createContext(context);
        const wrappedSrc = `
    __rootResult = (async function hackiumScript(){${src}}())
    `;
        this.log.debug('running script %O', wrappedSrc);
        try {
            vm_1.default.runInContext(wrappedSrc, context);
            const result = await context.__rootResult;
            return result;
        }
        catch (e) {
            console.log('Error in hackium script');
            console.log(e);
        }
    }
    async close() {
        this.log.debug('closing browser');
        if (this.browser) {
            await this.browser.close();
            this.log.debug('closed browser');
        }
    }
}
exports.Hackium = Hackium;
//# sourceMappingURL=hackium.js.map