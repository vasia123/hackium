"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumKeyboard = exports.IdleKeyboardBehavior = exports.HackiumMouse = exports.IdleMouseBehavior = void 0;
const Input_1 = require("puppeteer/lib/cjs/puppeteer/common/Input");
const USKeyboardLayout_js_1 = require("puppeteer/lib/cjs/puppeteer/common/USKeyboardLayout.js");
const logger_1 = __importDefault(require("../util/logger"));
const movement_1 = require("../util/movement");
const promises_1 = require("../util/promises");
const random_1 = require("../util/random");
var IdleMouseBehavior;
(function (IdleMouseBehavior) {
    IdleMouseBehavior[IdleMouseBehavior["MOVE"] = 0] = "MOVE";
    IdleMouseBehavior[IdleMouseBehavior["PAUSE"] = 1] = "PAUSE";
})(IdleMouseBehavior = exports.IdleMouseBehavior || (exports.IdleMouseBehavior = {}));
class HackiumMouse extends Input_1.Mouse {
    constructor(client, keyboard, page) {
        super(client, keyboard);
        this.log = new logger_1.default('hackium:page:mouse');
        this.rng = new random_1.Random();
        this.minDelay = 75;
        this.maxDelay = 500;
        this.minPause = 500;
        this.maxPause = 2000;
        this.__x = this.rng.int(1, 600);
        this.__y = this.rng.int(1, 600);
        this.__button = 'none';
        this.__x = this.rng.int(1, 600);
        this.__y = this.rng.int(1, 600);
        this.page = page;
        this.__client = client;
        this.__keyboard = keyboard;
    }
    get x() {
        return this.__x;
    }
    get y() {
        return this.__y;
    }
    async moveTo(selector) {
        const elementHandle = typeof selector === 'string' ? await this.page.$(selector) : selector;
        if (!elementHandle)
            throw new Error(`Can not find bounding box of ${selector}`);
        const box = await elementHandle.boundingBox();
        if (!box)
            throw new Error(`${selector} has no bounding box to move to`);
        const x = this.rng.int(box.x, box.x + box.width);
        const y = this.rng.int(box.y, box.y + box.height);
        return this.move(x, y);
    }
    async click(x = this.x, y = this.y, options = {}) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            this.log.error('Mouse.click: x and y must be numbers');
            throw new Error('x & y must be numbers');
        }
        if (!options.delay)
            options.delay = this.rng.int(this.minDelay, this.maxDelay);
        await this.move(x, y);
        return super.click(x, y, options);
    }
    async idle(pattern = [0, 1, 0, 0, 1]) {
        const viewport = this.page.viewport() || { width: 800, height: 600 };
        return promises_1.waterfallMap(pattern, async (movement) => {
            switch (movement) {
                case IdleMouseBehavior.MOVE:
                    await this.move(this.rng.int(1, viewport.width), this.rng.int(1, viewport.height));
                    break;
                case IdleMouseBehavior.PAUSE:
                    await new Promise((f) => setTimeout(f, this.rng.int(this.minPause, this.maxPause)));
                    break;
                default:
                    throw new Error(`Invalid IdleMouseMovement value ${movement}`);
            }
        });
    }
    async down(options = {}) {
        const { button = 'left', clickCount = 1 } = options;
        this.__button = button;
        await this.__client.send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            button,
            x: this.__x,
            y: this.__y,
            modifiers: this.__keyboard._modifiers,
            clickCount,
        });
    }
    async up(options = {}) {
        const { button = 'left', clickCount = 1 } = options;
        this.__button = 'none';
        await this.__client.send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            button,
            x: this.__x,
            y: this.__y,
            modifiers: this.__keyboard._modifiers,
            clickCount,
        });
    }
    async wheel(options = {}) {
        const { deltaX = 0, deltaY = 0 } = options;
        await this.__client.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: this.__x,
            y: this.__y,
            deltaX,
            deltaY,
            modifiers: this.__keyboard._modifiers,
            pointerType: 'mouse',
        });
    }
    async move(x, y, options = {}) {
        // steps are ignored and included for typing, duration is what matters to us.
        const { duration = Math.random() * 2000 } = options;
        const points = new movement_1.SimulatedMovement(4, 2, 5).generatePath(new movement_1.Vector(this.__x, this.__y), new movement_1.Vector(x, y));
        const moves = promises_1.waterfallMap(points, ([x, y]) => this.__client
            .send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            button: this.__button,
            x,
            y,
            modifiers: this.__keyboard._modifiers,
        })
            .then(() => {
            this.__x = x;
            this.__y = y;
        }));
        await moves;
    }
}
exports.HackiumMouse = HackiumMouse;
function charIsKey(char) {
    //@ts-ignore
    return !!USKeyboardLayout_js_1.keyDefinitions[char];
}
var IdleKeyboardBehavior;
(function (IdleKeyboardBehavior) {
    IdleKeyboardBehavior[IdleKeyboardBehavior["PERUSE"] = 0] = "PERUSE";
})(IdleKeyboardBehavior = exports.IdleKeyboardBehavior || (exports.IdleKeyboardBehavior = {}));
class HackiumKeyboard extends Input_1.Keyboard {
    constructor() {
        super(...arguments);
        this.minTypingDelay = 20;
        this.maxTypingDelay = 200;
        this.rng = new random_1.Random();
    }
    async type(text, options = {}) {
        const delay = options.delay || this.maxTypingDelay;
        const randomDelay = () => this.rng.int(this.minTypingDelay, delay);
        for (const char of text) {
            if (charIsKey(char)) {
                await this.press(char, { delay: randomDelay() });
            }
            else {
                if (delay)
                    await new Promise((f) => setTimeout(f, randomDelay()));
                await this.sendCharacter(char);
            }
        }
    }
    async idle(behaviors = Array(10).fill(IdleKeyboardBehavior.PERUSE)) {
        const randomDelay = () => this.rng.int(this.minTypingDelay, this.maxTypingDelay);
        return promises_1.waterfallMap(behaviors, async (behavior) => {
            switch (behavior) {
                case IdleKeyboardBehavior.PERUSE:
                    await new Promise((f) => setTimeout(f, randomDelay()));
                    switch (this.rng.int(0, 6)) {
                        case 0:
                            await this.press('ArrowUp', { delay: randomDelay() });
                            break;
                        case 1:
                            await this.press('ArrowDown', { delay: randomDelay() });
                            break;
                        case 2:
                            await this.press('ArrowRight', { delay: randomDelay() });
                            break;
                        case 3:
                            await this.press('ArrowLeft', { delay: randomDelay() });
                            break;
                        case 4:
                            await this.press('PageUp', { delay: randomDelay() });
                            break;
                        case 5:
                            await this.press('PageDown', { delay: randomDelay() });
                            break;
                    }
                    break;
                default:
                    throw new Error(`Invalid IdleKeyboardBehavior value ${behavior}`);
            }
        });
    }
}
exports.HackiumKeyboard = HackiumKeyboard;
//# sourceMappingURL=hackium-input.js.map