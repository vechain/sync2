/**
 * perform continuous query in rx-style following blockchain beats
 * @param connex the connex object
 * @param query the query logic
 */
export function continuous<T>(
    connex: Connex,
    query: () => Promise<T>
) {
    const opt = {
        abort: false,
        onNext: null as ((data: T) => void) | null,
        onError: null as ((err: Error) => void) | null
    };

    (async () => {
        const ticker = connex.thor.ticker()
        while (!opt.abort) {
            try {
                const data = await query()
                opt.abort || (opt.onNext && opt.onNext(data))
            } catch (err) {
                opt.abort || (opt.onError && opt.onError(err))
            }
            await ticker.next()
        }
    })()

    return {
        next(handler: (data: T) => void) {
            opt.onNext = handler
            return this
        },
        error(handler: (err: Error) => void) {
            opt.onError = handler
            return this
        },
        stop() {
            opt.abort = true
        }
    }
}
