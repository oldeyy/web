<?php
/** GET /api/dashboard?month=YYYY-MM — сводная статистика для стартовой страницы. */
class DashboardController
{
    public function index(Request $request): void
    {
        $month = $request->query['month'] ?? date('Y-m');
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            throw HttpException::validation(['month' => 'Месяц в формате ГГГГ-ММ']);
        }
        $db = Database::pdo();

        // Потребление за месяц по ресурсам (принятые и ожидающие проверки показания)
        $stmt = $db->prepare("SELECT m.resource, SUM(GREATEST(r.current_value - r.prev_value, 0)) AS total
            FROM readings r JOIN meters m ON m.id = r.meter_id
            WHERE DATE_FORMAT(r.reading_date, '%Y-%m') = :month AND r.status IN ('approved', 'pending')
            GROUP BY m.resource");
        $stmt->execute(['month' => $month]);
        $consumption = array_fill_keys(Meter::RESOURCES, 0.0);
        foreach ($stmt->fetchAll() as $row) {
            $consumption[$row['resource']] = (float) $row['total'];
        }

        // Активность передачи показаний за 14 дней (дни без показаний — нули)
        $stmt = $db->query("SELECT reading_date AS date, COUNT(*) AS cnt FROM readings
            WHERE reading_date > CURDATE() - INTERVAL 14 DAY AND reading_date <= CURDATE()
            GROUP BY reading_date");
        $counts = array_column($stmt->fetchAll(), 'cnt', 'date');
        $activity = [];
        for ($i = 13; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i day"));
            $activity[] = ['date' => $d, 'count' => (int) ($counts[$d] ?? 0)];
        }

        $debt = (float) $db->query("SELECT COALESCE(SUM(amount), 0) FROM receipts WHERE status <> 'paid'")->fetchColumn();

        Response::json([
            'month' => $month,
            'stats' => [
                'users'         => User::count("t.role = 'abonent'"),
                'meters'        => Meter::count(),
                'readingsMonth' => Reading::count("DATE_FORMAT(t.reading_date, '%Y-%m') = :m", ['m' => $month]),
                'pending'       => Reading::count("t.status = 'pending'"),
                'debt'          => $debt,
            ],
            'consumptionByResource' => $consumption,
            'activity'         => $activity,
            'latestReadings'   => Reading::search(['limit' => 5]),
            'verificationSoon' => Meter::verificationSoon(3),
            'debtors'          => array_values(array_filter(
                Receipt::all([], 't.period DESC'),
                fn ($r) => $r['status'] !== 'paid'
            )),
        ]);
    }
}
