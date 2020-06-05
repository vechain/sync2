
// copy from Vue
// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs(s: string): number {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

// copy from Vue
function getTimeout(el: HTMLElement) {
    const style = window.getComputedStyle(el)
    let delays = (style.transitionDelay || '').split(', ')
    const durations = (style.transitionDuration || '').split(', ')

    /* istanbul ignore next */
    while (delays.length < durations.length) {
        delays = delays.concat(delays)
    }

    return Math.max.apply(null, durations.map((d, i) => {
        return toMs(d) + toMs(delays[i])
    }))
}

/**
 * returns the promise which is resolved by requestAnimationFrame
 */
export function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve))
}

/**
 * returns the promise which is resolved when the given element's 'transitionend' event fired
 * @param el the element to watch
 */
export function transitionEnd(el: HTMLElement) {
    let removeListener = () => { }
    const end = new Promise(resolve => {
        const cb = (ev: TransitionEvent) => {
            if (ev && ev.target !== el) {
                return
            }
            if (!ev || ev.propertyName.endsWith('transform')) {
                resolve()
            }
        }
        el.addEventListener('transitionend', cb)
        removeListener = () => el.removeEventListener('transitionend', cb)
    })

    const timeout = new Promise(resolve => setTimeout(resolve, getTimeout(el) + 1))
    return Promise.race([end, timeout])
        .then(() => removeListener())
}

/**
 * create a pipeline which to ensure tasks running serialized
 */
export function newPipeline() {
    let done: Promise<void> | undefined
    return {
        run(task: () => Promise<unknown>) {
            const _done = done
            done = (async () => {
                await _done
                try {
                    await task()
                } catch (err) {
                    console.warn(err)
                }
            })()
            return done
        }
    }
}

export function newVelometer() {
    let _t1 = 0
    let _t2 = 0
    let _delta = 0
    return {
        update(t: number, delta: number) {
            _t1 = _t2
            _t2 = t
            _delta = delta
        },
        get velocity() {
            return _delta / (_t2 - _t1)
        }
    }
}
