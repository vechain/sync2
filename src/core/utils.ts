
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
 * manually transit an element
 * @param el the target element
 * @param options transition options
 */
export function transit(
    el: HTMLElement,
    classes: {
        from?: string
        to?: string
        active?: string
    }
) {
    return new Promise<void>(resolve => {
        (async () => {
            classes.from && el.classList.add(classes.from)
            await new Promise(requestAnimationFrame)

            classes.active && el.classList.add(classes.active)
            await new Promise(requestAnimationFrame)

            classes.from && el.classList.remove(classes.from)
            classes.to && el.classList.add(classes.to)

            const cb = (ev: TransitionEvent) => {
                if (ev && ev.target !== el) {
                    return
                }
                if (!ev || ev.propertyName.endsWith('transform')) {
                    resolve()
                }
            }
            el.addEventListener('transitionend', cb)

            const timer = setTimeout(() => {
                resolve()
            }, getTimeout(el) + 1)

            const _resolve = resolve
            resolve = () => {
                el.removeEventListener('transitionend', cb)
                clearTimeout(timer)

                classes.to && el.classList.remove(classes.to)
                classes.active && el.classList.remove(classes.active)

                const finalize = el.__transitionFinalize
                el.__transitionFinalize = undefined
                finalize && finalize()
                _resolve()
            }
        })()
    })
}

declare global {
    interface HTMLElement {
        __transitionFinalize?: () => void
    }
}
