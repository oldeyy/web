<?php
/**
 * Роутер для встроенного веб-сервера PHP (замена .htaccess при локальной разработке).
 * Запуск из корня сайта:  php -S localhost:8080 api/dev-router.php
 * Запросы /api/* обрабатывает api/index.php, остальные файлы сайта отдаются как статика.
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api(/|$)#', $path)) {
    require __DIR__ . '/index.php';
    return true;
}

return false; // статический файл публичной части сайта
