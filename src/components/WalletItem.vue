<template>
    <q-item
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-item-section
            avatar
            top
        >
            <q-avatar
                color="primary"
                text-color="white"
                class="text-uppercase"
            >{{avatarString}}</q-avatar>
        </q-item-section>

        <q-item-section>
            <q-item-label
                lines="1"
                class="text-capitalize"
            >{{name}}</q-item-label>
            <q-item-label caption>{{caption}}</q-item-label>
        </q-item-section>
    </q-item>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        name: String,
        caption: String
    },
    computed: {
        avatarString() {
            if (this.name) {
                const parts = this.name
                    .split(' ')
                    .map(p => p.trim()[0])
                    .filter(p => !!p)
                return parts.slice(0, 2).join('')
            }
            return ''
        }
    }
})
</script>
