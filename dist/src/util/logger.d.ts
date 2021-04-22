import { Debugger } from 'debug';
export default class Logger {
    debug: Debugger;
    constructor(name: string);
    format(...args: any): any;
    print(...args: any): void;
    info(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
}
