<template>
    <div>
        <q-input
            label="New Password"
            type="password"
            debounce="500"
            autocomplete="off"
            v-model="firstOne"
            placeholder="Passsword at least 6 characters"
            :rules="[
                val => !!val || 'Please enter the new password',
                val => val.length > 5 || 'Require at least 6 characters'
            ]"
        />
        <!-- @focus="onFocus" -->
        <q-input
            label="Confirm Password"
            type="password"
            ref="secondOne"
            lazy-rules="ondemand"
            autocomplete="off"
            @input="onChange"
            v-model="secondOne"
            :rules="[codeMatch]"
        />
    </div>
</template>
<script lang="ts">
import { QInput } from 'quasar'
import Vue from 'vue'
export default Vue.extend({
    model: {
        prop: 'code',
        event: 'change'
    },
    props: {
        code: String
    },
    data() {
        return {
            firstOne: '',
            secondOne: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timer: null as any
        }
    },
    methods: {
        codeMatch(val: string): boolean | string {
            return val === this.firstOne || 'Password mismatch'
        },
        onChange(val: string) {
            this.$emit('change', val)
            if (this.timer) {
                clearTimeout(this.timer)
            }
            this.timer = setTimeout(() => {
                (this.$refs.secondOne as QInput).resetValidation()
            }, 200)
        }
    }
})
</script>
