"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const logger_1 = __importDefault(require("../../src/util/logger"));
describe('logger', function () {
    it('should format log, warn, and error like debug', async () => {
        const logger = new logger_1.default('test');
        const warn = logger.format('warn %o', 'foo');
        const error = logger.format('error %o', 100);
        chai_1.expect(warn).to.match(/'foo'/);
        chai_1.expect(error).to.match(/100/);
    });
});
//# sourceMappingURL=logger.test.js.map