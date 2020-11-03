<template>
    <div
        class="column no-wrap items-center no-border no-outline"
        tabindex="0"
        @keydown.capture="handleKeyDown"
    >
        <q-carousel
            class="col full-width"
            v-model="slide"
            animated
            transition-prev="slide-right"
            transition-next="slide-left"
        >
            <q-carousel-slide
                name="a"
                class="column flex-center"
            >
                <p>Enter new password</p>
                <pin-code
                    v-model="code.a"
                    @fulfilled="handlePinA"
                />
                <p :class="{invisible: !mismatch}">Mismatched</p>
            </q-carousel-slide>
            <q-carousel-slide
                name="b"
                class="column flex-center"
            >
                <p>Confirm the new password</p>
                <pin-code
                    v-model="code.b"
                    @fulfilled="handlePinB"
                />
                <p class="invisible">placeholder</p>
            </q-carousel-slide>
        </q-carousel>
        <digit-keypad :class="{'full-width': $q.screen.xs}" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data: () => {
        return {
            code: { a: '', b: '' },
            slide: 'a' as 'a' | 'b',
            mismatch: false
        }
    },
    watch: {
        'code.a'(newVal: string) {
            if (newVal) {
                // clear mismatch flag when input again
                this.mismatch = false
            }
        }
    },
    methods: {
        handlePinA() {
            this.slide = 'b'
        },
        handlePinB() {
            if (this.code.a === this.code.b) {
                this.$emit('fulfilled', this.code.a)
            } else {
                this.code.a = this.code.b = ''
                this.slide = 'a'
                this.mismatch = true
            }
        },
        handleKeyDown(ev: KeyboardEvent) {
            const { key } = ev
            if (key === 'Del' || key === 'Delete' || key === 'Backspace') {
                this.code[this.slide] = this.code[this.slide].slice(0, -1)
            } else if (key.length === 1) {
                this.code[this.slide] += key
            }
        }
    },
    mounted() {
        (this.$el as HTMLElement).focus()
    }
})
</script>
