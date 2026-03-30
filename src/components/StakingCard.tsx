'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useBalance } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { DOLA_ADDRESS, SDOLA_ADDRESS, ERC20_ABI, ERC4626_ABI } from '@/lib/contracts';
import { formatBalance, formatTokenAmount } from '@/lib/utils';
import { SUPPORTED_TOKENS, isDola, isNativeEth, type SupportedToken } from '@/lib/tokens';
import { TokenSelector } from './TokenSelector';
import { useEnsoRoute } from '@/hooks/useEnsoRoute';
import { fetchEnsoApproval, fetchEnsoBalances } from '@/lib/enso';
import { SavingsOpportunites, SelectedOpportunity } from './SavingsOpportunities';
import { StakingData } from '@/pages';

type Tab = 'stake' | 'unstake';
type EnsoStep = 'idle' | 'approving' | 'routing';

export function StakingCard({ stakingData }: { stakingData: StakingData }) {
  const [activeTab, setActiveTab] = useState<Tab>('stake');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<SupportedToken>(SUPPORTED_TOKENS[0]);
  const [sortedTokens, setSortedTokens] = useState<SupportedToken[]>(SUPPORTED_TOKENS);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [ensoStep, setEnsoStep] = useState<EnsoStep>('idle');

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // ── DOLA direct flow reads ──

  const { data: dolaBalance, refetch: refetchDola } = useReadContract({
    address: DOLA_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: sdolaBalance, refetch: refetchSdola } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: DOLA_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, SDOLA_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // ── Selected non-DOLA ERC20 balance (for max / insufficient check) ──

  const { data: selectedTokenBalance, refetch: refetchSelectedBalance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && activeTab === 'stake' && !isDola(selectedToken.address) && !isNativeEth(selectedToken.address),
    },
  });

  // ── Native ETH balance ──

  const { data: ethBalanceData } = useBalance({ address, query: { enabled: !!address } });

  // ── Parsed amount ──

  const parsedAmount = (() => {
    try {
      return amount && parseFloat(amount) > 0 ? parseUnits(amount, activeTab === 'stake' ? selectedToken.decimals : 18) : 0n;
    } catch {
      return 0n;
    }
  })();

  const amountInWei = parsedAmount > 0n ? parsedAmount.toString() : '0';

  // ── Enso route (non-DOLA tokens only) ──

  const ensoRoute = useEnsoRoute(
    activeTab === 'stake' ? selectedToken.address : undefined,
    amountInWei,
    address,
    selectedToken.isStablish,
  );

  // ── DOLA preview reads ──

  const { data: previewShares } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'convertToShares',
    args: [parsedAmount],
    query: { enabled: activeTab === 'stake' && isDola(selectedToken.address) && parsedAmount > 0n },
  });

  const { data: previewAssets } = useReadContract({
    address: SDOLA_ADDRESS,
    abi: ERC4626_ABI,
    functionName: 'convertToAssets',
    args: [parsedAmount],
    query: { enabled: activeTab === 'unstake' && parsedAmount > 0n },
  });

  // ── DOLA direct flow writes ──

  const { writeContract: approve, data: approveTxHash, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContract: deposit, data: depositTxHash, isPending: isDepositing, reset: resetDeposit } = useWriteContract();
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({ hash: depositTxHash });

  const { writeContract: redeem, data: redeemTxHash, isPending: isRedeeming, reset: resetRedeem } = useWriteContract();
  const { isLoading: isRedeemConfirming, isSuccess: isRedeemConfirmed } = useWaitForTransactionReceipt({ hash: redeemTxHash });

  // ── Enso flow writes (two separate hooks: approval + route) ──

  const { sendTransaction: sendApprovalTx, data: ensoApprovalHash, isPending: isEnsoApprovalPending, reset: resetEnsoApproval } = useSendTransaction();
  const { isLoading: isEnsoApprovalConfirming, isSuccess: isEnsoApprovalConfirmed } = useWaitForTransactionReceipt({ hash: ensoApprovalHash });

  const { sendTransaction: sendRouteTx, data: ensoRouteHash, isPending: isEnsoRoutePending, reset: resetEnsoRoute } = useSendTransaction();
  const { isLoading: isEnsoRouteConfirming, isSuccess: isEnsoRouteConfirmed } = useWaitForTransactionReceipt({ hash: ensoRouteHash });

  // ── Fetch Enso balances on wallet connect ──

  const loadBalances = useCallback(async (addr: `0x${string}`) => {
    try {
      const balances = await fetchEnsoBalances(addr);
      const balMap: Record<string, string> = {};
      for (const b of balances) {
        balMap[b.token.toLowerCase()] = formatBalance(BigInt(b.amount), b.decimals);
      }
      setTokenBalances(balMap);

      const withBalance: { token: SupportedToken; usd: number }[] = [];
      const withoutBalance: SupportedToken[] = [];
      for (const t of SUPPORTED_TOKENS) {
        const found = balances.find(b => b.token.toLowerCase() === t.address.toLowerCase());
        if (found && BigInt(found.amount) > 0n) {
          const usd = Number(found.amount) * Number(found.price) / (10 ** found.decimals);
          withBalance.push({ token: { ...t, usd }, usd });
        } else {
          withoutBalance.push(t);
        }
      }
      withBalance.sort((a, b) => b.usd - a.usd);
      setSortedTokens([...withBalance.map(w => w.token), ...withoutBalance]);
    } catch (err) {
      console.error('Failed to fetch Enso balances:', err);
    }
  }, []);

  useEffect(() => {
    if (address) loadBalances(address);
  }, [address, loadBalances]);

  // ── DOLA flow effects ──

  useEffect(() => {
    if (isApproveConfirmed) { refetchAllowance(); resetApprove(); }
  }, [isApproveConfirmed, refetchAllowance, resetApprove]);

  useEffect(() => {
    if (isDepositConfirmed) {
      setAmount('');
      refetchDola();
      refetchSdola();
      refetchAllowance();
      resetDeposit();
      if (address) loadBalances(address);
    }
  }, [isDepositConfirmed, refetchDola, refetchSdola, refetchAllowance, resetDeposit, address, loadBalances]);

  useEffect(() => {
    if (isRedeemConfirmed) {
      setAmount('');
      refetchDola();
      refetchSdola();
      resetRedeem();
      if (address) loadBalances(address);
    }
  }, [isRedeemConfirmed, refetchDola, refetchSdola, resetRedeem, address, loadBalances]);

  // ── Enso flow: auto-advance from approval → route ──

  useEffect(() => {
    if (ensoStep === 'approving' && isEnsoApprovalConfirmed && ensoRoute.tx) {
      resetEnsoApproval();
      setEnsoStep('routing');
      sendRouteTx({
        to: ensoRoute.tx.to as `0x${string}`,
        data: ensoRoute.tx.data as `0x${string}`,
        value: BigInt(ensoRoute.tx.value || '0'),
      });
    }
  }, [ensoStep, isEnsoApprovalConfirmed, ensoRoute.tx, sendRouteTx, resetEnsoApproval]);

  // ── Enso flow: route confirmed ──

  useEffect(() => {
    if (ensoStep === 'routing' && isEnsoRouteConfirmed) {
      setEnsoStep('idle');
      setAmount('');
      resetEnsoRoute();
      refetchSdola();
      refetchSelectedBalance();
      if (address) loadBalances(address);
    }
  }, [ensoStep, isEnsoRouteConfirmed, resetEnsoRoute, refetchSdola, refetchSelectedBalance, address, loadBalances]);

  // ── Derived state ──

  const usingEnso = activeTab === 'stake' && !isDola(selectedToken.address);

  const stakeBalance = isDola(selectedToken.address)
    ? dolaBalance
    : isNativeEth(selectedToken.address)
      ? ethBalanceData?.value
      : selectedTokenBalance;

  const balance = activeTab === 'stake' ? stakeBalance : sdolaBalance;
  const balanceLabel = activeTab === 'stake' ? selectedToken.symbol : 'sDOLA';
  const balanceDecimals = activeTab === 'stake' ? selectedToken.decimals : 18;

  const needsApproval = activeTab === 'stake' && isDola(selectedToken.address) && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const insufficientBalance = parsedAmount > 0n && balance !== undefined && parsedAmount > balance;

  const isDolaFlowPending = isApproving || isApproveConfirming || isDepositing || isDepositConfirming || isRedeeming || isRedeemConfirming;
  const isEnsoFlowPending = ensoStep !== 'idle' || isEnsoApprovalPending || isEnsoApprovalConfirming || isEnsoRoutePending || isEnsoRouteConfirming;
  const isPending = isDolaFlowPending || isEnsoFlowPending;

  // ── Handlers ──

  function handleMax() {
    if (balance) {
      setAmount(formatUnits(balance, balanceDecimals));
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

  async function handleEnsoDeposit() {
    if (!address || !ensoRoute.tx) return;

    // Native ETH: no approval needed
    if (isNativeEth(selectedToken.address)) {
      setEnsoStep('routing');
      sendRouteTx({
        to: ensoRoute.tx.to as `0x${string}`,
        data: ensoRoute.tx.data as `0x${string}`,
        value: BigInt(ensoRoute.tx.value || '0'),
      });
      return;
    }

    // ERC20: check if approval is needed
    try {
      const approval = await fetchEnsoApproval({
        fromAddress: address,
        tokenAddress: selectedToken.address,
        amount: amountInWei,
      });

      if (approval.tx?.data && approval.tx.data !== '0x') {
        setEnsoStep('approving');
        sendApprovalTx({
          to: approval.tx.to as `0x${string}`,
          data: approval.tx.data as `0x${string}`,
          value: BigInt(approval.tx.value || '0'),
        });
        return;
      }
    } catch (err) {
      console.error('Approval check failed:', err);
    }

    // Already approved — send route directly
    setEnsoStep('routing');
    sendRouteTx({
      to: ensoRoute.tx.to as `0x${string}`,
      data: ensoRoute.tx.data as `0x${string}`,
      value: BigInt(ensoRoute.tx.value || '0'),
    });
  }

  // ── Button config ──

  function getButtonConfig(): { text: string; onClick: () => void; disabled: boolean } {
    if (!isConnected) return { text: 'Connect Wallet', onClick: () => openConnectModal?.(), disabled: false };
    if (!amount || parsedAmount === 0n) return { text: 'Enter Amount', onClick: () => { }, disabled: true };
    if (insufficientBalance) return { text: 'Insufficient Balance', onClick: () => { }, disabled: true };

    if (activeTab === 'stake') {
      if (usingEnso) {
        if (ensoRoute.isLoading) return { text: 'Fetching Route...', onClick: () => { }, disabled: true };
        if (ensoRoute.error) return { text: 'Route Error', onClick: () => { }, disabled: true };
        if (!ensoRoute.tx) return { text: 'Enter Amount', onClick: () => { }, disabled: true };
        if (ensoStep === 'approving' || isEnsoApprovalPending || isEnsoApprovalConfirming)
          return { text: 'Approving...', onClick: () => { }, disabled: true };
        if (ensoStep === 'routing' || isEnsoRoutePending || isEnsoRouteConfirming)
          return { text: 'Depositing...', onClick: () => { }, disabled: true };
        return { text: `Deposit ${selectedToken.symbol}`, onClick: handleEnsoDeposit, disabled: false };
      } else {
        if (isApproving || isApproveConfirming) return { text: 'Approving...', onClick: () => { }, disabled: true };
        if (needsApproval) return { text: 'Approve DOLA', onClick: handleApprove, disabled: false };
        if (isDepositing || isDepositConfirming) return { text: 'Depositing...', onClick: () => { }, disabled: true };
        return { text: 'Deposit DOLA', onClick: handleDeposit, disabled: false };
      }
    }

    if (isRedeeming || isRedeemConfirming) return { text: 'Withdrawing...', onClick: () => { }, disabled: true };
    return { text: 'Withdraw sDOLA', onClick: handleRedeem, disabled: false };
  }

  const btn = getButtonConfig();

  return (
    <div className="relative bg-card-bg/80 border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6">
        {(['stake', 'unstake'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setAmount('');
              setSelectedToken(SUPPORTED_TOKENS[0]);
              setEnsoStep('idle');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
              ? 'bg-accent text-white shadow-[0_0_20px_rgba(124,58,237,0.2)]'
              : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            {tab === 'stake' ? 'Deposit' : 'Withdraw'}
          </button>
        ))}
      </div>

      <div style={{ display: (activeTab === 'stake' ? 'block' : 'none') }}>
        <SavingsOpportunites
          apy={stakingData.apy}
          totalAssets={stakingData.totalAssets}
          tokens={sortedTokens}
          onSelectToken={(t) => { setSelectedToken(t); setTimeout(() => { handleMax() }, 0); }}
        />
      </div>

      {/* Balance */}
      {isConnected && (
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-text-muted text-xs uppercase tracking-wider">Balance</span>
          <button onClick={handleMax} className="text-text-secondary cursor-pointer hover:text-accent transition-colors duration-200 font-mono text-sm">
            {balance !== undefined
              ? formatBalance(balance, balanceDecimals)
              : tokenBalances[selectedToken.address.toLowerCase()] ?? '0'
            } {balanceLabel}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="relative mb-2 group">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={ensoStep !== 'idle'}
          className="w-full bg-surface border border-white/[0.06] rounded-xl px-4 py-4 pr-40 text-xl font-mono text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all duration-200 disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={handleMax}
            className="text-accent text-[11px] font-bold uppercase tracking-wider hover:text-accent-hover transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent/10"
          >
            Max
          </button>
          {activeTab === 'stake' ? (
            <TokenSelector
              tokens={sortedTokens}
              selected={selectedToken}
              onSelect={(t) => { setSelectedToken(t); setAmount(''); }}
              balances={tokenBalances}
            />
          ) : (
            <span className="text-text-muted/60 text-xs font-medium">sDOLA</span>
          )}
        </div>
      </div>

      {/* Preview — Deposit */}
      {parsedAmount > 0n && activeTab === 'stake' && (
        <div className="bg-surface border border-white/[0.04] rounded-xl px-4 py-3 mb-5">
          {selectedToken.isIdleStable ? (
            <SelectedOpportunity
              token={selectedToken}
              apy={stakingData.apy}
              totalAssets={stakingData.totalAssets}
              dolaPriceUsd={stakingData.dolaPriceUsd ?? 1}
              amount={parseFloat(amount) || 0}
            />
          ) : isDola(selectedToken.address) ? (
            previewShares !== undefined ? (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">You will receive</span>
                <span className="font-mono text-foreground">{formatBalance(previewShares, 2)} sDOLA</span>
              </div>
            ) : null
          ) : ensoRoute.isLoading ? (
            <div className="flex justify-center py-1">
              <span className="inline-block w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : ensoRoute.amountOut ? (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Estimated output</span>
              <span className="font-mono text-foreground">~{formatTokenAmount(ensoRoute.amountOut, 18)} sDOLA</span>
            </div>
          ) : ensoRoute.error ? (
            <div className="text-sm text-red-400 text-center">{ensoRoute.error}</div>
          ) : null}
        </div>
      )}

      {/* Preview — Withdraw */}
      {parsedAmount > 0n && activeTab === 'unstake' && previewAssets !== undefined && (
        <div className="bg-surface border border-white/[0.04] rounded-xl px-4 py-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">You will receive</span>
            <span className="font-mono text-foreground">{formatBalance(previewAssets, 2)} DOLA</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={btn.onClick}
        disabled={btn.disabled}
        className={`w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 ${btn.disabled
          ? 'bg-white/[0.04] text-text-muted cursor-not-allowed border border-white/[0.04]'
          : 'bg-accent hover:bg-accent-hover text-white cursor-pointer shadow-[0_0_24px_rgba(124,58,237,0.2)] hover:shadow-[0_0_32px_rgba(124,58,237,0.3)]'
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
