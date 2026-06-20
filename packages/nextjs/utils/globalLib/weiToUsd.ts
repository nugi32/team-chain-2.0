import axios from "axios";
import { formatEther } from "viem";

/**
 * Convert Wei to USD using the current ETH/USD price from CoinGecko.
 *
 * @param wei - ETH amount in wei
 * @returns USD value as a number
 */
export async function weiToUsd(wei: bigint): Promise<number> {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: "usd",
        },
        timeout: 10000,
      }
    );

    const ethPriceUsd = data?.ethereum?.usd;

    if (typeof ethPriceUsd !== "number") {
      throw new Error("Failed to fetch ETH price");
    }

    const ethAmount = Number(formatEther(wei));

    return ethAmount * ethPriceUsd;
  } catch (error) {
    console.error("weiToUsd error:", error);
    throw new Error("Unable to convert wei to USD");
  }
}