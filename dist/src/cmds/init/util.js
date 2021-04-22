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
exports.copyTemplate = exports.readTemplate = exports.safelyWrite = void 0;
const util_1 = require("util");
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const find_root_1 = __importDefault(require("find-root"));
const exists = util_1.promisify(fs_1.default.exists);
async function safelyWrite(file, contents) {
    if (await exists(file))
        throw new Error(`Refusing to overwrite ${file}`);
    return fs_1.promises.writeFile(file, contents, 'utf-8');
}
exports.safelyWrite = safelyWrite;
function readTemplate(name) {
    return fs_1.promises.readFile(path_1.default.join(find_root_1.default(__dirname), 'src', 'cmds', 'init', 'templates', name), 'utf-8');
}
exports.readTemplate = readTemplate;
async function copyTemplate(name, to) {
    await safelyWrite(to || name, await readTemplate(name));
    return name;
}
exports.copyTemplate = copyTemplate;
//# sourceMappingURL=util.js.map