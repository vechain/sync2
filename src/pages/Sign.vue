<template>
    <div class="fit column flex-center">
        <async
            :fn="getInput"
            v-slot="{data, error, pending, reload}"
        >
            <q-avatar
                square
                size="lg"
                v-show="data"
            >
                <q-img :src="favicon" />
            </q-avatar>
            <div v-if="pending">
                fetching input...
            </div>
            <template v-if="error">
                <div>
                    error: {{error}}
                </div>
                <q-btn @click="reload">Reload</q-btn>
            </template>
            <template v-if="data">
                <div> origin: {{origin}}</div>
                <div> type: {{data.type}}</div>
                <q-btn
                    v-if="!proceeding&&!output"
                    @click="proceed(data)"
                >Proceed</q-btn>
            </template>
        </async>
        <async
            v-if="output"
            :fn="postOutput"
            v-slot="{error, pending}"
        >
            <q-btn @click="$router.back()">done</q-btn>
            <div v-if="pending">posting output...</div>
            <div v-if="error">error: {{error}} </div>
        </async>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import * as V from 'validator-ts'
import { urls } from 'src/consts'

type Input = {
    type: 'tx' | 'cert'
    gid?: string // genesis id which to specify network. defaults to mainnet
    body: object
}

namespace Input {
    export const scheme: V.Scheme<Input> = {
        type: v => (v === 'tx' || v === 'cert') ? '' : `unsupported type '${v}'`,
        gid: v => (!v || /^0x[0-9a-f]{64}$/i.test(v)) ? '' : `invalid gid '${v}'`,
        body: v => v instanceof Object ? '' : 'body requires object type'
    }
}

type Output = {
    error?: Error
    body?: object
}

export default Vue.extend({
    props: {
        rid: String // the request id
    },
    data: () => {
        return {
            origin: '',
            proceeding: false,
            output: null as Output | null
        }
    },
    computed: {
        favicon(): string { return `${urls.tos}${this.rid}/icon?size=48..96..128` }
    },
    methods: {
        async getInput() {
            const resp = await this.$axios.get(urls.tos + this.rid)
            const input = V.validate<Input>(resp.data, Input.scheme)
            this.origin = resp.headers['x-data-origin']
            // TODO validate body
            return input
        },
        async proceed(input: Input) {
            const { type, gid, body } = input
            const output: Output = {}
            try {
                this.proceeding = true
                if (type === 'tx') {
                    output.body = await this.$signTx(gid || '', body as M.TxRequest)
                } else if (type === 'cert') {
                    output.body = await this.$signCert(gid || '', body as M.CertRequest)
                }
            } catch (err) {
                output.error = err
            } finally {
                this.proceeding = false
                this.output = output
            }
        },
        async postOutput() {
            await this.$axios.post(urls.tos + this.rid + '-out', this.output)
            return true
        }
    }
})
</script>
