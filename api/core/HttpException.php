<?php
/** Исключение, которое FrontController превращает в JSON-ответ с указанным HTTP-кодом. */
class HttpException extends RuntimeException
{
    public function __construct(string $message, int $status = 400, public array $details = [])
    {
        parent::__construct($message, $status);
    }

    public static function notFound(string $message = 'Запись не найдена'): self
    {
        return new self($message, 404);
    }

    public static function validation(array $fields): self
    {
        return new self('Ошибка валидации данных', 422, ['fields' => $fields]);
    }
}
