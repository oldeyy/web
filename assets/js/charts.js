/**
 * Построение графика потребления
 * Требование 3: График потребления за период
 * Требование 21: Чистый JavaScript
 */

(function() {
    'use strict';
    
    /**
     * Данные для графика
     */
    const chartData = {
        electricity: {
            label: 'Расход электроэнергии',
            data: [280, 260, 290, 310, 250, 240, 230, 220, 240, 270, 290, 310],
            color: '#fbbf24',
            unit: 'кВт/ч'
        },
        water: {
            label: 'Расход воды',
            data: [3.5, 3.2, 3.8, 4.0, 3.0, 2.8, 2.5, 2.3, 2.7, 3.0, 3.3, 3.6],
            color: '#0ea5e9',
            unit: 'м³'
        },
        gas: {
            label: 'Расход газа',
            data: [25, 22, 28, 30, 20, 18, 15, 14, 16, 22, 26, 30],
            color: '#f97316',
            unit: 'м³'
        }
    };
    
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    let currentResource = 'electricity';
    let chartCanvas = null;
    let chartContext = null;
    
    /**
     * Инициализация графика
     */
    function initChart() {
        chartCanvas = document.getElementById('consumptionChart');
        if (!chartCanvas) return;
        
        chartContext = chartCanvas.getContext('2d');
        
        // Устанавливаем правильные размеры canvas с учетом devicePixelRatio
        setupCanvasSize();
        
        // Отрисовываем график
        drawChart(currentResource);
        
        // Добавляем обработчики для табов
        setupTabHandlers();
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', debounce(function() {
            setupCanvasSize();
            drawChart(currentResource);
        }, 250));
    }
    
    /**
     * Настройка размеров canvas
     */
    function setupCanvasSize() {
        const container = chartCanvas.parentElement;
        const containerWidth = container.clientWidth;
        
        chartCanvas.width = containerWidth;
        chartCanvas.height = Math.min(300, containerWidth * 0.4);
    }
    
    /**
     * Отрисовка графика
     */
    function drawChart(resourceType) {
        if (!chartContext) return;
        
        const data = chartData[resourceType];
        const values = data.data;
        const color = data.color;
        
        const width = chartCanvas.width;
        const height = chartCanvas.height;
        const padding = { top: 30, right: 20, bottom: 40, left: 50 };
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Очищаем canvas
        chartContext.clearRect(0, 0, width, height);
        
        // Находим максимальное значение для масштабирования
        const maxValue = Math.max(...values) * 1.1;
        
        // Рисуем сетку и оси
        drawGrid(padding, chartWidth, chartHeight, maxValue);
        
        // Рисуем линию графика
        drawLine(values, padding, chartWidth, chartHeight, maxValue, color);
        
        // Рисуем точки
        drawPoints(values, padding, chartWidth, chartHeight, maxValue, color);
        
        // Рисуем подписи оси X (месяцы)
        drawXLabels(months, padding, chartWidth, chartHeight);
        
        // Рисуем заголовок
        drawTitle(data.label, width);
        
        // Обновляем легенду для скринридеров
        updateAriaLabel(values, data.unit);
    }
    
    /**
     * Отрисовка сетки
     */
    function drawGrid(padding, chartWidth, chartHeight, maxValue) {
        const steps = 5;
        const stepValue = maxValue / steps;
        
        chartContext.beginPath();
        chartContext.strokeStyle = '#e5e7eb';
        chartContext.lineWidth = 0.5;
        chartContext.fillStyle = '#6b7280';
        chartContext.font = '11px Inter, sans-serif';
        chartContext.textAlign = 'right';
        chartContext.textBaseline = 'middle';
        
        for (let i = 0; i <= steps; i++) {
            const y = padding.top + chartHeight - (i / steps) * chartHeight;
            
            // Горизонтальная линия
            chartContext.beginPath();
            chartContext.moveTo(padding.left, y);
            chartContext.lineTo(padding.left + chartWidth, y);
            chartContext.stroke();
            
            // Подпись значения
            const value = Math.round(i * stepValue);
            chartContext.fillText(value.toString(), padding.left - 10, y);
        }
        
        // Рисуем оси
        chartContext.beginPath();
        chartContext.strokeStyle = '#9ca3af';
        chartContext.lineWidth = 1;
        
        // Ось Y
        chartContext.moveTo(padding.left, padding.top);
        chartContext.lineTo(padding.left, padding.top + chartHeight);
        
        // Ось X
        chartContext.moveTo(padding.left, padding.top + chartHeight);
        chartContext.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        chartContext.stroke();
    }
    
    /**
     * Отрисовка линии графика
     */
    function drawLine(values, padding, chartWidth, chartHeight, maxValue, color) {
        const stepX = chartWidth / (values.length - 1);
        
        chartContext.beginPath();
        chartContext.strokeStyle = color;
        chartContext.lineWidth = 2;
        chartContext.lineJoin = 'round';
        
        values.forEach((value, index) => {
            const x = padding.left + index * stepX;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                chartContext.moveTo(x, y);
            } else {
                chartContext.lineTo(x, y);
            }
        });
        
        chartContext.stroke();
    }
    
    /**
     * Отрисовка точек на графике
     */
    function drawPoints(values, padding, chartWidth, chartHeight, maxValue, color) {
        const stepX = chartWidth / (values.length - 1);
        
        values.forEach((value, index) => {
            const x = padding.left + index * stepX;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            chartContext.beginPath();
            chartContext.fillStyle = 'white';
            chartContext.arc(x, y, 4, 0, 2 * Math.PI);
            chartContext.fill();
            
            chartContext.beginPath();
            chartContext.strokeStyle = color;
            chartContext.lineWidth = 2;
            chartContext.arc(x, y, 4, 0, 2 * Math.PI);
            chartContext.stroke();
        });
    }
    
    /**
     * Подписи по оси X
     */
    function drawXLabels(labels, padding, chartWidth, chartHeight) {
        const stepX = chartWidth / (labels.length - 1);
        
        chartContext.fillStyle = '#6b7280';
        chartContext.font = '10px Inter, sans-serif';
        chartContext.textAlign = 'center';
        chartContext.textBaseline = 'top';
        
        labels.forEach((label, index) => {
            const x = padding.left + index * stepX;
            const y = padding.top + chartHeight + 5;
            chartContext.fillText(label, x, y);
        });
    }
    
    /**
     * Заголовок графика
     */
    function drawTitle(title, width) {
        chartContext.fillStyle = '#374151';
        chartContext.font = 'bold 14px Inter, sans-serif';
        chartContext.textAlign = 'center';
        chartContext.textBaseline = 'top';
        chartContext.fillText(title, width / 2, 5);
    }
    
    /**
     * Обновление aria-label для доступности
     */
    function updateAriaLabel(values, unit) {
        const description = months.map((month, i) => 
            `${month}: ${values[i]} ${unit}`
        ).join(', ');
        
        chartCanvas.setAttribute('aria-label', `График расхода по месяцам. ${description}`);
    }
    
    /**
     * Обработчики для табов
     */
    function setupTabHandlers() {
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Обновляем активный таб
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Определяем тип ресурса
                const tabText = this.textContent.trim().toLowerCase();
                if (tabText.includes('электр')) {
                    currentResource = 'electricity';
                } else if (tabText.includes('вод')) {
                    currentResource = 'water';
                } else if (tabText.includes('газ')) {
                    currentResource = 'gas';
                }
                
                // Обновляем заголовок графика
                const chartTitle = document.querySelector('.chart-title');
                if (chartTitle) {
                    chartTitle.textContent = chartData[currentResource].label;
                }
                
                // Перерисовываем график
                drawChart(currentResource);
            });
        });
    }
    
    /**
     * Debounce для оптимизации
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Запускаем инициализацию при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChart);
    } else {
        initChart();
    }
})();