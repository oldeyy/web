<?php
/** Автозагрузка классов из каталогов core/, models/, controllers/. */

spl_autoload_register(function (string $class): void {
    foreach (['core', 'models', 'controllers'] as $dir) {
        $file = dirname(__DIR__) . "/$dir/$class.php";
        if (is_file($file)) {
            require $file;
            return;
        }
    }
});
