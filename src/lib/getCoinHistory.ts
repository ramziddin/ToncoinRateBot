import axios from "axios"
import { CACHE_TIME_MS, CG_COIN_HISTORY_API, Currency } from "./constants"

export type CoinHistory = Array<[number, number]>

export const coinHistoryCache = new Map<string, CoinHistory>()

export default async function getCoinHistory(
  coinId: string,
  currency: Currency,
  days: number
) {
  const key = `${coinId}-${currency}-${days}`

  const cache = coinHistoryCache.get(key)

  if (cache) {
    return cache
  } else {
    const coinHistory = await axios.get(CG_COIN_HISTORY_API, {
      params: {
        vs_currency: currency,
        days,
      },
    })

    const prices = coinHistory.data.prices as [number, number][]

    coinHistoryCache.set(key, prices)

    setTimeout(() => coinHistoryCache.delete(key), CACHE_TIME_MS)

    return prices
  }
}
