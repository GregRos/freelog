import _ = require("lodash");
import {log} from "util";
import {CoreLogViewEvent} from "./events";

export interface LogSubscription {
    close() : void;
}

export interface LogView<T = CoreLogViewEvent> {
    each(callback: (msg: T) => void): LogSubscription;

    filter(predicate : (msg : T) => boolean) : LogView<T>;

    map<S>(projection : (msg : T) => S) : LogView<S>;

    mutateMap(mutation : (msg : T) => void) : LogView<T>;

    merge(...others : LogView<T>[]) : LogView<T>;

    group<K>(groups : K[], getKey : (x : T) => any) : Map<K, LogView<T>>;

    expand<S>(projection : (msg : T) => S[]) : LogView<S>;

    filterMap<S>(projection : (msg : T) => S | null) : LogView<S>;
}

