import { collectEntropy } from '../worker'
import { createHmac, randomBytes } from 'crypto'
import { Storage } from '../storage'

async function generateSalt() {
    const entropy = await collectEntropy()
    const mac = createHmac('sha256', randomBytes(32))
    return mac.update(entropy).digest()
}

async function loadOrGenerateSalt() {
    const saltStorageKey = 'vault-salt'
    if (process.env.MODE === 'electron') {
        const Keytar = await import('keytar')
        const service = 'org.vechain.sync2'
        const savedSalt = await Keytar.getPassword(service, saltStorageKey)
        if (savedSalt) {
            return Buffer.from(savedSalt, 'hex')
        }
        const salt = await generateSalt()
        await Keytar.setPassword(service, saltStorageKey, salt.toString('hex'))

        return salt
    } else {
        const storage = await Storage.init()
        const rows = await storage.configs.all().where({ key: saltStorageKey }).query()
        if (rows.length > 0) {
            return Buffer.from(rows[0].value, 'hex')
        }
        const salt = await generateSalt()
        storage.configs.insert({ key: saltStorageKey, value: salt.toString('hex') })
        return salt
    }
}

let cachedSalt: Buffer | null = null

export async function init() {
    if (!cachedSalt) {
        cachedSalt = await loadOrGenerateSalt()
    }
    return cachedSalt
}
