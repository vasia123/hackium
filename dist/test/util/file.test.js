"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("../../src/util/file");
const chai_1 = require("chai");
const promises_1 = require("../../src/util/promises");
const path_1 = __importDefault(require("path"));
describe('file', function () {
    it('.resolve() should resolve relative paths with passed pwd', async () => {
        const fullPath = file_1.resolve(['.', 'foo', 'bar.js'], '/a');
        chai_1.expect(fullPath).to.equal(path_1.default.resolve('/a/foo/bar.js'));
    });
    it('.resolve() should resolve absolute paths regardless of pwd', async () => {
        const fullPath = file_1.resolve(['/foo/bar/baz.js'], '/a');
        chai_1.expect(fullPath).to.equal(path_1.default.resolve('/foo/bar/baz.js'));
    });
    it('.read() reads a file', async () => {
        const fullPath = file_1.resolve(['..', '_fixtures', 'dummy.txt'], __dirname);
        const contents = 'dummy contents';
        await file_1.write(fullPath, contents);
        const readContents = await file_1.read(fullPath);
        chai_1.expect(readContents).to.equal(contents);
        await file_1.remove(fullPath);
    });
    it('.read() should take in file parts like resolve()', async () => {
        const fullPath = file_1.resolve(['..', '_fixtures', 'dummy.txt'], __dirname);
        const contents = 'dummy contents';
        await file_1.write(fullPath, contents);
        const readContents = await file_1.read(['..', '_fixtures', 'dummy.txt'], __dirname);
        chai_1.expect(readContents).to.equal(contents);
        await file_1.remove(fullPath);
    });
    it('.watch() files and calls a callback on change', async () => {
        const fullPath = file_1.resolve(['..', '_fixtures', 'dummy.txt'], __dirname);
        const contents = 'dummy contents';
        await file_1.write(fullPath, contents);
        const promise = new Promise((resolve, reject) => file_1.watch(fullPath, resolve));
        await promises_1.delay(100);
        await file_1.write(fullPath, contents + contents);
        return promise.finally(() => file_1.remove(fullPath));
    });
});
//# sourceMappingURL=file.test.js.map