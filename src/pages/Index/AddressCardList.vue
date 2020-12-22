<template>
    <div
        class="overflow-auto"
        v-scrollDivider
    >
        <div class="q-mx-sm">
            <q-resize-observer
                :debounce="0"
                @resize="availableWidth = $event.width"
            />
        </div>
        <div
            class="q-mx-auto q-py-sm"
            :style="{width:`${pageWidth}px`}"
        >
            <Intersecting
                :cfg="{threshold: 0.2}"
                v-for="(address,i) in wallet.meta.addresses"
                class="q-pa-sm inline-block"
                :style="cellStyles"
                :key="address"
                v-slot="{entry}"
            >
                <resolve
                    :promise="entry.isIntersecting? $svc.bc(wallet.gid).thor.account(address).get() : null"
                    v-slot="{data}"
                >
                    <AddressCard
                        class="fit"
                        :style="cardStyles"
                        :index="i"
                        :address="address"
                        :account="data"
                        @click="onClickCard(i)"
                    />
                </resolve>
            </Intersecting>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressCard from './AddressCard.vue'

const CELL_WIDTH_S = 340
const CELL_WIDTH_L = 400

export default Vue.extend({
    components: { AddressCard },
    props: {
        wallet: Object as () => M.Wallet
    },
    data: () => {
        return {
            availableWidth: 0
        }
    },
    computed: {
        pageWidth(): number {
            const aWidth = this.availableWidth
            if (aWidth >= CELL_WIDTH_S * 3) {
                return CELL_WIDTH_S * 3
            }
            if (aWidth >= CELL_WIDTH_S * 2) {
                return CELL_WIDTH_S * 2
            }
            return Math.min(CELL_WIDTH_L, aWidth)
        },
        cellWidth(): number {
            if (this.pageWidth <= CELL_WIDTH_L) {
                return this.pageWidth
            }
            return CELL_WIDTH_S
        },
        cellStyles(): object {
            return {
                width: `${this.cellWidth}px`,
                height: `${this.cellWidth * 0.63}px`
            }
        },
        cardStyles(): object {
            return {
                borderRadius: `${this.cellWidth * 0.06}px`
            }
        }
    },
    methods: {
        onClickCard(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    wid: this.wallet.id.toString(),
                    i: index.toString()
                }
            })
        }
    }
})
</script>
