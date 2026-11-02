<?php
/** Пользователи сайта: абоненты и сотрудники (администраторы, операторы). */
class User extends Model
{
    protected const TABLE = 'users';
    protected const FIELDS = [
        'name'      => 'name',
        'phone'     => 'phone',
        'account'   => 'account',
        'address'   => 'address',
        'role'      => 'role',
        'status'    => 'status',
        'createdAt' => 'created_at',
    ];

    public const ROLES = ['admin', 'operator', 'abonent'];
    public const STAFF_ROLES = ['admin', 'operator'];
    public const STATUSES = ['active', 'blocked'];

    /** Приводит номер к виду 7XXXXXXXXXX: «+7 (900) 000-00-01», «8 900 …» → «79000000001». */
    public static function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone);
        if (strlen($digits) === 11 && $digits[0] === '8') {
            $digits = '7' . substr($digits, 1);
        } elseif (strlen($digits) === 10) {
            $digits = '7' . $digits;
        }
        return $digits;
    }

    /** 79123456789 → +7 912 345-67-89 */
    public static function formatPhone(string $digits): string
    {
        return preg_match('/^7(\d{3})(\d{3})(\d{2})(\d{2})$/', $digits, $m)
            ? "+7 {$m[1]} {$m[2]}-{$m[3]}-{$m[4]}"
            : $digits;
    }

    protected static function cast(array $row): array
    {
        $row = parent::cast($row);
        $row['phone'] = self::formatPhone($row['phone']);
        $row['account'] ??= '—';
        $row['address'] ??= '—';
        $row['createdAt'] = substr($row['createdAt'], 0, 10);
        return $row;
    }

    /** Полная запись, включая хэш пароля (только для аутентификации). */
    public static function findRaw(int $id): ?array
    {
        $stmt = static::db()->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByPhone(string $phone): ?array
    {
        $stmt = static::db()->prepare('SELECT * FROM users WHERE phone = :phone');
        $stmt->execute(['phone' => self::normalizePhone($phone)]);
        return $stmt->fetch() ?: null;
    }

    /** Публичное представление пользователя (без хэша пароля). */
    public static function publicView(array $raw): array
    {
        return static::find((int) $raw['id']);
    }
}
