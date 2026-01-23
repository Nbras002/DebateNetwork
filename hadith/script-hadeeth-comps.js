// Script for comparing two ahadith by their numbers

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('compare-form');
    const resultsDiv = document.getElementById('compare-results');
    let hadeethData = null;

    // Load hadith data once
    fetch('hadeeth.json')
        .then(res => res.json())
        .then(data => { hadeethData = data; })
        .catch(() => { resultsDiv.textContent = 'تعذر تحميل بيانات الأحاديث.'; });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        resultsDiv.innerHTML = '';
        const firstId = form['first-hadith'].value.trim();
        const secondId = form['second-hadith'].value.trim();
        if (!firstId || !secondId || !hadeethData) return;
        const first = hadeethData.find(h => h.id === firstId);
        const second = hadeethData.find(h => h.id === secondId);
        if (!first && !second) {
            resultsDiv.innerHTML = '<div style="color:red">لم يتم العثور على الحديثين.</div>';
            return;
        }
        if (!first) {
            resultsDiv.innerHTML = '<div style="color:red">لم يتم العثور على الحديث الأول.</div>';
            return;
        }
        if (!second) {
            resultsDiv.innerHTML = '<div style="color:red">لم يتم العثور على الحديث الثاني.</div>';
            return;
        }
        // Show first hadith, then second
        resultsDiv.innerHTML = renderHadith(first, 'الأول') + '<hr style="margin:2rem 0">' + renderHadith(second, 'الثاني');
    });

    function renderHadith(h, label) {
        return `<div class="hadith-compare-result" style="background:#fff;padding:1.2rem 1rem;border-radius:12px;box-shadow:var(--shadow);margin-bottom:1.5rem;">
            <div class="hadith-title">الحديث ${label} (رقم ${h.id})</div>
            <div class="hadith-text">${h.hadith_text || ''}</div>
            ${h.explanation ? `<div class="hadith-explanation" style="color:#222;padding:0.7rem 1rem;border-radius:7px;margin-bottom:0.7rem;"><b style='color:#1a237e;'>الشرح:</b> ${h.explanation}</div>` : ''}
            ${h.word_meanings ? `<div class="hadith-word-meanings" style="color:#222;padding:0.7rem 1rem;border-radius:7px;margin-bottom:0.7rem;"><b style='color:#3949ab;'>معاني الكلمات:</b> ${h.word_meanings}</div>` : ''}
            ${h.benefits ? `<div class="hadith-benefits" style="color:#222;padding:0.7rem 1rem;border-radius:7px;margin-bottom:0.7rem;"><b style='color:#ffb300;'>الفوائد:</b> ${h.benefits}</div>` : ''}
            <div class="hadith-meta" style="margin-top:0.7rem;">
                <span class='hadith-grade' style="color:green;font-weight:700;">الدرجة: ${h.grade || ''}</span>
                <span class="hadith-takhrij" style="color:#b71c1c;font-weight:700;margin-right:1.5rem;">التخريج: ${h.takhrij || ''}</span>
            </div>
        </div>`;
    }
});
