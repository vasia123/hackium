"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = exports.debug = void 0;
const debug_1 = __importDefault(require("debug"));
const yargs_1 = __importDefault(require("yargs"));
const arguments_1 = require("../src/arguments");
exports.debug = debug_1.default('hackium:test');
function getArgs(argv) {
    exports.debug('simulating arguments %o', argv);
    const y = yargs_1.default.options(arguments_1.cliArgsDefinition());
    const parsed = y.parse(argv);
    exports.debug('parsed arguments as %O', parsed);
    return parsed;
}
exports.getArgs = getArgs;
//# sourceMappingURL=helper.js.map