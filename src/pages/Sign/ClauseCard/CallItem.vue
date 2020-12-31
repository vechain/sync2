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
                <q-icon name="subdirectory_arrow_right" />
            </q-item-section>
            <q-item-section avatar>
                <address-label
                    :addr="op.to"
                    avatar
                />
            </q-item-section>
        </q-item>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressLabel from 'src/components/AddressLabel.vue'

export type OpCall = {
    type: 'call'
    to: string
}

export default Vue.extend({
    components: { AddressLabel },
    props: {
        op: Object as () => OpCall
    }
})
</script>
