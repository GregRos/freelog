import {CreateLoggerConstructor} from "../../lib/logger-type-constructor";
import {CoreLogEvent, CoreLogViewEvent} from "../../lib/events";
import {LogView} from "../../lib/log-view";
import {extra_matchers} from '../helpers/extra-matchers-impl';

describe("basics", () => {
    beforeEach(() => {
        jasmine.addMatchers(extra_matchers);
    });

    describe("create basic logger constructor", () => {
        let constructor = CreateLoggerConstructor({
            cow : 5,
            sheep : 10
        });

        let instance = new constructor();
        describe("when empty", () => {
            it("called method 1", () => {
                instance.cow("message");
            });

            it("called method 2", () => {
                instance.sheep("message");
            });
        });

        describe("not empty", () => {
            let lastMessage : CoreLogViewEvent;
            let view = instance.view();
            view.each(x => {
                lastMessage = x;
            });
            let msg = "Moo!";
            it("passes message correctly when invoke 1", () => {
                instance.cow(msg);
                expect(lastMessage).toHave({
                    $level : 5,
                    $message : msg
                });
            });
            it("passes message correctly when invoke 2", () => {
                instance.sheep(msg);
                expect(lastMessage).toHave({
                    $level : 10,
                    $message : msg
                });
            });
            it("passes event message exactly", () => {
                let msg = {
                    $level : 100,
                    $message : "test!",
                    boo : "abc!",
                    xkcd() {
                        return 1;
                    }
                };
                instance.log(msg);
                expect(lastMessage).toHave(msg);
            })
        })
    });
});