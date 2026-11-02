<?php
/**
 * Конфигурация REST API.
 * Значения берутся из переменных окружения, а при их отсутствии — из значений по умолчанию.
 * Для локальных настроек создайте api/config.local.php (он не попадает в git), который
 * возвращает массив с переопределяемыми ключами.
 */

$config = [
    'db' => [
        'host'     => getenv('DB_HOST') ?: '127.0.0.1',
        'port'     => getenv('DB_PORT') ?: '3306',
        'name'     => getenv('DB_NAME') ?: 'meters',
        'user'     => getenv('DB_USER') ?: 'meters',
        'password' => getenv('DB_PASSWORD') ?: 'meters',
    ],
    'jwt' => [
        // Секретный ключ подписи токенов. В production задаётся только через окружение.
        'secret' => getenv('JWT_SECRET') ?: 'change-me-meters-admin-dev-secret-key-2026',
        'ttl'    => 2 * 60 * 60, // время жизни токена — 2 часа
    ],
    'cors' => [
        // Адреса Vue-приложения, которым разрешено обращаться к API
        'allowed_origins' => array_filter(array_map('trim', explode(',',
            getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://127.0.0.1:5173'
        ))),
    ],
    'debug' => getenv('API_DEBUG') === '1',
];

$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $config = array_replace_recursive($config, require $local);
}

return $config;
