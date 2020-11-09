<template>
    <q-item dense>
        <q-item-section>
            <q-item-label class="text-body2">
                Est Fee
                <span v-if="gas">{{ getFee(gas, bgp, coef) }}</span>
                <q-spinner-dots
                    v-else
                    color="blue"
                />
                <span class="text-caption">
                    VTHO
                </span>
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-btn
                :loading="!gas"
                size="sm"
                color="primary"
                outline
                rounded
            >
                <q-icon
                    left
                    :name="levelList[level].icon"
                />
                <div>
                    {{levelList[level].label}}
                </div>
                <template v-slot:loading>
                    <q-spinner-dots color="primary" />
                </template>
                <q-popup-proxy
                    v-model="show"
                    breakpoint="2000"
                    :context-menu="false"
                >
                    <q-card class="full-width">
                        <q-toolbar>
                            <q-toolbar-title>
                                Adjust Priority
                            </q-toolbar-title>
                        </q-toolbar>
                        <q-card-section>
                            <q-list>
                                <q-item
                                    clickable
                                    @click="onChange(i)"
                                    v-for="(l, i) in levelList"
                                    :key="i"
                                    :class="{'text-primary': (coef === calcCoef(i))}"
                                >
                                    <q-item-section avatar>
                                        <q-icon
                                            :color=" (coef === calcCoef(i)) ? 'primary' : ''"
                                            :name="l.icon"
                                        />
                                    </q-item-section>
                                    <q-item-section>
                                        {{l.label}}
                                    </q-item-section>
                                    <q-item-section side>
                                        <div>
                                            <span class="monospace">{{ getFee(gas, bgp, calcCoef(i)) }}</span>
                                            <span class="text-caption monospace"> VTHO</span>
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card-section>
                    </q-card>
                </q-popup-proxy>
            </q-btn>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import BigNumber from 'bignumber.js'
import Vue from 'vue'
type Level = {
    icon: string
    label: string
}
export default Vue.extend({
    model: {
        prop: 'coef',
        event: 'change'
    },
    props: {
        gas: Number,
        bgp: String,
        coef: Number
    },
    data() {
        return {
            show: false,
            levelList: [
                { icon: 'directions_walk', label: 'Regular' },
                { icon: 'directions_bike', label: 'Low' },
                { icon: 'directions_car', label: 'Medium' },
                { icon: 'flight', label: 'High' }
            ]
        }
    },
    computed: {
        maxLel(): number {
            return this.levelList.length - 1
        },
        level(): number {
            return Math.round(this.coef / (255 / this.maxLel))
        }
    },
    methods: {
        calcCoef(level: number) {
            return Math.round(255 * (level / this.maxLel))
        },
        onChange(level: number) {
            this.$emit('change', this.calcCoef(level))
            this.show = false
        },
        getFee(gas: number, bgp: string, coef: number) {
            if (gas > 0) {
                const gp = new BigNumber(bgp).times(coef).idiv(255).plus(bgp)
                return Vue.filter('balance')(gp.times(gas).toString(10))
            }
            return Vue.filter('balance')()
        }
    }
})
</script>
