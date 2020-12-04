<template>
    <div>
        <div>Network</div>
        <div class="q-gutter-sm">
            <q-radio
                v-for="item in nodes"
                :key="item.genesis.id"
                v-model="gid"
                :val="item.genesis.id"
                class="text-capitalize"
                :label="item.genesis.id | net"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            gid: ''
        }
    },
    model: {
        prop: 'val',
        event: 'change'
    },
    created() {
        this.gid = this.val
    },
    props: {
        nodes: Array as () => M.Node[],
        val: String
    },
    watch: {
        gid(v: string) {
            this.$emit('change', v)
        }
    }
})
</script>
