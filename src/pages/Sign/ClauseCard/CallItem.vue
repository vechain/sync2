<template>
    <div>
        <q-item dense>
            <q-item-section avatar>
                <q-icon
                    name="mdi-function-variant"
                    size="sm"
                />
            </q-item-section>
        </q-item>
        <q-item dense>
            <q-item-section
                top
                class="items-center"
            >
                <q-icon name="mdi-subdirectory-arrow-right" />
            </q-item-section>
            <q-item-section avatar>
                <address-avatar
                    :addr="op.to"
                    size="1em"
                />
            </q-item-section>
            <q-item-section avatar>
                <q-item-label class="ellipsis">
                    <address-label :addr="op.to" />
                </q-item-label>
            </q-item-section>
        </q-item>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressLabel from 'src/components/AddressLabel.vue'
import AddressAvatar from 'src/components/AddressAvatar.vue'

export type OpCall = {
    type: 'call'
    to: string
}

export default Vue.extend({
    components: { AddressLabel, AddressAvatar },
    props: {
        op: Object as () => OpCall
    }
})
</script>
