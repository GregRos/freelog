import {LogView} from "./log-view";
import {CoreLogEvent, CoreLogViewEvent} from "./events";

export interface Logger<T>{
    props : CoreLogEvent<T>;
    log(ev : CoreLogEvent<T>) : this;
    view() : LogView<CoreLogViewEvent<T>>;
}