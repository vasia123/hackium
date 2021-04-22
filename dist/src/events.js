"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HackiumClientEvent = exports.HACKIUM_EVENTS = void 0;
var HACKIUM_EVENTS;
(function (HACKIUM_EVENTS) {
    HACKIUM_EVENTS["BEFORE_LAUNCH"] = "beforeLaunch";
    HACKIUM_EVENTS["LAUNCH"] = "launch";
})(HACKIUM_EVENTS = exports.HACKIUM_EVENTS || (exports.HACKIUM_EVENTS = {}));
class HackiumClientEvent {
    constructor(name, payload) {
        this.name = name;
        this.payload = payload;
    }
}
exports.HackiumClientEvent = HackiumClientEvent;
//# sourceMappingURL=events.js.map