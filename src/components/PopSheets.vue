<template>
    <q-popup-proxy
        v-bind="$attrs"
        v-on="$listeners"
        position="bottom"
    >
        <q-card>
            <q-list
                padding
                :separator="separator"
            >
                <template v-for="(sheet,i) in sheets">
                    <q-separator
                        v-if="sheet.separator"
                        :key="`s-${i}`"
                    />
                    <fragment
                        v-if="customized"
                        :key="i"
                    >
                        <slot :sheet="sheet" />
                    </fragment>
                    <q-item
                        v-else
                        clickable
                        v-close-popup
                        :key="i"
                        @click="sheet.action()"
                    >
                        <q-item-section>
                            <q-item-label
                                :lines="1"
                                class="q-px-lg text-center"
                                :class="sheet.classes"
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
    action: () => void
    classes?: string | string[]
    model?: T
    separator?: boolean
}

export default Vue.extend({
    props: {
        sheets: Array as () => Sheet[],
        separator: Boolean,
        customized: Boolean
    }
})
</script>
