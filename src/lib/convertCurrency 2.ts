import axios from "axios"

const { CURRENCY_API } = process.env

if (!CURRENCY_API) {
  throw new Error("Missing CURRENCY_API environment variable")
}

export default async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<number | undefined> {
  const { data } = await axios.get(CURRENCY_API as string, {
    params: {
      base_currency: from,
    },
  })

  const rate = data.data[to] as number | undefined

  if (!rate) {
    return undefined
  } else {
    return amount * rate
  }
}
