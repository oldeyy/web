<?php
/** Приборы учёта абонентов. */
class Meter extends Model
{
    protected const TABLE = 'meters';
    protected const FIELDS = [
        'number'        => 'number',
        'resource'      => 'resource',
        'userId'        => 'user_id',
        'installedAt'   => 'installed_at',
        'verifiedUntil' => 'verified_until',
        'status'        => 'status',
    ];
    protected const CASTS = ['userId' => 'int'];

    public const RESOURCES = ['electricity', 'water', 'gas'];
    public const STATUSES = ['active', 'verification', 'disabled'];

    /** К счётчику присоединяются ФИО и адрес абонента. */
    protected static function selectSql(): string
    {
        return 'SELECT t.id, t.number, t.resource, t.user_id AS userId, t.installed_at AS installedAt,
                       t.verified_until AS verifiedUntil, t.status, u.name AS userName, u.address
                FROM meters t JOIN users u ON u.id = t.user_id';
    }

    public static function numberExists(string $number, int $exceptId = 0): bool
    {
        return static::count('t.number = :n AND t.id <> :id', ['n' => $number, 'id' => $exceptId]) > 0;
    }

    /** Счётчики, поверка которых истекает в ближайшие $months месяцев. */
    public static function verificationSoon(int $months = 3): array
    {
        $stmt = static::db()->prepare(static::selectSql()
            . " WHERE t.status <> 'disabled' AND t.verified_until <= CURDATE() + INTERVAL :m MONTH
                ORDER BY t.verified_until");
        $stmt->execute(['m' => $months]);
        return array_map([static::class, 'cast'], $stmt->fetchAll());
    }
}
