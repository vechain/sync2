<template>
    <div class="column fit no-wrap">
        <page-toolbar :title="$t('sign.title_success')" />
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
            <p class="text-h6">{{$t('sign.msg_signed')}} {{typeText}}</p>
        </page-content>
        <page-action>
            <q-btn
                outline
                color="primary"
                :to="{name:'activities'}"
                :label="$t('sign.action_view_activities')"
            />
            <q-btn
                unelevated
                color="primary"
                @click="close()"
                :label="$t('common.close')"
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
                    return this.$t('common.transaction')
                case 'cert':
                    return this.$t('common.certificate')
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
