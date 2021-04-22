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
const src_1 = require("../../src");
const chai_spies_1 = __importDefault(require("chai-spies"));
chai_1.default.use(chai_spies_1.default);
describe('Input', function () {
    describe('Mouse', function () {
        this.timeout(10000);
        let hackium, browser;
        let server;
        before(async () => {
            server = await test_server_1.start(__dirname, '..', '_server_root');
        });
        after(async () => {
            await server.stop();
        });
        afterEach(async () => {
            if (hackium)
                await hackium.close();
        });
        it('coordinates should be randomized at mouse instantiation', async () => {
            hackium = new src_1.Hackium({ headless: true });
            const browser = await hackium.launch();
            const [page] = await browser.pages();
            chai_1.expect(page.mouse.x).to.be.not.undefined;
            chai_1.expect(page.mouse.x).to.be.greaterThan(0);
            chai_1.expect(page.mouse.y).to.be.not.undefined;
            chai_1.expect(page.mouse.y).to.be.greaterThan(0);
        });
        it('click() should give a friendly error when passing incorrect types', async () => {
            hackium = new src_1.Hackium({ headless: true });
            const browser = await hackium.launch();
            const [page] = await browser.pages();
            const logSpy = chai_1.default.spy();
            page.mouse.log.error = logSpy;
            let error;
            await page.mouse.click('100', '100').catch((e) => (error = e));
            chai_1.expect(error).to.be.instanceOf(Error);
            chai_1.expect(error.message).to.contain('x & y must be numbers');
            chai_1.expect(logSpy).to.have.been.called.once;
        });
        it('.moveTo should move to an element & click should click where we are at', async () => {
            hackium = new src_1.Hackium({ headless: true });
            const browser = await hackium.launch();
            const [page] = await browser.pages();
            await page.goto(server.url('form.html'));
            await page.mouse.moveTo('button');
            await page.mouse.click();
            await page.mouse.click();
            await page.mouse.click();
            const numClicks = await page.evaluate('buttonClicks');
            chai_1.expect(numClicks).to.equal(3);
        });
        it('.idle should reset basic idle timer', async () => {
            hackium = new src_1.Hackium({ headless: true });
            const browser = await hackium.launch();
            const [page] = await browser.pages();
            await page.goto(server.url('idle.html'));
            await page.mouse.idle();
            const { idleTime, totalTime } = (await page.evaluate('({idleTime, totalTime})'));
            chai_1.expect(totalTime).to.be.greaterThan(0);
            chai_1.expect(idleTime).to.be.greaterThan(0);
            chai_1.expect(idleTime).to.be.lessThan(totalTime);
        });
    });
    describe('Keyboard', function () {
        this.timeout(10000);
        let hackium, browser;
        let server;
        before(async () => {
            server = await test_server_1.start(__dirname, '..', '_server_root');
        });
        after(async () => {
            await server.stop();
        });
        afterEach(async () => {
            if (hackium)
                await hackium.close();
        });
        it('.idle should reset basic idle timer', async () => {
            hackium = new src_1.Hackium({ headless: true });
            const browser = await hackium.launch();
            const [page] = await browser.pages();
            await page.goto(server.url('idle.html'));
            await page.keyboard.idle();
            const { idleTime, totalTime } = (await page.evaluate('({idleTime, totalTime})'));
            chai_1.expect(totalTime).to.be.greaterThan(0);
            chai_1.expect(idleTime).to.be.greaterThan(0);
            chai_1.expect(idleTime).to.be.lessThan(totalTime);
        });
    });
});
//# sourceMappingURL=hackium-input.test.js.map