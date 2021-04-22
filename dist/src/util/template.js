"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = void 0;
const find_root_1 = __importDefault(require("find-root"));
const path_1 = __importDefault(require("path"));
const strings_1 = require("../strings");
const metadata = require(path_1.default.join(find_root_1.default(__dirname), 'package.json'));
function renderTemplate(src) {
    return src.replace('%%%HACKIUM_VERSION%%%', metadata.version).replace(/%%%(.+?)%%%/g, (m, $1) => {
        return strings_1.strings.get($1);
    });
}
exports.renderTemplate = renderTemplate;
//# sourceMappingURL=template.js.map