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
        }

    }
}
