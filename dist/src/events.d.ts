export declare enum HACKIUM_EVENTS {
    BEFORE_LAUNCH = "beforeLaunch",
    LAUNCH = "launch"
}
export declare class HackiumClientEvent {
    name: string;
    payload: any;
    constructor(name: string, payload: any);
}
