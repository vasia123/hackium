import { Keyboard, Mouse, MouseButton, MouseWheelOptions } from 'puppeteer/lib/cjs/puppeteer/common/Input';
import { ElementHandle } from 'puppeteer/lib/cjs/puppeteer/common/JSHandle';
import Logger from '../util/logger';
import { Random } from '../util/random';
import { HackiumPage } from './hackium-page';
import { CDPSession } from 'puppeteer/lib/cjs/puppeteer/common/Connection';
export interface Point {
    x: number;
    y: number;
}
interface MouseOptions {
    button?: MouseButton;
    clickCount?: number;
}
export declare enum IdleMouseBehavior {
    MOVE = 0,
    PAUSE = 1
}
export declare class HackiumMouse extends Mouse {
    log: Logger;
    page: HackiumPage;
    rng: Random;
    minDelay: number;
    maxDelay: number;
    minPause: number;
    maxPause: number;
    __x: number;
    __y: number;
    __client: CDPSession;
    __button: MouseButton | 'none';
    __keyboard: Keyboard;
    constructor(client: CDPSession, keyboard: Keyboard, page: HackiumPage);
    get x(): number;
    get y(): number;
    moveTo(selector: string | ElementHandle): Promise<void>;
    click(x?: number, y?: number, options?: MouseOptions & {
        delay?: number;
    }): Promise<void>;
    idle(pattern?: IdleMouseBehavior[]): Promise<void[]>;
    down(options?: MouseOptions): Promise<void>;
    up(options?: MouseOptions): Promise<void>;
    wheel(options?: MouseWheelOptions): Promise<void>;
    move(x: number, y: number, options?: {
        steps?: number;
        duration?: number;
    }): Promise<void>;
}
export declare enum IdleKeyboardBehavior {
    PERUSE = 0
}
export declare class HackiumKeyboard extends Keyboard {
    minTypingDelay: number;
    maxTypingDelay: number;
    rng: Random;
    type(text: string, options?: {
        delay?: number;
    }): Promise<void>;
    idle(behaviors?: IdleKeyboardBehavior[]): Promise<void[]>;
}
export {};
