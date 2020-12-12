export function groupBy<T, U>(array: T[], by: (v: T) => U): T[][] {
    if (array.length <= 10) {
        return array.reduce<T[][]>((prev, cur) => {
            const k = by(cur)
            const f = prev.find(e => by(e[0]) === k)
            f ? f.push(cur) : prev.push([cur])
            return prev
        }, [])
    }

    const map = new Map<U, T[]>()
    return array.reduce<T[][]>((prev, cur) => {
        const k = by(cur)
        const f = map.get(k)
        if (f) {
            f.push(cur)
        } else {
            const g = [cur]
            prev.push(g)
            map.set(k, g)
        }
        return prev
    }, [])
}

export function count<T>(array: T[], cond: (v: T) => boolean): number {
    return array.reduce((prev, cur) => {
        cond(cur) && prev++
        return prev
    }, 0)
}

export function unique<T>(array: T[]): T[] {
    if (array.length <= 10) {
        return array.reduce<T[]>((prev, cur) => {
            prev.includes(cur) || prev.push(cur)
            return prev
        }, [])
    }
    const set = new Set<T>()
    return array.reduce<T[]>((prev, cur) => {
        if (!set.has(cur)) {
            set.add(cur)
            prev.push(cur)
        }
        return prev
    }, [])
}
