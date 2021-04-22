"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    constructor(name) {
        this.debug = debug_1.default(name);
    }
    format(...args) {
        let index = 0;
        if (!args[0])
            return '';
        args[0] = args[0].toString().replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === '%%')
                return '%';
            index++;
            const formatter = debug_1.default.formatters[format];
            if (typeof formatter === 'function') {
                const val = args[index];
                match = formatter.call(this.debug, val);
                args.splice(index, 1);
                index--;
            }
            return match;
        });
        return args[0] || '';
    }
    print(...args) {
        console.log(...args);
    }
    info(...args) {
        console.log(chalk_1.default.cyan('Info: ') + this.format(...args));
    }
    warn(...args) {
        console.log(chalk_1.default.yellow('Warning: ') + this.format(...args));
    }
    error(...args) {
        console.log(chalk_1.default.red('Error: ') + this.format(...args));
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map