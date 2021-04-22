"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const arguments_1 = require("../../arguments");
const util_1 = require("./util");
async function initialize() {
    return inquirer_1.default
        .prompt([
        {
            name: 'url',
            message: 'What URL do you want to load by default?',
            default: arguments_1.defaultSignal,
        },
        // {
        //   name: 'adblock',
        //   message: "Do you want to block ads?",
        //   default: true,
        //   type: 'confirm'
        // },
        {
            name: 'devtools',
            message: 'Do you want to open devtools automatically?',
            default: true,
            type: 'confirm',
        },
        {
            name: 'inject',
            message: 'Do you want to create a blank JavaScript injection?',
            default: false,
            type: 'confirm',
        },
        {
            name: 'interceptor',
            message: 'Do you want to add a boilerplate interceptor?',
            default: false,
            type: 'confirm',
        },
        {
            name: 'execute',
            message: 'Do you want to add a boilerplate Hackium script?',
            default: false,
            type: 'confirm',
        },
        {
            name: 'headless',
            message: 'Do you want to run headless?',
            default: false,
            type: 'confirm',
        },
    ])
        .then(async (answers) => {
        if (answers.inject)
            answers.inject = [await util_1.copyTemplate('inject.js')];
        else
            answers.inject = [];
        if (answers.interceptor)
            answers.interceptor = [await util_1.copyTemplate('interceptor.js')];
        else
            answers.interceptor = [];
        if (answers.execute)
            answers.execute = [await util_1.copyTemplate('script.js')];
        else
            answers.execute = [];
        return answers;
    })
        .catch((error) => {
        console.log('Init error');
        console.log(error);
    });
}
exports.default = initialize;
//# sourceMappingURL=config.js.map