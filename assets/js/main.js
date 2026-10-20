/**
 * Основной JavaScript для страницы архива показаний
 * Требование 21: Чистый JavaScript
 * Требование 22: Единый стиль кода, комментарии
 */

(function() {
    'use strict';
    
    /**
     * Инициализация мобильного меню
     */
    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.main-nav__list');
        
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            menu.classList.toggle('active');
        });
    }
    
    /**
     * Инициализация форм и валидации
     */
    function initForms() {
        const meterForm = document.getElementById('meterForm');
        if (!meterForm) return;
        
        meterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentInput = document.getElementById('currentReading');
            const currentValue = parseFloat(currentInput.value);
            const prevValue = parseFloat(currentInput.dataset.prev);
            
            // Валидация (Требование 1)
            if (currentValue <= prevValue) {
                showError(currentInput, 'Текущие показания должны быть больше предыдущих');
                return;
            }
            
            // Расчет расхода и суммы (Требование 2)
            const tariff = 5.2; // Должно приходить с сервера
            const consumption = currentValue - prevValue;
            const amount = consumption * tariff;
            
            const resultDiv = document.getElementById('calcResult');
            resultDiv.innerHTML = `
                <div class="calculation-result">
                    <p>Расход: <strong>${consumption.toFixed(3)}</strong> единиц</p>
                    <p>Сумма к оплате: <strong>${amount.toFixed(2)} ₽</strong></p>
                </div>
            `;
            
            // Здесь должен быть AJAX-запрос на сервер
            console.log('Отправка данных на сервер...');
        });
    }
    
    /**
     * Показать ошибку валидации
     */
    function showError(input, message) {
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('error-feedback')) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        }
        
        input.classList.add('error');
        
        setTimeout(() => {
            input.classList.remove('error');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }, 3000);
    }
    
    /**
     * Экспорт данных (Требование 5)
     */
    function initExport() {
        const exportBtn = document.getElementById('exportBtn');
        if (!exportBtn) return;
        
        exportBtn.addEventListener('click', function() {
            const table = document.querySelector('.data-table');
            const rows = table.querySelectorAll('tr');
            
            let csv = [];
            rows.forEach(row => {
                const cols = row.querySelectorAll('th, td');
                const rowData = Array.from(cols).map(col => col.textContent.trim());
                csv.push(rowData.join(';'));
            });
            
            const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `pokazaniya_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    /**
     * Сравнительный анализ (Требование 4)
     */
    function initComparison() {
        const compareBtn = document.getElementById('compareBtn');
        if (!compareBtn) return;
        
        compareBtn.addEventListener('click', function() {
            // Получаем данные из таблицы
            const rows = document.querySelectorAll('.data-table tbody tr');
            const currentMonth = rows[0]?.querySelector('td:last-child')?.textContent;
            const prevMonth = rows[1]?.querySelector('td:last-child')?.textContent;
            
            // Показываем сравнение
            const comparisonDiv = document.getElementById('comparisonResult');
            if (comparisonDiv) {
                comparisonDiv.innerHTML = `
                    <h3>Сравнение с прошлым месяцем</h3>
                    <p>Текущий месяц: ${currentMonth}</p>
                    <p>Прошлый месяц: ${prevMonth}</p>
                `;
            }
        });
    }
    
    /**
     * Инициализация изображений-заглушек (Требование 15)
     */
    function initImageFallbacks() {
        const images = document.querySelectorAll('img:not([src*="placeholder"])');
        
        images.forEach(img => {
            img.addEventListener('error', function() {
                this.src = 'assets/img/placeholder.svg';
                this.alt = this.alt || 'Изображение временно недоступно';
            });
        });
    }
    
    /**
     * Проверка поддержки WebP и замена формата при необходимости
     */
    function checkWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = function() {
            document.documentElement.classList.add(webP.height === 2 ? 'webp' : 'no-webp');
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }
    
    // Запускаем все при загрузке DOM
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initForms();
        initExport();
        initComparison();
        initImageFallbacks();
        checkWebPSupport();
    });
    
})();

