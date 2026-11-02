<?php
/** Квитанции (начисления абонентам за период). */
class Receipt extends Model
{
    protected const TABLE = 'receipts';
    protected const FIELDS = [
        'userId'   => 'user_id',
        'period'   => 'period',
        'amount'   => 'amount',
        'status'   => 'status',
        'issuedAt' => 'issued_at',
    ];
    protected const CASTS = ['userId' => 'int', 'amount' => 'float'];

    public const STATUSES = ['paid', 'unpaid', 'overdue'];

    protected static function selectSql(): string
    {
        return 'SELECT t.id, t.user_id AS userId, t.period, t.amount, t.status, t.issued_at AS issuedAt,
                       u.name AS userName, u.account
                FROM receipts t JOIN users u ON u.id = t.user_id';
    }
}
