import {LogSubscription, LogView} from "../log-view";
import * as _ from "lodash";

export class CoreLogView<T> implements LogView<T> {
    private callbacks = [] as ((msg : T) => void)[];


    each(callback: ((msg: T) => void)) : LogSubscription {
        if (!_.isFunction(callback)) throw new Error(`Parameter 'callback' must be a function, but it was: ${callback}.`);
        this.callbacks.push(callback);
        return {
            close : () => _.pull(this.callbacks, callback)
        }
    }

    asLogView() : LogView<T> {
        return this;
    }

    filterMap<S>(projection : (ev : T) => S | null) : LogView<S> {
        if (!_.isFunction(projection)) throw new Error(`Parameter 'projection' must be a function, but it was: ${projection}.`);
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
        if (!_.isObject(ev)) throw new Error(`Parameter 'ev' must be an object, but it was: ${ev}.`);
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
        if (!_.isFunction(projection)) throw new Error(`Parameter 'projection' must be a function, but it was: ${projection}.`);
        let logView = new CoreLogView<S>();
        this.each(ev => {
            projection(ev).forEach(ev2 => logView.post(ev2));
        });
        return logView;
    }

    filter(predicate: (msg: T) => boolean): LogView<T> {
        if (!_.isFunction(predicate)) throw new Error(`Parameter 'projection' must be a function, but it was: ${predicate}.`);
        let impl = new CoreLogView<T>();
        this.each(ev => predicate(ev) && impl.post(ev));
        return impl;
    }

    map<S>(projection: (msg: T) => S): LogView<S> {
        if (!_.isFunction(projection)) throw new Error(`Parameter 'projection' must be a function, but it was: ${projection}.`);
        let impl = new CoreLogView<S>();
        this.each(ev => impl.post(projection(ev)));
        return impl;
    }

    mutateMap(action : (msg : T) => void) : LogView<T> {
        if (!_.isFunction(action)) throw new Error(`Parameter 'action' must be a function, but it was: ${action}.`);
        let impl = new CoreLogView<T>();
        this.each(ev => {
            let clone = _.cloneDeep(ev);
            action(clone);
            impl.post(clone);
        });
        return impl;
    }
}