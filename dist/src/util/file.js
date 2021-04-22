"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomDir = exports.remove = exports.write = exports.read = exports.watch = exports.resolve = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const chokidar_1 = __importDefault(require("chokidar"));
const debug_1 = __importDefault(require("debug"));
const os_1 = __importDefault(require("os"));
const debug = debug_1.default('hackium:file');
class Watcher {
    constructor() {
        this._watcher = chokidar_1.default.watch([], {});
        this.handlers = new Map();
        this._watcher.on('change', (file) => {
            debug('file %o changed', file);
            const handlers = this.handlers.get(file);
            if (!handlers) {
                debug('no change handlers set for %o', file);
                return;
            }
            handlers.forEach((handler) => handler(file));
        });
    }
    add(file, callback) {
        this._watcher.add(file);
        const existingHandlers = this.handlers.get(file);
        if (existingHandlers) {
            existingHandlers.push(callback);
        }
        else {
            this.handlers.set(file, [callback]);
        }
    }
}
const watcher = new Watcher();
function resolve(parts, pwd = '') {
    const joinedPath = path_1.default.join(...parts);
    const parsed = path_1.default.parse(joinedPath);
    if (!parsed.root) {
        if (pwd) {
            return path_1.default.resolve(path_1.default.join(pwd, ...parts));
        }
        else {
            throw new Error(`Path ${joinedPath} has no root and no pwd passed.`);
        }
    }
    else {
        return path_1.default.resolve(joinedPath);
    }
}
exports.resolve = resolve;
function watch(file, callback) {
    debug('watching %o', file);
    watcher.add(file, callback);
}
exports.watch = watch;
function read(parts, pwd = '') {
    const file = Array.isArray(parts) ? resolve(parts, pwd) : parts;
    debug('reading %o', file);
    return fs_1.promises.readFile(file, 'utf-8');
}
exports.read = read;
function write(parts, contents, pwd = '') {
    const file = Array.isArray(parts) ? resolve(parts, pwd) : parts;
    debug('writing %o bytes to %o', contents.length, file);
    return fs_1.promises.writeFile(file, contents);
}
exports.write = write;
function remove(parts, pwd = '') {
    const file = Array.isArray(parts) ? resolve(parts, pwd) : parts;
    debug('deleting %o', file);
    return fs_1.promises.unlink(file);
}
exports.remove = remove;
async function getRandomDir(prefix = 'hackium -') {
    const dir = await fs_1.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'prefix'));
    debug('created random directory %o', dir);
    return dir;
}
exports.getRandomDir = getRandomDir;
//# sourceMappingURL=file.js.map