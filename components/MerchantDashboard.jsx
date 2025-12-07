"use client";

import { MERCHANT_ADDRESS, getExplorerUrl, getAddressUrl } from "../lib/thirdweb";

export default function MerchantDashboard({ transactions, balance }) {
  const totalSaved = transactions.reduce((acc, tx) => {
    // Traditional would have charged 2.9% + $0.30
    const traditionalFee = tx.finalAmount * 0.029 + 0.30;
    // Fumav charges 0.5%
    const fumavFee = tx.finalAmount * 0.005;
    return acc + (traditionalFee - fumavFee);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fumav-green/20 to-fumav-cyan/20 flex items-center justify-center text-3xl">
            🏪
          </div>
          <div>
            <h2 className="text-2xl font-bold">Pixel Games Studio</h2>
            <a 
              href={getAddressUrl(MERCHANT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fumav-cyan text-sm font-mono hover:underline"
            >
              {MERCHANT_ADDRESS.slice(0, 10)}...{MERCHANT_ADDRESS.slice(-8)}
            </a>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-sm">Merchant since</p>
          <p className="font-medium">December 2025</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Wallet Balance" 
          value={`$${balance.toFixed(2)}`}
          subtext="USDC on Monad"
          variant="green"
          icon="💰"
        />
        <StatCard 
          label="Today's Sales" 
          value={`$${balance.toFixed(2)}`}
          subtext={`${transactions.length} transactions`}
          variant="cyan"
          icon="📈"
        />
        <StatCard 
          label="Fees Saved" 
          value={`$${totalSaved.toFixed(2)}`}
          subtext="vs traditional cards"
          variant="purple"
          icon="🎉"
        />
        <StatCard 
          label="Avg Settlement" 
          value="~2 sec"
          subtext="instant on Monad"
          variant="pink"
          icon="⚡"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Deposits */}
        <div className="col-span-2 card-glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📥</span> Recent Deposits
          </h3>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div 
                  key={tx.id}
                  className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${
                    index === 0 ? 'ring-2 ring-fumav-green/50 animate-fade-in' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      index === 0 ? 'bg-fumav-green/20' : 'bg-white/10'
                    }`}>
                      {index === 0 ? '✨' : '✓'}
                    </div>
                    <div>
                      <p className="font-medium">{tx.item}</p>
                      <p className="text-xs text-white/40">
                        {tx.settledAt?.toLocaleTimeString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${index === 0 ? 'text-fumav-green' : 'text-white'}`}>
                      +${tx.finalAmount.toFixed(2)}
                    </p>
                    {tx.txHash && (
                      <a 
                        href={getExplorerUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-fumav-cyan hover:underline font-mono"
                      >
                        {tx.txHash.slice(0, 8)}...
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/30">
              <span className="text-4xl block mb-3">📭</span>
              <p>No deposits yet</p>
              <p className="text-sm mt-1">Make a purchase from the Consumer Store to see instant deposits!</p>
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        <div className="card-glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Cost Comparison
          </h3>

          <div className="space-y-4">
            {/* Traditional */}
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60">Traditional Card</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Legacy</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Processing Fee</span>
                  <span className="text-red-400">2.9% + $0.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Settlement</span>
                  <span className="text-red-400">2-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Chargeback Rate</span>
                  <span className="text-red-400">1.35%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <div className="flex justify-between font-medium">
                  <span className="text-white/60">Cost per $1M</span>
                  <span className="text-red-400">$215,050</span>
                </div>
              </div>
            </div>

            {/* Fumav */}
            <div className="p-4 rounded-xl bg-fumav-green/5 border border-fumav-green/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60">Fumav Card</span>
                <span className="text-xs px-2 py-0.5 rounded bg-fumav-green/20 text-fumav-green">Active</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Processing Fee</span>
                  <span className="text-fumav-green">0.5% flat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Settlement</span>
                  <span className="text-fumav-green">~2 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Chargeback Rate</span>
                  <span className="text-fumav-green">0.13%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-fumav-green/20">
                <div className="flex justify-between font-medium">
                  <span className="text-white/60">Cost per $1M</span>
                  <span className="text-fumav-green">$23,450</span>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-fumav-purple/10 to-fumav-pink/10 border border-fumav-purple/20">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-1">Annual Savings</p>
                <p className="text-3xl font-bold gradient-text">$191,600</p>
                <p className="text-xs text-white/40 mt-1">per $1M revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-8 card-glass rounded-2xl p-6 text-center">
        <p className="text-white/40 text-sm mb-2">How Fumav works for merchants</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-white/5">Consumer pays with Fumav Card</span>
          <span className="text-white/30">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-fumav-purple/20 text-fumav-purple">Fumav settles in USDC</span>
          <span className="text-white/30">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-fumav-green/20 text-fumav-green">Merchant receives instantly</span>
        </div>
        <p className="text-xs text-white/30 mt-4">
          Consumer repays Fumav monthly via ACH. Merchant gets paid immediately. Everyone wins.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, variant, icon }) {
  const variants = {
    green: "border-fumav-green/20 bg-fumav-green/5",
    cyan: "border-fumav-cyan/20 bg-fumav-cyan/5",
    purple: "border-fumav-purple/20 bg-fumav-purple/5",
    pink: "border-fumav-pink/20 bg-fumav-pink/5",
  };

  const valueColors = {
    green: "text-fumav-green",
    cyan: "text-fumav-cyan",
    purple: "text-fumav-purple",
    pink: "text-fumav-pink",
  };

  return (
    <div className={`card-glass rounded-2xl p-5 border ${variants[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColors[variant]}`}>{value}</p>
      <p className="text-xs text-white/30 mt-1">{subtext}</p>
    </div>
  );
}
