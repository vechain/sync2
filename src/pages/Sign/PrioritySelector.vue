<template>
    <q-btn
        :loading="!calcFee"
        size="sm"
        color="primary"
        outline
        rounded
    >
        <q-icon
            left
            :name="level && level.icon"
        />
        <div> {{level && level.label}} </div>
        <template v-slot:loading>
            <q-spinner-dots color="primary" />
        </template>
        <q-popup-proxy
            v-if="calcFee"
            position="bottom"
        >
            <q-card>
                <q-list padding>
                    <q-item>
                        <q-item-section>
                            <q-item-label>
                                Select Priority
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label caption>
                                Est. fee
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item
                        v-for="(l, i) in levels"
                        :key="i"
                        clickable
                        v-close-popup
                        @click="$emit('change', l.value)"
                        :active="coef === l.value"
                    >
                        <q-item-section avatar>
                            <q-icon :name="l.icon" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>
                                {{l.label}}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section
                            side
                            avatar
                        >
                            <q-item-label class="row">
                                <span>{{ calcFee && calcFee(l.value) }}</span>
                                <q-avatar size="xs">
                                    <img src="~assets/vtho.svg">
                                </q-avatar>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </q-popup-proxy>
    </q-btn>
</template>
<script lang="ts">
import Vue from 'vue'

type Level = {
    icon: string
    label: string
    value: number
}

export default Vue.extend({
    model: {
        prop: 'coef',
        event: 'change'
    },
    props: {
        coef: Number,
        calcFee: Function as unknown as (() => ((coef: number) => void) | null)
    },
    computed: {
        levels(): Level[] {
            return [
                { icon: 'directions_walk', label: 'Regular', value: 0 },
                { icon: 'directions_car', label: 'Medium', value: 127 },
                { icon: 'flight', label: 'High', value: 255 }
            ]
        },
        level(): Level | null {
            return this.levels.find(l => l.value === this.coef) || null
        }
    },
    watch: {
        coef(newVal: number) {
            if (!this.levels.find(l => l.value === newVal)) {
                this.$emit('change', this.levels[0].value)
            }
        }
    }
})
</script>
