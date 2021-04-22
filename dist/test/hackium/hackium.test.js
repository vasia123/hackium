"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const find_root_1 = __importDefault(require("find-root"));
const path_1 = __importDefault(require("path"));
const src_1 = require("../../src");
const hackium_browser_1 = require("../../src/hackium/hackium-browser");
const hackium_page_1 = require("../../src/hackium/hackium-page");
describe('Hackium', function () {
    let hackium = null;
    afterEach(async () => {
        if (hackium)
            await hackium.close();
    });
    it('Should instantiate with no arguments', async () => {
        hackium = new src_1.Hackium();
        chai_1.expect(hackium).to.be.instanceOf(src_1.Hackium);
    });
    it('Should use version from package.json', async () => {
        hackium = new src_1.Hackium();
        const pkg = require(path_1.default.join(find_root_1.default(__dirname), 'package.json'));
        chai_1.expect(hackium.version).to.equal(pkg.version);
    });
    it('Should execute plugins', async () => {
        let meta = {};
        let browser = null;
        let plugin = {
            preInit: function (_hackium, options) {
                meta.pluginPreInit = true;
                chai_1.expect(options.devtools).to.equal(false);
                chai_1.expect(_hackium).to.be.instanceOf(src_1.Hackium);
                options.headless = true;
            },
            postInit: function (_hackium, options) {
                meta.pluginPostInit = true;
                chai_1.expect(options.headless).to.equal(true);
                chai_1.expect(_hackium).to.be.instanceOf(src_1.Hackium);
            },
            preLaunch: function (_hackium, launchOptions) {
                meta.pluginPreLaunch = true;
                chai_1.expect(launchOptions.headless).to.equal(true);
                launchOptions.headless = false;
                chai_1.expect(_hackium).to.equal(hackium);
            },
            postLaunch: function (_hackium, _browser, finalLaunchOptions) {
                meta.pluginPostLaunch = true;
                chai_1.expect(finalLaunchOptions.headless).to.equal(false);
                chai_1.expect(_hackium).to.equal(hackium);
                chai_1.expect(_browser).to.be.instanceOf(hackium_browser_1.HackiumBrowser);
            },
            prePageCreate: function (_browser) {
                meta.pluginPrePageCreate = true;
                chai_1.expect(_browser).to.be.instanceOf(hackium_browser_1.HackiumBrowser);
            },
            postPageCreate: function (_browser, _page) {
                meta.pluginPostPageCreate = true;
                chai_1.expect(_browser).to.be.instanceOf(hackium_browser_1.HackiumBrowser);
                chai_1.expect(_page).to.be.instanceOf(hackium_page_1.HackiumPage);
                //@ts-ignore
                _page.customProp = true;
            },
        };
        chai_1.expect(meta.pluginPreInit).to.be.undefined;
        chai_1.expect(meta.pluginPostInit).to.be.undefined;
        hackium = new src_1.Hackium({
            headless: false,
            plugins: [plugin],
        });
        chai_1.expect(meta.pluginPreInit).to.be.true;
        chai_1.expect(meta.pluginPostInit).to.be.true;
        chai_1.expect(meta.pluginPreLaunch).to.be.undefined;
        chai_1.expect(meta.pluginPostLaunch).to.be.undefined;
        browser = await hackium.launch();
        chai_1.expect(meta.pluginPreLaunch).to.be.true;
        chai_1.expect(meta.pluginPostLaunch).to.be.true;
        chai_1.expect(meta.pluginPrePageCreate).to.be.true;
        chai_1.expect(meta.pluginPostPageCreate).to.be.true;
        const [page] = await browser.pages();
        //@ts-ignore
        chai_1.expect(page.customProp).to.be.true;
        const page2 = await browser.newPage();
        //@ts-ignore
        chai_1.expect(page2.customProp).to.be.true;
    });
});
//# sourceMappingURL=hackium.test.js.map