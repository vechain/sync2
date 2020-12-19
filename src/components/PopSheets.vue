<template>
    <q-popup-proxy
        v-bind="$attrs"
        v-on="$listeners"
        position="bottom"
    >
        <q-card>
            <q-list separator>
                <template v-if="customized">
                    <fragment
                        v-for="(sheet,i) in sheets"
                        :key="i"
                    >
                        <slot :sheet="sheet" />
                    </fragment>
                </template>
                <template v-else>
                    <q-item
                        clickable
                        v-close-popup
                        v-for="(sheet,i) in sheets"
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
}

export default Vue.extend({
    props: {
        sheets: Array as () => Sheet[],
        customized: Boolean
    }
})
</script>
