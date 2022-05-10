import ytdl from "ytdl-core"
import { getUniqueArray } from "./getUniqueArray"

export function getBestQuality(formats: ytdl.videoFormat[]) {
  const filteredFormats = formats
    .map(format => {
      if (format?.qualityLabel) {
        return {
          quality: format.qualityLabel,
          itag: format.itag
        }
      }
    })
    .filter(Boolean)

  const noRepeatingElementsFormats = getUniqueArray(filteredFormats, [
    "quality"
  ])

  const parsedArray = noRepeatingElementsFormats.map(format => {
    const quality = format.quality.split("p") // e.g. for 1080p, returns ["1080", "p"]

    return parseInt(quality[0])
  })

  const bestQuality = Math.max.apply(null, parsedArray)
  const bestFormat = filteredFormats.find(
    format => format.quality.split("p")[0] == bestQuality
  )

  return bestFormat.itag
}
