<template>
    <div>
        <p>{{$t('backup.label_your_mnemonic')}}</p>
        <div class="row bg-yellow-1 q-px-sm">
            <div
                v-for="(item, index) in words"
                :key="index"
                class="col-4 row q-py-sm"
            >
                <div class="col-2 text-caption text-grey text-right q-pr-sm">{{index+1}}.</div>
                <div class="col-10 text-h6 serif">{{item}}</div>
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
