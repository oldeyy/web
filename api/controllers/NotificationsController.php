<?php
/** Уведомления абонентам: личные (userId) и общая рассылка (userId = null). */
class NotificationsController
{
    public function index(Request $request): void
    {
        Response::json(Notification::all([], 't.sent_at DESC'));
    }

    /** POST /api/notifications  { userId | null, message } */
    public function store(Request $request): void
    {
        $data = $request->json();
        (new Validator($data))->required('message')->validate();

        $userId = $data['userId'] ?? null;
        if ($userId !== null) {
            User::findOrFail((int) $userId);
        }

        Response::created(Notification::create([
            'userId'   => $userId,
            'message'  => trim($data['message']),
            'senderId' => (int) $request->user['sub'],
            'sentAt'   => date('Y-m-d H:i:s'),
        ]));
    }
}
