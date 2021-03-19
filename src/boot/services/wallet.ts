import { Storage } from 'core/storage'
import { delegateTable } from './utils'

export function build(storage: Storage) {
    const t = delegateTable<Storage.WalletEntity, M.Wallet>(
        storage.wallets,
        e => {
            const meta = JSON.parse(e.meta)
            return {
                id: e.id,
                gid: e.gid,
                vault: e.vault,
                meta: { ...meta, type: meta.type || 'hd' } // backward compat, defaults to 'hd' type
            }
        },
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
        }
    }
}
