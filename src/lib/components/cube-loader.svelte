<script lang="ts">
  type Variant = 'default' | 'success' | 'loading';
  type Props = {
    class?: string;
    size?: string;
    variant?: Variant;
  };

  let { class: className, size = '4rem', variant = 'default' }: Props = $props();

  const variants: Record<Variant, string> = {
    default:
      'bg-card/20 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)] backdrop-blur-[2px]',

    success:
      'bg-success/5 border border-success/40 shadow-[0_0_20px_rgba(var(--primary),0.2)] backdrop-blur-[2px]',

    loading:
      'bg-warn/5 border border-warn/40 shadow-[0_0_20px_rgba(var(--primary),0.2)] backdrop-blur-[2px]'
  };

  const faces = [
    { type: 'front', class: 'rotate-y-0' },
    { type: 'back', class: 'rotate-y-180' },
    { type: 'right', class: 'rotate-y-90' },
    { type: 'left', class: '-rotate-y-90' },
    { type: 'top', class: 'rotate-x-90' },
    { type: 'bottom', class: '-rotate-x-90' }
  ];
</script>

<div class={['scene text-primary', className].join(' ')} style="--size: {size}">
  <div class="cube">
    {#each faces as face}
      <div
        class={['cube-face transition-all duration-300', variants[variant], face.type].join(' ')}
      ></div>
    {/each}
  </div>
</div>

<style>
  .scene {
    width: var(--size);
    height: var(--size);
    perspective: 1000px;
  }

  .cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    animation: spin 4s linear infinite;
  }

  .cube-face {
    position: absolute;
    width: 100%;
    height: 100%;

    backface-visibility: visible;
  }

  .front {
    transform: rotateY(0deg) translateZ(calc(var(--size) / 2));
  }
  .back {
    transform: rotateY(180deg) translateZ(calc(var(--size) / 2));
  }
  .right {
    transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
  }
  .left {
    transform: rotateY(-90deg) translateZ(calc(var(--size) / 2));
  }
  .top {
    transform: rotateX(90deg) translateZ(calc(var(--size) / 2));
  }
  .bottom {
    transform: rotateX(-90deg) translateZ(calc(var(--size) / 2));
  }

  @keyframes spin {
    from {
      transform: rotateX(0deg) rotateY(0deg);
    }
    to {
      transform: rotateX(360deg) rotateY(360deg);
    }
  }
</style>
