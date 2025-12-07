import { createThirdwebClient, defineChain } from "thirdweb";

// Create thirdweb client - you'll need to add your client ID
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo", // Replace with your thirdweb client ID
});

// Define Monad Testnet
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpc: "https://testnet-rpc.monad.xyz",
  blockExplorers: [
    {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  ],
  testnet: true,
});

// Mock USDC contract address on Monad Testnet (we'll deploy or use existing)
export const USDC_ADDRESS = "0x0000000000000000000000000000000000000000"; // Will update with actual address

// Treasury wallet (Fumav's wallet that holds USDC)
export const TREASURY_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update with your wallet

// Demo merchant wallet
export const MERCHANT_ADDRESS = "0xcbb8744f23649d5a37c152d2943c2d97fc427488";

// Explorer URL helpers
export const getExplorerUrl = (txHash) =>
  `https://testnet.monadexplorer.com/tx/${txHash}`;

export const getAddressUrl = (address) =>
  `https://testnet.monadexplorer.com/address/${address}`;
