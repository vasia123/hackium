/// <reference types="node" />
import repl from 'repl';
import { Readable, Writable } from 'stream';
import { Arguments } from './arguments';
export default function runCli(): void;
export interface ReplOptions {
    stdout?: Writable;
    stdin?: Readable;
}
export declare function _runCli(cliArgs: Arguments, replOptions?: ReplOptions): Promise<{
    repl: repl.REPLServer;
}>;
