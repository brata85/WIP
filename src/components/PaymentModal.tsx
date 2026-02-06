'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { RECEIVER_ADDRESS, USDC_ADDRESS, ERC20_ABI } from '@/configs/pay';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'wagmi/chains';
import { useConnectModal, useChainModal } from '@rainbow-me/rainbowkit';
import styles from '@/styles/PaymentModal.module.css';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    t?: any;
}

const defaultT = {
    labels: {
        paymentTitle: 'Pay with USDC',
        paymentDescription: 'Payment in USDC is required to post your idea.',
        payButton: 'Pay {amount} USDC',
        paymentPending: 'Processing Payment...',
        paymentSuccess: 'Payment Successful! Posting your idea.',
        paymentError: 'An error occurred during payment. Please try again.',
        walletRequired: 'Wallet connection required.',
        connectWallet: 'Connect Wallet',
        switchNetwork: 'Switch to Base Network',
        paymentSuccessResult: 'Payment Complete!'
    }
};

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, t = defaultT }: PaymentModalProps) {
    const { isConnected, address, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();

    // Check USDC balance
    const { data: balance, isLoading: isBalanceLoading } = useReadContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address && isConnected && chainId === base.id,
        }
    });

    const requiredAmount = parseUnits(amount.toString(), 6);
    const hasSufficientBalance = balance !== undefined ? balance >= requiredAmount : true;
    const balanceText = balance !== undefined ? formatUnits(balance, 6) : '0';

    const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isConfirmed) {
            console.log('Transaction confirmed! hash:', hash);
            // Delay calling onSuccess slightly to show success state in modal or just call it
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }
    }, [isConfirmed, onSuccess, hash]);

    const isWrongChain = isConnected && chainId !== base.id;

    const handlePay = () => {
        if (!isConnected) {
            if (openConnectModal) {
                openConnectModal();
            }
            return;
        }

        if (isWrongChain) {
            if (openChainModal) {
                openChainModal();
            }
            return;
        }

        try {
            writeContract({
                address: USDC_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [RECEIVER_ADDRESS as `0x${string}`, parseUnits(amount.toString(), 6)],
            });
        } catch (err) {
            console.error('Write contract error:', err);
        }
    };

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.overlay}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={styles.backdrop}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={styles.modal}
                    >
                        <button
                            onClick={onClose}
                            className={styles.closeButton}
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>

                        <div className={styles.content}>
                            <div className={styles.iconWrapper}>
                                {isConfirmed ? (
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                ) : isWritePending || isConfirming ? (
                                    <Loader2 className={`${styles.spin} w-10 h-10 text-red-500`} />
                                ) : (
                                    <Wallet className="w-10 h-10 text-red-500" />
                                )}
                            </div>

                            <h2 className={styles.title}>
                                {isConfirmed ? t.labels.paymentSuccessResult : t.labels.paymentTitle}
                            </h2>

                            <p className={styles.description}>
                                {isConfirmed
                                    ? t.labels.paymentSuccess
                                    : t.labels.paymentDescription}
                            </p>

                            {!isConfirmed && (
                                <div className={styles.details}>
                                    <div className={styles.row}>
                                        <div className={styles.labelCol}>
                                            <span className={styles.label}>USDC on Base</span>
                                            {isConnected && chainId === base.id && (
                                                <span className={styles.subLabel}>
                                                    Balance: {balanceText} USDC
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.amount}>{amount} USDC</span>
                                    </div>

                                    {(writeError || (hash === undefined && !isWritePending && !isConfirming && writeError)) && isConnected && hasSufficientBalance && (
                                        <div className={styles.errorBox}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span className="break-all">{(writeError as any)?.message || t.labels.paymentError}</span>
                                        </div>
                                    )}

                                    <button
                                        disabled={isWritePending || isConfirming || (isConnected && chainId === base.id && !hasSufficientBalance) || isBalanceLoading}
                                        onClick={handlePay}
                                        className={styles.payButton}
                                    >
                                        {isBalanceLoading ? (
                                            <>
                                                <Loader2 className={`${styles.spin} w-5 h-5`} />
                                                Checking...
                                            </>
                                        ) : isWritePending || isConfirming ? (
                                            <>
                                                <Loader2 className={`${styles.spin} w-5 h-5`} />
                                                {t.labels.paymentPending}
                                            </>
                                        ) : (
                                            !isConnected
                                                ? (t.labels.connectWallet || 'Connect Wallet')
                                                : isWrongChain
                                                    ? (t.labels.switchNetwork || 'Switch to Base')
                                                    : !hasSufficientBalance
                                                        ? 'Insufficient Balance'
                                                        : t.labels.payButton.replace('{amount}', amount.toString())
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
