import contractJson from './contract.json'
interface AbiItem {
    anonymous?: boolean;
    constant?: boolean;
    inputs: AbiInput[];
    name?: string;
    outputs?: AbiOutput[];
    payable?: boolean;
    stateMutability?: string;
    type: string;
    gas?: number;
}

interface AbiInput {
    name: string;
    type: string;
    indexed?: boolean;
    components?: AbiInput[];
    internalType?: string;
}

interface AbiOutput {
    name: string;
    type: string;
    components?: AbiOutput[];
    internalType?: string;
}

interface Signatures {
    [key: string]: AbiItem
}

interface AbiByName {
    [key: string]: AbiItem
}

const abiByName: AbiByName = contractJson.abi.reduce((byName: { [key: string]: AbiItem }, fn: AbiItem) => {
    if (fn.name) {
        byName[fn.name] = fn
    }
    return byName
}, {})

export const Signatures: Signatures = {
    '0x7065cb48': abiByName.addOwner,
    '0x173825d9': abiByName.removeOwner,
    '0x0a57dfb8': abiByName.setConfirmationsRequired,
    '0xc6427474': abiByName.submitTransaction,
    '0xc01a8c84': abiByName.confirmTransaction,
    '0xee22610b': abiByName.executeTransaction,
    '0x20ea8d86': abiByName.revokeConfirmation
}

export default abiByName
