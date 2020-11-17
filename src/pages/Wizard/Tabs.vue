<template>
    <div>
        <q-tab-panels
            v-model="panel"
            animated
            swipeable
            class="text-center col"
        >
            <q-tab-panel
                :name="tab.name"
                v-for="tab in tabs"
                :key="tab.name"
                class="column justify-start"
            >
                <div>
                    <div class="column justify-center" style="height: 200px"><img :src="tab.img"/></div>
                    <div class="text-h6 col">{{tab.title}}</div>
                    <div class="q-mt-md text-body2">{{tab.content}}</div>
                </div>
            </q-tab-panel>
        </q-tab-panels>
        <div class="row justify-center q-mx-xl">
            <div
                v-for="i in tabs"
                :key="i.name"
                class="q-mx-sm"
            >
                <q-icon
                    @click="panel = i.name"
                    :class="i.name === panel ? 'text-blue-9' : 'text-grey'"
                    name="fiber_manual_record"
                ></q-icon>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            panel: 'sync',
            tabs: [{
                img: require('../../assets/logoSync.svg'),
                title: 'VeChain Sync2',
                name: 'sync',
                content: 'The brand new Sync enhanced design focuses on your experience'
            }, {
                img: require('../../assets/walletCards.svg'),
                title: 'Wallet Management',
                name: 'wallet',
                content: 'Manage assets with ease, anytime, anywhere.'
            }, {
                img: require('../../assets/signing.svg'),
                title: 'Signing Services',
                name: 'signing',
                content: 'Seamless user experience to sign transactions or certificates requested by the dapp.'
            }]
        }
    }
})
</script>
