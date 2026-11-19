export type Leave = () => Promise<void>;

/** Run every leave animation, then remove the nodes. Without leaves, removal is synchronous. */
export function leaveThen(leaves: Leave[], remove: () => void): Promise<void> {
  if (leaves.length === 0) {
    remove();
    return Promise.resolve();
  }
  return Promise.all(leaves.map((leave) => leave())).then(remove);
}
