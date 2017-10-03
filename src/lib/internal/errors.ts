import * as _ from "lodash";


export class FreelogError extends Error {
    constructor(msg ?: string) {
        super(msg);
    }

    get name() {
        return "FreelogError";
    }
}

export enum ParameterType {
    Number = "number",
    String = "string",
    Function = "function",
    Object = "object",
    Array = "array"
}

export module Errors {
    export function parameterNotOfType(o : any, pName : string, tName : string) {
        return new FreelogError(`The parameter ${pName} was equal to ${o}, which isn't of the type ${tName}.`);
    }

    export function parameterWasNullOrUndefined(pValue : any, pName : string) {
        return new FreelogError(`The parameter ${pName} was ${pValue}, which is null or undefined.`);
    }

    export function levelNotNumber(lName : string, lValue : any) {
        return new FreelogError(`Levels are expected to be numbers, but the level ${lName} was ${lValue}`);
    }

    export function levelNotNumberInMessage() {
        return new FreelogError(`Levels are expected to be numbers, but the level of the log message was not one.`);
    }

    export function levelDuplicate(lName : string, lValue : number) {
        return new FreelogError(`Level values are expected to be unique, but there was a collision involving level ${lName}, with value ${lValue}`);
    }

    export function levelNameNotString(lName : any) {
        return new FreelogError(`Level name expected to be string, but was ${lName}`);
    }

}

export module Validate {
    export function paramOfType(o : any, pName : string, type : ParameterType) {
        if (o == null) {
            throw Errors.parameterWasNullOrUndefined(o, pName);
        }
        let isOfType = false;
        switch (type) {
            case ParameterType.Number:
                isOfType = _.isNumber(o);
                break;
            case ParameterType.Object:
                isOfType = _.isObject(o) && !_.isArray(o);
                break;
            case ParameterType.Function:
                isOfType = _.isFunction(o);
                break;
            case ParameterType.String:
                isOfType = _.isString(o);
                break;
            case ParameterType.Array:
                isOfType = _.isArray(o);
                break;
        }
        if (!isOfType) {
            throw Errors.parameterNotOfType(o, pName, type);
        }
    }
}