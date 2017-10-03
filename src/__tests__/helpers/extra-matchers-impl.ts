

import Jasmine = jasmine.Jasmine;
import CustomMatcher = jasmine.CustomMatcher;
import CustomMatcherFactory = jasmine.CustomMatcherFactory;
import _ = require("lodash");
import {Logger} from "../../lib/logger";

export const extra_matchers = {
    toHave : function (util, customEqualityTesters) {
        return {
            compare : function (actual : any, expected : any) {
                let result = {
                    pass : false,
                    message : ""
                };

                result.pass = !expected ? true : _.matches(expected)(actual);
                if (result.pass) {
                    result.message = `Expected object ${actual} not to have all specified properties.`;
                } else {
                    result.message = `Expected object ${actual} to have properties: ${_.keys(expected).slice(0, 3)}...`;
                }
                return result;
            }
        } as CustomMatcher
    } as CustomMatcherFactory
};

export function basicallyWorks(log : Logger<any>) {
    let lastMessage : any;
    let sub = log.view().each(ev => {
        lastMessage = ev;
    });
    let obj = {
        $message : "whatever",
        $level : 10000,
        abcdefghi_123 : 5
    };
    log.log(obj);

    expect(lastMessage).toHave(obj);
    sub.close();
}



