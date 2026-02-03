# Как делать релиз

Релиз состоит из двух шагов: **поднять версию и создать тег** → **собрать бинарники и выложить в GitHub Release**.

---

## Способ 1: Всё из GitHub (рекомендуется)

1. Открой репозиторий на GitHub → вкладка **Actions**.
2. Слева выбери workflow **"Trigger Release"**.
3. Справа нажми **"Run workflow"**.
4. Выбери тип версии:
   - **patch** — 1.0.0 → 1.0.1
   - **minor** — 1.0.0 → 1.1.0
   - **major** — 1.0.0 → 2.0.0
5. Нажми **"Run workflow"** (зелёная кнопка).

Workflow обновит версию в `package.json`, `tauri.conf.json` и `Cargo.toml`, закоммитит, создаст тег `vX.Y.Z` и запушит в `main`.  
**После пуша тега автоматически запустится workflow "Release App"** — он соберёт бинарники для macOS (ARM + Intel), Windows и Linux и загрузит их в черновик релиза.

6. Через 10–20 минут зайди в **Releases** → появится черновик **"Parser vX.Y.Z"** с ассетами (.dmg, .exe, .AppImage и т.д.).
7. Когда всё проверено — нажми **"Publish release"**, чтобы опубликовать релиз.

---

## Способ 2: Только пересобрать по существующему тегу

Если тег уже есть (например, создан вручную или нужно пересобрать артефакты):

1. **Actions** → workflow **"Release App"**.
2. **"Run workflow"**.
3. В поле **"Tag to build"** введи тег, например `v1.0.0`.
4. **"Run workflow"**.

Сборка пойдёт для этого тега, артефакты появятся в соответствующем релизе.

---

## Способ 3: Ручной тег с локальной машины

```bash
# Поднять версию вручную (например patch)
pnpm version patch --no-git-tag-version

# Синхронизировать версию в Tauri (замени X.Y.Z на версию из package.json)
VERSION=$(node -p "require('./package.json').version")
jq --arg v "$VERSION" '.version = $v' src-tauri/tauri.conf.json > tmp.json && mv tmp.json src-tauri/tauri.conf.json
sed -i.bak "s/^version = \".*\"/version = \"$VERSION\"/" src-tauri/Cargo.toml && rm -f src-tauri/Cargo.toml.bak

# Закоммитить и создать тег
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore(release): v$VERSION"
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"
```

После пуша тега на GitHub автоматически запустится **Release App** и соберёт бинарники.

---

## Что делают workflow

| Файл | Назначение |
|------|------------|
| **trigger-release.yml** | Поднимает версию (patch/minor/major), коммитит и пушит тег `vX.Y.Z`. Запуск только вручную (Actions → Run workflow). |
| **release.yaml** | Запускается при пуше тега `v*` или вручную с указанием тега. Создаёт черновик релиза и собирает приложение для всех платформ, загружает артефакты в этот релиз. |

Рекомендуемый порядок: сначала **Trigger Release** (способ 1), затем дождаться завершения **Release App** и опубликовать черновик в Releases.
