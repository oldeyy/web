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

Демо-вход: любой номер телефона и пароль длиной от 4 символов.

## Переменные окружения (`.env`)

| Переменная | Значение по умолчанию | Описание |
|---|---|---|
| `VITE_API_URL` | `/api` | Базовый URL API для Axios |
| `VITE_PROXY_TARGET` | `http://meters.local` | Бэкенд, на который dev-сервер проксирует `/api/*` (префикс `/api` при этом отбрасывается) |
| `VITE_USE_MOCKS` | `true` | `true` — запросы обслуживает mock-адаптер `src/services/mockAdapter.js`; `false` — запросы уходят на реальный бэкенд |
| `VITE_PUBLIC_URL` | `http://meters.local/` | Ссылка на публичную часть сайта |

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
