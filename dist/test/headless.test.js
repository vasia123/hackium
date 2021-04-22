"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../src");
const hackium_browser_1 = require("../src/hackium/hackium-browser");
describe('headless', function () {
    let hackium = null;
    afterEach(async () => {
        if (hackium)
            await hackium.close();
    });
    it('Should launch headlessly', async () => {
        hackium = new src_1.Hackium({
            headless: true,
        });
        const browser = await hackium.launch();
        chai_1.expect(browser).to.be.instanceOf(hackium_browser_1.HackiumBrowser);
    });
});
//# sourceMappingURL=headless.test.js.map