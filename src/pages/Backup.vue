<template>
    <div
        v-scrollDivider
        class="fit overflow-auto"
        v-if="words && words.length"
    >
        <div
            style="max-width: 500px"
            class="q-mx-auto"
        >
            <template v-if="step === 1">
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
            </template>
            <template v-if="step === 2">
                <div class="q-px-md">
                    <div class="text-subtitle2 q-py-sm">
                        Please select the words in order.
                    </div>
                </div>
                <div class="q-px-lg">
                    <div
                        v-for="row of verifyRowNum"
                        :key="row"
                        class="row q-mt-sm q-px-lg q-py-sm q-col-gutter-sm rounded-borders bg-grey-2"
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
                    class="absolute row justify-center q-pa-md q-col-gutter-md"
                    style="bottom: 0"
                >
                    <div
                        class="col-4 text-center"
                        v-for="(item, index) in nextGroupIndex"
                        :key="index"
                    >
                        <q-btn
                            @click="onCheck(item)"
                            size="md"
                            outline
                            color="blue-9"
                            class="text-lowercase serif rounded-borders"
                            style="width: 100%"
                        >{{words[item]}}</q-btn>
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
                        The mnemonic words store all the information needed at any point in time to recover your wallet.
                    </div>
                    <div class="text-body2 text-grey q-py-sm">
                        The mnemonic words must be stored in a <strong class="text-black">secure place</strong>. It allows you to regain wallet access in a scenario where your device is lost, stolen, or unusable due to any reason.
                    </div>
                </div>
            </template>
            <div class="justify-center q-mt-lg q-mx-md">
                <div class="col-8 text-center">
                    <q-btn
                        v-if="step === 1"
                        class="text-capitalize full-width"
                        label="I've written it down"
                        @click="onNext"
                        color="blue-9"
                    />
                    <q-btn
                        v-if="step === 3"
                        class="text-capitalize full-width"
                        label="Done"
                        @click="onDone"
                        color="blue-9"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Vault } from '../core/vault'
export default Vue.extend({
    data: () => {
        return {
            words: null as string[] | null,
            step: 1,
            verifyRowNum: 0,
            verifyingItems: null as number[] | null,
            isError: false,
            groupSize: 3
        }
    },
    computed: {
        wallet() {
            return this.$state.wallet.current
        },
        nextGroupIndex() {
            const start = this.verifyRowNum * this.groupSize
            const result = []
            for (let i = 0; i < this.groupSize; i++) {
                result.push(Math.floor(Math.random() * this.words!.length))
            }
            return [...this.words!.map(
                (item, index) => { return index }
            ).slice(start, start + this.groupSize), ...result].map(item => {
                return {
                    v: item,
                    order: Math.random()
                }
            }).sort((item, nItem) => { return item.order - nItem.order }).map(item => {
                return item.v
            })
        }
    },
    async created() {
        try {
            const vault = await Vault.decode(this.wallet!.vault)
            const pin = await this.$authenticate((p) => {
                return Promise.resolve(p)
            })
            const words = await vault.decrypt(pin)
            this.words = (words as string).split(' ')
        } catch (error) {
            console.warn(error)
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
        onDone() {
            const meta: M.Wallet.Meta = {
                ...this.wallet!.meta,
                backedUp: true
            }
            this.$loading(
                async () => {
                    await this.$storage.wallets.update({ id: this.wallet!.id }, {
                        meta: JSON.stringify(meta)
                    })
                }
            )

            this.$router.back()
        },
        onCheck(index: number) {
            if (!this.verifyingItems || this.verifyingItems.length === 3) {
                this.verifyingItems = []
                this.isError = false
            }
            this.verifyingItems.push(index)

            if (this.verifyingItems.length === 3) {
                const items = this.verifyingItems.map(item => this.words![item]).join('')
                const startIndex = this.groupSize * this.verifyRowNum
                const words = this.words!.slice(startIndex, this.groupSize + startIndex).join('')
                if (items === words) {
                    this.verifyRowNum++
                    this.verifyingItems = []
                    this.verifyRowNum === 8 && this.step++
                } else {
                    this.isError = true
                }
            }
        }
    }
})
</script>
