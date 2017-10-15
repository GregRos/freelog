export interface InterpolationOptions {
    deleteEmbedded : boolean;
}
export interface LogEvent {
    $level : number;
    $message : string;
    [key : string] : any;
}
