<?php
/** CRUD приборов учёта. */
class MetersController
{
    /** GET /api/meters?resource=&userId=&status= */
    public function index(Request $request): void
    {
        Response::json(Meter::all(array_intersect_key($request->query, array_flip(['resource', 'userId', 'status']))));
    }

    public function show(Request $request): void
    {
        Response::json(Meter::findOrFail($request->id()));
    }

    public function store(Request $request): void
    {
        $data = $this->validated($request->json());
        Response::created(Meter::create($data));
    }

    public function update(Request $request): void
    {
        Meter::findOrFail($request->id());
        $data = $this->validated($request->json(), $request->id());
        Response::json(Meter::update($request->id(), $data));
    }

    public function destroy(Request $request): void
    {
        Meter::findOrFail($request->id());
        if (Reading::count('t.meter_id = :id', ['id' => $request->id()]) > 0) {
            throw new HttpException('По счётчику есть показания: удаление невозможно, выведите его из эксплуатации', 409);
        }
        Meter::delete($request->id());
        Response::noContent();
    }

    private function validated(array $data, int $id = 0): array
    {
        $data['status'] ??= 'active';
        (new Validator($data))
            ->required('number', 'resource', 'userId', 'installedAt', 'verifiedUntil')
            ->regex('number', '/^\d{5,}$/', 'Заводской номер — не менее 5 цифр')
            ->in('resource', Meter::RESOURCES)
            ->in('status', Meter::STATUSES)
            ->number('userId', 1)
            ->date('installedAt')->date('verifiedUntil')
            ->custom('userId', is_numeric($data['userId'] ?? null) && User::find((int) $data['userId']) !== null, 'Абонент не найден')
            ->custom('verifiedUntil', ($data['verifiedUntil'] ?? '') >= ($data['installedAt'] ?? ''), 'Срок поверки раньше даты установки')
            ->validate();

        if (Meter::numberExists((string) $data['number'], $id)) {
            throw new HttpException('Счётчик с таким номером уже существует', 409);
        }
        return $data;
    }
}
