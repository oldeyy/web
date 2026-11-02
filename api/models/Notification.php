<?php
/** Уведомления абонентам: user_id = NULL — общая рассылка. */
class Notification extends Model
{
    protected const TABLE = 'notifications';
    protected const FIELDS = [
        'userId'   => 'user_id',
        'message'  => 'message',
        'senderId' => 'sender_id',
        'sentAt'   => 'sent_at',
    ];
    protected const CASTS = ['userId' => 'int', 'senderId' => 'int'];
}
