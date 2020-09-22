<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-chip
                square
                dense
                :class="isReceive ? 'bg-green q-px-md' : 'bg-red q-px-sm'"
                class="text-white truncate-chip-labels"
            >
                {{isReceive ? 'IN' : 'OUT'}}
            </q-chip>
        </q-item-section>
        <q-item-section>
            <q-item-label
                lines="1"
                class="text-body2 monospace"
            >
                {{ (isReceive ? log.sender : log.recipient) | checksum | abbrev(8,6)}}
            </q-item-label>
            <q-item-label
                caption
                lines="2"
                v-if="!dense"
            >
                {{log.meta.blockTimestamp * 1000 | dateTime}}
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
        }
    }
})
</script>
