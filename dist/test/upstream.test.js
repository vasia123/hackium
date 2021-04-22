"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe('upstream', function () {
    let hackium = null;
    afterEach(async () => {
        if (hackium)
            await hackium.close();
    });
    // Don't need to run these. TypeScript will check types on compilation.
    xdescribe('types', async function () {
        let browser;
        beforeEach(async () => {
            hackium = new src_1.Hackium();
            browser = await hackium.launch();
        });
        afterEach(async () => {
            await browser.close();
        });
        it('page.goto should not need options', async () => {
            const [page] = await browser.pages();
            await page.goto('http://example.com');
        });
    });
});
//# sourceMappingURL=upstream.test.js.map