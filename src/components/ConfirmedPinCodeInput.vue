<template>
    <div class="relative-position">
        <div class="column flex-center absolute-full">
            <input
                class="invisible-input"
                v-model="code[slide]"
                v-bind="inputBinds"
            >
        </div>
        <q-carousel
            v-model="slide"
            animated
            transition-prev="slide-right"
            transition-next="slide-left"
            class="full-width full-height"
        >
            <q-carousel-slide
                name="a"
                class="column flex-center"
            >
                <p>Input new pin code</p>
                <pin-code
                    :for-id="inputBinds.id"
                    ref="inputA"
                    v-model="code.a"
                    @fulfilled="handlePin($event)"
                />
                <p :class="{invisible: !mismatch}">Mismatched</p>
            </q-carousel-slide>
            <q-carousel-slide
                name="b"
                class="column flex-center"
            >
                <p>Confirm the new pin code</p>
                <pin-code
                    :for-id="inputBinds.id"
                    ref="inputB"
                    v-model="code.b"
                    @fulfilled="handlePin($event)"
                />
                <p class="invisible">placeholder</p>
            </q-carousel-slide>
        </q-carousel>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data: () => {
        const inputId = `pin-${Date.now().toString(16)}`
        return {
            code: { a: '', b: '' },
            slide: 'a',
            pin: '',
            mismatch: false,
            inputBinds: {
                id: inputId,
                name: inputId,
                type: 'text',
                autocomplete: 'off',
                autocapitalize: 'off',
                autocorrect: 'off',
                // pattern="[0-9]*" and inputmode="numeric" are needed to bring up numeric keypad
                pattern: '[0-9]*',
                inputmode: 'numeric'
            }
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
        handlePin(pin: string) {
            if (this.pin) {
                if (this.pin === pin) {
                    this.$emit('fulfilled', pin)
                } else {
                    this.pin = ''
                    this.code.a = ''
                    this.code.b = ''
                    this.slide = 'a'
                    this.mismatch = true
                }
            } else {
                this.pin = pin
                this.slide = 'b'
            }
        }
    }
})
</script>
