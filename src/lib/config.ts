import { SupportedChainId, Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";

export const WETH_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);

export const USDC_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  6,
  "USDC",
  "USD//C"
);

export const currentConfig = {
  rpc: {
    local: "http://localhost:8545",
    mainnet: "https://rpc.ankr.com/eth"
  },
  tokens: {
    in: USDC_TOKEN,
    amountIn: 2000,
    out: WETH_TOKEN,
    poolFee: FeeAmount.MEDIUM,
    decimals: 18
  }
};
