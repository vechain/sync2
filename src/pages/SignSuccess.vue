<template>
    <div class="column fit no-wrap">
        <page-toolbar title="Success" />
        <page-content
            class="q-my-auto text-center"
            padding
        >
            <p>
                <q-icon
                    size="4rem"
                    name="check_circle_outline"
                    color="positive"
                />
            </p>
            <p class="text-h6">You've signed the {{typeText}}</p>
        </page-content>
        <page-action>
            <q-btn
                outline
                color="primary"
                :to="{name:'activities'}"
                label="View Activities"
            />
            <q-btn
                unelevated
                color="primary"
                @click="close()"
                label="Close"
            />
        </page-action>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import PageToolbar from 'components/PageToolbar.vue'
import PageContent from 'src/components/PageContent.vue'
import PageAction from 'src/components/PageAction.vue'

export default Vue.extend({
    components: { PageToolbar, PageContent, PageAction },
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
