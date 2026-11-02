# REST API админ-панели «Все счётчики» (ПР №8)

PHP 8.1+ (без фреймворков), MySQL/MariaDB через PDO, JWT (HS256, собственная реализация), CORS для Vue-приложения.

## Структура

```
api/
├── index.php          # FrontController — единая точка входа
├── routes.php         # таблица маршрутов и требуемых ролей
├── config.php         # настройки (БД, JWT, CORS) из переменных окружения
├── .htaccess          # перенаправление /api/* → index.php (Apache)
├── dev-router.php     # то же для встроенного сервера PHP
├── core/              # Request, Response, Router, Database, Jwt, Auth, Cors, Validator
├── models/            # DAL: User, Meter, Tariff, Reading, Receipt, Notification, RevokedToken
├── controllers/       # обработчики ресурсов
└── tests/smoke.sh     # 50 проверок API (curl + jq)
sql/
├── schema.sql         # схема БД (7 таблиц)
└── seed.sql           # тестовые данные
```

## Установка

```sh
# 1. База данных
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
mysql -u root -p -e "CREATE USER 'meters'@'localhost' IDENTIFIED BY 'meters';
                     GRANT ALL ON meters.* TO 'meters'@'localhost';"

# 2. Запуск (из корня сайта) — встроенный сервер PHP
php -S localhost:8080 api/dev-router.php
# Сайт: http://localhost:8080/, API: http://localhost:8080/api
```

При работе через Apache (OpenServer, XAMPP, виртуальный хост) API доступно по адресу `http://<хост>/api`,
нужен включённый `mod_rewrite`. Настройки задаются переменными окружения или файлом `api/config.local.php`:

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `127.0.0.1`, `3306`, `meters`, `meters`, `meters` | Подключение к БД |
| `JWT_SECRET` | dev-ключ | Секрет подписи токенов (в production — обязательно свой) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Адреса Vue-приложения |
| `API_DEBUG` | — | `1` — выводить текст исключений в ответе 500 |

Тестовые учётные записи: администратор `+7 900 000-00-01` / `admin12345`, оператор `+7 916 100-20-30` / `operator123`
(абоненты `abonent123` в админ-панель не допускаются).

## Эндпоинты

Все ответы — JSON. Ошибки: `{ "error": "текст" }`, для 422 дополнительно `"fields": { "поле": "сообщение" }`.

| Метод | Путь | Доступ | Назначение |
|---|---|---|---|
| GET | `/api` | все | Сведения об API |
| POST | `/api/auth/login` | все | Вход `{ phone, password }` → `{ accessToken, tokenType, expiresIn, user }` |
| POST | `/api/auth/logout` | сотрудник | Отзыв текущего токена |
| GET | `/api/auth/me` | сотрудник | Текущий пользователь |
| GET | `/api/dashboard?month=YYYY-MM` | сотрудник | Статистика |
| GET, POST | `/api/readings` | сотрудник | Список (`?status=&resource=&meterId=`), создание |
| GET, PUT, DELETE | `/api/readings/{id}` | сотрудник | Чтение, изменение, удаление |
| PATCH | `/api/readings/{id}/status` | сотрудник | Модерация `{ status, comment }` |
| GET, POST | `/api/meters` | сотрудник | Счётчики |
| GET, PUT, DELETE | `/api/meters/{id}` | сотрудник | |
| GET | `/api/users`, `/api/users/{id}` | сотрудник | Пользователи (`?role=&status=`) |
| PUT | `/api/users/{id}` | сотрудник (роль — admin) | Статус, профиль, роль |
| PUT | `/api/users/{id}/role` | admin | Смена роли |
| DELETE | `/api/users/{id}` | admin | Удаление (если нет счётчиков) |
| GET, POST | `/api/notifications` | сотрудник | Уведомления (`userId: null` — всем) |
| GET | `/api/tariffs`, `/api/tariffs/{id}` | сотрудник | Тарифы |
| POST, PUT, DELETE | `/api/tariffs[/{id}]` | admin | Изменение тарифов |
| GET | `/api/receipts`, `/api/receipts/{id}` | сотрудник | Квитанции (`?status=&period=&userId=`) |
| PUT | `/api/receipts/{id}` | сотрудник | Статус оплаты |

Коды ответов: 200, 201 (создано), 204 (без тела), 400 (неверный запрос), 401 (нет/неверный/истёкший/отозванный токен),
403 (недостаточно прав), 404, 405, 409 (конфликт), 422 (валидация), 500.

## Тестирование

```sh
bash api/tests/smoke.sh http://localhost:8080/api
```
