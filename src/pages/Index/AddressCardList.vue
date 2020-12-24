<template>
    <div
        class="overflow-auto"
        v-scrollDivider
    >
        <!-- only to measure available width -->
        <div class="q-mx-sm">
            <q-resize-observer
                :debounce="0"
                @resize="onResize"
            />
        </div>
        <!-- the card list page -->
        <div
            class="q-mx-auto q-py-sm"
            :class="{'text-center': rows === 1}"
            :style="pageStyles"
        >
            <div
                v-for="(address,i) in wallet.meta.addresses"
                :key="address"
                class="q-pa-sm inline-block"
                :style="cellStyles"
            >
                <Intersecting
                    :cfg="{threshold: 0}"
                    v-slot="{entry}"
                >
                    <async-resolve
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
                    </async-resolve>
                </Intersecting>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressCard from './AddressCard.vue'
import AsyncResolve from 'components/AsyncResolve'

const CELL_WIDTH_S = 330
const CELL_WIDTH_L = 400
const MAX_COL = 3

export default Vue.extend({
    components: { AddressCard, AsyncResolve },
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
        onResize(size: { width: number }) {
            if (size.width > 0) {
                this.availableWidth = size.width
            }
        },
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
