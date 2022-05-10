import fs from "fs"
import os from "os"

export function getDirectory(dir: string) {
  const directory = `${os.homedir()}/${dir}`

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory)
  }

  return directory
}
