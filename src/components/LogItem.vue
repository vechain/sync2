<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section class="q-pr-none" avatar>
            <q-avatar
                v-if="icon"
                square
                :size="dense ? 'sm' : 'md'"
            >
                <q-img
                    v-if="icon"
                    :src="icon"
                />
            </q-avatar>
            <q-avatar
                v-else
                :size="dense ? 'sm' : 'md'"
                color="primary"
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label
                lines="1"
                :class="{'text-caption': dense}"
                class="monospace"
            > {{isReceive ? 'From: ' : 'To: '}} {{ (isReceive ? log.sender : log.recipient) | checksum | abbrev(8,6)}}</q-item-label>
            <q-item-label
                caption
                lines="2"
                v-if="!dense"
            >
                {{log.meta.blockTimestamp | ago}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <span :class="isReceive ? 'text-green' : 'text-red'">
                <span v-if="amount">{{isReceive ? '+' : '-'}} {{amount | balance(token.decimals)}}</span>
                <span v-else> -- </span>
            </span>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'
export default Vue.extend({
    props: {
        log: Object as () => M.TransferLog,
        address: String,
        dense: Boolean
    },
    computed: {
        token(): M.TokenSpec {
            return this.log.token
        },
        amount(): string | number {
            return this.log.amount
        },
        isReceive(): boolean {
            return this.address === this.log.recipient
        },
        icon(): string {
            if (this.log && this.log.token.icon) {
                return `${urls.tokenRegistry}assets/${this.log.token.icon}`
            } else {
                return ''
            }
        }
    }
})
</script>
