export function saveFile(data: Blob, filename: string) {
  const a = document.createElement('a');
  const objectUrl = URL.createObjectURL(data);
  a.setAttribute('download', filename);
  a.href = objectUrl;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
