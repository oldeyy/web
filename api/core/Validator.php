<?php
/** Простая валидация входных данных; ошибки накапливаются по полям. */
class Validator
{
    private array $errors = [];

    public function __construct(private array $data)
    {
    }

    public function required(string ...$fields): self
    {
        foreach ($fields as $f) {
            if (!isset($this->data[$f]) || (is_string($this->data[$f]) && trim($this->data[$f]) === '')) {
                $this->errors[$f] ??= 'Поле обязательно';
            }
        }
        return $this;
    }

    public function number(string $field, ?float $min = null): self
    {
        if (isset($this->data[$field]) && !isset($this->errors[$field])) {
            if (!is_numeric($this->data[$field])) {
                $this->errors[$field] = 'Должно быть числом';
            } elseif ($min !== null && $this->data[$field] < $min) {
                $this->errors[$field] = "Не может быть меньше $min";
            }
        }
        return $this;
    }

    public function date(string $field): self
    {
        $v = $this->data[$field] ?? null;
        if ($v !== null && $v !== '' && !isset($this->errors[$field])) {
            $d = DateTime::createFromFormat('Y-m-d', (string) $v);
            if (!$d || $d->format('Y-m-d') !== $v) {
                $this->errors[$field] = 'Дата в формате ГГГГ-ММ-ДД';
            }
        }
        return $this;
    }

    public function in(string $field, array $values): self
    {
        if (isset($this->data[$field]) && !isset($this->errors[$field]) && !in_array($this->data[$field], $values, true)) {
            $this->errors[$field] = 'Допустимые значения: ' . implode(', ', $values);
        }
        return $this;
    }

    public function regex(string $field, string $pattern, string $message): self
    {
        if (isset($this->data[$field]) && !isset($this->errors[$field]) && !preg_match($pattern, (string) $this->data[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    public function custom(string $field, bool $valid, string $message): self
    {
        if (!$valid && !isset($this->errors[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    /** Бросает 422, если есть ошибки. */
    public function validate(): void
    {
        if ($this->errors) {
            throw HttpException::validation($this->errors);
        }
    }
}
