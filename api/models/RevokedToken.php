<?php
/** Отозванные JWT (выход из системы). Хранится только идентификатор jti до истечения срока токена. */
class RevokedToken
{
    public static function revoke(string $jti, int $expiresAt): void
    {
        $db = Database::pdo();
        $db->prepare('INSERT IGNORE INTO revoked_tokens (jti, expires_at) VALUES (:jti, FROM_UNIXTIME(:exp))')
            ->execute(['jti' => $jti, 'exp' => $expiresAt]);
        // Попутно удаляем записи о токенах, срок которых уже истёк
        $db->exec('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    }

    public static function isRevoked(string $jti): bool
    {
        $stmt = Database::pdo()->prepare('SELECT 1 FROM revoked_tokens WHERE jti = :jti');
        $stmt->execute(['jti' => $jti]);
        return (bool) $stmt->fetchColumn();
    }
}
