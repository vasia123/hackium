"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
async function initialize() {
    return inquirer_1.default
        .prompt([
        {
            name: 'name',
            message: 'Filename:',
            default: 'injection.js',
            type: 'string',
        },
    ])
        .catch((error) => {
        console.log('Init error');
        console.log(error);
    });
}
exports.default = initialize;
//# sourceMappingURL=injection.js.map