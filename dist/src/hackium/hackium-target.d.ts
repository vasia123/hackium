import Protocol from 'devtools-protocol';
import { CDPSession } from 'puppeteer/lib/cjs/puppeteer/common/Connection';
import { EventEmitter } from 'puppeteer/lib/cjs/puppeteer/common/EventEmitter';
import { Viewport } from 'puppeteer/lib/cjs/puppeteer/common/PuppeteerViewport';
import { Target } from 'puppeteer/lib/cjs/puppeteer/common/Target';
import Logger from '../util/logger';
import { HackiumBrowserContext } from './hackium-browser-context';
import { HackiumPage } from './hackium-page';
export interface HackiumTarget extends Target, EventEmitter {
}
export declare const enum TargetEmittedEvents {
    TargetInfoChanged = "targetInfoChanged"
}
export declare class HackiumTarget extends Target {
    log: Logger;
    constructor(targetInfo: Protocol.Target.TargetInfo, browserContext: HackiumBrowserContext, sessionFactory: () => Promise<CDPSession>, ignoreHTTPSErrors: boolean, defaultViewport: Viewport | null);
    page(): Promise<HackiumPage | null>;
    _targetInfoChanged(targetInfo: Protocol.Target.TargetInfo): void;
}
