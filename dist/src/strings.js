"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strings = void 0;
const SafeMap_1 = require("./util/SafeMap");
exports.strings = new SafeMap_1.SafeMap([
    ['clientid', 'hackium'],
    ['clienteventhandler', '__hackium_internal_onEvent'],
    ['extensionid', require('puppeteer-extensionbridge/extension/manifest.json').key],
]);
//# sourceMappingURL=strings.js.map