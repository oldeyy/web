(function() {
    'use strict';

    // ---------- Функция генерации HTML квитанции на основе макета receipt.html ----------
    function generateReceiptHTML(rowData) {
        // rowData должно содержать поля: date, resource, meterNumber, prev, current, consumption, tariff, amount, responsible
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Квитанция ${rowData.resource} ${rowData.date}</title>
    <style>
        /* Скопированы стили из вашей квитанции (при необходимости уточните) */
        body {
            font-family: 'Courier New', Courier, monospace;
            margin: 20px;
            background: white;
            color: black;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
        }
        .header {
            margin-bottom: 20px;
        }
        .header h2 {
            margin: 0 0 5px;
        }
        .info-row {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        .total {
            text-align: right;
            font-size: 1.2em;
            margin-top: 20px;
        }
        .bank-details {
            margin-top: 30px;
            font-size: 0.9em;
        }
        .print-btn-container {
            text-align: center;
            margin-top: 30px;
        }
        .print-btn {
            padding: 10px 20px;
            font-size: 16px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
        .print-btn:hover {
            background: #1d4ed8;
        }
        @media print {
            .no-print {
                display: none;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .receipt {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h2>Оплата за ${rowData.date.split('.')[1] || ''} ${rowData.date.split('.')[2] || ''}</h2>
            <div class="info-row"><strong>Получатель:</strong> ООО "Тмыв"</div>
            <div class="info-row"><strong>№ Счетчика:</strong> ${rowData.meterNumber}</div>
            <div class="info-row"><strong>Ответственный за снятие:</strong> ${rowData.responsible}</div>
            <div class="info-row"><strong>Адрес:</strong> г. Омск, ул. Ленина, д. 10, кв. 42</div>
        </div>

        <table>
            <thead>
                <tr><th>Дата</th><th>Пред</th><th>Тек</th></tr>
            </thead>
            <tbody>
                <tr><td>${rowData.date}</td><td>${rowData.prev}</td><td>${rowData.current}</td></tr>
            </tbody>
        </table>

        <div style="margin: 20px 0;">
            <h3>Квитанция об оплате за ${rowData.date.split('.')[1] || ''} ${rowData.date.split('.')[2] || ''}</h3>
            <div class="info-row"><strong>№ Счетчика:</strong> ${rowData.meterNumber}</div>
            <div class="info-row"><strong>Ответственный за снятие:</strong> ${rowData.responsible}</div>
            <div class="info-row"><strong>Адрес:</strong> г. Омск, ул. Ленина, д. 10, кв. 42</div>
        </div>

        <table>
            <thead>
                <tr><th>Услуги</th><th>Объем потреб., м³</th><th>Тариф, руб/м³</th><th>Сумма, руб.</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>${rowData.resource}</td>
                    <td>${rowData.consumption}</td>
                    <td>${rowData.tariff}</td>
                    <td>${rowData.amount}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align:right;"><strong>Всего к оплате</strong></td>
                    <td><strong>${rowData.amount}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="bank-details">
            <div><strong>ИНН:</strong> 7730263950</div>
            <div><strong>П/О:</strong> 693014</div>
            <div><strong>БИК:</strong> 04452060</div>
            <div><strong>р/с:</strong> 40702810837924156700</div>
            <div><strong>к/с:</strong> 30101810500000000600</div>
        </div>

        <div style="margin-top: 20px; text-align: right;">
            <strong>За водоснабжение</strong><br>
            Всего к оплате: <strong>${rowData.amount} р.</strong>
        </div>

        <!-- Дополнительный отрывной блок (как в макете) -->
        <div style="margin-top: 40px; border-top: 1px dashed #000; padding-top: 20px;">
            <table>
                <tr><th>Дата</th><th>Пред</th><th>Тек</th></tr>
                <tr><td>${rowData.date}</td><td>${rowData.prev}</td><td>${rowData.current}</td></tr>
            </table>
        </div>

        <div class="print-btn-container no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Печать квитанции</button>
            <button class="print-btn" onclick="window.close()" style="background:#6b7280; margin-left:10px;">Закрыть</button>
        </div>
    </div>
    <script>
        // Автоматически запускаем печать при загрузке (можно раскомментировать)
        // window.onload = function() { window.print(); };
    <\/script>
</body>
</html>`;
    }

    // Функция извлечения данных из строки таблицы
    function getRowDataFromTable(row) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 9) return null;
        return {
            date: cells[0].textContent.trim(),
            resource: cells[1].textContent.trim(),
            meterNumber: cells[2].textContent.trim(),
            prev: cells[3].textContent.trim(),
            current: cells[4].textContent.trim(),
            consumption: cells[5].textContent.trim(),
            tariff: cells[6].textContent.trim(),
            amount: cells[7].textContent.trim(),
            responsible: cells[8].textContent.trim()
        };
    }

    // Извлечение данных из мобильной карточки
    function getRowDataFromCard(card) {
        const rows = card.querySelectorAll('.archive-card__row');
        const data = {};
        rows.forEach(r => {
            const spans = r.querySelectorAll('span');
            if (spans.length >= 2) {
                const key = spans[0].textContent.replace(':', '').trim();
                data[key] = spans[1].textContent.trim();
            }
        });
        return {
            date: data['Дата'] || '',
            resource: data['Ресурс'] || '',
            meterNumber: data['№ счетчика'] || '',
            prev: data['Пред.'] || '',
            current: data['Текущ.'] || '',
            consumption: data['Расход'] || '',
            tariff: data['Тариф'] || '',
            amount: data['Сумма'] || '',
            responsible: data['Ответственный'] || ''
        };
    }

    function openReceiptPrint(rowData) {
        if (!rowData) return;
        const html = generateReceiptHTML(rowData);
        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
        win.focus();
        // Небольшая задержка для рендеринга перед печатью
        setTimeout(() => {
            win.print();
        }, 300);
    }

    // ---------- Навешиваем обработчики на кнопки "Квитанция" ----------
    // Таблица (десктоп)
    document.querySelectorAll('#archiveTable tbody tr').forEach(row => {
        const btn = row.querySelector('.print-receipt-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openReceiptPrint(getRowDataFromTable(row));
            });
        }
    });

    // Мобильные карточки
    document.querySelectorAll('.archive-card').forEach(card => {
        const btn = card.querySelector('.print-receipt-btn-mobile');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openReceiptPrint(getRowDataFromCard(card));
            });
        }
    });

    // ---------- Остальные функции (экспорт, фильтры) ----------
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            const table = document.getElementById('archiveTable');
            const html = table.outerHTML;
            const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'archive.xls';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            window.print();
        });
    }

    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            const meter = document.getElementById('meterFilter').value;
            const type = document.getElementById('typeFilter').value;
            const period = document.getElementById('periodFilter').value;
            alert(`Применены фильтры:\nСчетчик: ${meter || 'все'}\nТип: ${type || 'все'}\nПериод: ${period || 'все время'}`);
        });
    }

    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            document.getElementById('meterFilter').value = '';
            document.getElementById('typeFilter').value = '';
            document.getElementById('periodFilter').value = '';
        });
    }

})();