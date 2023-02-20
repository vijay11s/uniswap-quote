import "./styles.css";
import { useState, ChangeEvent } from "react";
import useQuote from "./hooks/useQuote";
import { SwapRoute } from "@uniswap/smart-order-router";
import { currentConfig } from "./lib/config";

export default function App() {
  const [amountOut, setAmountOut] = useState<string>("0");
  const [route, setRoute] = useState<SwapRoute | null>(null);
  const [amountIn, setAmountIn] = useState<number>(2000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getAmountOut, getPath } = useQuote(amountIn);

  async function handleClick() {
    if (isLoading) {
      return;
    }
    if (amountIn <= 0) {
      alert("Amount should be greater than 0");
      return;
    }
    try {
      setIsLoading(true);
      const [amount, path] = await Promise.all([getAmountOut(), getPath()]);
      setAmountOut(amount);
      setRoute(path);
    } catch (err) {
      alert("Something went wrong. Please try after sometime");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="App">
      <h1>Uniswap Quote Fetch</h1>
      <div className="input-container">
        <label>Enter the amount of USDC to be swapped</label>
        <input
          type="number"
          value={amountIn}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAmountIn(Number(e.target.value))
          }
          placeholder="Enter amount"
        />
        <button onClick={handleClick}>
          {isLoading ? "Please wait" : "Get Amount Out"}
        </button>
      </div>
      {amountOut !== "0" && (
        <h3>{`Quote output amount: ${amountOut} ${currentConfig.tokens.out.symbol}`}</h3>
      )}
      {route && (
        <h3>
          Optimal Path:{" "}
          {route.route
            .map((r) => r.tokenPath.map((t) => t.symbol).join(" -> "))
            .join(", ")}
        </h3>
      )}
    </div>
  );
}
