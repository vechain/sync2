<template>
    <q-item
        :dense="dense"
        v-on="$listeners"
        v-bind="$attrs"
    >
        <q-item-section avatar>
            <q-avatar
                v-if="icon"
                square
                :size="dense ? 'md' : ''"
            >
                <q-img
                    v-if="icon"
                    :src="icon"
                />
            </q-avatar>
            <q-avatar
                v-else
                :size="dense ? 'md' : ''"
                color="primary"
                text-color="white"
            >
                {{token.symbol.slice(0,1)}}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label
                lines="1"
                :class="{'text-body2': dense}"
            >{{token.symbol}}</q-item-label>
            <q-item-label
                caption
                lines="2"
                v-if="!dense"
            >
                {{token.name}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <span v-if="balance">{{balance | balance(token.decimals)}}</span>
            <span v-else> -- </span>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
import { urls } from 'src/consts'
export default Vue.extend({
    props: {
        token: Object as () => M.TokenSpec,
        balance: String as () => '',
        dense: Boolean
    },
    computed: {
        icon(): string {
            if (this.token && this.token.icon) {
                return `${urls.tokenRegistry}assets/${this.token.icon}`
            } else {
                return ''
            }
        }
    }
})
</script>
