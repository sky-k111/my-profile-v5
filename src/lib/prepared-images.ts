const images = new Map<string, HTMLImageElement>();
const requests = new Map<string, Promise<HTMLImageElement>>();

export function preparedImage(src: string): HTMLImageElement | undefined {
  return images.get(src);
}

export function prepareImage(src: string): Promise<HTMLImageElement> {
  const ready = images.get(src);
  if (ready) return Promise.resolve(ready);
  const pending = requests.get(src);
  if (pending) return pending;
  const image = new Image();
  image.src = src;
  const request = image.decode().then(() => {
    images.set(src, image);
    return image;
  }).finally(() => requests.delete(src));
  requests.set(src, request);
  return request;
}
