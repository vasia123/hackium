"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumBrowser = exports.HackiumBrowserEmittedEvents = void 0;
const assert_1 = __importDefault(require("assert"));
const find_root_1 = __importDefault(require("find-root"));
const path_1 = __importDefault(require("path"));
const puppeteer_extensionbridge_1 = require("puppeteer-extensionbridge");
const Browser_1 = require("puppeteer/lib/cjs/puppeteer/common/Browser");
const Events_1 = require("puppeteer/lib/cjs/puppeteer/common/Events");
const logger_1 = __importDefault(require("../util/logger"));
const hackium_browser_context_1 = require("./hackium-browser-context");
const hackium_target_1 = require("./hackium-target");
const newTabTimeout = 500;
var HackiumBrowserEmittedEvents;
(function (HackiumBrowserEmittedEvents) {
    HackiumBrowserEmittedEvents["ActivePageChanged"] = "activePageChanged";
})(HackiumBrowserEmittedEvents = exports.HackiumBrowserEmittedEvents || (exports.HackiumBrowserEmittedEvents = {}));
class HackiumBrowser extends Browser_1.Browser {
    constructor(connection, contextIds, ignoreHTTPSErrors, defaultViewport, process, closeCallback) {
        super(connection, contextIds, ignoreHTTPSErrors, defaultViewport, process, closeCallback);
        this.log = new logger_1.default('hackium:browser');
        this.extension = new puppeteer_extensionbridge_1.NullExtensionBridge();
        this._targets = new Map();
        this.__contexts = new Map();
        this.newtab = `file://${path_1.default.join(find_root_1.default(__dirname), 'pages', 'homepage', 'index.html')}`;
        this.connection = connection;
        this.__ignoreHTTPSErrors = ignoreHTTPSErrors;
        this.__defaultViewport = defaultViewport;
        this.__defaultContext = new hackium_browser_context_1.HackiumBrowserContext(this.connection, this);
        this.__contexts = new Map();
        for (const contextId of contextIds)
            this.__contexts.set(contextId, new hackium_browser_context_1.HackiumBrowserContext(this.connection, this, contextId));
        const listenerCount = this.connection.listenerCount('Target.targetCreated');
        if (listenerCount === 1) {
            this.connection.removeAllListeners('Target.targetCreated');
            this.connection.on('Target.targetCreated', this.__targetCreated.bind(this));
        }
        else {
            throw new Error('Need to reimplement how to intercept target creation. Submit a PR with a reproducible test case.');
        }
        this.log.debug('Hackium browser created');
    }
    async initialize() {
        await this.waitForTarget((target) => target.type() === 'page');
        const [page] = await this.pages();
        this.setActivePage(page);
    }
    async pages() {
        const contextPages = await Promise.all(this.browserContexts().map((context) => context.pages()));
        return contextPages.reduce((acc, x) => acc.concat(x), []);
    }
    async newPage() {
        return this.__defaultContext.newPage();
    }
    browserContexts() {
        return [this.__defaultContext, ...Array.from(this.__contexts.values())];
    }
    async createIncognitoBrowserContext() {
        const { browserContextId } = await this.connection.send('Target.createBrowserContext');
        const context = new hackium_browser_context_1.HackiumBrowserContext(this.connection, this, browserContextId);
        this.__contexts.set(browserContextId, context);
        return context;
    }
    async _disposeContext(contextId) {
        if (contextId) {
            await this.connection.send('Target.disposeBrowserContext', {
                browserContextId: contextId,
            });
            this.__contexts.delete(contextId);
        }
    }
    defaultBrowserContext() {
        return this.__defaultContext;
    }
    async __targetCreated(event) {
        const targetInfo = event.targetInfo;
        const { browserContextId } = targetInfo;
        const context = browserContextId && this.__contexts.has(browserContextId) ? this.__contexts.get(browserContextId) : this.__defaultContext;
        if (!context)
            throw new Error('Brower context should not be null or undefined');
        this.log.debug('Creating new target %o', targetInfo);
        const target = new hackium_target_1.HackiumTarget(targetInfo, context, () => this.connection.createSession(targetInfo), this.__ignoreHTTPSErrors, this.__defaultViewport || null);
        assert_1.default(!this._targets.has(event.targetInfo.targetId), 'Target should not exist before targetCreated');
        this._targets.set(event.targetInfo.targetId, target);
        if (targetInfo.url === 'chrome://newtab/') {
            this.log.debug('New tab opened, waiting for it to navigate to custom newtab');
            await new Promise((resolve, reject) => {
                let done = false;
                const changedHandler = (targetInfo) => {
                    this.log.debug('New tab target info changed %o', targetInfo);
                    if (targetInfo.url === this.newtab) {
                        this.log.debug('New tab navigation complete, continuing');
                        resolve();
                        target.off("targetInfoChanged" /* TargetInfoChanged */, changedHandler);
                    }
                };
                target.on("targetInfoChanged" /* TargetInfoChanged */, changedHandler);
                setTimeout(() => {
                    this.log.debug(`New tab navigation timed out.`);
                    if (!done)
                        reject(`Timeout of ${newTabTimeout} exceeded`);
                    target.off("targetInfoChanged" /* TargetInfoChanged */, changedHandler);
                }, newTabTimeout);
            });
        }
        if (targetInfo.type === 'page') {
            // page objects are lazily created, so merely accessing this will instrument the page properly.
            const page = await target.page();
        }
        if (await target._initializedPromise) {
            this.emit(Events_1.Events.Browser.TargetCreated, target);
            context.emit(Events_1.Events.BrowserContext.TargetCreated, target);
        }
    }
    async maximize() {
        // hacky way of maximizing. --start-maximized and windowState:maximized don't work on macs. Check later.
        const [page] = await this.pages();
        const [width, height] = (await page.evaluate('[screen.availWidth, screen.availHeight];'));
        return this.setWindowBounds(width, height);
    }
    async setWindowBounds(width, height) {
        const window = (await this.connection.send('Browser.getWindowForTarget', {
            // @ts-ignore
            targetId: page._targetId,
        }));
        return this.connection.send('Browser.setWindowBounds', {
            windowId: window.windowId,
            bounds: { top: 0, left: 0, width, height },
        });
    }
    async clearSiteData(origin) {
        await this.connection.send('Storage.clearDataForOrigin', {
            origin,
            storageTypes: 'all',
        });
    }
    async setProxy(host, port) {
        try {
            if (typeof port !== 'number')
                throw new Error('port is not a number');
            let config = {
                mode: 'fixed_servers',
                rules: {
                    singleProxy: {
                        scheme: 'http',
                        host: host,
                        port: port,
                    },
                    bypassList: [],
                },
            };
            const msg = { value: config, scope: 'regular' };
            this.log.debug(`sending request to change proxy`);
            return this.extension.send(`chrome.proxy.settings.set`, msg);
        }
        catch (err) {
            const setProxyError = `HackiumBrowser.setProxy: ${err.message}`;
            this.log.error(setProxyError);
            throw new Error(setProxyError);
        }
    }
    async clearProxy() {
        this.log.debug(`sending request to clear proxy`);
        return this.extension.send(`chrome.proxy.settings.clear`, {
            scope: 'regular',
        });
    }
    setActivePage(page) {
        if (!page) {
            this.log.debug(`tried to set active page to invalid page object.`);
            return;
        }
        this.log.debug(`setting active page with URL %o`, page.url());
        this.activePage = page;
        this.emit(HackiumBrowserEmittedEvents.ActivePageChanged, page);
    }
    getActivePage() {
        if (!this.activePage)
            throw new Error('no active page in browser instance');
        return this.activePage;
    }
}
exports.HackiumBrowser = HackiumBrowser;
//# sourceMappingURL=hackium-browser.js.map