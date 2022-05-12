import fs from "fs"
import async from "async"
import ytdl from "ytdl-core"
import cliProgress from "cli-progress"

import { getDirectory } from "./utils/getDirectory"
import { getBestQuality } from "./utils/bestQuality"
import { validateYTURL } from "./utils/validateYTURL"

export function downloadVideoFromURL(urls: string[]): Promise<void> {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  return new Promise<void>((resolve, reject) => {
    async.eachLimit(
      urls,
      1,
      function (url: string, callback: () => void) {
        if (!validateYTURL(url)) {
          return reject({ message: `${url} is not a valid YouTube video URL` })
        }

        let downloadStarted = false
        const filename = `${url.split("=")[1]}.mp4`

        ytdl
          .getInfo(url)
          .then(info => {
            const bestQuality = getBestQuality(info.formats)

            ytdl(url, { quality: bestQuality })
              .on("progress", (_, totalDownloaded, total) => {
                if (!downloadStarted) {
                  console.log(url)
                  bar.start(total, 0)
                  downloadStarted = true
                }

                bar.update(totalDownloaded)
              })
              .on("end", () => {
                bar.stop()
                callback()
              })
              .pipe(
                fs.createWriteStream(`${getDirectory("Downloads")}/${filename}`)
              )
          })
          .catch(e => console.log(e.message))
      }.bind(this),
      function (err) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}
