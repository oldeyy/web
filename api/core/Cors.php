<?php
/** Заголовки CORS для обращения к API из Vue-приложения, работающего на другом origin. */
class Cors
{
    public static function apply(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Разрешаем только известные адреса админ-панели (а не «*»), т.к. используется авторизация
        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Max-Age: 600'); // браузер кэширует результат preflight на 10 минут
        }
        header('Vary: Origin');
    }
}
