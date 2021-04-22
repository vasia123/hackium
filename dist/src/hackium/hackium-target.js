"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumTarget = void 0;
const EventEmitter_1 = require("puppeteer/lib/cjs/puppeteer/common/EventEmitter");
const Target_1 = require("puppeteer/lib/cjs/puppeteer/common/Target");
const logger_1 = __importDefault(require("../util/logger"));
const mixin_1 = require("../util/mixin");
class HackiumTarget extends Target_1.Target {
    constructor(targetInfo, browserContext, sessionFactory, ignoreHTTPSErrors, defaultViewport) {
        super(targetInfo, browserContext, sessionFactory, ignoreHTTPSErrors, defaultViewport);
        this.log = new logger_1.default('hackium:target');
        mixin_1.mixin(this, new EventEmitter_1.EventEmitter());
        this.log.debug('Constructed new target');
    }
    page() {
        return super.page();
    }
    _targetInfoChanged(targetInfo) {
        super._targetInfoChanged(targetInfo);
        this.emit("targetInfoChanged" /* TargetInfoChanged */, targetInfo);
    }
}
exports.HackiumTarget = HackiumTarget;
//# sourceMappingURL=hackium-target.js.map