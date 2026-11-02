<?php
/**
 * Самостоятельная реализация JSON Web Token (алгоритм HS256, RFC 7519).
 * Токен: base64url(header).base64url(payload).base64url(HMAC-SHA256(header.payload, secret))
 */
class Jwt
{
    private static string $secret;
    private static int $ttl;

    public static function configure(string $secret, int $ttl): void
    {
        self::$secret = $secret;
        self::$ttl = $ttl;
    }

    public static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    /** Выпускает токен; к полезной нагрузке добавляются iat, exp и уникальный jti. */
    public static function encode(array $payload): string
    {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $payload += [
            'iat' => time(),
            'exp' => time() + self::$ttl,
            'jti' => bin2hex(random_bytes(16)),
        ];

        $segments = self::base64UrlEncode(json_encode($header)) . '.'
            . self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_UNICODE));
        $signature = hash_hmac('sha256', $segments, self::$secret, true);

        return $segments . '.' . self::base64UrlEncode($signature);
    }

    /** Проверяет структуру, подпись и срок действия; возвращает полезную нагрузку. */
    public static function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new HttpException('Некорректная структура токена', 401);
        }
        [$header, $payload, $signature] = $parts;

        $expected = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        if (!hash_equals($expected, $signature)) { // сравнение, устойчивое к атакам по времени
            throw new HttpException('Подпись токена не верна', 401);
        }

        $headerData = json_decode(self::base64UrlDecode($header), true);
        if (($headerData['alg'] ?? '') !== 'HS256') {
            throw new HttpException('Неподдерживаемый алгоритм подписи', 401);
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($data)) {
            throw new HttpException('Некорректная полезная нагрузка токена', 401);
        }
        if (isset($data['exp']) && $data['exp'] < time()) {
            throw new HttpException('Срок действия токена истёк, авторизуйтесь снова', 401);
        }
        return $data;
    }
}
