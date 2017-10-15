import {LogView} from "./log-view";
import {LogEvent} from "./events";

export interface Logger<T extends LogEvent = LogEvent>{
    props : T;
    log(ev : T) : this;
    view() : LogView<T>;
}