import type { Storage } from './index'

export function newObservable() {
    let revision = 0
    let observers: Array<() => void> = []
    return {
        notify() {
            revision++
            const obs = observers
            observers = []
            obs.forEach(r => r())
        },
        observe(): Storage.Observer {
            let _rev = revision
            return {
                changed: () => {
                    return new Promise<void>(resolve => {
                        if (_rev !== revision) {
                            return resolve()
                        }
                        observers.push(resolve)
                    }).then(() => { _rev = revision })
                }
            }
        }
    }
}
