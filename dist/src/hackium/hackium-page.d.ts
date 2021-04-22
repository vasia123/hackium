import { Debugger } from 'debug';
import Protocol from 'devtools-protocol';
import { InterceptionHandler, Interceptor } from 'puppeteer-interceptor';
import { CDPSession } from 'puppeteer/lib/cjs/puppeteer/common/Connection';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { Target } from 'puppeteer/lib/cjs/puppeteer/common/Target';
import Logger from '../util/logger';
import { HackiumBrowser } from './hackium-browser';
import { HackiumBrowserContext } from './hackium-browser-context';
import { HackiumKeyboard, HackiumMouse } from './hackium-input';
import { EvaluateFn, SerializableOrJSHandle } from 'puppeteer/lib/cjs/puppeteer/common/EvalTypes';
import { Plugin } from '../util/types';
export interface PageInstrumentationConfig {
    injectionFiles: string[];
    interceptorFiles: string[];
    watch: boolean;
    pwd: string;
}
export interface Interceptor {
    intercept: Protocol.Fetch.RequestPattern[];
    interceptor: InterceptorSignature;
    handler?: InterceptionHandler;
}
declare type InterceptorSignature = (hackium: HackiumBrowser, evt: Interceptor.OnResponseReceivedEvent, debug: Debugger) => any;
export declare class HackiumPage extends Page {
    log: Logger;
    connection: CDPSession;
    clientLoaded: boolean;
    queuedActions: (() => void | Promise<void>)[];
    instrumentationConfig: PageInstrumentationConfig;
    _hmouse: HackiumMouse;
    _hkeyboard: HackiumKeyboard;
    private cachedInterceptors;
    private cachedInjections;
    private defaultInjections;
    constructor(client: CDPSession, target: Target, ignoreHTTPSErrors: boolean);
    static hijackCreate: (config: PageInstrumentationConfig, plugins?: Plugin[]) => void;
    private __initialize;
    executeOrQueue(action: () => void | Promise<void>): (() => void | Promise<void>) | undefined;
    evaluateNowAndOnNewDocument(fn: EvaluateFn | string, ...args: SerializableOrJSHandle[]): Promise<void>;
    browser(): HackiumBrowser;
    browserContext(): HackiumBrowserContext;
    get mouse(): HackiumMouse;
    get keyboard(): HackiumKeyboard;
    forceCacheEnabled(enabled?: boolean): Promise<void>;
    private instrumentSelf;
    private registerInterceptionRequests;
    private loadInterceptors;
    private loadInjections;
    addInterceptor(interceptor: Interceptor): void;
}
export {};
