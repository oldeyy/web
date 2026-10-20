(function() {
    'use strict';
    
    const meterSelect = document.getElementById('meterSelect');
    const currentInput = document.getElementById('currentReading');
    const prevInput = document.getElementById('prevReading');
    const consumptionSpan = document.getElementById('consumptionValue');
    const totalSpan = document.getElementById('totalAmount');
    const meterTypeSpan = document.getElementById('meterType');
    const meterTariffSpan = document.getElementById('meterTariff');
    const meterAddressSpan = document.getElementById('meterAddress');
    const meterLastCheckSpan = document.getElementById('meterLastCheck');
    
    let currentTariff = 0;
    
    function updateMeterInfo() {
        const selected = meterSelect.options[meterSelect.selectedIndex];
        if (selected.value) {
            meterTypeSpan.textContent = selected.dataset.type || '—';
            currentTariff = parseFloat(selected.dataset.tariff) || 0;
            meterTariffSpan.textContent = currentTariff;
            meterAddressSpan.textContent = selected.dataset.address || '—';
            meterLastCheckSpan.textContent = selected.dataset.lastCheck || '—';
            // Здесь можно сделать запрос для получения предыдущих показаний
            prevInput.value = '56842'; // пример
            calculate();
        }
    }
    
    function calculate() {
        const prev = parseFloat(prevInput.value) || 0;
        const curr = parseFloat(currentInput.value) || 0;
        if (curr > prev) {
            const consumption = curr - prev;
            consumptionSpan.textContent = consumption.toFixed(3);
            const amount = consumption * currentTariff;
            totalSpan.textContent = amount.toFixed(2);
            currentInput.setCustomValidity('');
        } else {
            currentInput.setCustomValidity('Текущие показания должны быть больше предыдущих');
            consumptionSpan.textContent = '0';
            totalSpan.textContent = '0';
        }
    }
    
    if (meterSelect) {
        meterSelect.addEventListener('change', updateMeterInfo);
        currentInput.addEventListener('input', calculate);
        updateMeterInfo();
    }
    
    // Обработка отправки
    const form = document.querySelector('.form-card');
    const submitBtn = document.getElementById('submitReading');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentInput.checkValidity()) {
                // Показать сообщение об успехе
                document.querySelector('.form-card > :not(.success-message)').forEach(el => el.style.display = 'none');
                document.querySelector('.success-message').style.display = 'block';
            } else {
                currentInput.reportValidity();
            }
        });
    }
})();