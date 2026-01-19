#!/usr/bin/env node

/**
 * Create Task File for Cowork Bridge
 * Генерирует файл задач для запроса компонентов через Cowork
 */

const fs = require('fs');
const path = require('path');

const COWORK_DIR = '/Users/alexeykrolmini/Downloads/Code/Claude-Cowork';
const PROJECT_NAME = 'ai-test02 (AI Knowledge Assessment Platform)';

/**
 * Получить номер следующего task file
 */
function getNextTaskNumber() {
  const files = fs.readdirSync(COWORK_DIR)
    .filter(f => f.match(/^tasks-(\d+)-.*\.md$/))
    .map(f => parseInt(f.match(/^tasks-(\d+)-/)[1]))
    .sort((a, b) => b - a);

  const lastNumber = files.length > 0 ? files[0] : 0;
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0');

  return nextNumber;
}

/**
 * Форматировать timestamp
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
    .split('.')[0];
}

/**
 * Преобразовать название компонента в kebab-case
 */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Создать задачу
 */
function createTask(taskNumber, index, component) {
  const taskId = `task-${taskNumber}-${index.toString().padStart(3, '0')}`;
  const timestamp = new Date().toISOString();
  const componentKebab = toKebabCase(component.name);
  const ext = component.framework === 'React' ? 'tsx' :
               component.framework === 'Vue' ? 'vue' : 'html';

  return `### ${taskId}
- **id**: ${taskId}
- **created**: ${timestamp}
- **priority**: ${component.priority || 'medium'}
- **component**: ${component.name}
- **source_url**: ${component.url}
- **specific_variant**: ${component.variant || 'Первый вариант на странице'}
- **framework**: ${component.framework || 'React'}
- **output_file**: results/${taskId}-${componentKebab}.${ext}
- **notes**: ${component.notes || ''}
- **status**: pending
`;
}

/**
 * Создать task file
 */
function createTaskFile(tasks) {
  const taskNumber = getNextTaskNumber();
  const timestamp = getTimestamp();
  const filename = `tasks-${taskNumber}-${timestamp}.md`;
  const filepath = path.join(COWORK_DIR, filename);

  const taskList = tasks.map((task, index) =>
    createTask(taskNumber, index + 1, task)
  ).join('\n');

  const content = `# Task Queue #${taskNumber}

## Meta
- **task_file**: ${filename}
- **created**: ${new Date().toISOString()}
- **created_by**: claude-code
- **project**: ${PROJECT_NAME}

---

## Pending

${taskList}
---

## In Progress

(пусто)

---

## Completed

(пусто)

---

## Failed

(пусто)

---

## Clarification Needed

(пусто)

---

## Instructions for Cowork

При выполнении задачи:

1. Откройте страницу \`source_url\` в Chrome (уже авторизованы в Tailwind UI)
2. Переключитесь на вкладку согласно \`framework\` (React/Vue/HTML)
3. Найдите вариант компонента согласно \`specific_variant\`
4. Скопируйте весь код
5. Сохраните в файл \`output_file\` (ВАЖНО: используйте точное имя файла из поля output_file!)
6. Переместите задачу из \`## Pending\` в \`## Completed\`
7. Добавьте поля:
   - \`completed\`: [timestamp]
   - \`result_notes\`: краткое описание (например: "Скачан вариант 'Simple card style', 52 строки кода")

Если компонент не найден или есть вопросы:
- Переместите в \`## Clarification Needed\`
- Опишите проблему в \`result_notes\`
`;

  fs.writeFileSync(filepath, content, 'utf8');

  return {
    filename,
    filepath,
    taskNumber,
    tasksCount: tasks.length
  };
}

// Экспорт для использования как модуль
module.exports = {
  getNextTaskNumber,
  createTaskFile,
  toKebabCase
};

// CLI использование
if (require.main === module) {
  console.log('Use this module from request-components command');
  console.log('Example usage:');
  console.log('');
  console.log('const { createTaskFile } = require("./create-task-file");');
  console.log('');
  console.log('const result = createTaskFile([');
  console.log('  {');
  console.log('    name: "Pricing Section",');
  console.log('    url: "https://tailwindui.com/...",');
  console.log('    variant: "Three tiers",');
  console.log('    framework: "React",');
  console.log('    priority: "high",');
  console.log('    notes: "Need dark mode version"');
  console.log('  }');
  console.log(']);');
}
