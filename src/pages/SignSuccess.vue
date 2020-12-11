<template>
    <div class="column fit">
        <page-toolbar title="Success" />
        <div class="col column q-pa-md no-wrap">
            <div class="q-my-auto text-center">
                <p>
                    <q-icon
                        size="4rem"
                        name="check_circle_outline"
                        color="positive"
                    />
                </p>
                <p class="text-h6">You've signed the {{typeText}}</p>
            </div>
            <div class="row justify-evenly self-stretch q-mt-md q-gutter-sm">
                <q-btn
                    unelevated
                    color="primary"
                    class="col-6 col-sm-3"
                    @click="close()"
                >Close</q-btn>
                <div class="col-12" />
                <q-btn
                    flat
                    color="primary"
                    class="col-6 col-sm-3"
                    :to="{name:'activities'}"
                >View Activities</q-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        type: String as () => 'tx' | 'cert'
    },
    computed: {
        typeText() {
            switch (this.type) {
                case 'tx':
                    return 'Transaction'
                case 'cert':
                    return 'Certificate'
                default:
                    return '??'
            }
        }
    },
    methods: {
        close() {
            this.$backOrHome()
        }
    }
})
</script>
