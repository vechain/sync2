import { boot } from 'quasar/wrappers'

const directives = {
    scrollDivider: {
        inserted(el: HTMLElement, bind: any) {
            const { top: t = true, bottom: b, both: bt } = bind.modifiers
            const handler = (e: any) => {
                const target = e.target
                if (t || bt) {
                    const opacity = 0.12 * (target.scrollTop > 50 ? 1 : target.scrollTop / 50)
                    el.style.borderTop = `1px solid rgba(0,0,0,${opacity})`
                }
                if (b || bt) {
                    const st = target.scrollHeight - target.scrollTop - target.clientHeight
                    const opacity = 0.12 * (st > 50 ? 1 : st / 50)
                    el.style.borderBottom = `1px solid rgba(0,0,0,${opacity})`
                }
            }

            const _el = el as any
            _el._scrollHandler = handler
            el.addEventListener('scroll', handler)
        },
        unbind(el: HTMLElement) {
            const _el = el as any
            el.removeEventListener('scroll', _el._scrollHandler)
            delete _el._scrollHandler
        }
    }
}
export default boot(({ Vue }) => {
    Object.entries(directives).forEach(([name, definition]) => {
        Vue.directive(name, definition)
    })
})
