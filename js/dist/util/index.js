export const print = (data) => {
    console.log(JSON.stringify(data));
};
export const tryRun = async (cb) => {
    try {
        const ret = await cb();
        return [ret, null];
    }
    catch (err) {
        return [null, err];
    }
};
export const rpcid = (function idGenerator() {
    let i = 0;
    return () => {
        if (i++ == 50)
            i = 1;
        return i;
    };
})();
