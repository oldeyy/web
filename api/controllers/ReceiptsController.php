<?php
/** Квитанции: просмотр и отметка об оплате. */
class ReceiptsController
{
    /** GET /api/receipts?status=&period=&userId= */
    public function index(Request $request): void
    {
        Response::json(Receipt::all(array_intersect_key($request->query, array_flip(['status', 'period', 'userId'])), 't.period DESC, t.id'));
    }

    public function show(Request $request): void
    {
        Response::json(Receipt::findOrFail($request->id()));
    }

    /** PUT /api/receipts/{id}  { status } */
    public function update(Request $request): void
    {
        Receipt::findOrFail($request->id());
        $data = $request->json();
        (new Validator($data))->required('status')->in('status', Receipt::STATUSES)->validate();
        Response::json(Receipt::update($request->id(), ['status' => $data['status']]));
    }
}
