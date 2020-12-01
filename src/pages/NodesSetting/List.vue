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
                <q-item-label
                    header
                    :key="group.name + gi"
                >{{group.name}}</q-item-label>
                <template v-for="(item, i) in group.list">
                    <q-item
                        v-ripple
                        :key="item.genesis.id + i"
                        clickable
                        @click="setActive(item, group)"
                    >
                        <q-item-section avatar>
                            <q-icon
                                color="blue-7"
                                name="check"
                                v-if="item.active"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label lines="1">{{item.url | urlHost}}</q-item-label>
                            <q-item-label caption>{{item.url}}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn
                                size="12px"
                                @click.prevent.stop="onDelete(group, i)"
                                flat
                                dense
                                v-if="!item.preset"
                                round
                                icon="delete_forever"
                            />
                        </q-item-section>
                    </q-item>
                    <q-separator
                        :key="'s-' + item.genesis.id + i"
                        spaced
                        inset="item"
                        v-if="i !== group.list.length - 1"
                    />
                </template>
                <q-separator
                    spaced
                    :key="'s-' + group.name + gi"
                />
            </template>
        </q-list>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { genesises } from '../../consts'
import Add from './Add.vue'

declare type NodesGroup = { list: M.Node[], name: string }

export default Vue.extend({
    data() {
        return {
            groups: [] as NodesGroup[]
        }
    },
    computed: {
        nodesGroup() {
            return this.$state.config.node.all.reduce((result: { [key: string]: NodesGroup }, item) => {
                if (!result[item.genesis.id]) {
                    let name
                    switch (genesises.which(item.genesis.id)) {
                        case 'main':
                            name = 'Mainnet'
                            break
                        case 'test':
                            name = 'Testnet'
                            break
                        default:
                            name = 'Private'
                    }
                    result[item.genesis.id] = {
                        name,
                        list: []
                    }
                }
                result[item.genesis.id].list.push(item)

                return result
            }, {})
        },
        nodes(): NodesGroup[] {
            return Object.values(this.nodesGroup)
        }
    },
    watch: {
        nodes(v) {
            this.groups = v
        }
    },
    created() {
        this.groups = [...this.nodes]
    },
    methods: {
        onAdd() {
            this.$q.dialog({
                component: Add
            }).onOk(async (infos: { genesis: Connex.Thor.Block, url: string }) => {
                const list = [...this.$state.config.node.all]
                list.push({
                    active: !this.nodesGroup[infos.genesis.id],
                    preset: false,
                    genesis: infos.genesis,
                    url: infos.url
                })

                await this.$state.config.set('nodes', JSON.stringify(list))
            })
        },
        onDelete(group: NodesGroup, i: number) {
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
                group.list.splice(i, 1)
                if (group.list.length) {
                    group.list[0].active = true
                }
                await this.setNodes()
            })
        },
        async setActive(item: M.Node, group: NodesGroup) {
            if (item.active) {
                return
            }
            group.list.forEach(item => {
                item.active = false
            })

            item.active = true
            await this.setNodes()
        },
        async setNodes() {
            const temp: M.Node[] = this.groups.map((g: NodesGroup) => {
                return g.list
            }).reduce((result: M.Node[], current: M.Node[]) => {
                return result.concat(current)
            }, [])

            await this.$state.config.set('nodes', JSON.stringify(temp))
        }
    }
})
</script>
