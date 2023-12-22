import ytdl from "ytdl-core"
import cliProgress from "cli-progress"

export function downloadFromFilter(
  url: string,
  quality: string | number,
  filter: ytdl.Filter
) {
  let downloadStarted = false
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  const result = ytdl(url, { quality, filter })
    .on("progress", (_, totalDownloaded, total) => {
      if (!downloadStarted) {
        bar.start(total, 0)
        downloadStarted = true
      }

      bar.update(totalDownloaded)
    })
    .on("end", () => {
      bar.stop()
    })

  return result
}
