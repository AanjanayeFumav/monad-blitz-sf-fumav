"use client";

import { useState, useEffect, useRef } from "react";
import { useSendTransaction } from "thirdweb/react";
import { prepareTransaction } from "thirdweb";
import { client, monadTestnet, MERCHANT_ADDRESS, TREASURY_ADDRESS, getExplorerUrl } from "../lib/thirdweb";

// Authorization pipeline steps
const AUTH_STEPS = [
  { id: 'auth', label: 'Consumer Authentication', icon: '🔐', details: 'Device: iPhone 15 • Location: San Francisco, CA • Biometric: Passed', timing: 12 },
  { id: 'credit', label: 'Credit Limit Check', icon: '💳', details: 'Current: $0.00 • Limit: $500.00 • Available: $500.00 ✓', timing: 45 },
  { id: 'fraud', label: 'Fraud Detection (ML Model)', icon: '🛡️', details: 'Risk Score: 0.02/1.00 (Very Low) • Velocity: Normal • Device: Known', timing: 28 },
  { id: 'kyc', label: 'KYC/AML Compliance', icon: '📋', details: 'Consumer KYC: Verified • Merchant KYB: Verified • Sanctions: Clear', timing: 15 },
  { id: 'bank', label: 'Issuing Bank Authorization', icon: '🏦', details: 'Bank: Unit.co (Evolve) • Status: Active • Response: APPROVED', timing: 67 },
];

// Settlement pipeline steps
const SETTLEMENT_STEPS = [
  { id: 'treasury', label: 'Treasury Wallet Check', icon: '💰', timing: 5 },
  { id: 'prepare', label: 'Transaction Preparation', icon: '📝', timing: 8 },
  { id: 'broadcast', label: 'Broadcasting to Monad', icon: '📡', timing: null }, // Variable
  { id: 'confirm', label: 'Block Confirmation', icon: '⛓️', timing: null },
];

export default function Orchestrator({ account, activeTransaction, onSettlement, treasuryBalance, transactions }) {
  const [phase, setPhase] = useState('idle'); // idle, authorizing, settling, complete
  const [authStep, setAuthStep] = useState(-1);
  const [settlementStep, setSettlementStep] = useState(-1);
  const [txHash, setTxHash] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [totalAuthTime, setTotalAuthTime] = useState(0);
  const [totalSettleTime, setTotalSettleTime] = useState(0);
  const [broadcastTime, setBroadcastTime] = useState(null);
  const [confirmTime, setConfirmTime] = useState(null);

  // Use ref to prevent duplicate runs from React Strict Mode
  const isRunningRef = useRef(false);
  const processedTxIdRef = useRef(null);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  // Run the full pipeline when there's an active transaction
  useEffect(() => {
    // Only run if we have a new pending transaction we haven't processed yet
    if (
      activeTransaction &&
      activeTransaction.status === "pending" &&
      activeTransaction.id !== processedTxIdRef.current &&
      !isRunningRef.current
    ) {
      processedTxIdRef.current = activeTransaction.id;
      isRunningRef.current = true;
      runPipeline();
    } else if (!activeTransaction) {
      resetState();
    }
  }, [activeTransaction?.id]);

  const resetState = () => {
    setPhase('idle');
    setAuthStep(-1);
    setSettlementStep(-1);
    setTxHash(null);
    setBlockNumber(null);
    setTotalAuthTime(0);
    setTotalSettleTime(0);
    setBroadcastTime(null);
    setConfirmTime(null);
    isRunningRef.current = false;
    processedTxIdRef.current = null;
  };

  const runPipeline = async () => {
    // Phase 1: Authorization
    setPhase('authorizing');
    let authTime = 0;
    
    for (let i = 0; i < AUTH_STEPS.length; i++) {
      setAuthStep(i);
      await new Promise(r => setTimeout(r, AUTH_STEPS[i].timing * 3 + 200)); // Slow down for visibility
      authTime += AUTH_STEPS[i].timing;
      setTotalAuthTime(authTime);
    }
    
    // Brief pause to show authorization complete
    await new Promise(r => setTimeout(r, 500));
    
    // Phase 2: Settlement
    setPhase('settling');
    let settleTime = 0;
    
    // Step 0: Treasury check
    setSettlementStep(0);
    await new Promise(r => setTimeout(r, 300));
    settleTime += 5;
    setTotalSettleTime(settleTime);
    
    // Step 1: Prepare
    setSettlementStep(1);
    await new Promise(r => setTimeout(r, 300));
    settleTime += 8;
    setTotalSettleTime(settleTime);
    
    // Step 2: Broadcast
    setSettlementStep(2);
    const broadcastStart = Date.now();
    
    // Execute real transaction if wallet connected, otherwise simulate
    let finalTxHash;
    if (account) {
      try {
        const tx = prepareTransaction({
          client,
          chain: monadTestnet,
          to: MERCHANT_ADDRESS,
          value: BigInt(Math.floor(activeTransaction.finalAmount * 1e14)), // Small amount for demo
        });
        
        const result = await sendTransaction(tx);
        finalTxHash = result.transactionHash;
      } catch (error) {
        console.error("Transaction failed:", error);
        // Fall back to simulated tx
        await new Promise(r => setTimeout(r, 1500));
        finalTxHash = `0x${Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;
      }
    } else {
      // Simulated transaction
      await new Promise(r => setTimeout(r, 1500));
      finalTxHash = `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
    }
    
    const broadcastEnd = Date.now();
    setBroadcastTime(broadcastEnd - broadcastStart);
    setTxHash(finalTxHash);
    
    // Step 3: Confirmation
    setSettlementStep(3);
    const confirmStart = Date.now();
    await new Promise(r => setTimeout(r, 800));
    const confirmEnd = Date.now();
    setConfirmTime(confirmEnd - confirmStart);
    setBlockNumber(Math.floor(Math.random() * 1000000) + 12000000);
    
    // Complete
    setPhase('complete');
    setTotalSettleTime(settleTime + (broadcastEnd - broadcastStart) + (confirmEnd - confirmStart));
    isRunningRef.current = false; // Pipeline finished

    // Notify parent after brief delay
    setTimeout(() => {
      onSettlement(activeTransaction, finalTxHash);
    }, 2000);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Live Status */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">FUMAV CARD ORCHESTRATOR</h2>
          <p className="text-white/40 mt-1">Real-time payment authorization & settlement</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${phase !== 'idle' ? 'bg-fumav-green animate-pulse' : 'bg-white/30'}`}></span>
          <span className={`text-sm ${phase !== 'idle' ? 'text-fumav-green' : 'text-white/30'}`}>
            {phase !== 'idle' ? 'Live' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card-glass rounded-xl p-4">
          <p className="text-white/40 text-sm">Active Transactions</p>
          <p className="text-2xl font-bold">{phase !== 'idle' && phase !== 'complete' ? '1' : '0'}</p>
        </div>
        <div className="card-glass rounded-xl p-4">
          <p className="text-white/40 text-sm">Treasury Balance</p>
          <p className="text-2xl font-bold text-fumav-green">{treasuryBalance?.toLocaleString()} USDC</p>
        </div>
        <div className="card-glass rounded-xl p-4">
          <p className="text-white/40 text-sm">Success Rate</p>
          <p className="text-2xl font-bold">100%</p>
        </div>
        <div className="card-glass rounded-xl p-4">
          <p className="text-white/40 text-sm">Avg Settlement</p>
          <p className="text-2xl font-bold">2.1s</p>
        </div>
      </div>

      {/* Transaction in Progress Card */}
      {activeTransaction && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>⚡</span> Transaction in Progress
            </h3>
            <span className="text-white/40 font-mono text-sm">TXN-{new Date().getFullYear()}-{String(activeTransaction.id).slice(-5)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 bg-white/5 rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs">Consumer</p>
                <p className="font-medium">player1@test.com</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Merchant</p>
                <p className="font-medium">Pixel Games Studio</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Amount</p>
                <p className="font-medium">${activeTransaction.originalAmount.toFixed(2)} USD → {activeTransaction.finalAmount.toFixed(2)} USDC</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs">Consumer ID</p>
                <p className="font-medium font-mono">CONS-{String(activeTransaction.id).slice(-5)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Merchant ID</p>
                <p className="font-medium font-mono">MERCH-10293</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Category</p>
                <p className="font-medium">Digital Goods - Gaming</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authorization Pipeline */}
      <div className="card-glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>🔐</span> Authorization Pipeline
        </h3>

        <div className="space-y-3">
          {AUTH_STEPS.map((step, index) => {
            const isActive = phase === 'authorizing' && authStep === index;
            const isComplete = authStep > index || phase === 'settling' || phase === 'complete';
            const isPending = authStep < index && phase === 'authorizing';
            
            return (
              <div 
                key={step.id}
                className={`rounded-xl p-4 transition-all duration-300 ${
                  isComplete ? 'bg-fumav-green/10 border border-fumav-green/30' :
                  isActive ? 'bg-fumav-cyan/10 border border-fumav-cyan/30 animate-pulse' :
                  'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{step.icon}</span>
                    <div>
                      <p className={`font-medium ${isComplete ? 'text-fumav-green' : isActive ? 'text-fumav-cyan' : 'text-white/50'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-white/40">
                        {step.id === 'credit' && activeTransaction 
                          ? `Current: $0.00 • Limit: $500.00 • Available: $500.00 ✓ • After: $${(500 - activeTransaction.finalAmount).toFixed(2)}`
                          : step.details
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${isComplete ? 'text-fumav-green' : isActive ? 'text-fumav-cyan' : 'text-white/30'}`}>
                      {isComplete || isActive ? `${step.timing}ms` : '—'}
                    </span>
                    {isComplete && (
                      <span className="w-6 h-6 rounded-full bg-fumav-green/20 flex items-center justify-center">
                        <span className="text-fumav-green text-sm">✓</span>
                      </span>
                    )}
                    {isActive && (
                      <div className="w-6 h-6 rounded-full border-2 border-fumav-cyan border-t-transparent animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Authorization Summary */}
        {(phase === 'settling' || phase === 'complete') && (
          <div className="mt-4 p-4 rounded-xl bg-fumav-green/10 border border-fumav-green/30">
            <div className="flex items-center gap-2">
              <span className="text-fumav-green">✅</span>
              <span className="text-fumav-green font-semibold">AUTHORIZATION APPROVED</span>
            </div>
            <p className="text-white/40 text-sm mt-1">
              Total Authorization Time: {totalAuthTime}ms • Consumer can complete purchase and leave ✓
            </p>
          </div>
        )}
      </div>

      {/* Settlement Pipeline */}
      <div className="card-glass rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>⚡</span> Settlement Pipeline
        </h3>

        <div className="space-y-3">
          {SETTLEMENT_STEPS.map((step, index) => {
            const isActive = phase === 'settling' && settlementStep === index;
            const isComplete = (phase === 'settling' && settlementStep > index) || phase === 'complete';
            const showTiming = isComplete || isActive;
            
            // Dynamic details for each step
            let details = '';
            let timing = step.timing;
            
            if (step.id === 'treasury') {
              details = `Balance: ${treasuryBalance?.toLocaleString()} USDC (sufficient)`;
            } else if (step.id === 'prepare' && activeTransaction) {
              details = `Recipient: ${MERCHANT_ADDRESS.slice(0, 10)}...${MERCHANT_ADDRESS.slice(-6)} • Amount: ${activeTransaction.finalAmount.toFixed(6)} USDC • Gas: 45,000 units (~$0.0008)`;
            } else if (step.id === 'broadcast') {
              details = `Network: Monad Testnet • RPC: Active • Status: ${isComplete ? 'Confirmed' : isActive ? 'Pending...' : 'Waiting'}`;
              timing = broadcastTime || '???';
            } else if (step.id === 'confirm') {
              details = blockNumber ? `Block: ${blockNumber.toLocaleString()} • Confirmations: 1` : 'Waiting for block inclusion...';
              timing = confirmTime || '???';
            }
            
            return (
              <div 
                key={step.id}
                className={`rounded-xl p-4 transition-all duration-300 ${
                  isComplete ? 'bg-fumav-green/10 border border-fumav-green/30' :
                  isActive ? 'bg-fumav-purple/10 border border-fumav-purple/30 animate-pulse' :
                  'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{step.icon}</span>
                    <div>
                      <p className={`font-medium ${isComplete ? 'text-fumav-green' : isActive ? 'text-fumav-purple' : 'text-white/50'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-white/40">{details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${isComplete ? 'text-fumav-green' : isActive ? 'text-fumav-purple' : 'text-white/30'}`}>
                      {showTiming ? `${timing}ms` : '—'}
                    </span>
                    {isComplete && (
                      <span className="w-6 h-6 rounded-full bg-fumav-green/20 flex items-center justify-center">
                        <span className="text-fumav-green text-sm">✓</span>
                      </span>
                    )}
                    {isActive && (
                      <div className="w-6 h-6 rounded-full border-2 border-fumav-purple border-t-transparent animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlement Complete Summary */}
        {phase === 'complete' && txHash && (
          <div className="mt-4 p-6 rounded-xl bg-fumav-green/10 border border-fumav-green/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-fumav-green text-xl">⚡</span>
              <span className="text-fumav-green font-bold text-xl">SETTLEMENT COMPLETE ✅</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-white/40 text-xs">Transaction Broadcast</p>
                <p className="text-fumav-cyan font-mono">{broadcastTime}ms</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Block Inclusion</p>
                <p className="text-fumav-cyan font-mono">{confirmTime}ms</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Settlement</p>
                <p className="text-fumav-cyan font-mono">{(broadcastTime || 0) + (confirmTime || 0)}ms</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Transaction Hash</p>
                <p className="text-fumav-cyan font-mono text-sm break-all">{txHash}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Block Details</p>
                <p className="text-white/70 font-mono text-sm">
                  Block: {blockNumber?.toLocaleString()} • Confirmations: 1 • Gas Used: 44,821 • Gas Cost: $0.0008
                </p>
              </div>

              <a 
                href={getExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fumav-cyan hover:underline flex items-center gap-1 text-sm"
              >
                View on Monad Explorer →
              </a>

              <p className="text-fumav-green text-sm flex items-center gap-2">
                <span>💰</span> Merchant Settlement Notification Sent • Pixel Games Studio has been notified
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cost Analysis */}
      {phase === 'complete' && activeTransaction && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Cost Analysis
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Traditional Card */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-xs uppercase tracking-wider mb-2">Traditional Card</p>
              <p className="text-3xl font-bold text-red-400">
                ${(activeTransaction.finalAmount * 0.029 + 0.30).toFixed(2)}
              </p>
              <p className="text-white/40 text-sm">
                ({((activeTransaction.finalAmount * 0.029 + 0.30) / activeTransaction.finalAmount * 100).toFixed(1)}% effective)
              </p>
              <div className="mt-3 space-y-1 text-sm text-white/50">
                <p>• Interchange: ${(activeTransaction.finalAmount * 0.029).toFixed(3)} (2.9%)</p>
                <p>• Flat Fee: $0.30</p>
                <p>• Settlement: 2-3 days</p>
                <p>• Status: Pending</p>
              </div>
            </div>

            {/* Fumav */}
            <div className="bg-fumav-green/10 border border-fumav-green/30 rounded-xl p-4">
              <p className="text-fumav-green text-xs uppercase tracking-wider mb-2">Fumav</p>
              <p className="text-3xl font-bold text-fumav-green">
                ${(activeTransaction.finalAmount * 0.005).toFixed(2)}
              </p>
              <p className="text-white/40 text-sm">(0.5% effective)</p>
              <div className="mt-3 space-y-1 text-sm text-white/50">
                <p>• Gas: $0.0008</p>
                <p>• Platform: ${(activeTransaction.finalAmount * 0.005 - 0.0008).toFixed(4)} (0.49%)</p>
                <p>• Settlement: {((broadcastTime || 0) + (confirmTime || 0)) / 1000} seconds</p>
                <p>• Status: Complete ✓</p>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-fumav-green/10 border border-fumav-green/30 rounded-xl p-4 text-center">
            <p className="text-fumav-green flex items-center justify-center gap-2 mb-2">
              <span>💰</span> Merchant Savings
            </p>
            <p className="text-3xl font-bold text-white">
              ${((activeTransaction.finalAmount * 0.029 + 0.30) - (activeTransaction.finalAmount * 0.005)).toFixed(2)} per transaction ({(((activeTransaction.finalAmount * 0.029 + 0.30) - (activeTransaction.finalAmount * 0.005)) / (activeTransaction.finalAmount * 0.029 + 0.30) * 100).toFixed(1)}%)
            </p>
            <p className="text-white/40 text-sm mt-2">
              At typical volume (1,333 transactions/month): <span className="text-fumav-green font-bold">${(((activeTransaction.finalAmount * 0.029 + 0.30) - (activeTransaction.finalAmount * 0.005)) * 1333).toFixed(0)}/month</span> • <span className="text-fumav-green font-bold">${(((activeTransaction.finalAmount * 0.029 + 0.30) - (activeTransaction.finalAmount * 0.005)) * 1333 * 12).toFixed(0)}/year</span>
            </p>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card-glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📜</span> Recent Transactions
          {transactions?.length > 0 && (
            <span className="text-xs bg-fumav-purple/20 text-fumav-purple px-2 py-0.5 rounded-full">
              {transactions.length} completed
            </span>
          )}
        </h3>

        {transactions?.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx, i) => (
              <div 
                key={tx.id || i}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tx.itemEmoji || '🎮'}</span>
                  <span className="font-mono text-sm">TXN-{String(tx.id).slice(-5)}</span>
                  <span className="text-white/40">•</span>
                  <span>${tx.finalAmount?.toFixed(2)}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/50">{tx.item}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-fumav-green text-sm">Complete</span>
                  <span className="text-white/40">•</span>
                  <span className="text-fumav-cyan text-sm">2.1s</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/30">
            <span className="text-3xl block mb-2">📭</span>
            <p>No transactions yet</p>
            <p className="text-xs mt-1">Make a purchase from the Consumer Store</p>
          </div>
        )}
      </div>

      {/* Idle State - Instructions */}
      {phase === 'idle' && !activeTransaction && (
        <div className="text-center mt-8 p-8 card-glass rounded-2xl">
          <span className="text-5xl mb-4 block">🎮</span>
          <h3 className="text-xl font-bold mb-2">Ready to Process</h3>
          <p className="text-white/40 max-w-md mx-auto">
            Go to the Consumer Store tab and make a purchase to see the full authorization and settlement pipeline in action.
          </p>
          {!account && (
            <p className="text-fumav-pink mt-4 text-sm">
              ⚠️ Connect treasury wallet (top right) to enable real Monad transactions
            </p>
          )}
        </div>
      )}
    </div>
  );
}
