"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const SafeMap_1 = require("../../util/SafeMap");
exports.templates = new SafeMap_1.SafeMap([
    ['Basic interceptor template', 'interceptor.js'],
    ['Pretty printer', 'interceptor-prettify.js'],
    ['JavaScript transformer using shift-refactor', 'interceptor-refactor.js'],
]);
async function initialize() {
    return inquirer_1.default
        .prompt([
        {
            name: 'name',
            message: 'Filename:',
            default: 'interceptor.js',
            type: 'string',
        },
        {
            name: 'type',
            message: 'Which template would you like to use?',
            default: 0,
            choices: ['Basic interceptor template', 'Pretty printer', 'JavaScript transformer using shift-refactor'],
            type: 'list',
        },
    ])
        .catch((error) => {
        console.log('Init error');
        console.log(error);
    });
}
exports.default = initialize;
//# sourceMappingURL=interceptor.js.map