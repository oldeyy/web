<?php
/** Маршрутизатор: сопоставляет метод и путь запроса с обработчиком и проверяет доступ. */
class Router
{
    private array $routes = [];

    public function get(string $path, array $handler, ?array $roles): void { $this->add('GET', $path, $handler, $roles); }
    public function post(string $path, array $handler, ?array $roles): void { $this->add('POST', $path, $handler, $roles); }
    public function put(string $path, array $handler, ?array $roles): void { $this->add('PUT', $path, $handler, $roles); }
    public function patch(string $path, array $handler, ?array $roles): void { $this->add('PATCH', $path, $handler, $roles); }
    public function delete(string $path, array $handler, ?array $roles): void { $this->add('DELETE', $path, $handler, $roles); }

    private function add(string $method, string $path, array $handler, ?array $roles): void
    {
        // /readings/{id} -> #^/readings/(?P<id>\d+)$#
        $pattern = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>\d+)', $path) . '$#';
        $this->routes[] = compact('method', 'pattern', 'handler', 'roles');
    }

    public function dispatch(Request $request): void
    {
        $allowed = [];

        foreach ($this->routes as $route) {
            if (!preg_match($route['pattern'], $request->path, $matches)) {
                continue;
            }
            if ($route['method'] !== $request->method) {
                $allowed[] = $route['method'];
                continue;
            }

            $request->params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            // Middleware авторизации: null — публичный маршрут
            if ($route['roles'] !== null) {
                $request->user = Auth::authenticate($request);
                Auth::requireRole($request->user, $route['roles']);
            }

            [$class, $method] = $route['handler'];
            (new $class())->$method($request);
            return;
        }

        if ($allowed) {
            header('Allow: ' . implode(', ', array_unique($allowed)));
            throw new HttpException('Метод ' . $request->method . ' не поддерживается для ' . $request->path, 405);
        }
        throw new HttpException('Маршрут ' . $request->path . ' не найден', 404);
    }
}
