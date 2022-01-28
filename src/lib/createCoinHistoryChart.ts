import { ChartConfiguration, ScriptableContext } from "chart.js"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import { writeFile, unlink, mkdir } from "fs/promises"
import { existsSync } from "fs"
import getCoinHistory from "./getCoinHistory"
import { CACHE_TIME_MS, TMP_DIRECTORY } from "./constants"

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1000,
  height: 700,
  backgroundColour: "#171717",
})

const gradient =
  (hexOpacity: string = "FF") =>
  ({ chart }: ScriptableContext<"line">) => {
    const gradientStroke = chart.ctx.createLinearGradient(500, 0, 100, 0)

    gradientStroke.addColorStop(0, `#0052D4${hexOpacity}`)
    gradientStroke.addColorStop(1, `#6FB1FC${hexOpacity}`)

    return gradientStroke
  }

/**
 * @returns A promise that resolves to the path of the image.
 */
export default async function createCoinHistoryChart(
  coinId: Parameters<typeof getCoinHistory>[0],
  currency: Parameters<typeof getCoinHistory>[1],
  days: Parameters<typeof getCoinHistory>[2]
): Promise<string> {
  const filePath = `${TMP_DIRECTORY}/${coinId}-${currency}-${days}.png`

  // if (existsSync(filePath)) return filePath

  if (!existsSync(TMP_DIRECTORY)) await mkdir(TMP_DIRECTORY)

  setTimeout(async () => {
    try {
      await unlink(filePath)
    } catch (error) {}
  }, CACHE_TIME_MS)

  const coinHistory = await getCoinHistory(coinId, currency, days)

  const configuration: ChartConfiguration<"line"> = {
    type: "line",
    options: {
      layout: {
        padding: {
          top: 60,
          left: 10,
          right: 40,
          bottom: 30,
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 20,
              weight: "bold",
            },
            color: "white",
          },
        },
        y: {
          ticks: {
            font: {
              size: 20,
              weight: "bold",
            },
            color: "white",
            padding: 20,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    data: {
      labels: coinHistory.map(([timestamp]) => {
        // Format date as DD/MM/YYYY
        const date = new Date(timestamp)
        const day = date.getDate()
        const month = date.getMonth() + 1

        return `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}`
      }),
      datasets: [
        {
          label: "Toncoin",
          data: coinHistory.map(([_, price]) => price),
          borderColor: gradient(),
          backgroundColor: gradient("15"),
          pointRadius: 0,
          fill: true,
        },
      ],
    },
  }

  const image = await chartJSNodeCanvas.renderToBuffer(configuration)

  await writeFile(filePath, image, "base64")

  return filePath
}
