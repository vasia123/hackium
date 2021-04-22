"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_1 = __importDefault(require("fs"));
const src_1 = require("../../src");
const test_server_1 = require("@jsoverson/test-server");
const path_1 = __importDefault(require("path"));
const file_1 = require("../../src/util/file");
const Connection_1 = require("puppeteer/lib/cjs/puppeteer/common/Connection");
const fsp = fs_1.default.promises;
describe('Page', function () {
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
        hackium = new src_1.Hackium({ headless: true });
    });
    afterEach(async () => {
        if (hackium)
            await hackium.close();
    });
    it('should expose a CDP session', async () => {
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        chai_1.expect(page.connection).to.be.instanceOf(Connection_1.CDPSession);
    });
    // TODO: fix this test
    it("should bypass puppeteer's smart caching if forceCacheEnabled(true)", async () => {
        const cachedUrl = server.url('cached');
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        const go = async () => page.goto(cachedUrl).then((resp) => page.content());
        const resultA1 = await go();
        const resultA2 = await go();
        chai_1.expect(resultA1).to.equal(resultA2);
        await page.setRequestInterception(true);
        let i = 0;
        page.on('request', (interceptedRequest) => ++i && interceptedRequest.continue());
        const resultB1 = await go(); // should be cached, but cache was disabled by setRequestInterception()
        chai_1.expect(resultB1).to.not.equal(resultA1);
        chai_1.expect(i).to.equal(1);
        await page.forceCacheEnabled(true);
        const resultC1 = await go(); // need to visit page again to cache response
        chai_1.expect(i).to.equal(2);
        const resultC2 = await go();
        chai_1.expect(i).to.equal(3);
        chai_1.expect(resultC1).to.equal(resultC2);
        chai_1.expect(resultC1).to.equal(resultB1);
        chai_1.expect(resultC2).to.equal(resultB1);
    });
    it('should expose hackium object & version on the page', async () => {
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        await page.goto(server.url('index.html'));
        const version = await page.evaluate('hackium.version');
        chai_1.expect(version).to.equal(require('../../package.json').version);
    });
    it('should always inject new scripts after hackium client', async () => {
        hackium = new src_1.Hackium({
            headless: true,
            inject: [path_1.default.join(__dirname, '..', '_fixtures', 'injection.js')],
        });
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        await page.goto(server.url('index.html'));
        const bool = await page.evaluate('hackiumExists');
        chai_1.expect(bool).to.be.true;
    });
    it('should allow configurable interception', async () => {
        const browser = await hackium.launch();
        const [page] = await browser.pages();
        let runs = 0;
        page.addInterceptor({
            intercept: [
                {
                    urlPattern: '*console*',
                    resourceType: 'Script',
                    requestStage: 'Response',
                },
            ],
            interceptor: function (browser, interception, debug) {
                runs++;
                if (!interception.response.body)
                    throw new Error('no body');
                interception.response.body = 'var myNewValue = 12;';
                return interception.response;
            },
        });
        await page.goto(server.url('index.html'));
        const value = await page.evaluate('myNewValue');
        chai_1.expect(runs).to.equal(1);
        chai_1.expect(value).to.equal(12);
    });
});
//# sourceMappingURL=hackium-page.test.js.map