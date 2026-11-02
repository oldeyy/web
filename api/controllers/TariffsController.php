<?php
/** CRUD тарифов (изменение — только администратор, см. routes.php). */
class TariffsController
{
    public function index(Request $request): void
    {
        Response::json(Tariff::all(array_intersect_key($request->query, ['resource' => 1]), 't.valid_to IS NOT NULL, t.resource, t.valid_from DESC'));
    }

    public function show(Request $request): void
    {
        Response::json(Tariff::findOrFail($request->id()));
    }

    public function store(Request $request): void
    {
        Response::created(Tariff::create($this->validated($request->json())));
    }

    public function update(Request $request): void
    {
        Tariff::findOrFail($request->id());
        Response::json(Tariff::update($request->id(), $this->validated($request->json())));
    }

    public function destroy(Request $request): void
    {
        Tariff::delete($request->id());
        Response::noContent();
    }

    private function validated(array $data): array
    {
        if (($data['validTo'] ?? '') === '') {
            $data['validTo'] = null;
        }
        (new Validator($data))
            ->required('resource', 'name', 'price', 'validFrom')
            ->in('resource', Meter::RESOURCES)
            ->number('price', 0)
            ->date('validFrom')->date('validTo')
            ->custom('validTo', $data['validTo'] === null || $data['validTo'] >= ($data['validFrom'] ?? ''), 'Дата окончания раньше даты начала')
            ->validate();

        $data['unit'] = Tariff::UNITS[$data['resource']];
        return $data;
    }
}
