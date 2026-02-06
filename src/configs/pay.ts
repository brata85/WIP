import { parseUnits } from 'viem';

export const RECEIVER_ADDRESS = '0xca48a5f1b377038be693d817e0b5f74e976f73d4' as const;

// USDC on Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// Fortune price in USDC (Adjusted for Idea Creation if needed, keeping 1 USDC for now)
export const FORTUNE_PRICE = '1'; // 1 USDC
export const FORTUNE_PRICE_UNITS = parseUnits(FORTUNE_PRICE, 6);

export const ERC20_ABI = [
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    }
] as const;
