export function groupBy<T, U>(array: T[], by: (v: T) => U): T[][] {
    const ret: T[][] = []
    const map = new Map<U, T[]>()
    array.forEach(v => {
        const k = by(v)
        const exist = map.get(k)
        if (exist) {
            exist.push(v)
        } else {
            const sub = [v]
            ret.push(sub)
            map.set(k, sub)
        }
    })
    return ret
}

export function count<T>(array: T[], cond: (v: T) => boolean): number {
    let n = 0
    array.forEach(v => {
        cond(v) && n++
    })
    return n
}
