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

  // === входные данные: твой FileTreeNode, как из get_preview_tree ===
  type FileTreeNode = {
    name: string;
    path: string;
    type: 'File' | 'Directory';
    children?: FileTreeNode[];
  };

  // пропсы: либо передай уже полученное дерево, либо пусть компонент сам получит
  let { roots = [] as FileTreeNode[] } = $props();

  // рабочие массивы для Svelte Flow
  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  // dagre graph config (TB — сверху-вниз; LR — слева-направо)
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const NODE_W = 220;
  const NODE_H = 36;

  // из дерева файлов -> массивы nodes/edges
  function treeToGraph(roots: FileTreeNode[]) {
    const ns: Node[] = [];
    const es: Edge[] = [];

    const visit = (node: FileTreeNode, parentId: string | null) => {
      const id = node.path;
      ns.push({
        id,
        type: 'default',
        data: { label: node.name },
        // временная позиция (dagre потом расставит)
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          padding: '6px 10px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          background: node.type === 'Directory' ? 'var(--muted)' : 'var(--card)'
        }
      });

      if (parentId) {
        es.push({
          id: `${parentId}->${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          animated: false
        });
      }
      if (node.children?.length) {
        for (const ch of node.children) visit(ch, id);
      }
    };

    for (const r of roots) visit(r, null);
    return { ns, es };
  }

  function layoutWithDagre(nodesIn: Node[], edgesIn: Edge[], direction: 'TB' | 'LR' = 'LR') {
    const isH = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 24, ranksep: 36 });

    nodesIn.forEach((n) => dagreGraph.setNode(n.id, { width: NODE_W, height: NODE_H }));
    edgesIn.forEach((e) => dagreGraph.setEdge(e.source, e.target));
    dagre.layout(dagreGraph);

    const layoutedNodes = nodesIn.map((n) => {
      const pos = dagreGraph.node(n.id);
      return {
        ...n,
        targetPosition: isH ? Position.Left : Position.Top,
        sourcePosition: isH ? Position.Right : Position.Bottom,
        // dagre возвращает центр — смещаем к верхнему левому
        position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
        width: NODE_W,
        height: NODE_H
      };
    });
    return { nodes: layoutedNodes, edges: edgesIn };
  }

  // пересобрать граф при изменении roots
  $effect(() => {
    const { ns, es } = treeToGraph(roots);
    const laid = layoutWithDagre(ns, es, 'LR'); // горизонтальное дерево
    nodes = laid.nodes;
    edges = laid.edges;
  });
</script>

<!-- сам канвас -->
<div
  class="bg-background border-border h-[50vh] w-[90vw] rounded-xl border
 text-black"
>
  <SvelteFlow
    colorMode="dark"
    bind:nodes
    bind:edges
    fitView
    connectionLineType={ConnectionLineType.SmoothStep}
    defaultEdgeOptions={{ type: 'smoothstep' }}
  >
    <Controls />
    <Background />
  </SvelteFlow>
</div>
