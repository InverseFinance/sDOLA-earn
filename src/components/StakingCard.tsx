'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { DOLA_ADDRESS, SDOLA_ADDRESS, ERC20_ABI, ERC4626_ABI } from '@/lib/contracts';
import { formatBalance } from '@/lib/utils';

type Tab = 'stake' | 'unstake';

export function StakingCard() {
  const [activeTab, setActiveTab] = useState<Tab>('stake');
  const [amount, setAmount] = useState('');
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Read DOLA balance
  const { data: dolaBalance, refetch: refetchDola } = useReadContract({
    address: DOLA_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read sDOLA balance
  const { data: sdolaBalance, refetch: refetchSdola } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read DOLA allowance for sDOLA contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: DOLA_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, SDOLA_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Preview: convert DOLA amount to sDOLA shares
  const parsedAmount = (() => {
    try {
      return amount && parseFloat(amount) > 0 ? parseUnits(amount, 18) : 0n;
    } catch {
      return 0n;
    }
  })();

  const { data: previewShares } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'convertToShares',
    args: [parsedAmount],
    query: { enabled: activeTab === 'stake' && parsedAmount > 0n },
  });

  // Preview: convert sDOLA shares to DOLA assets
  const { data: previewAssets } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'convertToAssets',
    args: [parsedAmount],
    query: { enabled: activeTab === 'unstake' && parsedAmount > 0n },
  });

  // Write: approve
  const { writeContract: approve, data: approveTxHash, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Write: deposit
  const { writeContract: deposit, data: depositTxHash, isPending: isDepositing, reset: resetDeposit } = useWriteContract();
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  // Write: redeem
  const { writeContract: redeem, data: redeemTxHash, isPending: isRedeeming, reset: resetRedeem } = useWriteContract();
  const { isLoading: isRedeemConfirming, isSuccess: isRedeemConfirmed } = useWaitForTransactionReceipt({
    hash: redeemTxHash,
  });

  // Refetch after approve confirms
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
      resetApprove();
    }
  }, [isApproveConfirmed, refetchAllowance, resetApprove]);

  // Refetch after deposit confirms
  useEffect(() => {
    if (isDepositConfirmed) {
      setAmount('');
      refetchDola();
      refetchSdola();
      refetchAllowance();
      resetDeposit();
    }
  }, [isDepositConfirmed, refetchDola, refetchSdola, refetchAllowance, resetDeposit]);

  // Refetch after redeem confirms
  useEffect(() => {
    if (isRedeemConfirmed) {
      setAmount('');
      refetchDola();
      refetchSdola();
      resetRedeem();
    }
  }, [isRedeemConfirmed, refetchDola, refetchSdola, resetRedeem]);

  const balance = activeTab === 'stake' ? dolaBalance : sdolaBalance;
  const balanceLabel = activeTab === 'stake' ? 'DOLA' : 'sDOLA';

  const needsApproval = activeTab === 'stake' && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const insufficientBalance = parsedAmount > 0n && balance !== undefined && parsedAmount > balance;

  const isPending = isApproving || isApproveConfirming || isDepositing || isDepositConfirming || isRedeeming || isRedeemConfirming;

  function handleMax() {
    if (balance) {
      setAmount(formatUnits(balance, 18));
    }
  }

  function handleApprove() {
    approve({
      address: DOLA_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [SDOLA_ADDRESS, maxUint256],
    });
  }

  function handleDeposit() {
    if (!address) return;
    deposit({
      address: SDOLA_ADDRESS,
      abi: ERC4626_ABI,
      functionName: 'deposit',
      args: [parsedAmount, address],
    });
  }

  function handleRedeem() {
    if (!address) return;
    redeem({
      address: SDOLA_ADDRESS,
      abi: ERC4626_ABI,
      functionName: 'redeem',
      args: [parsedAmount, address, address],
    });
  }

  function getButtonConfig(): { text: string; onClick: () => void; disabled: boolean } {
    if (!isConnected) return { text: 'Connect Wallet', onClick: () => openConnectModal?.(), disabled: false };
    if (!amount || parsedAmount === 0n) return { text: 'Enter Amount', onClick: () => {}, disabled: true };
    if (insufficientBalance) return { text: 'Insufficient Balance', onClick: () => {}, disabled: true };

    if (activeTab === 'stake') {
      if (isApproving || isApproveConfirming) return { text: 'Approving...', onClick: () => {}, disabled: true };
      if (needsApproval) return { text: 'Approve DOLA', onClick: handleApprove, disabled: false };
      if (isDepositing || isDepositConfirming) return { text: 'Depositing...', onClick: () => {}, disabled: true };
      return { text: 'Deposit DOLA', onClick: handleDeposit, disabled: false };
    }

    if (isRedeeming || isRedeemConfirming) return { text: 'Withdrawing...', onClick: () => {}, disabled: true };
    return { text: 'Withdraw sDOLA', onClick: handleRedeem, disabled: false };
  }

  const btn = getButtonConfig();

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-5 sm:p-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-background rounded-xl p-1 mb-5">
        {(['stake', 'unstake'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setAmount(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            {tab === 'stake' ? 'Deposit' : 'Withdraw'}
          </button>
        ))}
      </div>

      {/* Balance */}
      {isConnected && (
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="text-text-muted">Balance</span>
          <button onClick={handleMax} className="text-text-muted hover:text-accent transition-colors font-mono">
            {balance !== undefined ? formatBalance(balance) : '0'} {balanceLabel}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="relative mb-4">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-background border border-card-border rounded-xl px-4 py-4 text-xl font-mono text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={handleMax}
            className="text-accent text-xs font-semibold hover:text-accent-hover transition-colors px-2 py-1"
          >
            MAX
          </button>
          <span className="text-text-muted text-sm">{balanceLabel}</span>
        </div>
      </div>

      {/* Preview */}
      {parsedAmount > 0n && (
        <div className="bg-background rounded-xl px-4 py-3 mb-4 space-y-1">
          {activeTab === 'stake' && previewShares !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">You will receive</span>
              <span className="font-mono">{formatBalance(previewShares)} sDOLA</span>
            </div>
          )}
          {activeTab === 'unstake' && previewAssets !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">You will receive</span>
              <span className="font-mono">{formatBalance(previewAssets)} DOLA</span>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={btn.onClick}
        disabled={btn.disabled}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-colors ${
          btn.disabled
            ? 'bg-card-border text-text-muted cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover text-white cursor-pointer'
        }`}
      >
        {isPending && !btn.disabled && (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
        )}
        {btn.text}
      </button>
    </div>
  );
}
