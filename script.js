const WORDS = [
  "программирование", "функция", "переменная", "массив", "объект",
  "цикл", "условие", "класс", "метод", "интерфейс",
  "компилятор", "алгоритм", "структура", "данные", "запрос",
  "ответ", "сервер", "клиент", "браузер", "код",
  "разработка", "тестирование", "отладка", "рефакторинг", "деплой",
  "репозиторий", "коммит", "ветка", "слияние", "конфликт",
  "консоль", "терминал", "скрипт", "модуль", "пакет",
  "библиотека", "фреймворк", "плагин", "событие", "обработчик",
  "состояние", "компонент", "шаблон", "стиль", "разметка"
];

const el = {
  text: document.getElementById('text'),
  input: document.getElementById('input'),
  wpm: document.getElementById('wpm'),
  acc: document.getElementById('acc'),
  time: document.getElementById('time'),
  best: document.getElementById('best'),
  restart: document.getElementById('restart'),
  themeBtn: document.getElementById('themeBtn'),
};

let targetText = '';
let started = false;
let finished = false;
let startTime = null;
let timerId = null;
let correctChars = 0;
let totalTyped = 0;

// Загрузка рекорда и темы
const best = +(localStorage.getItem('typer_best') || 0);
el.best.textContent = best;

const savedTheme = localStorage.getItem('typer_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
el.themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

el.themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  el.themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('typer_theme', next);
});

// Генерация текста
function generateText(count = 25) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return arr.join(' ');
}

// Отрисовка текста с подсветкой
function renderText(typed) {
  const html = targetText.split('').map((ch, i) => {
    let cls = 'char';
    if (i < typed.length) {
      cls += typed[i] === ch ? ' ok' : ' bad';
    } else if (i === typed.length) {
      cls += ' current';
    }
    // пробелы заменяем для сохранения ширины
    const display = ch === ' ' ? '&nbsp;' : ch;
    return `<span class="${cls}">${display}</span>`;
  }).join('');
  el.text.innerHTML = html;
}

// Обновление статистики
function updateStats() {
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  el.time.textContent = Math.round(elapsed) + 's';

  const minutes = elapsed / 60;
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  el.wpm.textContent = wpm;

  const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  el.acc.textContent = acc + '%';

  return wpm;
}

// Запуск
function start() {
  if (started) return;
  started = true;
  startTime = Date.now();
  timerId = setInterval(updateStats, 100);
}

// Завершение
function finish() {
  finished = true;
  clearInterval(timerId);
  el.input.disabled = true;

  const wpm = updateStats();
  if (wpm > best) {
    localStorage.setItem('typer_best', wpm);
    el.best.textContent = wpm;
    el.best.style.color = '#22c55e';
  }
}

// Сброс
function reset() {
  clearInterval(timerId);
  targetText = generateText();
  started = false;
  finished = false;
  startTime = null;
  correctChars = 0;
  totalTyped = 0;
  el.input.disabled = false;
  el.input.value = '';
  el.input.focus();
  el.wpm.textContent = '0';
  el.acc.textContent = '100%';
  el.time.textContent = '0s';
  el.best.style.color = '';
  renderText('');
}

// Обработка ввода
el.input.addEventListener('input', (e) => {
  if (finished) return;
  start();

  const typed = e.target.value;
  totalTyped = typed.length;

  // Считаем правильные символы
  correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === targetText[i]) correctChars++;
  }

  renderText(typed);
  updateStats();

  if (typed.length >= targetText.length) {
    finish();
  }
});

el.restart.addEventListener('click', reset);

// Запуск при загрузке
reset();
