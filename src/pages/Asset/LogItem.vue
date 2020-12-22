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
                :class=" 'bg-' + logStyle.color"
                class="text-white truncate-chip-labels"
            >
                <q-icon :name="logStyle.icon" />
            </q-chip>
        </q-item-section>
        <q-item-section>
            <q-item-label
                lines="1"
                class="text-body2 monospace"
            >
                {{ (address === log.recipient ? log.sender : log.recipient) | checksum | abbrev(8,6)}}
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
            <span :class="'text-' + logStyle.color">
                <span v-if="amount">{{logStyle.mark}} {{amount | balance(token.decimals)}}</span>
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
        logStyle(): { icon: string, color: string, mark: string } {
            if (this.log.recipient === this.log.sender) {
                return {
                    icon: 'swap_horiz',
                    color: 'grey-9',
                    mark: ''
                }
            } else if (this.address === this.log.recipient) {
                return {
                    icon: 'north_west',
                    color: 'green',
                    mark: '+'
                }
            } else {
                return {
                    icon: 'south_east',
                    color: 'red',
                    mark: '-'
                }
            }
        }
    }
})
</script>
