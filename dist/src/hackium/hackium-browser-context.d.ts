import { BrowserContext } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Connection } from 'puppeteer/lib/cjs/puppeteer/common/Connection';
import Logger from '../util/logger';
import { HackiumBrowser } from './hackium-browser';
import { HackiumPage } from './hackium-page';
export declare class HackiumBrowserContext extends BrowserContext {
    log: Logger;
    __id?: string;
    __browser: HackiumBrowser;
    constructor(connection: Connection, browser: HackiumBrowser, contextId?: string);
    get id(): string | undefined;
    browser(): HackiumBrowser;
    newPage(): Promise<HackiumPage>;
    pages(): Promise<HackiumPage[]>;
}
