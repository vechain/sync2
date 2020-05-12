<template>
    <q-item
        clickable
        tag="a"
        target="_blank"
        :href="link"
    >
        <q-item-section
            v-if="icon"
            avatar
        >
            <q-icon :name="icon" />
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ title }}</q-item-label>
            <q-item-label caption>
                {{ caption }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    props: {
        title: { type: String },
        caption: { type: String, default: '' },
        link: { type: String, default: '#' },
        icon: { type: String, default: '' }
    }
})
</script>
