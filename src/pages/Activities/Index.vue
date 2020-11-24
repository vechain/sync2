<template>
    <div class="column fit">
        <page-toolbar title="Activities" />
        <div
            v-scrollDivider
            class="col overflow-auto"
        >
            <template v-if="activities.length">
                <component
                    v-for="a in activities"
                    :is="a.glob.type"
                    :activity="a"
                    :walletNames="walletNames"
                    :key="a.id"
                />
            </template>
            <template v-else>
                <div class="text-center q-px-xl column fit justify-center">
                    <div class="col-5">
                        <h6 class="text-h6 q-my-sm text-grey-8">No Activities Found</h6>
                        <div class="text-body1 text-grey-6">Activities that you’ve interacted with recently will appear here</div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Cert from './Cert.vue'
import Tx from './Tx.vue'
export default Vue.extend({
    components: {
        cert: Cert,
        tx: Tx
    },
    computed: {
        activities(): M.Activity<'tx' | 'cert'>[] {
            return this.$state.activity.list
        },
        walletNames(): { [key: number]: string } {
            const result: { [key: number]: string } = {}
            this.$state.wallet.list.map(w => {
                result[w.id] = w.meta.name
            })

            return result
        }
    }
})
</script>
