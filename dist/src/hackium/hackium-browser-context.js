"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumBrowserContext = void 0;
const Browser_1 = require("puppeteer/lib/cjs/puppeteer/common/Browser");
const logger_1 = __importDefault(require("../util/logger"));
class HackiumBrowserContext extends Browser_1.BrowserContext {
    constructor(connection, browser, contextId) {
        super(connection, browser, contextId);
        this.log = new logger_1.default('hackium:browser-context');
        this.__id = contextId;
        this.__browser = browser;
    }
    get id() {
        return this.__id;
    }
    browser() {
        return super.browser();
    }
    newPage() {
        return this.__browser._createPageInContext(this.id);
    }
    async pages() {
        const pages = await Promise.all(this.targets()
            .filter((target) => target.type() === 'page')
            .map((target) => target.page()));
        return pages.filter((page) => !!page);
    }
}
exports.HackiumBrowserContext = HackiumBrowserContext;
//# sourceMappingURL=hackium-browser-context.js.map