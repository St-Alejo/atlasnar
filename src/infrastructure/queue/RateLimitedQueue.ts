export interface QueueOptions {
  readonly concurrency: number; // max tasks running at once
  readonly minIntervalMs: number; // min gap between task starts
}

interface QueueItem {
  readonly priority: number;
  readonly sequence: number;
  readonly run: () => Promise<void>;
}

/**
 * Priority queue with bounded concurrency and a minimum interval between
 * task starts. Limits the rate within a single process (build worker,
 * serverless instance or browser tab), not globally.
 */
export class RateLimitedQueue {
  private readonly items: QueueItem[] = [];
  private active = 0;
  private lastStart = Number.NEGATIVE_INFINITY;
  private sequence = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: QueueOptions) {
    if (options.concurrency < 1) throw new RangeError("concurrency must be >= 1");
    if (options.minIntervalMs < 0) throw new RangeError("minIntervalMs must be >= 0");
  }

  get pending(): number {
    return this.items.length;
  }

  get running(): number {
    return this.active;
  }

  /** Higher priority runs first; ties are served in arrival order (FIFO). */
  enqueue<T>(task: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.items.push({
        priority,
        sequence: this.sequence++,
        run: () => Promise.resolve().then(task).then(resolve, reject),
      });
      this.items.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
      this.drain();
    });
  }

  private drain(): void {
    if (this.timer || this.active >= this.options.concurrency || this.items.length === 0) {
      return;
    }

    const wait = Math.max(0, this.lastStart + this.options.minIntervalMs - Date.now());

    this.timer = setTimeout(() => {
      this.timer = null;
      const next = this.items.shift();
      if (!next) return;

      this.active++;
      this.lastStart = Date.now();

      void next.run().finally(() => {
        this.active--;
        this.drain();
      });

      this.drain(); // there may be room for more concurrent tasks
    }, wait);
  }
}
