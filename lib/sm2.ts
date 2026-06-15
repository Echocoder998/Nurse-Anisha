// SM-2 spaced repetition algorithm
// quality: 0 (again), 3 (hard), 4 (good), 5 (easy)

export type CardState = {
  ease: number;
  interval: number;
  reps: number;
};

export function sm2(card: CardState, quality: number): CardState & { nextReview: number } {
  let { ease, interval, reps } = card;
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
    ease = Math.max(
      1.3,
      ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ease, interval, reps, nextReview };
}
