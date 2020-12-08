<template>
    <div class="fit column no-warp">
        <page-toolbar title="Nodes">
            <q-btn
                class="q-ml-auto"
                flat
                dense
                round
                icon="add"
                @click="onAdd"
            />
        </page-toolbar>
        <q-list>
            <template v-for="(group, gi) in groups">
                <q-separator
                    v-if="gi > 0"
                    :key="`s-${gi}`"
                    spaced
                />
                <q-item-label
                    header
                    :key="`h-${gi}`"
                >{{networkName(group.list[0])}}</q-item-label>
                <template v-for="(node, i) in group.list">
                    <q-separator
                        v-if="i > 0"
                        :key="`s-${gi}-${i}`"
                        spaced
                        inset="item"
                    />
                    <q-item
                        :key="`i-${gi}-${i}`"
                        clickable
                        @click="onSelect(node)"
                    >
                        <q-item-section avatar>
                            <q-icon
                                color="blue-7"
                                name="check"
                                v-show="group.selection === i"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label lines="1">{{node.url | urlHost}}</q-item-label>
                            <q-item-label caption>{{node.url}}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn
                                size="12px"
                                @click.prevent.stop="onDelete(node)"
                                flat
                                dense
                                v-if="canDelete(node)"
                                round
                                icon="delete_forever"
                            />
                        </q-item-section>
                    </q-item>
                </template>
            </template>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Add from './Add.vue'
import { genesises } from 'src/consts'
import { count, groupBy } from 'src/utils/array'

type NodeGroup = { list: M.Node[], selection: number }

export default Vue.extend({
    data() {
        return {
            activeMap: null as Record<string, string> | null
        }
    },
    asyncComputed: {
        nodes: {
            async get() {
                if (!this.activeMap) {
                    this.activeMap = await this.$svc.config.node.activeMap()
                }
                return this.$svc.config.node.all()
            },
            default: []
        }
    },
    computed: {
        groups(): NodeGroup[] {
            const groups = groupBy(this.nodes, n => n.genesis.id)
                .map<NodeGroup>(v => ({ list: v, selection: 0 }))

            const activeMap = this.activeMap || {}
            // normalize selection according to activeMap
            groups.forEach(g => {
                const sel = g.list.findIndex(n => activeMap[n.genesis.id] === n.url)
                g.selection = sel < 0 ? 0 : sel
            })
            return groups
        }
    },
    methods: {
        networkName(val: M.Node) {
            switch (genesises.which(val.genesis.id)) {
                case 'main': return 'Mainnet'
                case 'test': return 'Testnet'
                default: return 'Private'
            }
        },
        canDelete(val: M.Node) {
            return !val.preset &&
                count(this.nodes, n => n.genesis.id === val.genesis.id) > 1
        },
        onSelect(val: M.Node) {
            if (!this.activeMap) {
                return
            }
            this.$set(this.activeMap, val.genesis.id, val.url)
        },
        onAdd() {
            this.$q.dialog({
                component: Add
            }).onOk(async (infos: { genesis: Connex.Thor.Block, url: string }) => {
                if (this.nodes.find(n => n.genesis.id === infos.genesis.id && n.url === infos.url)) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Node already exists!',
                        timeout: 5000
                    })
                    return
                }

                const nodes = [...this.nodes]
                nodes.push({
                    genesis: infos.genesis,
                    preset: false,
                    url: infos.url
                })
                await this.$svc.config.node.save(nodes)
            })
        },
        onDelete(val: M.Node) {
            this.$q.dialog({
                title: 'Delete',
                message: 'Are you sure?',
                ok: {
                    label: 'Delete',
                    color: 'negative'
                },
                cancel: {
                    label: 'Cancel',
                    flat: true
                }
            }).onOk(async () => {
                const nodes = this.nodes.filter(n => !(n.genesis.id === val.genesis.id && n.url === val.url))
                await this.$svc.config.node.save(nodes)
            })
        }
    },
    beforeDestroy() {
        if (this.activeMap) {
            this.$svc.config.node.saveActiveMap(this.activeMap)
                .catch(err => console.warn(err))
        }
    }
})
</script>
