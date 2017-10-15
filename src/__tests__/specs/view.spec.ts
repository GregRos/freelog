import {extra_matchers} from "../helpers/extra-matchers-impl";
import {Logger} from "../../lib/logger";
import {LogView} from "../../lib/log-view";
import {Freelog} from "../../lib/freelog";
import * as _ from "lodash";

describe("view", () => {
    beforeEach(() => {
        jasmine.addMatchers(extra_matchers);
    });

    let specials = [1, 2, 3, 10, 20, 50, 100, -1, 9, 11, 3];
    let logger = Freelog.defineDefault().construct();
    let view = logger.view();
    let lastResults = [] as any[];
    let pushEvents = async <T, S>(v: LogView<S> | Promise<S[] | S>) => {
        lastResults = [];
        let sub;
        let pro;
        if (v instanceof Promise) {
            pro = v.then(xs => {
                if (Array.isArray(xs)) {
                    lastResults.push(...xs)
                } else {
                    lastResults.push(xs);
                }
            });
        } else {
            sub = v.each(ex => lastResults.push(ex));
        }
        for (let n of specials) {
            logger.log({
                $level: n,
                $message: `Message ${n}`,
                special: n
            });
        }
        sub &&  sub.close();
        if (pro) await pro;
    };


    it("filter", async () => {
        await pushEvents(view.filter(x => x.special % 2 == 0));
        expect(lastResults.map(x => x.special)).toEqual(specials.filter(x => x % 2 == 0));
    });

    it("map", async () => {
        await pushEvents(view.map(x => x.special * 10));
        expect(lastResults).toEqual(specials.map(x => x * 10));
    });

    it("take", async () => {
        await pushEvents(view.map(x => x.special).take(3));
        expect(lastResults).toEqual(specials.slice(0,3));
    });

    it("skip", async() => {
        await pushEvents(view.skip(3).map(x => x.special));
        expect(lastResults).toEqual(specials.slice(3));
    });

    it("skip+first", async () => {
        await pushEvents(view.skip(3).map(x => x.special).first());
        expect(lastResults).toEqual(specials.slice(3, 4));
    });

    it("mutateMap", async () => {
        await pushEvents(view.mutateMap(x => {
            x.special *= 10;
        }).map(x => x.special));
        expect(lastResults).toEqual(specials.map(x => x * 10));
    });

    it("expand", async () => {
        await pushEvents(view.expand(xs => [xs.special, xs.special - 1]));
        expect(lastResults).toEqual(_.flatMap(specials, x => [x, x - 1]));
    });

    it("merge", async () => {
        await pushEvents(view.merge(view).map(x => x.special));
        expect(lastResults).toEqual(_.flatMap(specials, x => [x, x]));
    });

    it("filterMap", async () => {
        await pushEvents(view.filterMap(x => x.special % 2 ? null : x.special));
        expect(lastResults).toEqual(specials.filter(x => x % 2 == 0))
    });
});