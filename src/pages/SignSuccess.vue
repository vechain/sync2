<template>
    <div class="column fit">
        <page-toolbar title="Success" />
        <div class="col q-pa-md column flex-center">
            <p>
                <q-icon
                    size="4rem"
                    name="check_circle_outline"
                    color="positive"
                />
            </p>
            <p class="text-h6">You've signed the {{typeText}}</p>
        </div>
        <div class="narrow-page row justify-around q-mx-auto q-pa-sm">
            <q-btn
                outline
                color="primary"
                class="w40"
                :to="{name:'activities'}"
            >View Activities</q-btn>
            <q-btn
                unelevated
                color="primary"
                class="w40"
                @click="close()"
            >Close</q-btn>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageToolbar from 'components/PageToolbar.vue'
export default Vue.extend({
    components: {
        PageToolbar
    },
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
