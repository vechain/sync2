<template>
    <div
        v-scrollDivider
        class="fit overflow-auto"
    >
        <template v-if="activities.length">
            <ActivityItem
                v-for="a in activities"
                :item="a"
                :walletNames="walletNames"
                :key="a.id"
            />
        </template>
        <template v-else>
            <div class="text-center q-px-xl column fit justify-center">
                <div class="col-5">
                    <h6 class="text-h6 q-my-sm text-grey-8">No activity found</h6>
                    <div class="text-body1 text-grey-6">Recent activity that you’ve interacted with recently will appear here</div>
                </div>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
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
