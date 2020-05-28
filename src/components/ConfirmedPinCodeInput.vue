<template>
    <q-carousel
        v-model="slide"
        animated
        transition-prev="slide-right"
        transition-next="slide-left"
    >
        <q-carousel-slide
            name="a"
            class="column flex-center"
        >
            <p>Input new pin code</p>
            <pin-code-input
                ref="inputA"
                v-model="clearA"
                @fulfilled="handlePin($event)"
            />
            <p>&nbsp;<span v-if="mismatch">Mismatched</span>&nbsp;</p>
        </q-carousel-slide>
        <q-carousel-slide
            name="b"
            class="column flex-center"
        >
            <p>Confirm the new pin code</p>
            <pin-code-input
                ref="inputB"
                v-model="clearB"
                @fulfilled="handlePin($event)"
            />
            <p>&nbsp;</p>
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data: () => {
        return {
            clearA: '',
            clearB: '',
            slide: 'a',
            pin: '',
            mismatch: false
        }
    },
    watch: {
        clearA(newVal: string) {
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
                    this.clearA = ''
                    this.clearB = ''
                    this.slide = 'a'
                    this.mismatch = true
                    this.$nextTick(() => {
                        this.focus(this.$refs.inputA as Vue)
                    })
                }
            } else {
                this.pin = pin
                this.slide = 'b'
                this.$nextTick(() => {
                    this.focus(this.$refs.inputB as Vue)
                })
            }
        },
        focus(ref: Vue) {
            // focusing a input may break running transition, so need to wait for
            // transition end
            const el = ref.$el as HTMLElement
            setTimeout(() => el.getElementsByTagName('input')[0].focus(), 300)
        }
    },
    mounted() {
        this.focus(this.$refs.inputA as Vue)
    }
})
</script>
