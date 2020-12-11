import { Storage } from 'core/storage'
import { delegateTable } from './utils'

export function build(storage: Storage) {
    const t = delegateTable<Storage.WalletEntity, M.Wallet>(
        storage.wallets,
        e => ({
            id: e.id,
            gid: e.gid,
            vault: e.vault,
            meta: JSON.parse(e.meta)
        }),
        m => ({
            id: m.id,
            gid: m.gid,
            vault: m.vault,
            meta: m.meta && JSON.stringify(m.meta)
        }))

    return {
        all() { return t.all().query() },
        get(id: number) {
            return t.all()
                .where({ id })
                .query()
                .then(r => r.length > 0 ? r[0] : null)
        },
        getByGid(gid: string) {
            return t.all()
                .where({ gid })
                .query()
        },
        insert(w: Omit<M.Wallet, 'id'>) {
            return t.insert(w)
        },
        update(id: number, meta: M.Wallet.Meta) {
            return t.update({ id }, { meta })
        },
        delete(id: number) {
            return t.delete({ id })
        },
        reEncryptAll(de: (vault: string) => Promise<string>, savePasswordShadow: () => Promise<void>) {
            return storage.transaction(async () => {
                const wallets = await storage.wallets.all().query()
                for (const w of wallets) {
                    const newVault = await storage.waitFor(de(w.vault))
                    await storage.wallets.update({ id: w.id }, {
                        vault: newVault
                    })
                }
                await savePasswordShadow()
            })
        }
    }
}
