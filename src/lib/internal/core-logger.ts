import {CoreLogView} from "./basic-log-view";
import {Logger} from "../logger";
import {LogView} from "../log-view";
import _ = require("lodash");
import {CoreLogEvent, CoreLogViewEvent} from "../events";

class LogViewEventImpl<T>  {
    interpolate(): this {
        return this;
    }

    $level?: number;
    $message?: string;
}

function wrapEvent<T>(ev : CoreLogEvent<T>) : CoreLogViewEvent<T> {
    let viewEvent = new LogViewEventImpl();
    _.assign(viewEvent, ev);
    return viewEvent as any as CoreLogViewEvent<T>;
}

export class CoreLogger<T> extends CoreLogView<CoreLogEvent<T>> implements Logger<T> {
    constructor(public props : T & CoreLogEvent<T>) {
        super();
    }

    log(ev : CoreLogEvent<T>) {
        if (!_.isNumber(ev.$level)) {
            throw new Error(`Invalid log message. Given log $level = ${ev.$level}, but that's not a number.`);
        }
        let obj = _.cloneDeep(ev) as any;
        _.forOwn(this.props, (v, k) => {
            if (v instanceof  Function) {
                obj[k] = v();
            } else {
                obj[k] = v;
            }
        });
        this.post(obj);
        return this;
    }

    child(props ?: object) {
        let newProps = _.cloneDeep(this.props);
        newProps = _.defaults(newProps, props);
        return new ((this as any).constructor)(newProps) as this;
    }

    view() : LogView<CoreLogViewEvent<T>> {
        let view = new CoreLogView<CoreLogViewEvent<T>>();
        this.each(ev => {
            view.post(wrapEvent(ev));
        });
        return view;
    }
}