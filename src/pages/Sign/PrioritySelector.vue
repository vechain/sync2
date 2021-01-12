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
                                {{$t('sign.label_select_priority')}}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label caption>
                                {{$t('sign.label_estimate_fee')}}
                                <q-avatar size="1rem">
                                    <img src="~assets/vtho.svg">
                                </q-avatar>
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
                        <q-item-section avatar>
                            <q-item-label>
                                <amount-label
                                    :value="calcFee && calcFee(l.value)"
                                    :decimals="18"
                                />
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
import AmountLabel from 'src/components/AmountLabel.vue'

type Level = {
    icon: string
    label: string
    value: number
}

export default Vue.extend({
    components: { AmountLabel },
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
                { icon: 'mdi-walk', label: this.$t('sign.label_priority_regular').toString(), value: 0 },
                { icon: 'mdi-car', label: this.$t('sign.label_priority_medium').toString(), value: 127 },
                { icon: 'mdi-airplane', label: this.$t('sign.label_priority_high').toString(), value: 255 }
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
