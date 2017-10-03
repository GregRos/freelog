export interface InterpolationOptions {
    deleteEmbedded : boolean;
}

export type CoreLogEvent<T  = {}> = Partial<T> & {
    $level ?: number;
    $message ?: string;
    [custom : string] : any;
};

export type CoreLogViewEvent<T = {}> = CoreLogEvent<T> & {
    interpolate(options : InterpolationOptions) : CoreLogViewEvent<T>
};