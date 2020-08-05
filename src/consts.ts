import { abi } from 'thor-devkit/dist/abi'
const transferABI: abi.Function.Definition = {
    constant: false,
    inputs: [
        {
            name: '_to',
            type: 'address'
        },
        {
            name: '_value',
            type: 'uint256'
        }
    ],
    name: 'transfer',
    outputs: [
        {
            name: '',
            type: 'bool'
        }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
}
const vip180balanceOf: abi.Function.Definition = {
    constant: true,
    inputs: [
        {
            name: '_owner',
            type: 'address'
        }
    ],
    name: 'balanceOf',
    outputs: [
        {
            name: 'balance',
            type: 'uint256'
        }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
}

const VTHO: M.TokenSpec = {
    symbol: 'VTHO',
    name: 'VeChain Thor',
    address: '0x0000000000000000000000000000456e65726779',
    decimals: 18,
    desc: '',
    icon: '',
    totalSupply: ''
}
const VET: M.TokenSpec = {
    symbol: 'VET',
    name: 'VeChain',
    address: '',
    decimals: 18,
    desc: '',
    icon: '',
    totalSupply: ''
}

export const abis = {
    transfer: transferABI,
    balanceOf: vip180balanceOf
}

export const tokenSpecs = {
    VTHO, VET
}
