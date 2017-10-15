export interface InterpolationOptions {
    deleteEmbedded : boolean;
}

export type LogEvent<T  = {}> = Partial<T> & {
    $level ?: number;
    $message ?: string;
    [custom : string] : any;
};

export type LogViewEvent<T = {}> = LogEvent<T> & {
    $levelLabel ?: string;
    interpolate(options : InterpolationOptions) : LogViewEvent<T>
};