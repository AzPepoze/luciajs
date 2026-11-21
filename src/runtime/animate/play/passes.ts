/** One trip along the timeline. `from` jumps there first, so a loop can restart without reversing. */
export interface Pass {
  to: 0 | 1;
  from?: 0 | 1;
}

export interface LoopSpec {
  /** Infinity loops forever. */
  count: number;
  backAndForth: boolean;
}

const FORWARD: Pass[] = [{ to: 1 }];

export const LEAVE: Pass[] = [{ to: 0 }];

export function forwardPasses(loop: LoopSpec | undefined): Iterable<Pass> {
  return loop ? loopPasses(loop) : FORWARD;
}

function* loopPasses({ count, backAndForth }: LoopSpec): Generator<Pass> {
  for (let i = 0; i < count; i++) {
    if (backAndForth) {
      yield { to: 1 };
      yield { to: 0 };
    } else {
      yield { from: 0, to: 1 };
    }
  }
}
