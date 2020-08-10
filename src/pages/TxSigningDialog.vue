<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <q-toolbar>
                <q-toolbar-title class="absolute-center">
                    Sign
                </q-toolbar-title>
                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click="hide"
                />
            </q-toolbar>
            <q-card-section>
                <ClauseCard
                    v-for="(msg, i) in req.message"
                    :key="i"
                    :tokens="tokens"
                    :msg="msg"
                />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'
import { tokenSpecs } from '../consts'

export default Vue.extend({
    props: {
        req: Object as () => M.TxRequest,
        gid: String
    },
    computed: {
        tokens(): M.TokenSpec[] {
            return [tokenSpecs.VTHO, ...this.$state.config.token.specs(this.gid, false)]
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: M.TxResponse) {
            this.$emit('ok', result)
            this.hide()
        }
    }
})
</script>
