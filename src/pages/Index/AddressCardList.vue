<template>
    <div
        class="row overflow-auto justify-center"
        v-scrollDivider
    >
        <Intersecting
            :cfg="{threshold: 0.2}"
            v-for="(address,i) in wallet.meta.addresses"
            class="address-card-wrap q-pa-md"
            :key="address"
            v-slot="{entry}"
        >
            <resolve
                :promise="entry.isIntersecting? $svc.bc(wallet.gid).getAccount(address) : null"
                v-slot="{data}"
            >
                <AddressCard
                    class="address-card fit"
                    :index="i"
                    :address="address"
                    :account="data"
                    @click="onClickCard(i)"
                />
            </resolve>
        </Intersecting>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressCard from './AddressCard.vue'

export default Vue.extend({
    components: { AddressCard },
    props: {
        wallet: Object as () => M.Wallet
    },
    methods: {
        onClickCard(index: number) {
            this.$router.push({
                name: 'account',
                query: {
                    wId: this.wallet.id.toString(),
                    i: index.toString()
                }
            })
        }
    }
})
</script>
<style scoped>
.address-card-wrap {
    width: min(100vw, 375px);
    height: calc(min(100vw, 375px) * 0.67);
}
.address-card {
    border-radius: calc(min(100vw, 375px) * 0.05);
}
</style>
