<?php
/** GET /api — сведения об API (проверка доступности). */
class IndexController
{
    public function index(Request $request): void
    {
        Response::json([
            'name'    => 'REST API админ-панели «Все счётчики»',
            'version' => '1.0',
            'resources' => ['auth', 'dashboard', 'readings', 'meters', 'users', 'notifications', 'tariffs', 'receipts'],
        ]);
    }
}
