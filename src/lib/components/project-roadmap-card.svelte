<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { Progress } from '$lib/components/ui/progress';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import {
    ListTree,
    Workflow,
    Settings2,
    ShieldCheck,
    FileJson,
    ChevronDown,
    ChevronRight
  } from '@lucide/svelte/icons';

  // ---- Типы (мок) ----
  type RouteItem = { path: string; type: 'page' | 'layout' | 'server' | 'endpoint' };
  type ProjectSummary = {
    root: string;
    name?: string;
    packageManager?: 'pnpm' | 'npm' | 'yarn' | 'bun';
    languages: string[];
    frameworks: string[]; // ['sveltekit','tauri']
    deps: Record<string, string>;
    scripts: Record<string, string>;
    sveltekit?: { routes: RouteItem[] };
    tailwind?: { hasV4: boolean; tokens: string[] };
    tauri?: { hasV2: boolean; plugins: string[]; capabilities: string[] };
    hasShadcnSvelte: boolean;
    size?: { files: number; linesApprox: number };
  };

  type RoadmapTask = {
    id: string;
    title: string;
    detail?: string;
    priority: 'high' | 'med' | 'low';
    effort: 'S' | 'M' | 'L';
    done?: boolean;
  };
  type Roadmap = { sections: Array<{ title: string; tasks: RoadmapTask[] }> };

  // ---- Пропсы ----
  let { root = '/path/to/project' } = $props();

  // ---- Моки ----
  const summary = $state<ProjectSummary>({
    root,
    name: 'parser-ai-front',
    packageManager: 'pnpm',
    languages: ['ts', 'svelte', 'rust', 'css'],
    frameworks: ['sveltekit', 'tauri'],
    deps: { '@tauri-apps/api': '^2.0.0', '@sveltejs/kit': '^2.5.0', tailwindcss: '^4.0.0' },
    scripts: { dev: 'pnpm tauri dev', build: 'pnpm tauri build' },
    sveltekit: {
      routes: [
        { path: 'src/routes/+layout.svelte', type: 'layout' },
        { path: 'src/routes/+page.svelte', type: 'page' },
        { path: 'src/routes/files/+page.svelte', type: 'page' },
        { path: 'src/routes/api/parse/+server.ts', type: 'server' }
      ]
    },
    tailwind: { hasV4: true, tokens: ['--radius', '--bg', '--fg'] },
    tauri: {
      hasV2: true,
      plugins: ['dialog', 'shell', 'store', 'updater'],
      capabilities: ['core:window:allow-set-progress-bar', 'fs:default', 'shell:allow']
    },
    hasShadcnSvelte: true,
    size: { files: 342, linesApprox: 28471 }
  });

  const roadmap = $state<Roadmap>({
    sections: [
      {
        title: 'Инициализация и безопасность',
        tasks: [
          {
            id: 'cap',
            title: 'Проверить capabilities/permissions',
            detail: 'window.setProgressBar, dialog, fs, shell',
            priority: 'high',
            effort: 'S',
            done: false
          },
          {
            id: 'progress',
            title: 'Индикатор прогресса окна',
            detail: 'setProgressBar + события парсинга',
            priority: 'high',
            effort: 'S',
            done: true
          }
        ]
      },
      {
        title: 'Маршруты и UI',
        tasks: [
          {
            id: 'routes',
            title: 'Инвентаризация маршрутов',
            detail: `${summary.sveltekit?.routes.length ?? 0} routes`,
            priority: 'med',
            effort: 'S',
            done: false
          },
          {
            id: 'tw4',
            title: 'Нормализовать токены Tailwind v4',
            detail: 'убрать legacy, навести порядок в @theme',
            priority: 'med',
            effort: 'M',
            done: false
          },
          {
            id: 'ui-kit',
            title: 'Единый стиль shadcn-svelte',
            detail: 'шрифты, радиусы, отступы',
            priority: 'low',
            effort: 'S',
            done: true
          }
        ]
      }
    ]
  });

  // ---- Локальная логика ----
  let showDetails = $state(true);
  const totalTasks = $derived(roadmap.sections.reduce((acc, s) => acc + s.tasks.length, 0));
  const doneTasks = $derived(
    roadmap.sections.reduce((acc, s) => acc + s.tasks.filter((t) => t.done).length, 0)
  );
  const percent = $derived(totalTasks ? Math.round((100 * doneTasks) / totalTasks) : 0);

  function badgeColor(p: RoadmapTask['priority']) {
    return p === 'high' ? 'destructive' : p === 'med' ? 'default' : 'outline';
  }

  function exportJson() {
    const data = JSON.stringify({ summary, roadmap }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<Card.Root class="bg-card/40 w-full max-w-5xl">
  <Card.Header class="flex items-start justify-between gap-3">
    <div class="space-y-1">
      <Card.Title class="flex items-center gap-2">
        <Workflow class="h-5 w-5" />
        {summary.name ?? 'Project'}
      </Card.Title>
      <Card.Description class="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{summary.packageManager}</Badge>
        {#each summary.frameworks as fw}
          <Badge variant="outline">{fw}</Badge>
        {/each}
        {#if summary.hasShadcnSvelte}
          <Badge variant="outline">shadcn-svelte</Badge>
        {/if}
        <span class="text-muted-foreground">/ {summary.root}</span>
      </Card.Description>
    </div>

    <div class="flex items-center gap-2">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button variant="outline" size="sm" onclick={exportJson}>
            <FileJson class="mr-2 h-4 w-4" /> Export JSON
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Скачать мок-результат</Tooltip.Content>
      </Tooltip.Root>
      <Button variant="ghost" size="icon" onclick={() => (showDetails = !showDetails)}>
        {#if showDetails}<ChevronDown class="h-5 w-5" />{:else}<ChevronRight class="h-5 w-5" />{/if}
      </Button>
    </div>
  </Card.Header>

  <Card.Content class="space-y-4">
    <!-- Прогресс по задачам -->
    <div class="space-y-2">
      <div class="text-muted-foreground flex items-center justify-between text-sm">
        <span>Roadmap progress</span>
        <span>{doneTasks}/{totalTasks} ({percent}%)</span>
      </div>
      <Progress value={percent} />
    </div>

    <!-- Быстрые факты -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl border p-3">
        <div class="flex items-center gap-2 text-sm font-medium">
          <ListTree class="h-4 w-4" />Routes
        </div>
        <div class="mt-1 text-2xl font-semibold">{summary.sveltekit?.routes.length ?? 0}</div>
        <div class="text-muted-foreground mt-1 text-xs">SvelteKit pages/layouts/endpoints</div>
      </div>
      <div class="rounded-xl border p-3">
        <div class="flex items-center gap-2 text-sm font-medium">
          <Settings2 class="h-4 w-4" />Tailwind v4
        </div>
        <div class="mt-1 text-2xl font-semibold">{summary.tailwind?.hasV4 ? 'Yes' : 'No'}</div>
        <div class="text-muted-foreground mt-1 text-xs">
          {summary.tailwind?.tokens.length ?? 0} tokens
        </div>
      </div>
      <div class="rounded-xl border p-3">
        <div class="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck class="h-4 w-4" />Capabilities
        </div>
        <div class="mt-1 text-2xl font-semibold">{summary.tauri?.capabilities.length ?? 0}</div>
        <div class="text-muted-foreground mt-1 text-xs">
          {summary.tauri?.plugins.length ?? 0} plugins
        </div>
      </div>
    </div>

    {#if showDetails}
      <!-- Список задач -->
      <div class="space-y-3">
        {#each roadmap.sections as sec}
          <Card.Root class="bg-muted/30 border">
            <Card.Header><Card.Title class="text-base">{sec.title}</Card.Title></Card.Header>
            <Card.Content class="space-y-2">
              {#each sec.tasks as t}
                <div class="flex items-start justify-between gap-3 rounded-lg border p-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.done}
                        on:change={(e) => (t.done = (e.target as HTMLInputElement).checked)}
                      />
                      <span class="truncate font-medium">{t.title}</span>
                      <Badge variant={badgeColor(t.priority)}>{t.priority}</Badge>
                      <Badge variant="outline">{t.effort}</Badge>
                    </div>
                    {#if t.detail}
                      <div class="text-muted-foreground mt-1 line-clamp-2 text-xs">{t.detail}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    {/if}

    <!-- Немного деталек по маршрутам (мок) -->
    {#if summary.sveltekit?.routes?.length}
      <div class="rounded-xl border p-3">
        <div class="mb-2 text-sm font-medium">Routes</div>
        <ul class="space-y-1 text-sm">
          {#each summary.sveltekit.routes.slice(0, 6) as r}
            <li class="flex items-center justify-between gap-2">
              <span class="truncate">{r.path}</span>
              <Badge variant="outline">{r.type}</Badge>
            </li>
          {/each}
          {#if summary.sveltekit.routes.length > 6}
            <li class="text-muted-foreground mt-1 text-xs">
              +{summary.sveltekit.routes.length - 6} more…
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
