"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettify = void 0;
const { parseScript } = require('shift-parser');
const shift_printer_1 = require("shift-printer");
function prettify(src) {
    return shift_printer_1.prettyPrint(parseScript(src));
}
exports.prettify = prettify;
//# sourceMappingURL=prettify.js.map