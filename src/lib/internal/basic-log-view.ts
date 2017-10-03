import {LogSubscription, LogView} from "../log-view";
import * as _ from "lodash";
import {ParameterType, Validate} from "./errors";

export class CoreLogView<T> implements LogView<T> {
    private callbacks = [] as ((msg : T) => void)[];

    each(callback: ((msg: T) => void)) : LogSubscription {
        Validate.paramOfType(callback, "callback", ParameterType.Function);
        this.callbacks.push(callback);
        let alreadyUnsubbed = false;
        return {
            close : () => {
                if (!alreadyUnsubbed) {
                    _.pull(this.callbacks, callback)
                } else {
                    alreadyUnsubbed = true;
                }
            }
        }
    }

    asLogView() : LogView<T> {
        return this;
    }

    filterMap<S>(projection : (ev : T) => S | null) : LogView<S> {
        Validate.paramOfType(projection, "projection", ParameterType.Function);
        let logView = new CoreLogView<S>();
        this.each(ev => {
            let res = projection(ev);
            if (res === null) {
                return;
            }
            logView.post(res);
        });
        return logView;
    }

    post(ev : T) : void {
        Validate.paramOfType(ev, "ev", ParameterType.Object);
        this.callbacks.forEach(cb => cb(ev));
    }

    merge(...others : LogView<T>[]) : LogView<T> {
        let logView = new CoreLogView<T>();
        for (let x of [this, ...others]) {
            x.each(ev => logView.post(ev));
        }
        return logView;
    }


    group<K>(groups : K[], getKey : (msg : T) => K) : Map<K, LogView<T>> {
        Validate.paramOfType(getKey, "getKey", ParameterType.Function);
        Validate.paramOfType(groups, "groups", ParameterType.Array);
        if (!_.isFunction(getKey)) throw new Error(`Parameter 'getKey' must be a function, but it was: ${getKey}.`);
        if (!_.isArray(groups)) throw new Error(`Parameter 'groups' must be an array, but it was: ${groups}`);
        let logViews = new Map<K, CoreLogView<T>>();
        for (let k of groups) {
            logViews.set(k, new CoreLogView<T>());
        }
        logViews.set(null, new CoreLogView<T>());

        this.each(x => {
            let k = getKey(x);
            let matchingLogView = logViews.get(k);
            if (!matchingLogView) {
                matchingLogView = logViews.get(null);
            }
            matchingLogView.post(x);
        });

        return logViews;
    }

    expand<S>(projection : (ev : T) => S[]) : LogView<S> {
        Validate.paramOfType(projection, "projection", ParameterType.Function);
        let logView = new CoreLogView<S>();
        this.each(ev => {
            projection(ev).forEach(ev2 => logView.post(ev2));
        });
        return logView;
    }

    filter(predicate: (msg: T) => boolean): LogView<T> {
        Validate.paramOfType(predicate, "predicate", ParameterType.Function);
        let impl = new CoreLogView<T>();
        this.each(ev => predicate(ev) && impl.post(ev));
        return impl;
    }

    map<S>(projection: (msg: T) => S): LogView<S> {
        Validate.paramOfType(projection, "projection", ParameterType.Function);
        let impl = new CoreLogView<S>();
        this.each(ev => impl.post(projection(ev)));
        return impl;
    }

    mutateMap(action : (msg : T) => void) : LogView<T> {
        Validate.paramOfType(action, "action", ParameterType.Function);

        let impl = new CoreLogView<T>();
        this.each(ev => {
            let clone = _.cloneDeep(ev);
            action(clone);
            impl.post(clone);
        });
        return impl;
    }
}