<?php
/** HTTP-запрос: метод, путь относительно /api, query-параметры, JSON-тело, заголовки. */
class Request
{
    public array $params = [];   // параметры маршрута, например {id}
    public ?array $user = null;  // данные пользователя из JWT (заполняет Auth)

    private function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        private readonly string $rawBody,
        private readonly array $headers,
    ) {
    }

    public static function fromGlobals(): self
    {
        $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        // Отбрасываем всё до сегмента /api включительно: работает и в корне сайта, и в подкаталоге
        $path = preg_replace('#^.*?/api(?=/|$)#', '', $uriPath);
        $path = '/' . trim($path, '/');

        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $headers = array_change_key_case($headers ?: [], CASE_LOWER);
        if (empty($headers['authorization'])) {
            $headers['authorization'] = $_SERVER['HTTP_AUTHORIZATION']
                ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        }

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            $path,
            $_GET,
            file_get_contents('php://input') ?: '',
            $headers,
        );
    }

    public function header(string $name): string
    {
        return $this->headers[strtolower($name)] ?? '';
    }

    /** Тело запроса в формате JSON (ассоциативный массив). */
    public function json(): array
    {
        if ($this->rawBody === '') {
            return [];
        }
        $data = json_decode($this->rawBody, true);
        if (!is_array($data)) {
            throw new HttpException('Тело запроса должно быть корректным JSON-объектом', 400);
        }
        return $data;
    }

    public function id(): int
    {
        return (int) $this->params['id'];
    }
}
