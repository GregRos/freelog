import {LogView} from "./log-view";
import {ExpandedLogEvent, LogEvent} from "./events";

export interface Logger<T extends LogEvent = LogEvent>{
    props : T;
    log(ev : T) : this;
    view() : LogView<ExpandedLogEvent & T>;
    getLevelFromName(name : string) : number;
}