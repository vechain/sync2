<template>
    <q-page class="bg-white">
        <h5 class="q-ma-none q-pa-md">General</h5>
        <q-list>
            <q-item>
                <q-item-section avatar>
                    <q-avatar
                        color="primary"
                        text-color="black"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Change Master Code</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right"></q-icon>
                </q-item-section>
            </q-item>
            <q-separator inset="item" />
            <q-item>
                <q-item-section avatar>
                    <q-avatar
                        color="primary"
                        text-color="black"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">Face ID/ Touch ID</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-toggle
                        v-model="green"
                        color="green"
                    />
                </q-item-section>
            </q-item>
            <q-separator inset="item" />
            <q-item>
                <q-item-section avatar>
                    <q-avatar
                        color="primary"
                        text-color="black"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">Appearence</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right"></q-icon>
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-item-label> Tokens </q-item-label>
                    <q-item-label caption> Selected token will be showing the balance of account balance </q-item-label>
                </q-item-section>
            </q-item>
            <q-item :to="{name: 'tokens'}">
                <q-item-section avatar>
                    <q-avatar
                        color="primary"
                        text-color="black"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">Token List</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right"></q-icon>
                </q-item-section>
            </q-item>
        </q-list>
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            green: false
        }
    }
})
</script>
