import {Logger} from "./logger";
import _ = require("lodash");
import {CoreLogger} from "./internal/core-logger";
import {LogEvent} from "./events";
import {Errors, FreelogError, ParameterType, Validate} from "./internal/errors";



export interface LoggerLevels {
    [levelName: string] : number;
}

export interface DefaultLoggerLevels extends LoggerLevels {
    trace: 0;
    debug: 1;
    info: 2;
    warning: 3;
    error: 4;
    fatal: 5;
}

function validateLevels(levels : {[key : string] : number}) {

    let set = new Set<number>();
    _.forOwn(levels, (v, k) => {
        if (!_.isNumber(v)) {
            throw Errors.levelNotNumber(k, v);
        }
        if (set.has(v)) {
            throw Errors.levelDuplicate(k ,v);
        }
        set.add(v);
    });
}

export module Freelog {
    export function defineCustom<TLevels extends LoggerLevels>(levels: TLevels, logClassName ?: string) {
        logClassName = logClassName || "AnonymousLogger";
        Validate.paramOfType(levels, "levels", ParameterType.Object);
        validateLevels(levels);
        class MyLogger extends CoreLogger<any> {
            constructor(props: object) {
                props = props == null ? {} : props;
                Validate.paramOfType(props, "props", ParameterType.Object);
                super(levels, props);

                _.forOwn(levels, (v, k) => {
                    (this as any)[k] = function (messageOrLog: string | object, maybeRemainingObject ?: object) {
                        let msgObj = {
                            $level: v
                        } as any;
                        if (typeof messageOrLog === "string") {
                            msgObj.$message = messageOrLog;
                            if (maybeRemainingObject) {
                                Validate.paramOfType(maybeRemainingObject, "rest", ParameterType.Object);
                                _.assign(msgObj, maybeRemainingObject);
                            }
                        }
                        else if (_.isObject(messageOrLog)) {
                            _.assign(msgObj, messageOrLog);
                        } else {
                            throw Errors.parameterNotOfType(messageOrLog, "$message | event", "string | object");
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
            child<TOther extends TEvent = TOther>(props ?: LogEvent<TOther>): CombinedLogger<TOther>
        }    & {
            [K in keyof TLevels] : (event: LogEvent<TEvent>) => void
            } & {
            [K in keyof TLevels] : ($message: string, rest ?: LogEvent<TEvent>) => void
            };

        return MyLogger as any as {
            new<TEvent> (props ?: LogEvent<TEvent>): CombinedLogger<TEvent>
        }
    }

    export function defineDefault(logClassName ?: string) {
        return defineCustom({
            trace: 0,
            debug: 1,
            info: 2,
            warning: 3,
            error: 4,
            fatal: 5
        }, logClassName)
    }
}


