<template>
    <q-slide-transition v-show="show">
        <div>
            <q-banner
                dark
                dense
                rounded
                class="bg-warning text-white q-mx-sm q-mb-sm"
            >
                {{$t('index.msg_backup')}}
                <template v-slot:action>
                    <q-btn
                        flat
                        :label="$t('common.dismiss')"
                        @click="$set(dismissed, wallet.id, true)"
                    />
                    <q-btn
                        flat
                        :label="$t('index.action_backup')"
                        :to="{name: 'backup'}"
                    />
                </template>
            </q-banner>
        </div>
    </q-slide-transition>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        wallet: Object as () => M.Wallet
    },
    data: () => {
        return {
            dismissed: {} as Record<number, boolean>
        }
    },
    computed: {
        show() {
            return !this.wallet.meta.backedUp &&
                !this.dismissed[this.wallet.id]
        }
    }
})
</script>
