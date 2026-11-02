<?php
/**
 * Базовая модель — слой доступа к данным (DAL).
 * Описывает таблицу, соответствие полей API (camelCase) и столбцов БД (snake_case),
 * приведение типов и типовые CRUD-операции на подготовленных запросах PDO.
 * Те же модели могут использоваться публичной частью сайта, чтобы не дублировать SQL.
 */
abstract class Model
{
    /** Имя таблицы. */
    protected const TABLE = '';

    /** Поле API => столбец БД (только поля, которые можно записывать). */
    protected const FIELDS = [];

    /** Типы полей API для приведения: int | float | bool | null-строка по умолчанию. */
    protected const CASTS = [];

    /** SELECT, используемый для чтения (может содержать JOIN). Столбцы — в именах API. */
    protected static function selectSql(): string
    {
        $cols = ['t.id AS id'];
        foreach (static::FIELDS as $api => $db) {
            $cols[] = "t.$db AS $api";
        }
        return 'SELECT ' . implode(', ', $cols) . ' FROM ' . static::TABLE . ' t';
    }

    protected static function db(): PDO
    {
        return Database::pdo();
    }

    /** Приведение типов строки результата к формату API. */
    protected static function cast(array $row): array
    {
        $row['id'] = (int) $row['id'];
        foreach (static::CASTS as $field => $type) {
            if (!array_key_exists($field, $row) || $row[$field] === null) {
                continue;
            }
            $row[$field] = match ($type) {
                'int'   => (int) $row[$field],
                'float' => (float) $row[$field],
                'bool'  => (bool) $row[$field],
                default => $row[$field],
            };
        }
        return $row;
    }

    /**
     * Список записей. $filters — поле API => значение (точное совпадение),
     * допускаются только поля из FIELDS.
     */
    public static function all(array $filters = [], string $order = 't.id'): array
    {
        $where = [];
        $params = [];
        foreach ($filters as $api => $value) {
            if ($value === null || $value === '' || !isset(static::FIELDS[$api])) {
                continue;
            }
            $where[] = 't.' . static::FIELDS[$api] . " = :$api";
            $params[$api] = $value;
        }

        $sql = static::selectSql()
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . " ORDER BY $order";

        $stmt = static::db()->prepare($sql);
        $stmt->execute($params);
        return array_map([static::class, 'cast'], $stmt->fetchAll());
    }

    public static function find(int $id): ?array
    {
        $stmt = static::db()->prepare(static::selectSql() . ' WHERE t.id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ? static::cast($row) : null;
    }

    public static function findOrFail(int $id): array
    {
        return static::find($id) ?? throw HttpException::notFound();
    }

    /** Оставляет только известные поля и переводит их в имена столбцов. */
    protected static function toColumns(array $data): array
    {
        $cols = [];
        foreach (static::FIELDS as $api => $db) {
            if (array_key_exists($api, $data)) {
                $cols[$db] = is_bool($data[$api]) ? (int) $data[$api] : $data[$api];
            }
        }
        return $cols;
    }

    public static function create(array $data): array
    {
        $cols = static::toColumns($data);
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            static::TABLE,
            implode(', ', array_keys($cols)),
            implode(', ', array_map(fn ($c) => ":$c", array_keys($cols)))
        );
        static::db()->prepare($sql)->execute($cols);
        return static::find((int) static::db()->lastInsertId());
    }

    public static function update(int $id, array $data): array
    {
        static::findOrFail($id);
        $cols = static::toColumns($data);
        if ($cols) {
            $set = implode(', ', array_map(fn ($c) => "$c = :$c", array_keys($cols)));
            static::db()->prepare('UPDATE ' . static::TABLE . " SET $set WHERE id = :id")
                ->execute($cols + ['id' => $id]);
        }
        return static::find($id);
    }

    public static function delete(int $id): void
    {
        static::findOrFail($id);
        static::db()->prepare('DELETE FROM ' . static::TABLE . ' WHERE id = :id')->execute(['id' => $id]);
    }

    public static function count(string $where = '1', array $params = []): int
    {
        $stmt = static::db()->prepare('SELECT COUNT(*) FROM ' . static::TABLE . " t WHERE $where");
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }
}
