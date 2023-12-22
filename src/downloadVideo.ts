import fs from "fs"
import async from "async"
import ytdl from "ytdl-core"
import cp from "child_process"
import ffmpeg from "ffmpeg-static"

import { getDirectory } from "./utils/getDirectory"
import { getBestQuality } from "./utils/bestQuality"
import { validateYTURL } from "./utils/validateYTURL"
import { downloadFromFilter } from "./utils/downloadFromFilter"

export function downloadVideoFromURL(urls: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    async.eachLimit(
      urls,
      1,
      function (url: string) {
        if (!validateYTURL(url)) {
          return reject({ message: `${url} is not a valid YouTube video URL` })
        }

        const filename = `${url.split("=")[1]}.mp4`

        ytdl
          .getInfo(url)
          .then(info => {
            const bestVideoQuality = getBestQuality(info.formats)

            const audio = downloadFromFilter(url, "highestaudio", "audioonly")
            const video = downloadFromFilter(url, bestVideoQuality, "videoonly")

            const ffmpegProcess = cp.spawn(
              ffmpeg,
              [
                "-i",
                `pipe:3`,
                "-i",
                `pipe:4`,
                "-map",
                "0:v",
                "-map",
                "1:a",
                "-c:v",
                "copy",
                "-c:a",
                "libmp3lame",
                "-crf",
                "27",
                "-preset",
                "veryfast",
                "-movflags",
                "frag_keyframe+empty_moov",
                "-f",
                "mp4",
                "-loglevel",
                "error",
                "-"
              ],
              {
                stdio: ["pipe", "pipe", "pipe", "pipe", "pipe"]
              }
            )

            video.pipe(ffmpegProcess.stdio[3] as NodeJS.WritableStream)
            audio.pipe(ffmpegProcess.stdio[4] as NodeJS.WritableStream)

            ffmpegProcess.stdio[1].pipe(
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
