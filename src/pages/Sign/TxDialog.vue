<template>
    <q-dialog
        ref="dialog"
        @hide="$emit('hide')"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card class="column no-wrap">
            <page-toolbar
                title="Transaction"
                icon="close"
                :gid="gid"
                @action="hide()"
            />
            <page-content
                class="col q-pa-sm bg-grey-3"
                innerClass="q-gutter-y-sm"
            >
            </page-content>
            <page-content size="xs">
                <q-banner
                    v-if="signerError"
                    dark
                    dense
                    rounded
                    class="bg-negative q-ma-sm"
                >{{signerError}}</q-banner>
                <gas-fee-bar :fee="fee">
                    <priority-selector
                        v-model="gasPriceCoef"
                        :calcFee="calcFee"
                    />
                </gas-fee-bar>
                <signer-selector
                    v-if="wallet"
                    :signer="signer"
                    :groups="signerGroups"
                    @select="signer=$event"
                />
            </page-content>
            <page-action class="q-mt-lg">
                <q-btn
                    v-if="wallet"
                    unelevated
                    color="primary"
                    label="Sign"
                    @click="onClickSign()"
                />
                <q-btn
                    v-else
                    outline
                    color="primary"
                    label="Close"
                    @click="hide()"
                />
            </page-action>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">
import Common from './Common'
import { QDialog } from 'quasar'
import PageToolbar from 'src/components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'
import SignerSelector from './SignerSelector.vue'
import { estimateGas, EstimateGasResult, calcFee } from './helper'
import PrioritySelector from './PrioritySelector.vue'
import GasFeeBar from './GasFeeBar.vue'

export default Common.extend({
    components: { PageToolbar, PageContent, PageAction, SignerSelector, PrioritySelector, GasFeeBar },
    props: {
        req: Object as () => M.TxRequest
    },
    data() {
        return {
            gasPriceCoef: 0
        }
    },
    computed: {
        calcFee() {
            const est = this.estimation
            if (!est) {
                return null
            }
            return (coef: number) => {
                return calcFee(est.gas, est.baseGasPrice, coef).div(1e18).toFormat(2)
            }
        },
        fee(): string | null {
            return this.calcFee ? this.calcFee(this.gasPriceCoef) : null
        }
    },
    asyncComputed: {
        estimation(): Promise<EstimateGasResult | null> {
            if (!this.wallet) {
                return Promise.resolve(null)
            }
            const thor = this.$svc.bc(this.gid).thor
            return estimateGas(
                thor,
                this.req.message,
                this.req.options.gas || 0,
                this.signer,
                this.req.options.delegator && this.req.options.delegator.signer)
        }
    },
    methods: {
        // method is REQUIRED by $q.dialog
        show() { (this.$refs.dialog as QDialog).show() },
        // method is REQUIRED by $q.dialog
        hide() { (this.$refs.dialog as QDialog).hide() },

        ok(result: M.CertResponse) {
            this.$emit('ok', result)
            this.hide()
        },
        onClickSign() {

        }
    }
})
</script>
