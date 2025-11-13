import { getContext, setContext } from 'svelte';
import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';

export class Loading {
  progress = $state<Tween<number> | null>(null);
  state = $state<'started' | 'stopped'>('stopped');

  inProgress = $derived(this.progress && this.progress.current < 100);

  async start() {
    if (this.state === 'started') return;

    this.state = 'started';
    this.progress = new Tween(0, { duration: 200, easing: cubicOut });

    await this.progress.set(10, { duration: 100 });
    await this.progress.set(30, { duration: 100 });
    await this.progress.set(60, { duration: 100 });
    await this.progress.set(90, { duration: 100 });
  }

  async stop() {
    if (!this.progress || this.state !== 'started') return;

    this.state = 'stopped';
    await this.progress.set(100, { duration: 100 });
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.progress = null;
  }

  async withProgress<T>(fn: () => Promise<T>): Promise<T> {
    this.start();
    try {
      return await fn();
    } finally {
      await this.stop();
    }
  }
}

const KEY = Symbol('Loading');

export const setLoadingContext = () => {
  const loading = new Loading();
  setContext(KEY, loading);
  return loading;
};

export const getLoadingContext = () => getContext<Loading>(KEY);
