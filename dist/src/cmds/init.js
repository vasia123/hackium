"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
// const promzard = require('promzard'
const fs_1 = require("fs");
const config_1 = __importDefault(require("./init/config"));
const interceptor_1 = __importStar(require("./init/interceptor"));
const injection_1 = __importDefault(require("./init/injection"));
const script_1 = __importDefault(require("./init/script"));
const arguments_1 = require("../arguments");
const util_1 = require("./init/util");
// These exports are necessary for yargs
exports.command = 'init [file]';
exports.desc = 'Create boilerplate configuration/scripts';
exports.builder = {
    file: {
        default: 'config',
        description: 'file to create',
        choices: ['config', 'interceptor', 'injection', 'script'],
    },
};
function filterDefaults(obj) {
    return Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, val === arguments_1.defaultSignal ? undefined : val]));
}
function toAlmostJSON(obj) {
    if (obj === undefined)
        throw new Error('Can not serialize undefined');
    if (obj === null)
        throw new Error('Can not serialize null');
    const entries = Object.entries(obj)
        .map(([key, val]) => {
        return `  ${key}: ${JSON.stringify(val)},`;
    })
        .join('\n');
    return `{\n${entries}\n}`;
}
const handler = async function (argv) {
    console.log(`Initializing ${argv.file}`);
    switch (argv.file) {
        case 'config': {
            const rawConfig = await config_1.default();
            if (!rawConfig)
                throw new Error('Can not initialize with undefined configuration');
            const filteredConfig = filterDefaults(rawConfig);
            console.log(`Writing to ./hackium.config.js`);
            const config = `module.exports = ${toAlmostJSON(filteredConfig)};\n`;
            await fs_1.promises.writeFile('hackium.config.js', config, 'utf-8');
            break;
        }
        case 'interceptor': {
            const rawConfig = await interceptor_1.default();
            if (!rawConfig)
                throw new Error('Can not initialize with undefined configuration');
            try {
                await util_1.copyTemplate(interceptor_1.templates.get(rawConfig.type), rawConfig.name);
            }
            catch (e) {
                console.log('\nError: ' + e.message);
            }
            break;
        }
        case 'injection':
            {
                const rawConfig = await injection_1.default();
                if (!rawConfig)
                    throw new Error('Can not initialize with undefined configuration');
                try {
                    await util_1.copyTemplate('inject.js', rawConfig.name);
                }
                catch (e) {
                    console.log('\nError: ' + e.message);
                }
            }
            break;
        case 'script':
            {
                const rawConfig = await script_1.default();
                if (!rawConfig)
                    throw new Error('Can not initialize with undefined configuration');
                try {
                    await util_1.copyTemplate('script.js', rawConfig.name);
                }
                catch (e) {
                    console.log('\nError: ' + e.message);
                }
            }
            break;
        default:
            console.log('Error: bad init specified');
            break;
    }
};
exports.handler = handler;
//# sourceMappingURL=init.js.map