"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hackiumExtensionBridge = void 0;
const puppeteer_extensionbridge_1 = require("puppeteer-extensionbridge");
exports.hackiumExtensionBridge = {
    preLaunch(hackium, launchOptions) {
        puppeteer_extensionbridge_1.mergeLaunchOptions(launchOptions);
    },
    async postLaunch(hackium, browser, finalLaunchOptions) {
        await puppeteer_extensionbridge_1.decorateBrowser(browser, { newtab: browser.newtab });
        browser.log.debug('initializing and decorating browser instance');
        let lastActive = { tabId: -1, windowId: -1 };
        await browser.extension.addListener('chrome.tabs.onActivated', async ({ tabId, windowId }) => {
            lastActive = { tabId, windowId };
            const code = `
          window.postMessage({owner:'hackium', name:'pageActivated', data:{tabId:${tabId}, windowId:${windowId}}});
        `;
            browser.log.debug(`chrome.tabs.onActivated triggered. Calling %o`, code);
            await browser.extension.send('chrome.tabs.executeScript', tabId, { code });
        });
        await browser.extension.addListener('chrome.tabs.onUpdated', async (tabId) => {
            if (tabId === lastActive.tabId) {
                const code = `
            window.postMessage({owner:'hackium', name:'pageActivated', data:{tabId:${tabId}}});
          `;
                browser.log.debug(`Active page updated. Calling %o`, code);
                await browser.extension.send('chrome.tabs.executeScript', tabId, { code });
            }
        });
    },
};
//# sourceMappingURL=extensionbridge.js.map