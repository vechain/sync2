<template>
    <div class="column fit">
        <q-item>
            <q-item-section>{{$t('index.label_wallets')}}</q-item-section>
            <q-item-section side>
                <q-btn
                    flat
                    round
                    dense
                    icon="mdi-plus-circle-outline"
                    :to="{name:'new-wallet'}"
                />
            </q-item-section>
        </q-item>
        <!-- the grouped wallet list -->
        <q-list
            class="col overflow-auto full-width"
            v-scrollDivider.both
        >
            <span
                class="absolute-center text-grey"
                v-if="wallets.length === 0"
            >{{$t('common.no_wallet')}}</span>
            <q-item
                v-for="wallet in wallets"
                :key="wallet.id"
                :ref="wallet.id.toString()"
                clickable
                :active="wallet.id === current"
                active-class="bg-blue-1"
                @click="$emit('select', wallet.id)"
            >
                <q-item-section>
                    <q-item-label lines="1">
                        {{wallet.meta.name}}
                    </q-item-label>
                    <q-item-label
                        v-if="wallet.gid !==mainnetGid"
                        caption
                    >
                        {{$netDisplayName(wallet.gid)}}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { genesises } from 'src/consts'

export default Vue.extend({
    props: {
        wallets: Array as () => M.Wallet[],
        current: Number
    },
    computed: {
        mainnetGid() { return genesises.main.id }
    },
    watch: {
        wallets(newVal: M.Wallet[], oldVal: M.Wallet[]) {
            if (newVal.length !== oldVal.length) {
                this.$nextTick(() => this.ensureCurrentInView())
            }
        },
        current() {
            this.ensureCurrentInView()
        }
    },
    methods: {
        ensureCurrentInView() {
            const item = this.$refs[this.current.toString()] as Vue[]
            if (item && item.length > 0) {
                item[0].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
        }
    }
})
</script>
