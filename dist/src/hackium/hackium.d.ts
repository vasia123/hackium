/// <reference types="node" />
import { EventEmitter } from 'events';
import { Arguments, ArgumentsWithDefaults } from '../arguments';
import Logger from '../util/logger';
import { PuppeteerLaunchOptions } from '../util/types';
import { HackiumBrowser } from './hackium-browser';
import { REPLServer } from 'repl';
export declare class Hackium extends EventEmitter {
    browser?: HackiumBrowser;
    log: Logger;
    version: any;
    repl?: REPLServer;
    config: ArgumentsWithDefaults;
    private unpauseCallback?;
    private defaultChromiumArgs;
    private launchOptions;
    constructor(config?: Arguments);
    getBrowser(): HackiumBrowser;
    launch(options?: PuppeteerLaunchOptions): Promise<HackiumBrowser>;
    startRepl(context?: Record<string, any>): Promise<void>;
    closeRepl(): void;
    pause(options?: {
        repl: false | Record<string, any>;
    }): Promise<unknown>;
    unpause(): void;
    cliBehavior(): Promise<HackiumBrowser>;
    runScript(file: string, args?: any[], src?: string): Promise<null | undefined>;
    close(): Promise<void>;
}
