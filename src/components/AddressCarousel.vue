<template>
    <q-carousel
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable
        animated
        :padding="true"
        :vertical="false"
        :arrows="false"
        :navigation="false"
        height="200px"
        class="bg-grey-1"
    >
        <q-carousel-slide
            :name="'style-' + item.index"
            class="row justify-center"
            v-for="item in addresses"
            :key="item.address"
        >
            <AddressCard
                class="col-10"
                :addressItem="item"
            />
        </q-carousel-slide>
    </q-carousel>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            slide: 'style-1'
        }
    },
    props: {
        addresses: Array // M.Wallet.Meta[addresses]
    }
})
</script>
