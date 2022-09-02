<template>
    <div class="column fit no-wrap">
        <page-toolbar :title="$t('feeDelegation.title')" />
        <page-content class="q-my-auto text-center" padding>
            <p>
                <q-icon size="4rem" name="check_circle_outline" color="positive" />
            </p>
            <p class="text-h6">{{ $t('feeDelegation.msg_remote_config_accepted') }}</p>
        </page-content>
        <page-action>
            <q-btn unelevated color="primary" @click="close()" :label="$t('common.close')" />
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
    methods: {
        close() {
            this.$backOrHome()
        }
    }
})
</script>
