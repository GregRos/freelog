import {LogView} from "./log-view";
import {LogEvent} from "./events";
import {ExpandedLogEvent} from "./internal/core-logger";

export interface Logger<T extends LogEvent = LogEvent>{
    props : T;
    log(ev : T) : this;
    view() : LogView<ExpandedLogEvent & T>;
    getLevelFromName(name : string) : number;
}