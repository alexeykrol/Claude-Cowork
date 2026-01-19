# Claude Code ↔ Cowork Bridge

## Обзор

Этот документ описывает схему взаимодействия между Claude Code (терминал) и Claude Cowork (десктоп + браузер) для задач, требующих авторизованного доступа к веб-ресурсам.

**Типичный use case:** скачивание компонентов из Tailwind UI (платный ресурс, требует авторизации).

## Архитектура

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Claude Code   │     │   Shared Folder  │     │   Claude Cowork     │
│   (терминал)    │────▶│  Claude-Cowork/  │◀────│   + Chrome Browser  │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
        │                        │                         │
        │  1. Пишет задачи       │                         │
        │─────────────────▶      │                         │
        │                        │      2. Читает задачи   │
        │                        │  ◀───────────────────────│
        │                        │                         │
        │                        │      3. Скачивает       │
        │                        │         компоненты      │
        │                        │  ◀───────────────────────│
        │                        │                         │
        │  4. Забирает результат │                         │
        │◀───────────────────────│                         │
```

## Структура папки Claude-Cowork/

```
Claude-Cowork/
├── CLAUDE_CODE_BRIDGE.md    # этот документ
├── tasks.md                 # очередь задач (главный файл обмена)
├── results/                 # скачанные компоненты
│   └── [component-name].html
└── logs/                    # логи выполнения (опционально)
    └── [timestamp].log
```

## Формат tasks.md

```markdown
# Task Queue

## Meta
- **last_updated**: 2026-01-16T10:30:00
- **updated_by**: claude-code | cowork

## Pending

### task-001-001
- **id**: task-001-001
- **created**: 2026-01-16T10:30:00
- **component**: Hero Section with image
- **source_url**: https://tailwindui.com/components/marketing/sections/heroes
- **specific_variant**: "With app screenshot" (первый вариант на странице)
- **framework**: React
- **output_file**: results/task-001-001-hero-with-screenshot.tsx
- **notes**: Нужен вариант с тёмным фоном, если есть
- **status**: pending

## In Progress

(задачи, которые Cowork сейчас выполняет)

## Completed

### task-001-000
- **id**: task-001-000
- **created**: 2026-01-16T09:00:00
- **completed**: 2026-01-16T09:15:00
- **component**: Test task
- **output_file**: results/task-001-000-test.html
- **status**: done
- **result_notes**: Успешно скачан, 45 строк HTML
```

## Workflow пошагово

### Шаг 1: Claude Code создаёт задачу

Claude Code добавляет новую задачу в секцию `## Pending` файла `tasks-NNN-TIMESTAMP.md`:

```markdown
### task-002-001
- **id**: task-002-001
- **created**: [timestamp]
- **priority**: high
- **component**: Pricing section three tiers
- **source_url**: https://tailwindui.com/components/marketing/sections/pricing
- **specific_variant**: Three tiers with toggle
- **framework**: React
- **output_file**: results/task-002-001-pricing-three-tiers.tsx
- **notes**:
- **status**: pending
```

### Шаг 2: Пользователь активирует Cowork

Пользователь:
1. Открывает новый диалог в Claude Cowork
2. Выбирает папку `Claude-Cowork/` при старте задачи
3. Открывает Chrome, логинится в Tailwind UI
4. Пишет Cowork: «Проверь задачи, есть доступ к Tailwind»

### Шаг 3: Cowork выполняет задачи

Cowork:
1. Читает `tasks.md`
2. Находит задачи со статусом `pending`
3. Переносит задачу в `## In Progress`, обновляет статус
4. Через Claude in Chrome:
   - Переходит на `source_url`
   - Находит нужный вариант компонента
   - Копирует HTML код
5. Сохраняет в `results/[output_file]`
6. Переносит задачу в `## Completed`, добавляет `completed` timestamp и `result_notes`

### Шаг 4: Claude Code забирает результат

Claude Code:
1. Проверяет `tasks.md` — видит задачу в `## Completed`
2. Читает файл из `results/`
3. Интегрирует в проект
4. (Опционально) Архивирует или удаляет выполненную задачу

## Протокол обмена сообщениями

### Статусы задач

| Статус | Значение |
|--------|----------|
| `pending` | Ожидает выполнения |
| `in_progress` | Cowork сейчас выполняет |
| `done` | Выполнено успешно |
| `failed` | Ошибка (см. result_notes) |
| `clarification_needed` | Нужно уточнение от Claude Code |

### Поле result_notes

Cowork заполняет после выполнения:
- При успехе: краткое описание (размер файла, особенности)
- При ошибке: причина (компонент не найден, страница изменилась, и т.д.)
- При уточнении: вопрос к Claude Code

## Тестовая задача

Для проверки работоспособности pipeline, Claude Code должен создать тестовую задачу:

```markdown
### task-test-001
- **id**: task-test-001
- **created**: [текущий timestamp]
- **component**: Simple Hero Section
- **source_url**: https://tailwindui.com/components/marketing/sections/heroes
- **specific_variant**: Первый (самый простой) вариант на странице
- **output_file**: results/test-hero.html
- **notes**: Тестовая задача для проверки pipeline
- **status**: pending
```

## Ограничения и особенности

1. **Нет автоматического триггера** — пользователь вручную запускает Cowork и говорит проверить задачи

2. **Каждая сессия Cowork — новая** — нужно заново выбирать папку и давать доступ к браузеру

3. **Авторизация — через пользователя** — Cowork не вводит пароли, пользователь логинится сам

4. **Один компонент = один файл** — результат сохраняется как отдельный HTML файл

## Пример сессии

**Claude Code:**
```
Добавил задачу task-003 в tasks.md — нужен компонент Contact form.
Жду результат в results/contact-form.html
```

**Пользователь:**
→ Открывает Cowork, выбирает папку
→ Логинится в Tailwind UI
→ Пишет: "Проверь tasks.md"

**Cowork:**
```
Вижу задачу task-003: Contact form
Статус: pending
Перехожу на страницу... Нашёл компонент... Сохраняю...
Готово: results/contact-form.html (67 строк)
Обновил tasks.md — статус: done
```

**Пользователь:**
→ Возвращается в Claude Code

**Claude Code:**
```
Вижу task-003 выполнен.
Читаю results/contact-form.html
Интегрирую в src/components/...
```
