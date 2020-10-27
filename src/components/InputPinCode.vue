<template>
    <div class="q-px-md">
        <q-input
            label="PIN Code"
            type="password"
            debounce="500"
            autocomplete="off"
            v-model.trim="firstOne"
            :rules="[
                val => !!val || '* Required',
                val => val.length > 5 || 'Please use minimum 6 characters'
            ]"
        />
        <q-input
            label="re-enter your PIN code"
            type="password"
            debounce="500"
            autocomplete="off"
            @input="(val) => $emit('change', val)"
            v-model.trim="secondOne"
            :rules="[codeMatch]"
        />
        <div>
            <div class="q-mb-sm">PIN code requirements:</div>
            <div
                :class="firstOne.length > 5 ? 'text-blue-7' : 'text-grey-7'"
                class="row items-center q-gutter-sm"
            >
                <q-icon name="check_circle" />
                <span class="row">
                    At least 6 characters
                </span>

            </div>
        </div>
    </div>
</template>
<script lang="ts">
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
            secondOne: ''
        }
    },
    methods: {
        codeMatch(val: string): boolean | string {
            return val === this.firstOne || 'PIN code mismatch'
        }
    }
})
</script>
