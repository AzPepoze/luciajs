/** What a controller drives. A slot's group fits this shape. */
export interface Member {
  forward(): Promise<void>;
  backward(): Promise<void>;
  seek(progress: number): void;
  cancel(): void;
}

export interface Controller {
  play(): Promise<void>;
  reverse(): Promise<void>;
  stop(): void;
  seek(progress: number): void;
  /** Used by the animate binding to register a slot. Returns the function that unregisters it. */
  attach(member: Member): () => void;
}

export function controller(): Controller {
  const members = new Set<Member>();
  return {
    async play() {
      await Promise.all([...members].map((member) => member.forward()));
    },
    async reverse() {
      await Promise.all([...members].map((member) => member.backward()));
    },
    stop() {
      for (const member of members) member.cancel();
    },
    seek(progress) {
      for (const member of members) member.seek(progress);
    },
    attach(member) {
      members.add(member);
      return () => {
        members.delete(member);
      };
    },
  };
}
