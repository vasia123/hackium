"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_server_1 = require("@jsoverson/test-server");
const chai_1 = require("chai");
const fs_1 = __importDefault(require("fs"));
const src_1 = require("../../src");
const file_1 = require("../../src/util/file");
const fsp = fs_1.default.promises;
describe('Browser context', function () {
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
    it('Should expose hackium object & version on the page', async () => {
        const browser = await hackium.launch();
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(server.url('index.html'));
        const version = await page.evaluate('hackium.version');
        chai_1.expect(version).to.equal(require('../../package.json').version);
    });
});
//# sourceMappingURL=hackium-browser-context.test.js.map