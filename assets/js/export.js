document.getElementById('exportExcel')?.addEventListener('click', function() {
    const table = document.querySelector('.data-table');
    let html = table.outerHTML;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'archive.xls';
    link.click();
});

document.getElementById('exportPdf')?.addEventListener('click', function() {
    window.print(); // или использовать библиотеку, но ТЗ запрещает фреймворки, поэтому печать
});