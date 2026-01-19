#!/bin/bash

# Watch Cowork Results - мониторинг появления результатов от Cowork
# Usage: watch-cowork-results.sh TASK_NUMBER
# Example: watch-cowork-results.sh 002

TASK_NUMBER=$1
RESULTS_DIR="/Users/alexeykrolmini/Downloads/Code/Claude-Cowork/results"
WATCH_PATTERN="task-${TASK_NUMBER}-*.{tsx,jsx,html,vue}"
CHECK_INTERVAL=5  # секунд между проверками
MAX_WAIT=600      # максимум 10 минут ожидания

if [ -z "$TASK_NUMBER" ]; then
  echo "❌ Ошибка: не указан номер задачи"
  echo "Usage: $0 TASK_NUMBER"
  echo "Example: $0 002"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Мониторинг результатов Cowork"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Папка: $RESULTS_DIR"
echo "🔎 Паттерн: $WATCH_PATTERN"
echo "⏱️  Проверка каждые ${CHECK_INTERVAL}с"
echo ""
echo "⏳ Ожидание результатов..."
echo ""

# Запоминаем начальное состояние
INITIAL_FILES=$(ls -1 "$RESULTS_DIR"/task-${TASK_NUMBER}-* 2>/dev/null | wc -l | tr -d ' ')
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  # Проверяем текущее количество файлов
  CURRENT_FILES=$(ls -1 "$RESULTS_DIR"/task-${TASK_NUMBER}-* 2>/dev/null | wc -l | tr -d ' ')

  if [ "$CURRENT_FILES" -gt "$INITIAL_FILES" ]; then
    # Новые файлы появились!
    NEW_COUNT=$((CURRENT_FILES - INITIAL_FILES))

    echo "✅ Обнаружено новых файлов: $NEW_COUNT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Новые результаты:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Показываем новые файлы с размерами
    ls -lh "$RESULTS_DIR"/task-${TASK_NUMBER}-* 2>/dev/null | tail -n "$NEW_COUNT" | awk '{
      size = $5
      file = $9
      split(file, parts, "/")
      filename = parts[length(parts)]
      printf "  ✓ %-40s (%s)\n", filename, size
    }'

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Мониторинг завершён успешно"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📌 Следующий шаг:"
    echo "   Файлы готовы к интеграции в проект"
    echo ""

    exit 0
  fi

  # Показываем прогресс каждые 15 секунд
  if [ $((ELAPSED % 15)) -eq 0 ] && [ $ELAPSED -gt 0 ]; then
    echo "⏳ Ожидание... (прошло ${ELAPSED}с)"
  fi

  sleep $CHECK_INTERVAL
  ELAPSED=$((ELAPSED + CHECK_INTERVAL))
done

# Таймаут
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  Таймаут: результаты не появились за ${MAX_WAIT}с"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Возможные причины:"
echo "  • Cowork ещё работает над задачами"
echo "  • Требуется вмешательство пользователя"
echo "  • Проверьте статус в Claude Cowork"
echo ""
echo "Проверить вручную:"
echo "  ls -lh $RESULTS_DIR/task-${TASK_NUMBER}-*"
echo ""

exit 1
