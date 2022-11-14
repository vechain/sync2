import contractJson from './contract.json'

interface AbiItem {
    anonymous?: boolean;
    constant?: boolean;
    inputs?: AbiInput[];
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

export default contractJson.abi.reduce((byName: { [key: string]: AbiItem }, fn: AbiItem) => {
    if (fn.name) {
        byName[fn.name] = fn
    }
    return byName
}, {})
