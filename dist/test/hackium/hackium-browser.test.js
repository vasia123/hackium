"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_server_1 = require("@jsoverson/test-server");
const chai_1 = __importStar(require("chai"));
const fs_1 = __importDefault(require("fs"));
const src_1 = require("../../src");
const file_1 = require("../../src/util/file");
const promises_1 = require("../../src/util/promises");
const chai_spies_1 = __importDefault(require("chai-spies"));
chai_1.default.use(chai_spies_1.default);
const fsp = fs_1.default.promises;
describe('Browser', function () {
    this.timeout(6000);
    let userDataDir = '/nonexistant';
    let hackium;
    let server;
    before(async () => {
        userDataDir = await file_1.getRandomDir();
        server = await test_server_1.start(__dirname, '..', '_server_root');
    });
    after(async () => {
        await fsp.rmdir(userDataDir, { recursive: true });
        await server.stop();
    });
    beforeEach(async () => {
        hackium = new src_1.Hackium({ headless: false });
    });
    afterEach(async () => {
        if (hackium)
            await hackium.close();
    });
    it('should update active page as tabs open', async () => {
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        await page.goto(server.url('index.html'));
        chai_1.expect(page).to.equal(browser.activePage);
        const page2 = await browser.newPage();
        // delay because of a race condition where goto resolves before we get
        // to communicate that the active page updated. It's significant in automated scripts but not
        // perceptible in manual usage/repl where activePage is most used.
        await promises_1.delay(1000);
        await page2.goto(server.url('two.html'), { waitUntil: 'networkidle2' });
        chai_1.expect(page2).to.equal(browser.activePage);
    });
    it('Should return an error when port defined as string', async () => {
        const browser = await hackium.launch();
        const logSpy = chai_1.default.spy();
        browser.log.error = logSpy;
        let browserError;
        const callSetProxy = (stringPort) => browser.setProxy('127.0.0.1', stringPort);
        await callSetProxy('9999').catch((err) => {
            browserError = err;
        });
        chai_1.expect(browserError).to.be.instanceOf(Error);
        chai_1.expect(browserError.message).to.contain('port is not a number');
        chai_1.expect(logSpy).to.have.been.called.once.with('HackiumBrowser.setProxy: port is not a number');
    });
});
//# sourceMappingURL=hackium-browser.test.js.map