<?php
/** Middleware авторизации: проверка JWT из заголовка Authorization и роли пользователя. */
class Auth
{
    public static function authenticate(Request $request): array
    {
        $header = $request->header('Authorization');
        if ($header === '') {
            throw new HttpException('Токен авторизации отсутствует', 401);
        }
        if (!preg_match('/^Bearer\s+(\S+)$/', $header, $m)) {
            throw new HttpException('Неверный формат заголовка Authorization', 400);
        }

        $payload = Jwt::decode($m[1]);

        // Токен отозван при выходе из системы
        if (RevokedToken::isRevoked($payload['jti'] ?? '')) {
            throw new HttpException('Токен отозван, авторизуйтесь снова', 401);
        }

        // Пользователя могли заблокировать или понизить в правах после выдачи токена
        $user = User::findRaw((int) ($payload['sub'] ?? 0));
        if (!$user || $user['status'] !== 'active' || !in_array($user['role'], User::STAFF_ROLES, true)) {
            throw new HttpException('Доступ запрещён', 403);
        }

        return $payload + ['role_actual' => $user['role']];
    }

    /** $roles = [] — достаточно быть сотрудником; иначе роль должна входить в список. */
    public static function requireRole(array $user, array $roles): void
    {
        if ($roles && !in_array($user['role_actual'], $roles, true)) {
            throw new HttpException('Недостаточно прав для выполнения операции', 403);
        }
    }
}
