<?php
/**
 * Показания счётчиков. При чтении присоединяются номер и ресурс счётчика, ФИО абонента,
 * а расход и сумма вычисляются в SQL: consumption = current - prev, amount = consumption * tariff.
 */
class Reading extends Model
{
    protected const TABLE = 'readings';
    protected const FIELDS = [
        'meterId'     => 'meter_id',
        'date'        => 'reading_date',
        'prev'        => 'prev_value',
        'current'     => 'current_value',
        'tariff'      => 'tariff',
        'responsible' => 'responsible',
        'status'      => 'status',
        'comment'     => 'comment',
    ];
    protected const CASTS = [
        'meterId' => 'int', 'prev' => 'float', 'current' => 'float', 'tariff' => 'float',
        'consumption' => 'float', 'amount' => 'float',
    ];

    public const STATUSES = ['pending', 'approved', 'rejected'];

    protected static function selectSql(): string
    {
        return 'SELECT t.id, t.meter_id AS meterId, t.reading_date AS date, t.prev_value AS prev,
                       t.current_value AS current, t.tariff, t.responsible, t.status, t.comment,
                       m.number AS meterNumber, m.resource, u.name AS userName,
                       GREATEST(t.current_value - t.prev_value, 0) AS consumption,
                       ROUND(GREATEST(t.current_value - t.prev_value, 0) * t.tariff, 2) AS amount
                FROM readings t
                JOIN meters m ON m.id = t.meter_id
                JOIN users u ON u.id = m.user_id';
    }

    /** Список с фильтрами по статусу, ресурсу и счётчику; новые записи первыми. */
    public static function search(array $f): array
    {
        $where = [];
        $params = [];
        if (!empty($f['status'])) {
            $where[] = 't.status = :status';
            $params['status'] = $f['status'];
        }
        if (!empty($f['resource'])) {
            $where[] = 'm.resource = :resource';
            $params['resource'] = $f['resource'];
        }
        if (!empty($f['meterId'])) {
            $where[] = 't.meter_id = :meterId';
            $params['meterId'] = (int) $f['meterId'];
        }
        $sql = static::selectSql() . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY t.reading_date DESC, t.id DESC';
        if (!empty($f['limit'])) {
            $sql .= ' LIMIT ' . max(1, (int) $f['limit']);
        }
        $stmt = static::db()->prepare($sql);
        $stmt->execute($params);
        return array_map([static::class, 'cast'], $stmt->fetchAll());
    }

    /** Последнее принятое показание счётчика — источник «предыдущих показаний». */
    public static function lastApproved(int $meterId): ?array
    {
        $rows = static::search(['meterId' => $meterId, 'status' => 'approved', 'limit' => 1]);
        return $rows[0] ?? null;
    }
}
