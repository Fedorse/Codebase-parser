<script lang="ts">
  import {
    SvelteFlow,
    Background,
    Controls,
    Position,
    ConnectionLineType,
    type Node,
    type Edge
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import dagre from '@dagrejs/dagre';

  // ──────────────────────────────────────────────
  // МОК ДАННЫХ: мини-проект
  // ──────────────────────────────────────────────

  type Kind = 'route' | 'component' | 'store' | 'api' | 'util' | 'external';
  type Mod = { id: string; label: string; kind: Kind };

  // Узлы (модули)
  const mods: Mod[] = [
    { id: 'src/routes/+page.svelte', label: '+page.svelte', kind: 'route' },
    { id: 'src/lib/components/FileList.svelte', label: 'FileList.svelte', kind: 'component' },
    { id: 'src/lib/components/FileItem.svelte', label: 'FileItem.svelte', kind: 'component' },
    { id: 'src/lib/stores/files.ts', label: 'stores/files.ts', kind: 'store' },
    { id: 'src/lib/api/parser.ts', label: 'api/parser.ts', kind: 'api' },
    { id: 'src/lib/utils/format.ts', label: 'utils/format.ts', kind: 'util' },
    { id: '@tauri-apps/api/core', label: '@tauri-apps/api/core', kind: 'external' },
    { id: '$lib/types.ts', label: '$lib/types.ts', kind: 'util' }
  ];

  // Рёбра (A импортирует B): A -> B
  // Пример: страница импортирует список, стор и форматтер; список импортирует айтем и стор; и т.д.
  const deps: Array<{ from: string; to: string; note?: string }> = [
    { from: 'src/routes/+page.svelte', to: 'src/lib/components/FileList.svelte' },
    { from: 'src/routes/+page.svelte', to: 'src/lib/stores/files.ts' },
    { from: 'src/routes/+page.svelte', to: 'src/lib/utils/format.ts' },

    { from: 'src/lib/components/FileList.svelte', to: 'src/lib/components/FileItem.svelte' },
    { from: 'src/lib/components/FileList.svelte', to: 'src/lib/stores/files.ts' },

    { from: 'src/lib/components/FileItem.svelte', to: 'src/lib/utils/format.ts' },

    { from: 'src/lib/stores/files.ts', to: 'src/lib/api/parser.ts' },
    { from: 'src/lib/api/parser.ts', to: '@tauri-apps/api/core', note: 'invoke' },
    { from: 'src/lib/api/parser.ts', to: '$lib/types.ts' }
  ];

  // ──────────────────────────────────────────────
  // Построение графа для Svelte Flow
  // ──────────────────────────────────────────────

  type NodeData = { label: string; kind: Kind };

  const NODE_W = 220;
  const NODE_H = 40;

  let direction = $state<'LR' | 'TB'>('LR');
  let nodes = $state.raw<Node<NodeData>[]>([]);
  let edges = $state.raw<Edge[]>([]);

  const kindStyle: Record<Kind, { bg: string; border: string }> = {
    route: { bg: 'var(--muted)', border: '1px solid var(--border)' },
    component: { bg: 'var(--card)', border: '1px solid var(--border)' },
    store: {
      bg: 'color-mix(in oklab, var(--mint) 8%, var(--card))',
      border: '1px solid var(--border)'
    },
    api: {
      bg: 'color-mix(in oklab, var(--blue) 10%, var(--card))',
      border: '1px solid var(--border)'
    },
    util: {
      bg: 'color-mix(in oklab, var(--yellow) 10%, var(--card))',
      border: '1px solid var(--border)'
    },
    external: {
      bg: 'color-mix(in oklab, var(--foreground) 6%, var(--card))',
      border: '1px dashed var(--border)'
    }
  };

  function buildNodes(): Node<NodeData>[] {
    return mods.map((m) => ({
      id: m.id,
      type: 'default',
      data: { label: m.label, kind: m.kind },
      position: { x: 0, y: 0 },
      width: NODE_W,
      height: NODE_H,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      style: {
        padding: '6px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        background: kindStyle[m.kind].bg,
        border: kindStyle[m.kind].border
      }
    }));
  }

  function buildEdges(): Edge[] {
    return deps.map((d, i) => ({
      id: `${d.from}->${d.to}-${i}`,
      source: d.from,
      target: d.to,
      type: 'smoothstep',
      animated: d.to.startsWith('@') || d.note === 'dynamic', // пример: внешние/динамические подсветим анимацией
      label: d.note,
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 8,
      labelShowBg: !!d.note
    }));
  }

  function layoutWithDagre(nodesIn: Node[], edgesIn: Edge[], dir: 'LR' | 'TB') {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: dir, nodesep: 28, ranksep: 44 });

    nodesIn.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
    edgesIn.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    const isH = dir === 'LR';
    const layoutedNodes = nodesIn.map((n) => {
      const pos = g.node(n.id);
      return {
        ...n,
        sourcePosition: isH ? Position.Right : Position.Bottom,
        targetPosition: isH ? Position.Left : Position.Top,
        position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 }
      };
    });

    return { nodes: layoutedNodes, edges: edgesIn };
  }

  function rebuild() {
    const ns = buildNodes();
    const es = buildEdges();
    const laid = layoutWithDagre(ns, es, direction);
    nodes = laid.nodes;
    edges = laid.edges;
  }

  $effect(() => {
    rebuild();
  });
</script>

<!-- Панель -->
<div class="mb-2 flex flex-wrap items-center gap-2">
  <div class="border-border inline-flex rounded-md border p-1">
    <button
      class="hover:bg-muted rounded px-3 py-1.5 text-sm {direction === 'LR' ? 'bg-muted' : ''}"
      onclick={() => (direction = 'LR')}
    >
      LR
    </button>
    <button
      class="hover:bg-muted rounded px-3 py-1.5 text-sm {direction === 'TB' ? 'bg-muted' : ''}"
      onclick={() => (direction = 'TB')}
    >
      TB
    </button>
  </div>
  <button
    class="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
    onclick={rebuild}>Relayout</button
  >

  <!-- Легенда -->
  <div class="text-muted-foreground ml-auto flex flex-wrap items-center gap-2 text-xs">
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.route.bg}; border:{kindStyle.route.border}"
      ></span> route
    </span>
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.component.bg}; border:{kindStyle.component.border}"
      ></span> component
    </span>
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.store.bg}; border:{kindStyle.store.border}"
      ></span> store
    </span>
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.api.bg}; border:{kindStyle.api.border}"
      ></span> api
    </span>
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.util.bg}; border:{kindStyle.util.border}"
      ></span> util
    </span>
    <span class="inline-flex items-center gap-1">
      <span
        class="inline-block size-3 rounded-sm"
        style="background: {kindStyle.external.bg}; border:{kindStyle.external.border}"
      ></span> external
    </span>
  </div>
</div>

<!-- Канвас -->
<div class="bg-background border-border h-[80vh] w-[90vw] rounded-xl border">
  <SvelteFlow
    colorMode="dark"
    bind:nodes
    bind:edges
    fitView
    connectionLineType={ConnectionLineType.SmoothStep}
    defaultEdgeOptions={{ type: 'smoothstep' }}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={true}
  >
    <Controls />
    <Background />
  </SvelteFlow>
</div>
