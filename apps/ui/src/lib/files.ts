export const downloadBlob = (blob: Blob, fileName: string) => {
  const fileUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const openBlobInNewTab = (blob: Blob) => {
  const file = window.URL.createObjectURL(blob)
  window.open(file, "_blank")
}
