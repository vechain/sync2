<template>
    <div>
        <div class="q-px-lg">
            <div class="text-subtitle2 q-py-sm">
                {{`These ${words.length} words will be used to recover your wallet. Please write them down in the given order and keep it safe in a secure place.`}}
            </div>
        </div>
        <div class="row justify-around q-pt-lg ">
            <div
                v-for="(item, index) in words"
                :key="index"
                class="col-4 text-center q-my-sm serif"
            >
                <span class="text-grey">{{index + 1}}.</span>
                <span class="text-weight-medium">{{item}}</span>
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
