<template>
    <q-page v-if="wallet">
        <q-item class="q-px-lg">
            <q-item-section>
                <span class="text-h6">{{wallet.meta.name}}</span>
            </q-item-section>
            <q-item-section side>
                <q-btn
                    color="white"
                    text-color="black"
                    flat
                    dense
                    round
                    icon="more_horiz"
                    aria-label="More"
                    @click="showMenu = !showMenu"
                >
                    <q-menu v-show="false">
                        <q-list>
                            <q-item>
                                <q-item-section>Accounts</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Activity</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Backup</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Delete</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-item-section>
        </q-item>
        <AddressCarousel :addresses="wallet.meta.addresses" />
        <q-separator />
        <Tokens />
        <q-separator />
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            accounts: []
        }
    },
    computed: {
        wallet() {
            return this.$state.wallet.current
        }
    }
})
</script>
