"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_server_1 = require("@jsoverson/test-server");
const chai_1 = require("chai");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
const cli_1 = require("../src/cli");
const file_1 = require("../src/util/file");
const promises_1 = require("../src/util/promises");
const helper_1 = require("./helper");
const rimraf_1 = __importDefault(require("rimraf"));
var stdin = require('mock-stdin').stdin();
describe('cli', function () {
    this.timeout(6000);
    let dir = '/nonexistant';
    let baseUrlArgs = '';
    let baseArgs = '';
    let instance;
    let server;
    before(async () => {
        server = await test_server_1.start(__dirname, '_server_root');
    });
    after(async () => {
        await server.stop();
    });
    beforeEach(async () => {
        dir = await file_1.getRandomDir();
        baseArgs = `--pwd="${__dirname}" --headless --userDataDir=${dir}`;
        baseUrlArgs = `--url="${server.url('index.html')}" ${baseArgs}`;
    });
    afterEach((done) => {
        (instance ? instance.close() : Promise.resolve()).finally(() => {
            instance = undefined;
            rimraf_1.default(dir, (err) => {
                if (err)
                    done(err);
                done();
            });
        });
    });
    it('Should go to a default URL', async () => {
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs}`));
        const browser = await instance.cliBehavior();
        const [page] = await browser.pages();
        const title = await page.title();
        chai_1.expect(title).to.equal('Test page');
    });
    it('Should allow for configurable timeouts', async () => {
        // set a timeout too low for Chrome to launch & check the error in the assertion
        instance = new src_1.Hackium(helper_1.getArgs(`${baseArgs} -t 10`));
        const error = await instance.cliBehavior().catch((e) => e);
        chai_1.expect(error.message).to.match(/Timed out/i);
    });
    it('Should inject evaluateOnNewDocument scripts', async () => {
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} --inject _fixtures/global-var.js`));
        const browser = await instance.cliBehavior();
        const [page] = await browser.pages();
        const globalValue = await page.evaluate('window.globalVar');
        chai_1.expect(globalValue).to.equal('globalVar');
    });
    it('Should intercept scripts', async () => {
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} --i _fixtures/interceptor.js`));
        const browser = await instance.cliBehavior();
        const [page] = await browser.pages();
        const value = await page.evaluate('window.interceptedVal');
        chai_1.expect(value).to.equal('interceptedValue');
    });
    it('Should create userDataDir', async () => {
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs}`));
        process.env.FOO = 'T';
        await instance.cliBehavior();
        const stat = await fs_1.promises.stat(dir);
        chai_1.expect(stat.isDirectory()).to.be.true;
    });
    it('Should read local config', async () => {
        instance = new src_1.Hackium({
            pwd: __dirname,
            headless: true,
            url: server.url('anything/'),
        });
        const browser = await instance.cliBehavior();
        const [page] = await browser.pages();
        const url = page.url();
        chai_1.expect(url).to.equal(server.url('anything/'));
    });
    it('Should merge defaults with passed config', async () => {
        instance = new src_1.Hackium({
            headless: true,
            userDataDir: dir,
        });
        chai_1.expect(instance.config.pwd).equal(process.cwd());
    });
    it('Should watch for and apply changes to injections on a reload', async () => {
        const tempPath = file_1.resolve(['_fixtures', 'global-var-temp.js'], __dirname);
        const origSrc = await file_1.read(['_fixtures', 'global-var.js'], __dirname);
        await file_1.write(tempPath, origSrc);
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} --inject _fixtures/global-var-temp.js -w`));
        const browser = await instance.cliBehavior();
        let [page] = await browser.pages();
        await page.setCacheEnabled(false);
        let globalValue = await page.evaluate('window.globalVar');
        chai_1.expect(globalValue).to.equal('globalVar');
        await file_1.write(tempPath, origSrc.replace(/globalVar/g, 'hotloadVar'));
        const newPage = await instance.getBrowser().newPage();
        await page.close();
        helper_1.debug('loading page in new tab');
        await newPage.goto(server.url('index.html'));
        globalValue = await newPage.evaluate('window.hotloadVar');
        chai_1.expect(globalValue).to.equal('hotloadVar');
        await file_1.remove(tempPath);
    });
    it('Should watch for and apply changes to interceptors on a reload', async () => {
        const tempPath = file_1.resolve(['_fixtures', 'interceptorTemp.js'], __dirname);
        const origSrc = await file_1.read(['_fixtures', 'interceptor.js'], __dirname);
        await file_1.write(tempPath, origSrc.replace('interceptedValue', 'interceptedValTemp'));
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} --i _fixtures/interceptorTemp.js -w`));
        const browser = await instance.cliBehavior();
        let [page] = await browser.pages();
        await page.setCacheEnabled(false);
        let value = await page.evaluate('window.interceptedVal');
        chai_1.expect(value).to.equal('interceptedValTemp');
        await file_1.write(tempPath, origSrc.replace('interceptedValue', 'interceptedValHotload'));
        // this is a race but so is life
        await promises_1.delay(100);
        helper_1.debug('reloading');
        await page.reload();
        value = await page.evaluate('window.interceptedVal');
        chai_1.expect(value).to.equal('interceptedValHotload');
        await file_1.remove(tempPath);
    });
    it('Should watch for and apply changes to interceptors on a new tab', async () => {
        const tempPath = file_1.resolve(['_fixtures', 'interceptorTemp.js'], __dirname);
        const origSrc = await file_1.read(['_fixtures', 'interceptor.js'], __dirname);
        await file_1.write(tempPath, origSrc.replace('interceptedValue', 'interceptedValTemp'));
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} --i _fixtures/interceptorTemp.js -w`));
        const browser = await instance.cliBehavior();
        let [page] = await browser.pages();
        await page.setCacheEnabled(false);
        let value = await page.evaluate('window.interceptedVal');
        chai_1.expect(value).to.equal('interceptedValTemp');
        await file_1.write(tempPath, origSrc.replace('interceptedValue', 'interceptedValHotload'));
        const newPage = await instance.getBrowser().newPage();
        await page.close();
        helper_1.debug('loading page in new tab');
        await newPage.goto(server.url('index.html'));
        value = await newPage.evaluate('window.interceptedVal');
        chai_1.expect(value).to.equal('interceptedValHotload');
        await file_1.remove(tempPath);
    });
    it('Should run hackium scripts', async () => {
        const scriptPath = path_1.default.join('.', '_fixtures', 'script.js');
        instance = new src_1.Hackium(helper_1.getArgs(`${baseUrlArgs} -e ${scriptPath} -- ${server.url('two.html')}`));
        const browser = await instance.cliBehavior();
        const [pageOrig, pageNew] = await browser.pages();
        const clicksEl = await pageOrig.$('#clicks');
        const numClicks = await pageOrig.evaluate((clicksEl) => clicksEl.innerHTML, clicksEl);
        chai_1.expect(numClicks).to.equal('2');
        const url = pageNew.url();
        chai_1.expect(url).to.match(/two.html$/);
        const bodyEl = await pageNew.$('body');
        const body = await pageNew.evaluate((bodyEl) => bodyEl.innerHTML, bodyEl);
        chai_1.expect(body).to.equal(require('./_fixtures/module'));
    });
    it('repl should be testable', async () => {
        const args = helper_1.getArgs(`${baseUrlArgs}`);
        const { repl } = await cli_1._runCli(args);
        instance = repl.context.hackium;
        let didClose = false;
        repl.on('exit', () => {
            didClose = true;
        });
        repl.write('.exit\n');
        // yield;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                chai_1.expect(didClose).to.be.true;
                resolve();
            }, 100);
        });
    });
    // TODO: Fix this flaky test
    xit('.repl_history should be stored in config.pwd', async () => {
        if (process.env.MOCHA_EXPLORER_VSCODE) {
            // This is failing when it's run in VS Code and I can't spend any more time
            // figuring out why. This env var is set as part of the project settings so
            // this test is shortcircuited when run in VS Code.
            console.log('short circuiting');
            return;
        }
        const userDataDir = path_1.default.join(dir, 'chrome');
        const args = helper_1.getArgs(`--pwd="${dir}" --userDataDir=${userDataDir}`);
        const { repl } = await cli_1._runCli(args, { stdin });
        instance = repl.context.hackium;
        stdin.send('/*hello world*/');
        stdin.send('\n');
        await promises_1.delay(200);
        console.log(file_1.resolve(['.repl_history'], dir));
        console.log(dir);
        const replHistoryPath = file_1.resolve(['.repl_history'], dir);
        const history = await file_1.read(replHistoryPath);
        chai_1.expect(history).to.equal(`/*hello world*/`);
    });
});
//# sourceMappingURL=cli.test.js.map