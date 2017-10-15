import * as _ from "lodash";
import {LogEvent} from "../events";
const format = require('string-format');
export interface InterpolationOptions {
    removeInterpolatedFields ?: boolean;
    rxpMatchToken ?: RegExp;
}

const defaultInterpolationOptions = {
    removeInterpolatedFields : true,
    rxpMatchToken : /%\{(\w+)\}/g
} as InterpolationOptions;

export function interpolate(options : InterpolationOptions) {
    options = _.defaults(options, defaultInterpolationOptions);
    return <T extends LogEvent>(ev : T) :T => {
        let clone = _.clone(ev);

        let message = clone.$message;
        if (_.isString(message)) {
            let allKeys = new Set<string>();
            clone.$message = message.replace(options.rxpMatchToken, (substr, group1) => {
                let group = clone[group1] as string;
                let split = group.split(".");
                let target : any = clone;
                if (split[0]) {
                    allKeys.add(split[0]);
                }
                for (let prop in split) {
                    target = target[prop];
                }

                return `${target}`;
            });

            if (options.removeInterpolatedFields) {
                for (let key of allKeys) {
                    delete clone[key];
                }
            }
        }
        return clone;
    }
}