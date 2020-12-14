<template>
    <div class="column fit">
        <page-toolbar title="Settings" />
        <div
            v-scrollDivider
            class="col overflow-auto"
        >
            <h5 class="q-ma-none q-pa-md">General</h5>
            <q-list>
                <q-item
                    clickable
                    :to="{name: 'reset-pin-code'}"
                >
                    <q-item-section avatar>
                        <q-avatar
                            color="primary"
                            text-color="black"
                        />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Change Password</q-item-label>
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
                        <q-item-label lines="1">Biometric Authentication</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-toggle
                            color="green"
                            :value="bioPassSaved"
                            :disable="bioPassSaved===null"
                            @input="toggleBioPass"
                        />
                    </q-item-section>
                </q-item>
                <q-separator inset="item" />
                <q-item :to="{name: 'tokens-setting'}">
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
                <q-separator inset="item" />
                <q-item :to="{name: 'nodes-setting'}">
                    <q-item-section avatar>
                        <q-avatar
                            color="primary"
                            text-color="black"
                        />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">Nodes</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="keyboard_arrow_right"></q-icon>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { BioPass } from 'src/utils/bio-pass'

export default Vue.extend({
    asyncComputed: {
        bioPass() {
            return BioPass.open()
        }
    },
    computed: {
        bioPassSaved(): boolean | null {
            return this.bioPass ? this.bioPass.saved : null
        }
    },
    methods: {
        // TODO faceID
        async toggleBioPass(newVal: boolean) {
            const bioPass = this.bioPass
            if (!bioPass) {
                return
            }

            try {
                if (newVal) {
                    const password = await this.$authenticate()
                    await bioPass.save(password)
                } else {
                    await bioPass.delete()
                }
                this.$asyncComputed.bioPass.update()
            } catch (err) {
                console.warn(err)
            }
        }
    }
})
</script>
