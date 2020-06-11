<template>
    <q-page class="bg-white">
        <div
            v-show="isAuthorized"
            style="max-width: 600px"
            class="q-mx-auto"
        >
            <template v-if="step === 1">
                <div class="row justify-around q-pt-lg ">
                    <div
                        v-for="(item, index) in words"
                        :key="item"
                        class="col-4 text-center q-my-sm serif"
                    >
                        <span class="text-grey">{{index + 1}}.</span>
                        <span class="text-weight-medium">{{item}}</span>
                    </div>
                </div>
                <div class="text-body2 text-grey q-pa-lg">
                    Recovery phrases are used to recover your wallet. Please write down in order and keep it in secure place.
                </div>
            </template>
            <template v-if="step === 2">
                <div style="min-height: 400px">
                    <div class="row justify-start">
                        <div
                            v-for="(item, index) in indexGroup"
                            :key="item"
                            class="col-4 text-center q-my-sm"
                        >
                            <q-btn
                                size="sm"
                                :label="words[item]"
                                class="text-lowercase serif"
                                @click="onUncheck(index)"
                                :color="words[item] === words[index] ? 'green' : 'red'"
                            />
                        </div>
                    </div>
                </div>
                <div class="row justify-around">
                    <div
                        v-for="item in nextGroupIndex"
                        :key="item"
                        class="col-4 text-center q-my-sm"
                    >
                        <q-btn
                            size="sm"
                            class="text-lowercase serif"
                            :disabled="indexGroup.includes(item)"
                            @click="onCheck(item)"
                            :label="words[item]"
                        />
                    </div>
                </div>
            </template>
            <div class="row justify-center q-mt-lg">
                <div class="col-8 text-center">
                    <q-btn
                        v-if="step === 1"
                        label="Next"
                        @click="onNext"
                        color="primary"
                    />
                    <q-btn
                        v-if="step === 2"
                        label="Back"
                        @click="onBack"
                        color="primary"
                    />
                </div>
            </div>
        </div>
    </q-page>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from '../core/vault'
export default Vue.extend({
    data: () => {
        return {
            words: null as string[] | null,
            step: 1,
            isAuthorized: false,
            verifyPosition: 0,
            indexGroup: [] as number[],
            groupSize: 3
        }
    },
    computed: {
        wallet() {
            return this.$state.wallet.current
        },
        nextGroupIndex() {
            const start = this.verifyPosition * this.groupSize
            return this.words!.map(
                (item, index) => { return index }
            ).slice(start, start + this.groupSize).sort(
                () => Math.random() - 0.5
            )
        }
    },
    async created() {
        const vault = await Vault.decode(this.wallet!.vault)
        try {
            this.$authenticate(async (p) => {
                this.isAuthorized = true
                const words = await vault.decrypt(p)
                this.words = (words as string).split(' ')
            })
        } catch (error) {
            console.warn(error)
            alert('something wrong')
            this.$router.back()
        }
    },
    methods: {
        onNext() {
            this.step++
        },
        onBack() {
            this.step--
        },
        onCheck(item: number) {
            this.indexGroup.push(item)
            this.verifyPosition = Math.floor(
                this.indexGroup.filter(
                    (item, index) => { return this.words![item] === this.words![index] }
                ).length / this.groupSize
            )
            if (this.verifyPosition === this.words!.length / this.groupSize) {
                this.$router.back()
            }
        },
        onUncheck(index: number) {
            if (this.verifyPosition * this.groupSize > index) {
                return
            }
            this.indexGroup.splice(index, 1)
        }
    }
})
</script>
