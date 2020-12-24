<template>
    <div>
        <div class="q-px-lg">
            <div class="text-subtitle2 q-py-sm">
                Your Mnemonic Words
            </div>
        </div>
        <div class="row justify-around q-py-lg ">
            <div
                v-for="(item, index) in words"
                :key="index"
                class="col-4 text-center q-my-sm serif"
            >
                <span class="text-grey text-caption">{{index + 1}}.</span>
                <span class="text-bady1">{{item}}</span>
            </div>
        </div>
        <slot />
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        words: {
            type: Array as () => string[],
            default: []
        }
    }
})
</script>
