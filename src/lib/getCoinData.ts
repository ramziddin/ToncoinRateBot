import axios from "axios"
import { CACHE_TIME_MS, CG_COIN_DATA_API } from "./constants"

interface CoinData {
  price: {
    usd: number
    rub: number
  }

  high24h: {
    usd: number
    rub: number
  }

  low24h: {
    usd: number
    rub: number
  }
}

const coinDataCache = new Map<string, CoinData>()

export default async function getCoinData(coinId: string) {
  const cache = coinDataCache.get(coinId)

  if (cache) {
    return cache
  } else {
    const coinData = await axios.get(CG_COIN_DATA_API)

    const {
      data: {
        market_data: { current_price, high_24h, low_24h },
      },
    } = coinData

    const data = {
      price: {
        usd: current_price.usd,
        rub: current_price.rub,
      },
      high24h: {
        usd: high_24h.usd,
        rub: high_24h.rub,
      },
      low24h: {
        usd: low_24h.usd,
        rub: low_24h.rub,
      },
    }

    coinDataCache.set(coinId, data)

    setTimeout(() => coinDataCache.delete(coinId), CACHE_TIME_MS)

    return data
  }
}
