export const TONCOIN_ID = "the-open-network"

export const CG_COIN_DATA_API = `https://api.coingecko.com/api/v3/coins/${TONCOIN_ID}`

export const CG_COIN_HISTORY_API = `https://api.coingecko.com/api/v3/coins/${TONCOIN_ID}/market_chart`

export const CRYPTO_BOT_REFERRAL_LINK = "t.me/CryptoBot?start=r-53279-market"

export const CACHE_TIME_MS = 1000 * 60 * 0.03 // 3 minutes

export enum Currency {
  USD = "usd",
  RUB = "rub",
}

export const TMP_DIRECTORY = "./tmp"
