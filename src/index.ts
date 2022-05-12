import * as readline from "node:readline"
import { stdin as input, stdout as output } from "node:process"

import { downloadVideoFromURL } from "./downloadVideo"

const rl = readline.createInterface({ input, output })

rl.question("YouTube video URLs (separate URLs with a space): ", answer => {
  if (answer.length === 0) {
    console.log("Provide at least 1 URL")
    return rl.close()
  }

  const videoUrls = answer.split(" ")

  downloadVideoFromURL(videoUrls)
    .then(() => console.log("Download complete"))
    .catch(e => console.log(e.message))

  rl.close()
})
