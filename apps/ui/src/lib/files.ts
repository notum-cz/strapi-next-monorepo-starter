export const downloadBlob = (blob: Blob, fileName: string) => {
  const fileUrl = globalThis.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = fileUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
}

export const openBlobInNewTab = (blob: Blob) => {
  const file = globalThis.URL.createObjectURL(blob)
  window.open(file, "_blank")
}
