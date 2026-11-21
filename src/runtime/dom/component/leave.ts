export type Leave = () => Promise<void>;

export function leaveThen(leaves: Leave[], remove: () => void): Promise<void> {
  if (leaves.length === 0) {
    remove();
    return Promise.resolve();
  }
  return Promise.all(leaves.map((leave) => leave())).then(remove);
}
