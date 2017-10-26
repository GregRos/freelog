import {Freelog} from "../../lib/freelog";
import {LogEvent} from "../../lib/events";
import {LogView} from "../../lib/log-view";
import {basicallyWorks, extra_matchers} from '../helpers/extra-matchers-impl';
import {FreelogError} from "../../lib/internal/errors";
let flError = new FreelogError();
describe("basics", () => {
    beforeEach(() => {
        jasmine.addMatchers(extra_matchers);
    });

    describe("create basic logger constructor", () => {
        let constructor = Freelog.define({
            cow : 5,
            sheep : 10
        });
        let instance = constructor.construct({
            x : 1
        });
        describe("when empty", () => {
            it("called method 1", () => {
                instance.cow("message");
            });

            it("called method 2", () => {
                instance.sheep("message");
            });
        });

        describe("not empty", () => {
            let lastMessage : LogEvent;
            let view = instance.view();
            let subParent = view.each(x => {
                lastMessage = x;
            });
            let msg = "Moo!";
            let extras = {
                a : "a",
                b : "b"
            };
            it("passes message correctly when invoke 1", () => {
                instance.cow(msg, extras);
                expect(lastMessage).toHave({
                    $level : 5,
                    $levelLabel : "cow",
                    $message : msg,
                    x : 1,
                    ...extras
                });
            });
            it("passes message correctly when invoke 2", () => {
                instance.sheep(msg, extras);
                expect(lastMessage).toHave({
                    $level : 10,
                    $levelLabel : "sheep",
                    $message : msg,
                    x : 1,
                    ...extras
                });
            });
            it("passes event message exactly", () => {
                let msg = {
                    $level : 100,
                    $levelLabel : undefined,
                    $message : "test!",
                    boo : "abc!",
                    xkcd() {
                        return 1;
                    }
                };
                instance.log(msg);
                expect(lastMessage).toHave({
                    ...msg,
                    x : 1
                });
            });

            it("passes undefined message", () => {
                instance.cow({
                    $message : undefined
                });
                expect(lastMessage).toHave({
                    $message : undefined,
                    $level : 5,
                    $levelLabel : "cow",
                    x : 1
                })
            });
            it("throws on invalid level", () => {
                expect(() => instance.cow({
                    $level : "abc" as any,
                    $levelLabel : undefined,
                }));
            });
            it("qInvoke1, override $level and x", () => {
                instance.cow("Blah", {
                    x : 5,
                    $level : 101,
                    $levelLabel : undefined
                });
                expect(lastMessage).toHave({
                    $level : 101,
                    x : 5,
                    $message : "Blah",
                    $levelLabel : undefined
                });
            });

            describe("child", () => {
               let child = instance.child({
                   x : 6,
                   y : -1
               });

               let childView = child.view();
               let lastChildMessage : any;
               let subChild = childView.each(ev => lastChildMessage = ev);

               it("invoke on child propagates to child and parent", () => {
                   child.cow("Hi");
                   let exampleMessage = {
                       $message : "Hi",
                       $level : 5,
                       x : 6,
                       y : -1,
                       $levelLabel : "cow"
                   };
                   expect(lastChildMessage).toHave(exampleMessage);
                   expect(lastMessage).toHave(exampleMessage);
               });

               it("invoke on parent doesn't propagate to child", () => {
                   instance.cow("Hi");
                   let exampleMessage = {
                       $message : "Hi",
                       $level : 5,
                       x : 1,
                       $levelLabel : "cow"
                   };

                   expect(lastChildMessage).not.toHave(exampleMessage);
                   expect(lastMessage).toHave(exampleMessage);
               });

               it("unsub on child works, still sends to parent", () => {
                   subChild.close();
                   let msg = {
                       $message : "hi!",
                       $level : 1000,
                       y : 1000,
                       $levelLabel : undefined
                   };
                   child.log(msg);
                   expect(lastChildMessage).not.toHave(msg);
                   expect(lastMessage).toHave(msg);
                });

                it("2nd unsub does nothing", () =>{
                    subChild.close();
                    let msg = {
                        $message : "hi!",
                        $level : 1000,
                        y : 1001,
                        $levelLabel : undefined
                    };
                    child.log(msg);
                    expect(lastChildMessage).not.toHave(msg);
                    expect(lastMessage).toHave({
                        ...msg,
                        x : 6
                    });
                });
            });

            it("unsub to parent works", () => {
                subParent.close();
                instance.cow("abc123");

                expect(lastMessage).not.toHave({
                    $message : "abc123"
                });
            })
        });

    });

    describe("creation", () => {
       describe("validate define", () => {
           it("fails on invalid levels" ,() => {
               expect(() => Freelog.define(null)).toThrowError(FreelogError)
               expect(() => Freelog.define([1, 2, 3] as any)).toThrowError(FreelogError);
               expect(() => Freelog.define(1 as any)).toThrowError(FreelogError);

           });

           it("fails on duplicate levels", () => {
               expect(() => Freelog.define({
                   a : 1,
                   b : 1
               })).toThrowError(FreelogError);
           });

           it("fails on non-number levels", () => {
               expect(() => Freelog.define({
                   a : "hi",
                   b : 34
               } as any)).toThrowError(FreelogError);
           });
       });

       describe("validate construct", () => {
           let ctor = Freelog.define({
               a : 1
           });

           it("basically works with no props", () => {
               let inst = ctor.construct();
               basicallyWorks(inst);
           });

           it("basically works with null props", () => {
               let inst = ctor.construct(null);
               basicallyWorks(inst);
           });

           it("basically works with empty props", () => {
               let inst = ctor.construct({});
               basicallyWorks(inst);
           });

           it("error on non-object props", () => {
               expect(() => ctor.construct(1 as any)).toThrowError(FreelogError);
               expect(() => ctor.construct("" as any)).toThrowError(FreelogError);
               expect(() => ctor.construct([1, 2, 3])).toThrowError(FreelogError);
           });
       });

       describe("create default", () => {
           let ctor = Freelog.defineDefault("Test");
           let instance = ctor.construct({
               a : 1
           });

           let lastMessage : any;

           instance.view().each(ev => lastMessage = ev);

           it("info works", () => {
               instance.info("boo");
               expect(lastMessage).toHave({
                   $message : "boo",
                   $level : 2
               });
           });
       });


    });
});