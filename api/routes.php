<?php
/**
 * Таблица маршрутов API: метод, шаблон пути, обработчик [Контроллер, метод], требуемые роли.
 * Роли: null — без авторизации; [] — любой авторизованный сотрудник; ['admin'] — только администратор.
 */

$router = new Router();

$staff = [];          // admin и operator
$admin = ['admin'];

// Служебное
$router->get('/', [IndexController::class, 'index'], null);

// Аутентификация
$router->post('/auth/login', [AuthController::class, 'login'], null);
$router->post('/auth/logout', [AuthController::class, 'logout'], $staff);
$router->get('/auth/me', [AuthController::class, 'me'], $staff);

// Дашборд
$router->get('/dashboard', [DashboardController::class, 'index'], $staff);

// Показания
$router->get('/readings', [ReadingsController::class, 'index'], $staff);
$router->post('/readings', [ReadingsController::class, 'store'], $staff);
$router->get('/readings/{id}', [ReadingsController::class, 'show'], $staff);
$router->put('/readings/{id}', [ReadingsController::class, 'update'], $staff);
$router->patch('/readings/{id}/status', [ReadingsController::class, 'setStatus'], $staff);
$router->delete('/readings/{id}', [ReadingsController::class, 'destroy'], $staff);

// Счётчики
$router->get('/meters', [MetersController::class, 'index'], $staff);
$router->post('/meters', [MetersController::class, 'store'], $staff);
$router->get('/meters/{id}', [MetersController::class, 'show'], $staff);
$router->put('/meters/{id}', [MetersController::class, 'update'], $staff);
$router->delete('/meters/{id}', [MetersController::class, 'destroy'], $staff);

// Пользователи
$router->get('/users', [UsersController::class, 'index'], $staff);
$router->get('/users/{id}', [UsersController::class, 'show'], $staff);
$router->put('/users/{id}', [UsersController::class, 'update'], $staff);
$router->put('/users/{id}/role', [UsersController::class, 'setRole'], $admin);
$router->delete('/users/{id}', [UsersController::class, 'destroy'], $admin);

// Уведомления
$router->get('/notifications', [NotificationsController::class, 'index'], $staff);
$router->post('/notifications', [NotificationsController::class, 'store'], $staff);

// Тарифы (изменять может только администратор)
$router->get('/tariffs', [TariffsController::class, 'index'], $staff);
$router->post('/tariffs', [TariffsController::class, 'store'], $admin);
$router->get('/tariffs/{id}', [TariffsController::class, 'show'], $staff);
$router->put('/tariffs/{id}', [TariffsController::class, 'update'], $admin);
$router->delete('/tariffs/{id}', [TariffsController::class, 'destroy'], $admin);

// Квитанции
$router->get('/receipts', [ReceiptsController::class, 'index'], $staff);
$router->get('/receipts/{id}', [ReceiptsController::class, 'show'], $staff);
$router->put('/receipts/{id}', [ReceiptsController::class, 'update'], $staff);

return $router;
