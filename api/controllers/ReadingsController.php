<?php
/** CRUD показаний счётчиков и модерация (принять / отклонить). */
class ReadingsController
{
    /** GET /api/readings?status=&resource=&meterId= */
    public function index(Request $request): void
    {
        Response::json(Reading::search($request->query));
    }

    public function show(Request $request): void
    {
        Response::json(Reading::findOrFail($request->id()));
    }

    /** POST /api/readings */
    public function store(Request $request): void
    {
        $data = $this->validated($request->json());
        Response::created(Reading::create($data));
    }

    /** PUT /api/readings/{id} */
    public function update(Request $request): void
    {
        Reading::findOrFail($request->id());
        $data = $this->validated($request->json());
        Response::json(Reading::update($request->id(), $data));
    }

    /** PATCH /api/readings/{id}/status  { status, comment } */
    public function setStatus(Request $request): void
    {
        $data = $request->json();
        (new Validator($data))
            ->required('status')
            ->in('status', Reading::STATUSES)
            ->custom('comment', ($data['status'] ?? '') !== 'rejected' || trim((string) ($data['comment'] ?? '')) !== '',
                'Укажите причину отклонения')
            ->validate();

        Response::json(Reading::update($request->id(), [
            'status'  => $data['status'],
            'comment' => trim((string) ($data['comment'] ?? '')),
        ]));
    }

    public function destroy(Request $request): void
    {
        Reading::delete($request->id());
        Response::noContent();
    }

    /** Общие правила для создания и изменения; тариф по умолчанию — действующий для ресурса. */
    private function validated(array $data): array
    {
        $v = (new Validator($data))
            ->required('meterId', 'date', 'prev', 'current', 'responsible')
            ->number('meterId', 1)->number('prev', 0)->number('current', 0)->number('tariff', 0)
            ->date('date')
            ->in('status', Reading::STATUSES);

        $meter = isset($data['meterId']) && is_numeric($data['meterId']) ? Meter::find((int) $data['meterId']) : null;
        $v->custom('meterId', $meter !== null, 'Счётчик не найден');
        $v->custom('current',
            !is_numeric($data['current'] ?? null) || !is_numeric($data['prev'] ?? null) || $data['current'] >= $data['prev'],
            'Текущие показания не могут быть меньше предыдущих');
        $v->validate();

        if (!isset($data['tariff']) || $data['tariff'] === '') {
            $data['tariff'] = Tariff::current($meter['resource'])['price'] ?? 0;
        }
        $data['status'] ??= 'pending';
        $data['comment'] = trim((string) ($data['comment'] ?? ''));
        return $data;
    }
}
