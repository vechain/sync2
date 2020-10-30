/* eslint-disable @typescript-eslint/no-explicit-any */
import { boot } from 'quasar/wrappers'
import { debounce } from 'quasar'

const directives: Record<string, Vue.DirectiveOptions> = {
    scrollDivider: {
        inserted: (el, bind) => {
            const { top = true, bottom, both } = bind.modifiers
            const handler = () => {
                if (top || both) {
                    const opacity = 0.12 * (el.scrollTop > 50 ? 1 : el.scrollTop / 50)
                    el.style.borderTop = `1px solid rgba(0,0,0,${opacity})`
                }
                if (bottom || both) {
                    const st = el.scrollHeight - el.scrollTop - el.clientHeight
                    const opacity = 0.12 * (st > 50 ? 1 : st / 50)
                    el.style.borderBottom = `1px solid rgba(0,0,0,${opacity})`
                }
            }
            const onResize = debounce(handler, 300);

            (el as any)._scrollHandler = handler;
            (window as any)._onResize = onResize

            el.addEventListener('scroll', handler)
            window.addEventListener('resize', onResize)

            // get correct initial state
            handler()
        },
        unbind: el => {
            el.removeEventListener('scroll', (el as any)._scrollHandler)
            window.removeEventListener('resize', (el as any)._onResize)
            delete (el as any)._scrollHandler
            delete (window as any)._onResize
        }
    }
}
export default boot(({ Vue }) => {
    Object.entries(directives).forEach(([name, definition]) => {
        Vue.directive(name, definition)
    })
})
