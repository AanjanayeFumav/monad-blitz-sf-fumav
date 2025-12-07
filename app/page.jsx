"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client, monadTestnet } from "../lib/thirdweb";
import ConsumerStore from "../components/ConsumerStore";
import Orchestrator from "../components/Orchestrator";
import MerchantDashboard from "../components/MerchantDashboard";

const TABS = [
  { id: "consumer", label: "Consumer Store", icon: "🛒" },
  { id: "orchestrator", label: "Orchestrator", icon: "⚡" },
  { id: "merchant", label: "Merchant Dashboard", icon: "🏪" },
];

export default function Home() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState("consumer");
  const [transactions, setTransactions] = useState([]);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [merchantBalance, setMerchantBalance] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState(50000); // Mock treasury balance

  // Handle purchase from ConsumerStore
  const handlePurchase = async (item, discount) => {
    const txId = Date.now();
    const finalAmount = item.price - discount;

    const newTransaction = {
      id: txId,
      item: item.name,
      itemEmoji: item.image,
      originalAmount: item.price,
      discount,
      finalAmount,
      status: "pending",
      createdAt: new Date(),
    };

    setActiveTransaction(newTransaction);
    // Auto-switch to orchestrator to show the pipeline
    setActiveTab("orchestrator");
  };

  // Handle settlement completion from Orchestrator
  const handleSettlement = (tx, txHash) => {
    const settledTx = {
      ...tx,
      status: "settled",
      txHash,
      settledAt: new Date(),
    };

    setTransactions(prev => [settledTx, ...prev]);
    setMerchantBalance(prev => prev + tx.finalAmount);
    setTreasuryBalance(prev => prev - tx.finalAmount); // Reduce treasury
    setActiveTransaction(null);

    // Auto-switch to merchant dashboard after settlement
    setTimeout(() => {
      setActiveTab("merchant");
    }, 1500);
  };

  return (
    <div className="min-h-screen grid-pattern">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fumav-purple to-fumav-pink flex items-center justify-center font-bold text-lg">
              F
            </div>
            <div>
              <h1 className="font-bold text-xl">Fumav</h1>
              <p className="text-xs text-white/40">Stablecoin Credit Card</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-fumav-green/10 border border-fumav-green/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fumav-green animate-pulse" />
              <span className="text-xs text-fumav-green font-medium">Monad Testnet</span>
            </div>
            <ConnectButton
              client={client}
              chain={monadTestnet}
              theme="dark"
              connectButton={{
                label: "Treasury Wallet",
                style: {
                  background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  fontWeight: "600",
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-fumav-purple text-white"
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.id === "orchestrator" && activeTransaction && (
                  <span className="w-2 h-2 rounded-full bg-fumav-green animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "consumer" && (
          <ConsumerStore onPurchase={handlePurchase} />
        )}

        {activeTab === "orchestrator" && (
          <Orchestrator
            account={account}
            activeTransaction={activeTransaction}
            onSettlement={handleSettlement}
            treasuryBalance={treasuryBalance}
            transactions={transactions}
          />
        )}

        {activeTab === "merchant" && (
          <MerchantDashboard
            transactions={transactions}
            balance={merchantBalance}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/30 text-sm">
          <p>Built for Monad Blitz SF × x402 Edition | Powered by thirdweb</p>
          <p className="mt-2">Fumav — Making payments equitable for merchants and consumers</p>
        </div>
      </footer>
    </div>
  );
}
