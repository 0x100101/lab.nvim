export declare const DEBUG = false;
export declare enum CodeRunnerMethod {
    Start = "Lab.Runner.Start",
    Stop = "Lab.Runner.Stop",
    Resume = "Lab.Runner.Resume",
    Feedback = "Lab.Runner.Feedback"
}
export declare enum ConfigMethod {
    Get = "Lab.Config.Get"
}
export declare enum QuickDataMethod {
    Update = "Lab.QuickData.Update"
}
export declare enum Processors {
    EsBuild = "lab.esbuild"
}
export declare enum Runners {
    Node = "lab.node",
    Python = "lab.python",
    Lua = "lab.lua"
}
export declare const PROCESSORS_PATH = "./processors/";
export declare const RUNNERS_PATH = "./runners/";
export declare const PROCESSOR_PATHS: {
    "lab.esbuild": string;
};
export declare const RUNNER_PATHS: {
    "lab.node": string;
    "lab.python": string;
    "lab.lua": string;
};
