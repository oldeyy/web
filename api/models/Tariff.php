<?php
/** Тарифы на ресурсы. Тариф без даты окончания (valid_to IS NULL) — действующий. */
class Tariff extends Model
{
    protected const TABLE = 'tariffs';
    protected const FIELDS = [
        'resource'  => 'resource',
        'name'      => 'name',
        'price'     => 'price',
        'unit'      => 'unit',
        'validFrom' => 'valid_from',
        'validTo'   => 'valid_to',
    ];
    protected const CASTS = ['price' => 'float'];

    public const UNITS = ['electricity' => 'кВт·ч', 'water' => 'м³', 'gas' => 'м³'];

    public static function current(string $resource): ?array
    {
        $stmt = static::db()->prepare(static::selectSql()
            . ' WHERE t.resource = :r AND t.valid_to IS NULL ORDER BY t.valid_from DESC LIMIT 1');
        $stmt->execute(['r' => $resource]);
        $row = $stmt->fetch();
        return $row ? static::cast($row) : null;
    }
}
