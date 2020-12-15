<template>
    <div class="column fit">
        <page-toolbar title="Success" />
        <div class="narrow-page col column self-center items-center q-pa-md no-wrap q-gutter-y-sm">
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
            <q-btn
                unelevated
                color="primary"
                class="w40"
                @click="close()"
            >Close</q-btn>
            <q-btn
                flat
                color="primary"
                class="w40"
                :to="{name:'activities'}"
            >View Activities</q-btn>
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
