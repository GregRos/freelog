import {CoreLogView} from "./basic-log-view";
import {Logger} from "../logger";
import {LogView} from "../log-view";
import _ = require("lodash");
import {LogEvent, LogViewEvent} from "../events";
import {Errors, ParameterType, Validate} from "./errors";
import {LoggerLevels} from "../freelog";

class LogViewEventImpl<T>  {
    interpolate(): this {
        return this;
    }

    $level?: number;
    $message?: string;
}



export class CoreLogger<T> extends CoreLogView<LogEvent<T>> implements Logger<T> {
    constructor(public levels : LoggerLevels, public props : T & LogEvent<T>) {
        super();
    }

    log(ev : LogEvent<T>) {
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

    wrapEvent<T>(ev : LogEvent<T>) : LogViewEvent<T> {
        let viewEventImpl = new LogViewEventImpl();
        _.assign(viewEventImpl, ev);
        let viewEvent = viewEventImpl as any as LogViewEvent<T>;
        viewEvent.$levelLabel = _.findKey(this.levels, v => v === ev.$level);
        return viewEventImpl as any as LogViewEvent<T>;
    }

    view() : LogView<LogViewEvent<T>> {
        let view = new CoreLogView<LogViewEvent<T>>();
        this.each(ev => {
            view.post(this.wrapEvent(ev));
        });
        return view;
    }


}