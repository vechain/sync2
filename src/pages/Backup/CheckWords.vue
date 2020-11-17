<template>
    <div
        class="fit column"
    >
        <div class="q-px-md">
            <div class="text-subtitle2 q-py-sm">
                Please select the words in order.
            </div>
        </div>
        <div class="col q-px-lg q-pt-sm">
            <div
                v-for="row of verifyRowNum"
                :key="row"
                class="row q-px-lg q-py-sm q-col-gutter-sm rounded-borders"
            >
                <div
                    class="col-4 text-center"
                    v-for="i of groupSize"
                    :key="i"
                >
                    <span class="text-grey">{{i + groupSize * (row - 1) }}.</span>
                    <span class="serif">{{words[(i - 1) + groupSize * (row - 1)]}}</span>
                </div>
            </div>
            <div
                v-if="verifyRowNum < words.length / groupSize"
                class="row q-mt-sm q-px-lg q-py-sm q-col-gutter-sm rounded-borders"
                :class="isError ? 'bg-deep-orange-2' : 'bg-grey-2'"
            >
                <div
                    class="col-4 text-center"
                    v-for="i of groupSize"
                    :key="i"
                >
                    <span class="text-grey">{{i + groupSize * verifyRowNum }}.</span>
                    <span class="serif">{{verifyingItems && words[verifyingItems[i-1]]}}</span>
                </div>
            </div>
        </div>
        <div
            v-if="verifyRowNum < words.length / groupSize"
            class="q-mt-auto row justify-center q-pa-md q-col-gutter-md"
            style="bottom: 0"
        >
            <div
                class="col-4 text-center"
                v-for="(wordIndex, index) in nextGroupIndex"
                :key="index"
            >
                <q-btn
                    @click="onCheck(wordIndex)"
                    size="md"
                    outline
                    color="blue-9"
                    class="text-lowercase serif rounded-borders"
                    style="width: 100%"
                >{{words[wordIndex]}}</q-btn>
            </div>
        </div>
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
    },
    data() {
        return {
            verifyRowNum: 0,
            groupSize: 3,
            verifyingItems: null as number[] | null,
            isError: false
        }
    },
    computed: {
        nextGroupIndex(): number[] {
            const start = this.verifyRowNum * this.groupSize
            const indexs = [...this.words.keys()]
            indexs.splice(start, this.groupSize)

            const randomIndex = []
            for (let i = 0; i < this.groupSize; i++) {
                randomIndex.push(indexs[Math.floor(Math.random() * (this.words.length - this.groupSize))])
            }

            return [...this.words.map(
                (word, index) => { return index }
            ).slice(start, start + this.groupSize), ...randomIndex].map(wordIndex => {
                return {
                    wordIndex,
                    order: Math.random()
                }
            }).sort((item, nItem) => { return item.order - nItem.order }).map(item => {
                return item.wordIndex
            })
        }
    },
    methods: {
        onCheck(index: number) {
            if (!this.verifyingItems || this.verifyingItems.length === 3) {
                this.verifyingItems = []
                this.isError = false
            }
            this.verifyingItems.push(index)

            if (this.verifyingItems.length === 3) {
                const items = this.verifyingItems.map(item => this.words[item]).join('')
                const startIndex = this.groupSize * this.verifyRowNum
                const words = this.words.slice(startIndex, this.groupSize + startIndex).join('')
                if (items === words) {
                    this.verifyRowNum++
                    this.verifyingItems = []
                    this.verifyRowNum === 8 && this.$emit('checked')
                } else {
                    this.isError = true
                }
            }
        }
    }
})
</script>
