<template>
    <q-carousel
        v-model="slide"
        swipeable
        animated
        navigation
        arrows
        transition-prev="slide-right"
        transition-next="slide-left"
        control-color="primary"
        padding
    >
        <q-carousel-slide
            v-for="item in slides"
            :key="item.name"
            :name="item.name"
            class="column no-wrap q-gutter-y-md text-center"
        >
            <img
                class="q-my-auto"
                style="max-height:200px;min-height:32px;max-width:100%"
                draggable="false"
                :src="item.img"
            />
            <div class="text-h6">{{item.title}}</div>
            <div class="text-body2">{{item.content}}</div>
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
import Vue from 'vue'

const slides = [{
    img: require('assets/logoSync.svg'),
    title: 'VeChain Sync2',
    name: 's1',
    content: 'The brand new Sync enhanced design focuses on your experience'
}, {
    img: require('assets/walletCards.svg'),
    title: 'Wallet Management',
    name: 's2',
    content: 'Manage assets with ease, anytime, anywhere.'
}, {
    img: require('assets/signing.svg'),
    title: 'Signing Services',
    name: 's3',
    content: 'Seamless user experience to sign transactions or certificates requested by the dapp.'
}]

export default Vue.extend({
    data() {
        return {
            slide: slides[0].name,
            slides
        }
    }
})
</script>
