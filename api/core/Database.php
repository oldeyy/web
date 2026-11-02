<?php
/** Подключение к MySQL через PDO (одно соединение на запрос). */
class Database
{
    private static array $config;
    private static ?PDO $pdo = null;

    public static function configure(array $config): void
    {
        self::$config = $config;
    }

    public static function pdo(): PDO
    {
        if (self::$pdo === null) {
            $c = self::$config;
            self::$pdo = new PDO(
                "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset=utf8mb4",
                $c['user'],
                $c['password'],
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false, // настоящие подготовленные запросы
                ]
            );
        }
        return self::$pdo;
    }
}
