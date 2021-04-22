"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const object_1 = require("../../src/util/object");
describe('object', function () {
    it('.merge() should take varargs', async () => {
        const other1 = {
            a: 1,
            b: 'not this',
        };
        const other2 = {
            b: 2,
        };
        const final = object_1.merge({}, other1, other2);
        const expected = {
            a: 1,
            b: 2,
        };
        chai_1.expect(final).to.deep.equal(expected);
    });
    it('.merge() should not mutate objects', async () => {
        const dest = {
            a: 1,
        };
        const other = {
            b: 2,
        };
        const final = object_1.merge(dest, other);
        const expected = {
            a: 1,
            b: 2,
        };
        chai_1.expect(final).to.deep.equal(expected);
        chai_1.expect(final).to.not.equal(dest);
        chai_1.expect('b' in dest).to.be.false;
        chai_1.expect('a' in other).to.be.false;
    });
    it('.merge() should merge objects', async () => {
        const dest = {
            undef1: undefined,
            undef2: undefined,
            defined1: 'defined',
            defined2: 'defined',
            array1: ['array1'],
            array2: [],
        };
        const other = {
            undef1: 'defined',
            defined1: 'redefined',
            defined3: 'defined',
            array1: ['otherArray1'],
            array2: ['otherArray2'],
            array3: ['otherArray3'],
        };
        const mutatedDest = object_1.merge(dest, other);
        const expected = {
            undef1: 'defined',
            defined1: 'redefined',
            defined2: 'defined',
            defined3: 'defined',
            array1: ['array1', 'otherArray1'],
            array2: ['otherArray2'],
            array3: ['otherArray3'],
        };
        chai_1.expect(mutatedDest).to.deep.equal(expected);
    });
    it('.merge() cliArgs should override file config when defined', () => {
        const cliArgs = {
            devtools: false,
            inject: [],
            interceptor: [],
            execute: [],
            headless: false,
            pwd: '/Users/jsoverson/development/src/hackium',
            _: [],
            adblock: false,
            env: [],
            I: [],
            e: [],
            i: [],
            userDataDir: '/Users/jsoverson/.hackium/chromium',
            U: '/Users/jsoverson/.hackium/chromium',
            'user-data-dir': '/Users/jsoverson/.hackium/chromium',
            d: true,
            watch: false,
            w: false,
            plugin: [],
            p: [],
            timeout: 30000,
            t: 30000,
            chromeOutput: false,
            'chrome-output': false,
            config: '',
            c: '',
            $0: '../../../.npm/_npx/13379/bin/hackium',
            plugins: [],
        };
        let config = {
            url: 'https://example.com',
            devtools: false,
            inject: [],
            interceptor: [],
            execute: [],
            headless: false,
            pwd: '/Users/jsoverson/development/src/hackium',
        };
        config = object_1.merge(config, cliArgs);
        chai_1.expect(config.url).to.equal('https://example.com');
        chai_1.expect(config.devtools).to.equal(false);
    });
});
//# sourceMappingURL=object.test.js.map