<template>
    <q-page>
        <q-item class="q-px-lg">
            <q-item-section>
                <span class="text-h6">{{wallet}}</span>
            </q-item-section>
            <q-item-section side>
                <q-btn
                    color="white"
                    text-color="black"
                    flat
                    dense
                    round
                    icon="more_horiz"
                    aria-label="More"
                    @click="showMenu = !showMenu"
                >
                    <q-menu v-show="false">
                        <q-list>
                            <q-item>
                                <q-item-section>Accounts</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Activity</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Backup</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>Delete</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-item-section>
        </q-item>
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
                :name="'style-' + i"
                class="row justify-center"
                v-for="i in 5"
                :key="i"
            >
                <AccountCard
                    class="col-10"
                    :name="i"
                />
            </q-carousel-slide>
        </q-carousel>
        <q-list>
            <q-separator />
            <template v-for="i in 6">
                <q-item :key="i">
                    <q-item-section avatar>
                        <q-avatar>
                            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
                        </q-avatar>
                    </q-item-section>

                    <q-item-section>
                        <q-item-label lines="1">VET</q-item-label>
                        <q-item-label
                            caption
                            lines="2"
                        >
                            VeChainCoin
                        </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        {{(12312313).toLocaleString()}}
                    </q-item-section>
                </q-item>
                <q-separator
                    v-if="i !== 6"
                    :key="i + 's'"
                    inset="item"
                />
            </template>
        </q-list>
        <q-separator />
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            showMenu: false,
            slide: 'style-1'
        }
    },
    computed: {
        wallet() {
            return 'wallet ' + this.$route.params.id
        }
    }
})
</script>
