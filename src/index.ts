import fs from "fs"
import async from "async"
import ytdl from "ytdl-core"
import cliProgress from "cli-progress"

import * as readline from "node:readline"
import { stdin as input, stdout as output } from "node:process"

import { getDirectory } from "./utils/getDirectory"
import { getBestQuality } from "./utils/bestQuality"

const rl = readline.createInterface({ input, output })

rl.question("YouTube video URLs (separate URLs with a space): ", answer => {
  if (answer.length === 0) {
    console.log("Provide at least 1 URL")
    return rl.close()
  }

  const videoUrls = answer.split(" ")

  downloadVideoFromURL(videoUrls).then(() => console.log("Download complete"))

  rl.close()
})

function downloadVideoFromURL(urls: string[]): Promise<void> {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  return new Promise<void>((resolve, reject) => {
    async.eachLimit(
      urls,
      1,
      function (url: string, callback: () => void) {
        if (url.length <= 1) {
          return console.log(`${url} is not a valid URL`)
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
