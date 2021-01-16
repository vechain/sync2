<template>
    <div class="fit column no-wrap">
        <p>{{$t('backup.msg_confirm_your_mnemonic')}}</p>
        <div class="col overflow-auto">
            <div class="bg-yellow-1 q-px-sm">
                <div
                    v-for="row of verifyRowNum"
                    :key="row"
                    class="row"
                >
                    <div
                        class="col-4 row q-py-sm"
                        v-for="i of groupSize"
                        :key="i"
                    >
                        <div class="col-2 text-caption text-grey text-right q-pr-sm">{{groupSize * (row - 1) + i}}.</div>
                        <div class="col-10 text-h6 serif">{{words[(i - 1) + groupSize * (row - 1)]}}</div>
                    </div>
                </div>
                <div
                    v-if="verifyRowNum < words.length / groupSize"
                    class="row"
                >
                    <div
                        class="col-4 row q-py-sm"
                        v-for="i of groupSize"
                        :key="i"
                    >
                        <div class="col-2 text-caption text-grey text-right q-pr-sm">{{i + groupSize * verifyRowNum }}.</div>
                        <div
                            class="col-10 text-h6 serif"
                            :class="{'text-negative' :isError,' text-grey': !isError}"
                        >{{verifyingItems && words[verifyingItems[i-1]]}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="verifyRowNum < words.length / groupSize"
            class="row q-col-gutter-sm q-pa-sm"
        >
            <div
                v-for="(wordIndex, index) in nextGroupIndex"
                :key="index"
                class="col-4"
            >
                <q-btn
                    class="full-width serif"
                    @click="onCheck(wordIndex)"
                    outline
                    color="primary"
                >{{words[wordIndex]}}</q-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
const GroupSize = 3
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
            verifyingItems: null as number[] | null,
            isError: false
        }
    },
    computed: {
        groupSize(): number {
            return GroupSize
        },
        nextGroupIndex(): number[] {
            const start = this.verifyRowNum * GroupSize
            const indexs = [...this.words.keys()]
            indexs.splice(start, GroupSize)

            const randomIndex = []
            for (let i = 0; i < GroupSize; i++) {
                randomIndex.push(indexs[Math.floor(Math.random() * (this.words.length - GroupSize))])
            }

            return [...this.words.map(
                (word, index) => { return index }
            ).slice(start, start + GroupSize), ...randomIndex].map(wordIndex => {
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
            if (!this.verifyingItems || this.verifyingItems.length === GroupSize) {
                this.verifyingItems = []
                this.isError = false
            }
            this.verifyingItems.push(index)

            if (this.verifyingItems.length === GroupSize) {
                const items = this.verifyingItems.map(item => this.words[item]).join('')
                const startIndex = GroupSize * this.verifyRowNum
                const words = this.words.slice(startIndex, GroupSize + startIndex).join('')
                if (items === words) {
                    this.verifyRowNum++
                    this.verifyingItems = []
                    this.verifyRowNum === (this.words.length / GroupSize) && this.$emit('checked')
                } else {
                    this.isError = true
                }
            }
        }
    }
})
</script>
