import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimitedQueue } from "@/infrastructure/queue/RateLimitedQueue";

const deferred = <T = void>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

describe("RateLimitedQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => vi.useRealTimers());

  it("runs tasks in arrival order (FIFO) when priorities tie", async () => {
    const queue = new RateLimitedQueue({ concurrency: 1, minIntervalMs: 0 });
    const order: string[] = [];
    const tasks = ["a", "b", "c"].map((id) => queue.enqueue(async () => order.push(id)));

    await vi.runAllTimersAsync();
    await Promise.all(tasks);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("serves higher priority first among waiting tasks", async () => {
    const queue = new RateLimitedQueue({ concurrency: 1, minIntervalMs: 0 });
    const order: string[] = [];
    const gate = deferred();

    const first = queue.enqueue(async () => {
      order.push("first");
      await gate.promise;
    });
    await vi.advanceTimersByTimeAsync(0); // "first" is now running

    const low = queue.enqueue(async () => order.push("low"), 0);
    const high = queue.enqueue(async () => order.push("high"), 10);
    const mid = queue.enqueue(async () => order.push("mid"), 5);

    gate.resolve();
    await vi.runAllTimersAsync();
    await Promise.all([first, low, high, mid]);
    expect(order).toEqual(["first", "high", "mid", "low"]);
  });

  it("never exceeds the concurrency limit", async () => {
    const queue = new RateLimitedQueue({ concurrency: 2, minIntervalMs: 0 });
    let running = 0;
    let maxRunning = 0;

    const tasks = Array.from({ length: 6 }, () =>
      queue.enqueue(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((resolve) => setTimeout(resolve, 100));
        running--;
      }),
    );

    await vi.runAllTimersAsync();
    await Promise.all(tasks);
    expect(maxRunning).toBe(2);
  });

  it("keeps at least minIntervalMs between task starts", async () => {
    const queue = new RateLimitedQueue({ concurrency: 5, minIntervalMs: 1000 });
    const starts: number[] = [];
    const tasks = Array.from({ length: 3 }, () => queue.enqueue(async () => starts.push(Date.now())));

    await vi.runAllTimersAsync();
    await Promise.all(tasks);
    expect(starts).toEqual([0, 1000, 2000]);
  });

  it("propagates task results and errors to the caller without stopping the queue", async () => {
    const queue = new RateLimitedQueue({ concurrency: 1, minIntervalMs: 0 });
    const failing = queue.enqueue(async () => {
      throw new Error("boom");
    });
    const failingExpectation = expect(failing).rejects.toThrow("boom");
    const succeeding = queue.enqueue(async () => 42);

    await vi.runAllTimersAsync();
    await failingExpectation;
    await expect(succeeding).resolves.toBe(42);
  });

  it("rejects invalid options", () => {
    expect(() => new RateLimitedQueue({ concurrency: 0, minIntervalMs: 0 })).toThrow(RangeError);
    expect(() => new RateLimitedQueue({ concurrency: 1, minIntervalMs: -1 })).toThrow(RangeError);
  });
});
