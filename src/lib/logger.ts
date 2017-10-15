import {LogView} from "./log-view";
import {LogEvent, LogViewEvent} from "./events";

export interface Logger<T = {}>{
    props : LogEvent<T>;
    log(ev : LogEvent<T>) : this;
    view() : LogView<LogViewEvent<T>>;
}