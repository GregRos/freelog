import {CoreLogView} from "./basic-log-view";
import {Logger} from "../logger";
import {LogView} from "../log-view";
import _ = require("lodash");
import {CoreLogEvent, CoreLogViewEvent} from "../events";
import {Errors, ParameterType, Validate} from "./errors";

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
        Validate.paramOfType(ev, "ev", ParameterType.Object);
        if (!_.isNumber(ev.$level)) {
            throw Errors.levelNotNumberInMessage();
        }
        let obj = _.cloneDeep(ev) as any;
        _.forOwn(this.props, (v, k) => {
            if (!(k in obj)) {
                if (v instanceof  Function) {
                    obj[k] = v();
                } else {
                    obj[k] = v;
                }
            }
        });
        this.post(obj);
        return this;
    }

    child(props ?: object) {
        let propsClone = _.cloneDeep(this.props);
        propsClone = _.assign(propsClone, props);
        let newLog = new ((this as any).constructor)(propsClone) as this;
        newLog.each(ev => {
            this.post(ev);
        });
        return newLog;
    }

    view() : LogView<CoreLogViewEvent<T>> {
        let view = new CoreLogView<CoreLogViewEvent<T>>();
        this.each(ev => {
            view.post(wrapEvent(ev));
        });
        return view;
    }
}