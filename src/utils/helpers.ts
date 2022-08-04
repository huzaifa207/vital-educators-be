export function PickKeys(obj: Record<string, any>, keys: string[]): Record<string, any> {
  const n: Record<string, any> = {};
  for (const k of keys) {
    n[k] = obj[k];
  }
  return n;
}

export function DeleteKeys(obj: Record<string, any>, keys: string[]): Record<string, any> {
  const n: Record<string, any> = Object.assign({}, obj);
  for (const k of keys) {
    delete n[k];
  }
  return n;
}
