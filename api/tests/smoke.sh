#!/usr/bin/env bash
# Smoke-тесты REST API. Запуск: bash api/tests/smoke.sh [http://localhost:8080/api]
# Требуются curl и jq; база должна быть заполнена sql/seed.sql.
set -u
API=${1:-http://localhost:8080/api}
ORIGIN=http://localhost:5173
PASS=0; FAIL=0

check() { # check "описание" ожидаемый_код фактический_код
  local pad=$((56 - ${#1})); [ $pad -lt 1 ] && pad=1   # ${#} считает символы, а не байты
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '  \e[32m✔\e[0m %s%*s%s\n' "$1" $pad '' "$3";
  else FAIL=$((FAIL+1)); printf '  \e[31m✘\e[0m %s%*s%s (ожидался %s)\n' "$1" $pad '' "$3" "$2"; fi
}
req() { # req МЕТОД путь [json] [токен] → печатает тело, код в $CODE
  local args=(-s -o /tmp/api_body -w '%{http_code}' -X "$1" "$API$2" -H 'Content-Type: application/json')
  [ -n "${3:-}" ] && args+=(-d "$3")
  [ -n "${4:-}" ] && args+=(-H "Authorization: Bearer $4")
  CODE=$(curl "${args[@]}"); BODY=$(cat /tmp/api_body)
}

echo "== Аутентификация"
req POST /auth/login '{"phone":"+7 900 000-00-01","password":"wrong"}'; check 'Неверный пароль' 401 $CODE
req POST /auth/login '{"phone":"","password":""}';                     check 'Пустые поля' 400 $CODE
req POST /auth/login '{"phone":"+7 912 345-67-89","password":"abonent123"}'; check 'Абонент не допускается в админ-панель' 403 $CODE
req POST /auth/login '{"phone":"8 (900) 000-00-01","password":"admin12345"}'; check 'Вход администратора (телефон в формате 8 …)' 200 $CODE
ADMIN=$(echo "$BODY" | jq -r .accessToken)
req POST /auth/login '{"phone":"+7 916 100-20-30","password":"operator123"}'; check 'Вход оператора' 200 $CODE
OPER=$(echo "$BODY" | jq -r .accessToken)
req GET /auth/me '' "$ADMIN";                                          check 'GET /auth/me' 200 $CODE

echo "== Защита маршрутов (JWT)"
req GET /readings;                                                     check 'Без токена' 401 $CODE
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$API/readings" -H 'Authorization: Token abc'); check 'Неверный формат заголовка' 400 $CODE
req GET /readings '' "${ADMIN%?}x";                                    check 'Подделанная подпись' 401 $CODE
req GET /readings '' "abc.def";                                        check 'Некорректная структура токена' 401 $CODE

echo "== CORS"
H=$(curl -s -o /dev/null -D - -X OPTIONS "$API/readings" -H "Origin: $ORIGIN" \
    -H 'Access-Control-Request-Method: DELETE' -H 'Access-Control-Request-Headers: authorization,content-type')
check 'Preflight OPTIONS → 204' 204 "$(echo "$H" | head -1 | awk '{print $2}')"
check 'Access-Control-Allow-Origin = origin Vue' "$ORIGIN" "$(echo "$H" | grep -i '^access-control-allow-origin' | awk '{print $2}' | tr -d '\r')"
H=$(curl -s -o /dev/null -D - "$API/" -H 'Origin: http://evil.example')
check 'Чужой origin не получает разрешения' 0 "$(echo "$H" | grep -ci '^access-control-allow-origin')"

echo "== Показания"
req GET /readings '' "$ADMIN";                                         check 'GET /readings' 200 $CODE
echo "     всего: $(echo "$BODY" | jq length)"
req GET '/readings?status=pending&resource=water' '' "$ADMIN";        check 'GET /readings?status=pending&resource=water' 200 $CODE
req POST /readings '{"meterId":1,"date":"2026-11-02","prev":500,"current":400,"responsible":"Тест"}' "$ADMIN"
check 'Текущие < предыдущих → ошибка валидации' 422 $CODE
req POST /readings '{"meterId":2,"date":"2026-11-02","prev":0,"current":120,"responsible":"Тест"}' "$OPER"
check 'POST /readings (тариф подставлен автоматически)' 201 $CODE
RID=$(echo "$BODY" | jq .id); echo "     id=$RID tariff=$(echo "$BODY" | jq .tariff) amount=$(echo "$BODY" | jq .amount)"
req GET /readings/$RID '' "$ADMIN";                                    check "GET /readings/$RID" 200 $CODE
req PUT /readings/$RID '{"meterId":2,"date":"2026-11-02","prev":0,"current":150,"responsible":"Тест","status":"pending"}' "$ADMIN"
check "PUT /readings/$RID" 200 $CODE
req PATCH /readings/$RID/status '{"status":"rejected"}' "$ADMIN";     check 'Отклонение без причины' 422 $CODE
req PATCH /readings/$RID/status '{"status":"rejected","comment":"Нет фото"}' "$ADMIN"; check "PATCH /readings/$RID/status" 200 $CODE
req DELETE /readings/$RID '' "$ADMIN";                                 check "DELETE /readings/$RID" 204 $CODE
req GET /readings/$RID '' "$ADMIN";                                    check 'Удалённая запись' 404 $CODE
req DELETE /readings/$RID '' "$ADMIN";                                 check 'Повторный DELETE (идемпотентность результата)' 404 $CODE

echo "== Счётчики"
req POST /meters '{"number":"99001","resource":"water","userId":3,"installedAt":"2026-11-01","verifiedUntil":"2032-11-01"}' "$ADMIN"
check 'POST /meters' 201 $CODE; MID=$(echo "$BODY" | jq .id)
req POST /meters '{"number":"99001","resource":"water","userId":3,"installedAt":"2026-11-01","verifiedUntil":"2032-11-01"}' "$ADMIN"
check 'Дубликат номера' 409 $CODE
req PUT /meters/$MID '{"number":"99001","resource":"water","userId":3,"installedAt":"2026-11-01","verifiedUntil":"2032-11-01","status":"verification"}' "$ADMIN"
check "PUT /meters/$MID" 200 $CODE
req DELETE /meters/$MID '' "$ADMIN";                                   check "DELETE /meters/$MID" 204 $CODE
req DELETE /meters/1 '' "$ADMIN";                                      check 'Удаление счётчика с показаниями' 409 $CODE

echo "== Тарифы и роли"
req GET /tariffs '' "$OPER";                                           check 'Оператор читает тарифы' 200 $CODE
req POST /tariffs '{"resource":"gas","name":"Тест","price":1,"validFrom":"2027-01-01"}' "$OPER"; check 'Оператор не может создать тариф' 403 $CODE
req POST /tariffs '{"resource":"gas","name":"Газ 2027","price":700,"validFrom":"2027-01-01"}' "$ADMIN"; check 'POST /tariffs (администратор)' 201 $CODE
TID=$(echo "$BODY" | jq .id)
req PUT /tariffs/$TID '{"resource":"gas","name":"Газ 2027","price":710,"validFrom":"2027-01-01","validTo":""}' "$ADMIN"; check "PUT /tariffs/$TID" 200 $CODE
req DELETE /tariffs/$TID '' "$ADMIN";                                  check "DELETE /tariffs/$TID" 204 $CODE

echo "== Пользователи, квитанции, уведомления, дашборд"
req GET /users '' "$OPER";                                             check 'GET /users' 200 $CODE
req PUT /users/4 '{"role":"operator"}' "$OPER";                        check 'Оператор не может менять роль' 403 $CODE
req PUT /users/4/role '{"role":"operator"}' "$ADMIN";                 check 'PUT /users/4/role (администратор)' 200 $CODE
req PUT /users/4 '{"role":"abonent","status":"blocked"}' "$ADMIN";    check 'PUT /users/4 (роль и блокировка)' 200 $CODE
req PUT /users/4 '{"status":"active"}' "$ADMIN";                       check 'Разблокировка' 200 $CODE
req PUT /users/1 '{"status":"blocked"}' "$ADMIN";                      check 'Нельзя заблокировать себя' 409 $CODE
req GET '/receipts?status=unpaid' '' "$ADMIN";                         check 'GET /receipts?status=unpaid' 200 $CODE
RCID=$(echo "$BODY" | jq '.[0].id')
req PUT /receipts/$RCID '{"status":"paid"}' "$ADMIN";                  check "PUT /receipts/$RCID (оплачена)" 200 $CODE
req PUT /receipts/$RCID '{"status":"unpaid"}' "$ADMIN";                check "PUT /receipts/$RCID (вернуть статус)" 200 $CODE
req POST /notifications '{"userId":null,"message":"Тестовая рассылка"}' "$OPER"; check 'POST /notifications' 201 $CODE
req GET /dashboard '' "$ADMIN";                                        check 'GET /dashboard' 200 $CODE
echo "     $(echo "$BODY" | jq -c .stats)"

echo "== Прочие ошибки"
req GET /unknown '' "$ADMIN";                                          check 'Неизвестный маршрут' 404 $CODE
req PATCH /readings '' "$ADMIN";                                       check 'Неподдерживаемый метод' 405 $CODE
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/readings" -H "Authorization: Bearer $ADMIN" -d '{oops'); check 'Некорректный JSON' 400 $CODE

echo "== Выход"
req POST /auth/logout '' "$OPER";                                      check 'POST /auth/logout' 204 $CODE
req GET /readings '' "$OPER";                                          check 'Отозванный токен' 401 $CODE

echo; echo "Итого: пройдено $PASS, ошибок $FAIL"
[ "$FAIL" -eq 0 ]
