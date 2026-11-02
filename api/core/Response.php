<?php
/** Формирование JSON-ответов. Все методы завершают выполнение скрипта. */
class Response
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
        exit;
    }

    public static function created(mixed $data): never
    {
        self::json($data, 201);
    }

    public static function noContent(): never
    {
        ini_set('default_mimetype', ''); // у ответа без тела не должно быть Content-Type
        http_response_code(204);
        exit;
    }

    public static function error(string $message, int $status, array $details = []): never
    {
        self::json(['error' => $message] + $details, $status);
    }
}
