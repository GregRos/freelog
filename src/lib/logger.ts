import {LogView} from "./log-view";
import {ExpandedLogEvent, LogEvent} from "./events";

export interface Logger<T extends LogEvent = LogEvent> {
    props: T;

    log(ev: T): this;

    view(): LogView<ExpandedLogEvent & T>;

    getLevelFromName(name: string): number;
}

export type FreeLogger<TLevels, TEvent extends LogEvent> = Logger<TEvent> & {
    child<TOther extends TEvent = TOther>(props ?: Partial<TOther>): FreeLogger<TLevels, TOther>
} & {
    [K in keyof TLevels] : (event: Partial<TEvent>) => void
    } & {
    [K in keyof TLevels] : ($message: string, rest ?: Partial<TEvent>) => void
    };
