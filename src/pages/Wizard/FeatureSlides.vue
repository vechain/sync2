<template>
    <q-carousel
        v-model="slide"
        swipeable
        animated
        navigation
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

export default Vue.extend({
    data: () => {
        return {
            slide: 's1'
        }
    },
    computed: {
        slides() {
            return [{
                img: require('assets/sync-logo.svg'),
                title: this.$t('wizard.title_feature_1'),
                name: 's1',
                content: this.$t('wizard.msg_feature_1').toString()
            }, {
                img: require('assets/feature-2.svg'),
                title: this.$t('wizard.title_feature_2'),
                name: 's2',
                content: this.$t('wizard.msg_feature_2').toString()
            }, {
                img: require('assets/feature-3.svg'),
                title: this.$t('wizard.title_feature_3'),
                name: 's3',
                content: this.$t('wizard.msg_feature_3').toString()
            }]
        }
    }
})
</script>
