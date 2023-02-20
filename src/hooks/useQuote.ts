import { ethers } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import {
  QUOTER_CONTRACT_ADDRESS,
  POOL_FACTORY_CONTRACT_ADDRESS,
} from "../lib/constant";
import { currentConfig } from "../lib/config";
import { computePoolAddress } from "@uniswap/v3-sdk";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { fromReadableAmount, toReadableAmount } from "../lib/helpers";
import {
  AlphaRouter,
  ChainId,
  SwapOptionsUniversalRouter,
  SwapRoute,
  SwapType,
} from "@uniswap/smart-order-router";
import { TradeType, CurrencyAmount, Percent } from "@uniswap/sdk-core";

export default function useQuote(amountIn: number) {
  const provider = new ethers.providers.JsonRpcProvider(
    currentConfig.rpc.mainnet
  );

  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    provider
  );

  async function getPoolConstants(): Promise<{
    token0: string;
    token1: string;
    fee: number;
  }> {
    const currentPoolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA: currentConfig.tokens.in,
      tokenB: currentConfig.tokens.out,
      fee: currentConfig.tokens.poolFee,
    });

    const poolContract = new ethers.Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      provider
    );
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    return {
      token0,
      token1,
      fee,
    };
  }

  async function getAmountOut(): Promise<string> {
    try {
      const poolConstants = await getPoolConstants();
      const quotedAmountOut =
        await quoterContract.callStatic.quoteExactInputSingle(
          poolConstants.token0,
          poolConstants.token1,
          poolConstants.fee,
          fromReadableAmount(
            amountIn,
            currentConfig.tokens.in.decimals
          ).toString(),
          0
        );
      return toReadableAmount(
        quotedAmountOut,
        currentConfig.tokens.out.decimals
      );
    } catch (err) {
      console.log(err);
      return "0";
    }
  }

  async function getPath(): Promise<SwapRoute | null> {
    const router = new AlphaRouter({
      chainId: ChainId.MAINNET,
      provider: provider as any,
    });
    const options: SwapOptionsUniversalRouter = {
      slippageTolerance: new Percent(50, 10_000),
      type: SwapType.UNIVERSAL_ROUTER,
    };
    const route = await router.route(
      CurrencyAmount.fromRawAmount(
        currentConfig.tokens.in,
        fromReadableAmount(
          amountIn,
          currentConfig.tokens.in.decimals
        ).toString()
      ),
      currentConfig.tokens.out,
      TradeType.EXACT_INPUT,
      options
    );

    return route;
  }

  return { getAmountOut, getPath };
}
