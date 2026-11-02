# meters-admin — админ-панель сайта «Все счётчики»

SPA на Vue 3 + Vite для сотрудников управляющей компании: модерация показаний, счётчики, абоненты, тарифы, квитанции.

- Техническое задание: [docs/TZ.md](docs/TZ.md)
- Lo-fi прототипы: [docs/prototypes/lofi](docs/prototypes/lofi)
- Hi-fi прототипы (кликабельный HTML): [docs/prototypes/hifi](docs/prototypes/hifi)
- Скриншоты работающего приложения: [docs/screenshots](docs/screenshots)

## Стек

| Пакет | Назначение |
|---|---|
| Vue 3 | Компонентный фреймворк (Composition API, `<script setup>`) |
| Vite | Dev-сервер с HMR и сборщик |
| Vue Router | Маршрутизация SPA и защита маршрутов |
| Pinia | Глобальные хранилища состояния |
| Axios | HTTP-клиент с перехватчиками (токен, обработка 401) |

## Запуск

```sh
npm install
npm run dev        # http://localhost:5173
npm run dev -- --open
npm run build      # production-сборка в dist/
npm run format     # форматирование Prettier
```

Перед запуском поднимите REST API (каталог `api/` в корне сайта, см. [api/README.md](../api/README.md)):
`php -S localhost:8080 api/dev-router.php`. Вход: администратор `+7 900 000-00-01` / `admin12345`,
оператор `+7 916 100-20-30` / `operator123`. Без бэкенда можно работать на демо-данных: `VITE_USE_MOCKS=true`
(тогда подходит любой телефон и пароль от 4 символов).

> **Открывается стартовая страница Vue/Vite («Get started», «You did it!») вместо админ-панели?**
> Значит, порт 5173 занят другим запущенным dev-сервером (например, тестовым проектом из `npm create vue`/`npm create vite`).
> Остановите его (Ctrl+C в его терминале) и снова выполните `npm run dev` в каталоге `meters-admin`.
> В `vite.config.js` включён `strictPort: true`, поэтому при занятом порте сервер не стартует и выводит
> `Error: Port 5173 is already in use`, а не переезжает молча на 5174.

## Переменные окружения (`.env`)

| Переменная | Значение по умолчанию | Описание |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Базовый URL API для Axios. Прямое обращение к API на другом origin (браузер проверяет CORS); `/api` — через прокси Vite |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Сервер, на который dev-сервер проксирует `/api/*` (используется при `VITE_API_URL=/api`) |
| `VITE_USE_MOCKS` | `false` | `true` — запросы обслуживает mock-адаптер `src/services/mockAdapter.js`, бэкенд не нужен |
| `VITE_PUBLIC_URL` | `http://localhost:8080/` | Ссылка на публичную часть сайта |

## Структура

```
meters-admin/
├── docs/                    # ТЗ, прототипы, скриншоты
├── public/                  # favicon, логотип
├── src/
│   ├── assets/main.css      # дизайн-система (палитра публичного сайта)
│   ├── components/          # AppSidebar, AppTopbar, StatCard, ActivityChart, BaseModal, бейджи
│   ├── layouts/AdminLayout.vue
│   ├── mocks/db.js          # демонстрационные данные
│   ├── router/index.js      # маршруты и navigation guard
│   ├── services/api.js      # экземпляр Axios с перехватчиками
│   ├── services/mockAdapter.js
│   ├── stores/              # auth, dashboard, readings, meters, users, tariffs, receipts
│   ├── utils/format.js      # справочники статусов и форматирование
│   ├── views/               # Dashboard, ReadingsList, ReadingForm, MetersList, UsersList,
│   │                        # TariffsList, ReceiptsList, Login, NotFound
│   ├── App.vue
│   └── main.js
├── .env
└── vite.config.js
```
