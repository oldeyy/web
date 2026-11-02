<?php
/**
 * FrontController — единая точка входа REST API админ-панели «Все счётчики».
 * Принимает все запросы /api/*, применяет CORS, определяет маршрут и вызывает контроллер.
 */
declare(strict_types=1);

require __DIR__ . '/core/bootstrap.php';

$config = require __DIR__ . '/config.php';

Cors::apply($config['cors']['allowed_origins']);

$request = Request::fromGlobals();

// Preflight-запрос браузера: заголовки CORS уже отправлены, тело не нужно
if ($request->method === 'OPTIONS') {
    Response::noContent();
}

Database::configure($config['db']);
Jwt::configure($config['jwt']['secret'], $config['jwt']['ttl']);

$router = require __DIR__ . '/routes.php';

try {
    $router->dispatch($request);
} catch (HttpException $e) {
    Response::error($e->getMessage(), $e->getCode(), $e->details);
} catch (Throwable $e) {
    error_log('[api] ' . $e);
    Response::error(
        $config['debug'] ? $e->getMessage() : 'Внутренняя ошибка сервера',
        500
    );
}
