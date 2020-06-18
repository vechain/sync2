<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card>
            <q-list>
                <q-item
                    clickable
                    v-for="(a, i) in actions"
                    :key="i"
                    @click="ok();a.onClick()"
                >
                    <q-item-section class="text-subtitle1 text-center q-py-sm">
                        {{a.label}}
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue'

export default Vue.extend({
    props: {
        actions: Array as () => Array<{ label: string, onClick: Function }>
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as any).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as any).hide() },
        ok(result: unknown) {
            this.$emit('ok', result)
            this.hide()
        }
    }
})
</script>
