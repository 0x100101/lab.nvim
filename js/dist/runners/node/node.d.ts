export namespace codeRunner {
    function init({ file, useSourceMap, ip, port }: {
        file: any;
        useSourceMap?: boolean | undefined;
        ip?: string | undefined;
        port?: string | undefined;
    }): Promise<any>;
    function init({ file, useSourceMap, ip, port }: {
        file: any;
        useSourceMap?: boolean | undefined;
        ip?: string | undefined;
        port?: string | undefined;
    }): Promise<any>;
    function findFrame(file: any, callFrames: any): any;
    function findFrame(file: any, callFrames: any): any;
    function filterMessage(file: any, ws: any, message: any): boolean;
    function filterMessage(file: any, ws: any, message: any): boolean;
    function processMessage(file: any, message: any): {
        event: string;
        line: any;
        col: any;
        text: string;
        description?: undefined;
        type?: undefined;
    } | {
        event: string;
        line: any;
        col: any;
        text: any;
        description: any;
        type?: undefined;
    } | {
        event: string;
        type: any;
        line: any;
        col: any;
        text: string;
        description?: undefined;
    } | undefined;
    function processMessage(file: any, message: any): {
        event: string;
        line: any;
        col: any;
        text: string;
        description?: undefined;
        type?: undefined;
    } | {
        event: string;
        line: any;
        col: any;
        text: any;
        description: any;
        type?: undefined;
    } | {
        event: string;
        type: any;
        line: any;
        col: any;
        text: string;
        description?: undefined;
    } | undefined;
    function initServer(file: any, ip: any, port: any): Promise<any>;
    function initServer(file: any, ip: any, port: any): Promise<any>;
    function initConnection(url: any): Promise<any>;
    function initConnection(url: any): Promise<any>;
}
