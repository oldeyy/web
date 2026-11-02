<?php
/** Пользователи: просмотр, блокировка, смена роли (только администратор), удаление. */
class UsersController
{
    /** GET /api/users?role=&status= */
    public function index(Request $request): void
    {
        Response::json(User::all(array_intersect_key($request->query, array_flip(['role', 'status']))));
    }

    public function show(Request $request): void
    {
        Response::json(User::findOrFail($request->id()));
    }

    /** PUT /api/users/{id} — изменение статуса и профиля; роль меняет только администратор. */
    public function update(Request $request): void
    {
        $user = User::findOrFail($request->id());
        $data = $request->json();

        (new Validator($data))
            ->in('role', User::ROLES)
            ->in('status', User::STATUSES)
            ->validate();

        if (isset($data['role']) && $data['role'] !== $user['role']) {
            Auth::requireRole($request->user, ['admin']);
        }
        $this->guardSelf($request, $data);

        // Телефон, лицевой счёт и дата регистрации через этот метод не меняются
        $allowed = array_intersect_key($data, array_flip(['name', 'address', 'role', 'status']));
        Response::json(User::update($request->id(), $allowed));
    }

    /** PUT /api/users/{id}/role  { role } */
    public function setRole(Request $request): void
    {
        User::findOrFail($request->id());
        $data = $request->json();
        (new Validator($data))->required('role')->in('role', User::ROLES)->validate();
        $this->guardSelf($request, $data);
        Response::json(User::update($request->id(), ['role' => $data['role']]));
    }

    public function destroy(Request $request): void
    {
        if ($request->id() === (int) $request->user['sub']) {
            throw new HttpException('Нельзя удалить собственную учётную запись', 409);
        }
        User::findOrFail($request->id());
        if (Meter::count('t.user_id = :id', ['id' => $request->id()]) > 0) {
            throw new HttpException('У пользователя есть счётчики: удаление невозможно, заблокируйте его', 409);
        }
        User::delete($request->id());
        Response::noContent();
    }

    /** Администратор не может заблокировать себя или лишить себя прав. */
    private function guardSelf(Request $request, array $data): void
    {
        if ($request->id() !== (int) $request->user['sub']) {
            return;
        }
        if (($data['status'] ?? 'active') !== 'active' || (isset($data['role']) && $data['role'] !== $request->user['role_actual'])) {
            throw new HttpException('Нельзя заблокировать себя или изменить собственную роль', 409);
        }
    }
}
