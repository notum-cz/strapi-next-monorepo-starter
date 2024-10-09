export function isLocalLink(link: string): boolean {
  try {
    return (
      link.startsWith("/") ||
      window.location.hostname === new URL(link).hostname
    )
  } catch (error) {
    return false
  }
}
