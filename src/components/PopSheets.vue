<template>
    <q-popup-proxy
        v-bind="$attrs"
        v-on="$listeners"
        position="bottom"
        v-model="opened"
    >
        <q-card>
            <q-list
                padding
                :separator="separator"
            >
                <template v-for="(sheet,i) in sheets">
                    <q-separator
                        v-if="sheet.separator"
                        v-show="!sheet.hidden"
                        :key="`s-${i}`"
                    />
                    <q-item
                        v-show="!sheet.hidden"
                        :key="i"
                        :clickable="!!sheet.action"
                        :dense="sheet.header && !sheet.action"
                        @click="opened=false; sheet.action && sheet.action()"
                    >
                        <q-item-section>
                            <q-item-label
                                :lines="1"
                                class="q-px-lg text-center"
                                :class="sheet.classes"
                                :header="sheet.header"
                            >
                                {{sheet.label}}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
        </q-card>
    </q-popup-proxy>
</template>
<script lang="ts">
import Vue from 'vue'

export type Sheet<T = never> = {
    label: string
    action?: () => void
    classes?: string | string[]
    model?: T
    separator?: boolean
    header?: boolean
    hidden?: boolean
}

export default Vue.extend({
    props: {
        sheets: Array as () => Sheet[],
        separator: Boolean
    },
    data() {
        return { opened: false }
    }
})
</script>
