/// <reference types="node" />
import { ChildProcess } from 'child_process';
import Protocol from 'devtools-protocol';
import { ExtensionBridge } from 'puppeteer-extensionbridge';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Connection } from 'puppeteer/lib/cjs/puppeteer/common/Connection';
import { Viewport } from 'puppeteer/lib/cjs/puppeteer/common/PuppeteerViewport';
import Logger from '../util/logger';
import { HackiumBrowserContext } from './hackium-browser-context';
import { HackiumPage } from './hackium-page';
import { HackiumTarget } from './hackium-target';
export declare enum HackiumBrowserEmittedEvents {
    ActivePageChanged = "activePageChanged"
}
export declare type BrowserCloseCallback = () => Promise<void> | void;
export declare class HackiumBrowser extends Browser {
    log: Logger;
    activePage?: HackiumPage;
    connection: Connection;
    extension: ExtensionBridge;
    _targets: Map<string, HackiumTarget>;
    __defaultContext: HackiumBrowserContext;
    __contexts: Map<string, HackiumBrowserContext>;
    __ignoreHTTPSErrors: boolean;
    __defaultViewport?: Viewport;
    newtab: string;
    constructor(connection: Connection, contextIds: string[], ignoreHTTPSErrors: boolean, defaultViewport?: Viewport, process?: ChildProcess, closeCallback?: BrowserCloseCallback);
    initialize(): Promise<void>;
    pages(): Promise<HackiumPage[]>;
    newPage(): Promise<HackiumPage>;
    browserContexts(): HackiumBrowserContext[];
    createIncognitoBrowserContext(): Promise<HackiumBrowserContext>;
    _disposeContext(contextId?: string): Promise<void>;
    defaultBrowserContext(): HackiumBrowserContext;
    __targetCreated(event: Protocol.Target.TargetCreatedEvent): Promise<void>;
    maximize(): Promise<void>;
    setWindowBounds(width: number, height: number): Promise<void>;
    clearSiteData(origin: string): Promise<void>;
    setProxy(host: string, port: number): Promise<import("puppeteer-extensionbridge").BridgeResponse>;
    clearProxy(): Promise<import("puppeteer-extensionbridge").BridgeResponse>;
    setActivePage(page: HackiumPage): void;
    getActivePage(): HackiumPage;
}
