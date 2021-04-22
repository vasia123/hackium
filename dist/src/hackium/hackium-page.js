"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumPage = void 0;
const debug_1 = __importDefault(require("debug"));
const find_root_1 = __importDefault(require("find-root"));
const import_fresh_1 = __importDefault(require("import-fresh"));
const path_1 = __importDefault(require("path"));
const puppeteer_interceptor_1 = require("puppeteer-interceptor");
const Page_1 = require("puppeteer/lib/cjs/puppeteer/common/Page");
const events_1 = require("../events");
const strings_1 = require("../strings");
const file_1 = require("../util/file");
const logger_1 = __importDefault(require("../util/logger"));
const promises_1 = require("../util/promises");
const template_1 = require("../util/template");
const hackium_input_1 = require("./hackium-input");
class HackiumPage extends Page_1.Page {
    constructor(client, target, ignoreHTTPSErrors) {
        super(client, target, ignoreHTTPSErrors);
        this.log = new logger_1.default('hackium:page');
        this.clientLoaded = false;
        this.queuedActions = [];
        this.instrumentationConfig = {
            injectionFiles: [],
            interceptorFiles: [],
            watch: false,
            pwd: process.env.PWD || '/tmp',
        };
        this.cachedInterceptors = [];
        this.cachedInjections = [];
        this.defaultInjections = [path_1.default.join(find_root_1.default(__dirname), 'client', 'hackium.js')];
        this._hkeyboard = new hackium_input_1.HackiumKeyboard(client);
        this._hmouse = new hackium_input_1.HackiumMouse(client, this._hkeyboard, this);
    }
    async __initialize(config) {
        //@ts-ignore #private-fields
        await super._initialize();
        if (this.cachedInterceptors.length === 0)
            this.loadInterceptors();
        try {
            await this.instrumentSelf(config);
        }
        catch (e) {
            if (e.message && e.message.match(/Protocol error.*Target closed/)) {
                this.log.debug('Error: Page instrumentation failed: communication could not be estalished due to a protocol error.\n' +
                    '-- This is likely because the page has already been closed. It is probably safe to ignore this error if you do not observe any problems in casual usage.');
            }
            else {
                throw e;
            }
        }
    }
    executeOrQueue(action) {
        if (this.clientLoaded) {
            return action;
        }
        else {
            this.queuedActions.push(action);
        }
    }
    evaluateNowAndOnNewDocument(fn, ...args) {
        return Promise.all([this.evaluate(fn, ...args), this.evaluateOnNewDocument(fn, ...args)])
            .catch((e) => {
            this.log.debug(e);
        })
            .then((_) => { });
    }
    browser() {
        return super.browser();
    }
    browserContext() {
        return super.browserContext();
    }
    get mouse() {
        return this._hmouse;
    }
    get keyboard() {
        return this._hkeyboard;
    }
    async forceCacheEnabled(enabled = true) {
        //@ts-ignore #private-fields
        await this._frameManager.networkManager()._client.send('Network.setCacheDisabled', {
            cacheDisabled: !enabled,
        });
    }
    async instrumentSelf(config = this.instrumentationConfig) {
        this.instrumentationConfig = config;
        this.log.debug(`instrumenting page %o with config %o`, this.url(), config);
        this.connection = await this.target().createCDPSession();
        await this.exposeFunction(strings_1.strings.get('clienteventhandler'), (data) => {
            const name = data.name;
            this.log.debug(`Received event '%o' from client with data %o`, name, data);
            this.emit(`hackiumclient:${name}`, new events_1.HackiumClientEvent(name, data));
        });
        // TODO: fix error: Argument of type '"hackiumclient:onClientLoaded"' is not assignable to parameter of type 'keyof PageEventObject'
        // @ts-ignore
        this.on('hackiumclient:onClientLoaded', (e) => {
            this.clientLoaded = true;
            this.log.debug(`client loaded, running %o queued actions`, this.queuedActions.length);
            promises_1.waterfallMap(this.queuedActions, async (action, i) => {
                return await action();
            });
        });
        // TODO: fix error: Argument of type '"hackiumclient:onClientLoaded"' is not assignable to parameter of type 'keyof PageEventObject'
        // @ts-ignore
        this.on('hackiumclient:pageActivated', (e) => {
            this.browser().setActivePage(this);
        });
        if (this.instrumentationConfig.injectionFiles) {
            await this.loadInjections();
        }
        this.log.debug(`adding %o scripts to evaluate on every load`, this.cachedInjections.length);
        for (let i = 0; i < this.cachedInjections.length; i++) {
            await this.evaluateNowAndOnNewDocument(this.cachedInjections[i]);
        }
        this.registerInterceptionRequests(this.cachedInterceptors);
    }
    registerInterceptionRequests(interceptors) {
        const browser = this.browserContext().browser();
        interceptors.forEach(async (interceptor) => {
            if (interceptor.handler) {
                this.log.debug('skipped re-registering interception handler for %o', interceptor.intercept);
                return;
            }
            this.log.debug(`Registering interceptor for pattern %o`, interceptor.intercept);
            try {
                const handler = await puppeteer_interceptor_1.intercept(this, interceptor.intercept, {
                    onResponseReceived: (evt) => {
                        this.log.debug(`Intercepted response for URL %o`, evt.request.url);
                        let response = evt.response;
                        if (response)
                            evt.response = response;
                        return interceptor.interceptor(browser, evt, debug_1.default('hackium:interceptor'));
                    },
                });
                interceptor.handler = handler;
            }
            catch (e) {
                this.log.debug('could not register interceptor for pattern(s) %o', interceptor.intercept);
                this.log.warn('Interceptor failed to initialize for target. This may be fixable by trying in a new tab.');
                this.log.warn(e);
            }
        });
    }
    loadInterceptors() {
        this.cachedInterceptors = [];
        this.log.debug(`loading: %o interceptor modules`, this.instrumentationConfig.interceptorFiles.length);
        this.instrumentationConfig.interceptorFiles.forEach((modulePath) => {
            try {
                const interceptorPath = file_1.resolve([modulePath], this.instrumentationConfig.pwd);
                const interceptor = import_fresh_1.default(interceptorPath);
                if (this.instrumentationConfig.watch) {
                    file_1.watch(interceptorPath, (file) => {
                        this.log.debug('interceptor modified, disabling ');
                        if (interceptor.handler)
                            interceptor.handler.disable();
                        const reloadedInterceptor = import_fresh_1.default(interceptorPath);
                        this.addInterceptor(reloadedInterceptor);
                    });
                }
                this.log.debug(`Reading interceptor module from %o`, interceptorPath);
                this.cachedInterceptors.push(interceptor);
            }
            catch (e) {
                this.log.warn(`Could not load interceptor: %o`, e.message);
            }
        });
    }
    async loadInjections() {
        this.cachedInjections = [];
        const files = this.defaultInjections.concat(this.instrumentationConfig.injectionFiles);
        this.log.debug(`loading: %o modules to inject before page load (%o default, %o user) `, files.length, this.defaultInjections.length, this.instrumentationConfig.injectionFiles.length);
        const injections = await promises_1.onlySettled(files.map((f) => {
            const location = file_1.resolve([f], this.instrumentationConfig.pwd);
            this.log.debug(`reading %o (originally %o)`, location, f);
            return file_1.read(location).then(template_1.renderTemplate);
        }));
        this.log.debug(`successfully read %o files`, injections.length);
        this.cachedInjections = injections;
        return injections;
    }
    addInterceptor(interceptor) {
        this.log.debug('adding interceptor for pattern %o', interceptor.intercept);
        this.cachedInterceptors.push(interceptor);
        this.registerInterceptionRequests([interceptor]);
    }
}
exports.HackiumPage = HackiumPage;
HackiumPage.hijackCreate = function (config, plugins = []) {
    Page_1.Page.create = async function (client, target, ignoreHTTPSErrors, defaultViewport) {
        const tempLogger = new logger_1.default('hackium:page');
        tempLogger.debug('running prePageCreate on %o plugins', plugins.length);
        plugins.forEach((plugin) => plugin.prePageCreate && plugin.prePageCreate(target.browser()));
        const page = new HackiumPage(client, target, ignoreHTTPSErrors);
        page.log.debug('running postPageCreate on %o plugins', plugins.length);
        plugins.forEach((plugin) => plugin.postPageCreate && plugin.postPageCreate(target.browser(), page));
        page.log.debug('Created page new page for target %o', target._targetId);
        page.instrumentationConfig = config;
        await page.__initialize(config);
        return page;
    };
};
//# sourceMappingURL=hackium-page.js.map