<template>
    <div
        class="overflow-auto"
        v-scrollDivider
    >
        <!-- only to measure available width -->
        <div class="q-mx-sm">
            <q-resize-observer
                :debounce="0"
                @resize="availableWidth = $event.width"
            />
        </div>
        <!-- the car list page -->
        <div
            class="q-mx-auto q-py-sm"
            :class="{'text-center': rows === 1}"
            :style="pageStyles"
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
                    <q-responsive :ratio="1/0.62">
                        <AddressCard
                            :style="cardStyles"
                            :index="i"
                            :address="address"
                            :account="data"
                            @click="onClickCard(i)"
                        />
                    </q-responsive>
                </resolve>
            </Intersecting>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressCard from './AddressCard.vue'

const CELL_WIDTH_S = 330
const CELL_WIDTH_L = 400
const MAX_COL = 3

export default Vue.extend({
    components: { AddressCard },
    props: {
        wallet: Object as () => M.Wallet
    },
    data: () => {
        return { availableWidth: 0 }
    },
    computed: {
        cols(): number {
            const n = Math.floor(this.availableWidth / CELL_WIDTH_S)
            return Math.max(Math.min(n, MAX_COL), 1)
        },
        rows(): number {
            return Math.ceil(this.wallet.meta.addresses.length / this.cols)
        },
        pageWidth(): number {
            const cols = this.cols
            if (cols > 1) {
                return cols * CELL_WIDTH_S
            }
            return Math.min(CELL_WIDTH_L, this.availableWidth)
        },
        cellWidth(): number {
            if (this.pageWidth <= CELL_WIDTH_L) {
                return this.pageWidth
            }
            return CELL_WIDTH_S
        },
        pageStyles(): object {
            return { width: `${this.pageWidth}px` }
        },
        cellStyles(): object {
            return { width: `${this.cellWidth}px` }
        },
        cardStyles(): object {
            return { borderRadius: `${this.cellWidth * 0.06}px` }
        }
    },
    methods: {
        onClickCard(index: number) {
            this.$router.push({
                name: 'address',
                params: {
                    walletId: this.wallet.id.toString(),
                    addressIndex: index.toString()
                }
            })
        }
    }
})
</script>
