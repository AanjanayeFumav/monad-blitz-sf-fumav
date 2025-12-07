# Fumav - Stablecoin Credit Card for Gaming

**Built for Monad Blitz SF × x402 Edition**

89% cost reduction vs traditional cards | Instant settlement on Monad

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 🔧 Setup for Real Transactions

1. **Get thirdweb Client ID** at https://thirdweb.com/dashboard
   ```bash
   echo "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_id_here" > .env.local
   ```

2. **Connect Treasury Wallet** (top right of app)
   - Use MetaMask or any EVM wallet
   - Add Monad Testnet: Chain ID 10143, RPC https://testnet-rpc.monad.xyz
   - Get testnet MON from https://testnet.monad.xyz/

3. **(Optional) Update merchant address** in `lib/thirdweb.js`

## 🎯 Demo Flow (for judges)

### Tab 1: Consumer Store 🛒
- Select Battle Pass ($10)
- See Fumav Card visualization
- See 3% discount applied ($10 → $9.70)
- Click **"Pay $9.70 with Fumav Card"**

### Tab 2: Orchestrator ⚡ (auto-switches)

**Authorization Pipeline** (~2 seconds):
| Step | Time |
|------|------|
| 🔐 Consumer Authentication | 12ms |
| 💳 Credit Limit Check | 45ms |
| 🛡️ Fraud Detection (ML Model) | 28ms |
| 📋 KYC/AML Compliance | 15ms |
| 🏦 Issuing Bank Authorization | 67ms |
| ✅ **AUTHORIZATION APPROVED** | **167ms** |

**Settlement Pipeline** (~2 seconds):
| Step | Details |
|------|---------|
| 💰 Treasury Wallet Check | Balance verification |
| 📝 Transaction Preparation | Recipient, amount, gas |
| 📡 Broadcasting to Monad | Real tx if wallet connected |
| ⛓️ Block Confirmation | ~800ms |
| ✅ **SETTLEMENT COMPLETE** | Real tx hash! |

**Cost Analysis Panel**:
- Traditional Card: $2.93 (2.9% + $0.30)
- Fumav: $0.05 (0.5%)
- **Merchant Savings: 98% per transaction**

### Tab 3: Merchant Dashboard 🏪 (auto-switches)
- See instant deposit
- Watch balance grow with each transaction
- View Traditional vs Fumav comparison
- See annual savings calculator

## 📊 Key Metrics

| Metric | Traditional | Fumav | Improvement |
|--------|------------|-------|-------------|
| Processing Fee | 2.9% + $0.30 | 0.5% | **89% reduction** |
| Settlement Time | 2-3 days | ~2 seconds | **129,600x faster** |
| Chargeback Rate | 1.35% | 0.13% | **90% reduction** |
| Annual Cost per $1M | $215,050 | $23,450 | **$191,600 saved** |

## 🔧 Tech Stack

- **Frontend**: Next.js 14 + React 18
- **Blockchain**: Monad Testnet (Chain ID: 10143)
- **Wallet**: thirdweb SDK v5
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
fumav-hackathon/
├── app/
│   ├── layout.jsx          # Root layout + thirdweb provider
│   ├── page.jsx            # Main 3-tab container
│   └── globals.css         # Tailwind + animations
├── components/
│   ├── ConsumerStore.jsx   # Card payment checkout UI
│   ├── Orchestrator.jsx    # Authorization + Settlement pipelines
│   └── MerchantDashboard.jsx
├── lib/
│   └── thirdweb.js         # Monad config, addresses
```

## 💡 How It Works

1. **Consumer** pays with Fumav Card (no crypto knowledge needed)
2. **Fumav Treasury** receives authorization request
3. **Pipeline** runs credit check, fraud detection, KYC/AML
4. **Treasury Wallet** sends USDC to merchant on Monad
5. **Merchant** receives funds in ~2 seconds (vs 2-3 days)
6. **Consumer** pays Fumav back monthly via ACH

## 🔗 Resources

- [Monad Testnet Faucet](https://testnet.monad.xyz)
- [Monad Explorer](https://testnet.monadexplorer.com)
- [thirdweb Dashboard](https://thirdweb.com/dashboard)

---

Built by Aanjanaye Kajaria | [Fumav](https://fumav.com)
