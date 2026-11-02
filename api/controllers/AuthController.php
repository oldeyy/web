<?php
/** Аутентификация сотрудников по номеру телефона и паролю с выдачей JWT. */
class AuthController
{
    /** POST /api/auth/login  { phone, password } → { accessToken, tokenType, expiresIn, user } */
    public function login(Request $request): void
    {
        $data = $request->json();
        $phone = trim((string) ($data['phone'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($phone === '' || $password === '') {
            throw new HttpException('Номер телефона и пароль обязательны', 400);
        }

        $user = User::findByPhone($phone);

        // Одинаковое сообщение для неизвестного телефона и неверного пароля
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new HttpException('Неверный номер телефона или пароль', 401);
        }
        if ($user['status'] !== 'active') {
            throw new HttpException('Учётная запись заблокирована', 403);
        }
        if (!in_array($user['role'], User::STAFF_ROLES, true)) {
            throw new HttpException('Доступ запрещён: вход в админ-панель только для сотрудников', 403);
        }

        $token = Jwt::encode([
            'sub'  => (int) $user['id'],
            'name' => $user['name'],
            'role' => $user['role'],
        ]);
        $payload = Jwt::decode($token);

        Response::json([
            'accessToken' => $token,
            'tokenType'   => 'Bearer',
            'expiresIn'   => $payload['exp'] - $payload['iat'],
            'user'        => User::publicView($user),
        ]);
    }

    /** POST /api/auth/logout — токен заносится в список отозванных. */
    public function logout(Request $request): void
    {
        RevokedToken::revoke($request->user['jti'], (int) $request->user['exp']);
        Response::noContent();
    }

    /** GET /api/auth/me — текущий пользователь по токену. */
    public function me(Request $request): void
    {
        Response::json(User::findOrFail((int) $request->user['sub']));
    }
}
