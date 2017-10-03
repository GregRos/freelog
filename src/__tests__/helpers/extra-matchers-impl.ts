

import Jasmine = jasmine.Jasmine;
import CustomMatcher = jasmine.CustomMatcher;
import CustomMatcherFactory = jasmine.CustomMatcherFactory;
import _ = require("lodash");

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
                    result.message = `Expected object ${actual} to have properties: ${_.keys(expected).slice(0, 3)}...`;
                } else {
                    result.message = `Expected object ${actual} not to have all specified properties.`;
                }
                return result;
            }
        } as CustomMatcher
    } as CustomMatcherFactory
};



