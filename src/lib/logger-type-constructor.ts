import {Logger} from "./logger";
import _ = require("lodash");
import {CoreLogger} from "./internal/core-logger";
import {CoreLogEvent} from "./events";

export interface LoggerLevels {
    [levelName: string]: number;
}

export interface DefaultLoggerLevels extends LoggerLevels {
    trace: 0;
    debug: 1;
    info: 2;
    warning: 3;
    error: 4;
    fatal: 5;
}

export function CreateLoggerConstructor<TLevels extends LoggerLevels = DefaultLoggerLevels>(levels: TLevels, logClassName ?: string) {
    logClassName = logClassName || "AnonymousLogger";

    class MyLogger extends CoreLogger<any> {
        constructor(props: object) {
            super(props);
            _.forOwn(levels, (v, k) => {
                (this as any)[k] = function (messageOrLog: string | object, maybeRemainingObject ?: object) {
                    let msgObj = {
                        $level: v
                    } as any;
                    if (typeof messageOrLog === "string") {
                        msgObj.$message = messageOrLog;
                        if (maybeRemainingObject) {
                            _.assign(msgObj, maybeRemainingObject);
                        }
                    }
                    else {
                        _.assign(msgObj, messageOrLog);
                    }
                    this.log(msgObj);
                }
            });
        }
    }

    Object.defineProperty(MyLogger, "name", {
        writable : true
    });

    (MyLogger as any).name = logClassName;

    type CombinedLogger<TEvent> = Logger<TEvent> & {
        child<TOther extends TEvent = TOther>(props ?: CoreLogEvent<TOther>): CombinedLogger<TOther>
    } & {
        [K in keyof TLevels] : (event: CoreLogEvent<TEvent>) => void
        } & {
        [K in keyof TLevels] : ($message: string, rest ?: CoreLogEvent<TEvent>) => void
        };

    return MyLogger as any as {
        new<TEvent> (props ?: CoreLogEvent<TEvent>): CombinedLogger<TEvent>
    }
}

export function CreateDefaultLoggerConstructor(logClassName ?: string) {
    return CreateLoggerConstructor({
        trace: 0,
        debug: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5
    }, logClassName)
}