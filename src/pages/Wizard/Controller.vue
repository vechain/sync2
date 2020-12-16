<template>
    <div>
        <q-carousel
            class="q-mx-auto narrow-page full-height"
            v-model="slide"
            transition-prev="slide-down"
            transition-next="slide-up"
            animated
        >
            <q-carousel-slide
                name="welcome"
                class="column q-gutter-y-md no-wrap"
            >
                <h4 class="q-mt-md q-mb-none">Welcome</h4>
                <feature-slides class="col" />
                <q-btn
                    class="w40 self-center"
                    unelevated
                    color="primary"
                    label="Get Started"
                    @click="onClickStart()"
                />
            </q-carousel-slide>
            <q-carousel-slide
                class="column q-gutter-y-md no-wrap"
                name="progress"
            >
                <h4 class="q-mt-md q-mb-none">Initialize</h4>
                <Progress
                    :current="progressStr"
                    class="col"
                />
                <h5 v-if="finished">Wallet created!</h5>
                <q-btn
                    v-if="finished"
                    class="w40 self-center"
                    unelevated
                    color="primary"
                    label="OK"
                    @click="$emit('done')"
                />
            </q-carousel-slide>
        </q-carousel>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import FeatureSlides from './FeatureSlides.vue'
import Progress from './Progress.vue'
import NewPasswordDialog from 'pages/NewPasswordDialog'
import { Vault } from 'core/vault'
import { genesises } from 'src/consts'

async function randomDelay<T>(p: Promise<T>, aboutSeconds: number) {
    const [r] = await Promise.all<T, unknown>([
        p,
        new Promise(resolve => setTimeout(resolve, (aboutSeconds * (1 + Math.random()) * 1000)))
    ])
    return r
}

export default Vue.extend({
    components: {
        Progress,
        FeatureSlides
    },
    data: () => {
        return {
            slide: 'welcome',
            progressStr: '',
            finished: false
        }
    },
    methods: {
        onClickStart() {
            this.$q.dialog({
                component: NewPasswordDialog,
                parent: this
            }).onOk(async (password: string) => {
                await this.init(password)
                this.finished = true
            })
        },
        async init(password: string) {
            this.slide = 'progress'
            await this.$nextTick()

            this.progressStr = 'Collecting entropy'
            const words = await randomDelay(Vault.generateMnemonic(16), 1)

            this.progressStr = 'Generating random seed'
            await randomDelay(Promise.resolve(), 0.5)

            this.progressStr = 'Creating wallet'
            await randomDelay(Promise.resolve(), 0.5)

            this.progressStr = 'Encrypting wallet'
            const vault = await randomDelay(Vault.createHD(words, password), 0.5)

            this.progressStr = 'Saving wallet'
            await randomDelay((async () => {
                const node0 = await vault.derive(0)
                const shadow = await Vault.shadowPassword(password)
                await this.$svc.config.savePasswordShadow(shadow)
                await this.$svc.wallet.insert({
                    gid: genesises.main.id,
                    vault: vault.encode(),
                    meta: {
                        name: 'My Wallet',
                        addresses: [node0.address]
                    }
                })
            })(), 0.5)

            this.progressStr = ''
        }
    }
})
</script>
