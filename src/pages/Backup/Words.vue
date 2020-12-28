<template>
    <div>
        <div class="text-h6 q-pb-md">
            {{$t('backup.label_your_mnemonic')}}
        </div>
        <div class="row justify-around q-py-sm bg-grey-2 round-border">
            <div
                v-for="(item, index) in words"
                :key="index"
                class="col-4 text-center q-my-sm serif"
            >
                <span class="text-h6">{{item}}</span>
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
