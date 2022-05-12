export function validateYTURL(url: string): boolean {
  const valid = "https://www.youtube.com/watch"

  return url.startsWith(valid)
}
