<template>
    <q-page class="bg-white">
        <div
            v-show="words.length"
            style="max-width: 600px"
            class="q-mx-auto q-mt-lg"
        >
            <template v-if="step === 1">
                <div class="q-px-lg">
                    <span class="text-subtitle2 q-py-sm">Backup mnemonic</span>
                    <div class="text-body2 text-grey q-py-sm">
                        These 24 words are used to recover your wallet. Please write down in order and keep it in a secure place.
                    </div>
                </div>
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
            </template>
            <template v-if="step === 2">
                <div class="q-px-lg">
                    <span class="text-subtitle2 q-py-sm">Confirm your mnemonic words</span>
                    <div class="text-body2 text-grey q-py-sm">
                        Please choose mnemonic words in order and make sure your written mnemonic was correct written.
                    </div>
                </div>
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
            <template v-if="step === 3">
                <div class="q-pa-lg">
                    <div class="q-pl-sm q-pb-md">
                        <q-icon
                            size="50px"
                            name="verified_user"
                        />
                    </div>
                    <span class="text-h4">Your wallet is now backed up</span>
                    <div class="text-body2 text-grey q-py-md">
                        The mnemonic words stores all the information that is needed at any point in time to recover your wallet.
                    </div>
                    <div class="text-body2 text-grey q-py-sm">
                        The mnemonic words should be <strong class="text-black">stored in a secure place</strong>. It ensures you have had a backup in a scenario where your device breaks down or becomes unusable due to any reason.
                    </div>
                </div>
            </template>
            <div class="row justify-center q-mt-lg">
                <div class="col-8 text-center">
                    <q-btn
                        v-if="step === 1"
                        class="text-capitalize"
                        label="I've written it down"
                        @click="onNext"
                        color="black"
                    />
                    <q-btn
                        v-if="step === 2"
                        class="text-capitalize"
                        label="Check Mnemonic again"
                        @click="onBack"
                        color="black"
                    />
                    <q-btn
                        v-if="step === 3"
                        class="text-capitalize"
                        label="Done"
                        @click="$router.back()"
                        color="black"
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
                this.step++
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
