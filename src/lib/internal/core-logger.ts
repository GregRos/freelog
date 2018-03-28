import {WriteableLogView} from "./writeable-log-view";
import {Logger} from "../logger";
import {LogView} from "../log-view";
import _ = require("lodash");
import {ExpandedLogEvent, LogEvent} from "../events";
import {Errors, ParameterType, Validate} from "./errors";
import {LoggerLevels} from "../freelog";





export class CoreLogger<T extends LogEvent> extends WriteableLogView<T> implements Logger<T> {

    getLevelFromName(name: string): number {
        return this.levels[name];
    }
    constructor(public levels : LoggerLevels, public props : T) {
        super();
    }

    log(ev : T) {
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

    wrapEvent(ev : T) : T & ExpandedLogEvent {
        let self = this;
        let viewEventImpl = {
            get $levelLabel() {
                return _.findKey(self.levels, v => v === ev.$level);
            }
        };
        _.assign(viewEventImpl, ev);
        let viewEvent = viewEventImpl as any;
        return viewEventImpl as any as T & ExpandedLogEvent;
    }

    view() : LogView<T & ExpandedLogEvent> {
        let view = new WriteableLogView<T & ExpandedLogEvent>();
        this.each(ev => {
            view.post(this.wrapEvent(ev));

        });
        return view;
    }


}