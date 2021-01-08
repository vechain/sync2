<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        position="bottom"
    >
        <q-card class="full-width">
            <q-toolbar>
                <q-toolbar-title class="text-center">{{$t('common.clause')}} · {{index+1}}</q-toolbar-title>
            </q-toolbar>
            <q-list padding>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>{{$t('common.comment')}}</q-item-label>
                        <q-item-label>{{clause.comment || 'N/A'}}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-separator inset />
                <q-item>
                    <q-item-section>
                        <q-item-label caption>{{$t('common.to')}}</q-item-label>
                        <q-item-label style="word-break:break-all">
                            <address-label
                                :addr="clause.to"
                                full
                            >null</address-label>
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>{{$t('common.value')}} (wei)</q-item-label>
                        <q-item-label>
                            <amount-label
                                :value="clause.value"
                                :fixed="0"
                            />
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-item-label caption>{{$t('common.data')}}</q-item-label>
                        <q-item-label>
                            <q-input
                                v-if="clause.data && clause.data.length > 2"
                                dense
                                class="monospace"
                                type="textarea"
                                standout
                                readonly
                                :value="clause.data"
                            />
                            <template v-else>N/A</template>
                        </q-item-label>
                    </q-item-section>
                </q-item>

            </q-list>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { QDialog } from 'quasar'
import AddressLabel from 'src/components/AddressLabel.vue'
import AmountLabel from 'src/components/AmountLabel.vue'
export default Vue.extend({
    components: { AddressLabel, AmountLabel },
    props: {
        index: Number,
        clause: Object as () => Connex.Vendor.TxMessage[0]
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() }
    }
})
</script>
