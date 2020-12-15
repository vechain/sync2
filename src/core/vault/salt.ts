import { generateSalt } from 'core/worker'
import { Storage } from 'core/storage'

async function loadOrGenerateSalt() {
    const saltStorageKey = 'vault-salt'
    if (process.env.MODE === 'electron') {
        // for electron app, the salt is stored in os keychain
        const Keytar = await import('keytar')

        // distinguish prod and dev
        const service = process.env.PROD ? 'org.vechain.sync2' : 'org.vechain.sync2.dev'

        // retrieve from keytar
        const savedSalt = await Keytar.getPassword(service, saltStorageKey)
        if (savedSalt) {
            return Buffer.from(savedSalt, 'hex')
        }
        // generate
        const salt = await generateSalt()
        // and then store it
        await Keytar.setPassword(service, saltStorageKey, salt.toString('hex'))

        return salt
    } else {
        // for non-electron app, save the salt in Storage
        const storage = await Storage.init()
        const rows = await storage
            .configs
            .all()
            .where({ key: saltStorageKey, subKey: '' })
            .query()

        if (rows.length > 0) {
            return Buffer.from(rows[0].value, 'hex')
        }
        const salt = await generateSalt()
        await storage.configs.insert({
            key: saltStorageKey,
            subKey: '',
            value: salt.toString('hex')
        })
        return salt
    }
}

let cachedSalt: Promise<Buffer> | undefined

export function init() {
    if (!cachedSalt) {
        cachedSalt = loadOrGenerateSalt()
    }
    return cachedSalt
}
