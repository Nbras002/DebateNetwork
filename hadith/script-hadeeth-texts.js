// All logic is self-contained and runs after DOMContentLoaded

document.addEventListener('DOMContentLoaded', function () {
    // Main container (now always present in HTML)
    const container = document.getElementById('hadeeth-container');
    container.innerHTML = '';
    container.style.maxWidth = '700px';
    container.style.margin = '2rem auto';
    container.style.background = 'var(--white)';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    container.style.padding = '2rem 1.5rem';
    container.style.textAlign = 'right';
    container.style.direction = 'rtl';

    // Elements
    const hadithDisplay = document.createElement('div');
    hadithDisplay.id = 'hadith-display';
    hadithDisplay.style.fontSize = '1.1rem';
    hadithDisplay.style.marginBottom = '1.5rem';
    hadithDisplay.style.wordBreak = 'break-word';

    // Controls layout:
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexDirection = 'row';
    controls.style.alignItems = 'center';
    controls.style.justifyContent = 'space-between';
    controls.style.gap = '0.5rem';
    controls.style.marginBottom = '1rem';

    // Right:
    const rightGroup = document.createElement('div');
    rightGroup.style.display = 'flex';
    rightGroup.style.flexDirection = 'row';
    rightGroup.style.alignItems = 'center';
    rightGroup.style.gap = '0.3rem';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'السابق';
    prevBtn.style.padding = '0.5rem 1.2rem';
    prevBtn.style.fontFamily = 'Amiri';
    prevBtn.style.fontSize = '1rem';
    prevBtn.style.background = 'var(--secondary)';
    prevBtn.style.color = 'white';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '6px';
    prevBtn.style.cursor = 'pointer';

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'التالي';
    nextBtn.style.padding = '0.5rem 1.2rem';
    nextBtn.style.fontFamily = 'Amiri';
    nextBtn.style.fontSize = '1rem';
    nextBtn.style.background = 'var(--primary)';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '6px';
    nextBtn.style.cursor = 'pointer';

    rightGroup.appendChild(prevBtn);
    rightGroup.appendChild(nextBtn);

    // Center:
    const centerGroup = document.createElement('div');
    centerGroup.style.display = 'flex';
    centerGroup.style.justifyContent = 'center';
    centerGroup.style.alignItems = 'center';
    centerGroup.style.flex = '1';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'نسخ';
    copyBtn.style.padding = '0.5rem 1.2rem';
    copyBtn.style.fontFamily = 'Amiri';
    copyBtn.style.fontSize = '1rem';
    copyBtn.style.background = 'var(--accent)';
    copyBtn.style.color = 'black';
    copyBtn.style.border = 'none';
    copyBtn.style.borderRadius = '6px';
    copyBtn.style.cursor = 'pointer';
    centerGroup.appendChild(copyBtn);

    // Left:
    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.flexDirection = 'row';
    leftGroup.style.alignItems = 'center';
    leftGroup.style.gap = '0.3rem';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.style.width = '70px';
    input.style.fontFamily = 'Amiri';
    input.style.fontSize = '1rem';
    input.style.padding = '0.4rem';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #ccc';
    input.style.textAlign = 'center';
    input.setAttribute('aria-label', 'رقم الحديث');

    const gotoBtn = document.createElement('button');
    gotoBtn.textContent = 'اذهب';
    gotoBtn.style.padding = '0.5rem 1.2rem';
    gotoBtn.style.fontFamily = 'Amiri';
    gotoBtn.style.fontSize = '1rem';
    gotoBtn.style.background = 'var(--accent)';
    gotoBtn.style.color = 'black';
    gotoBtn.style.border = 'none';
    gotoBtn.style.borderRadius = '6px';
    gotoBtn.style.cursor = 'pointer';

    leftGroup.appendChild(input);
    leftGroup.appendChild(gotoBtn);

    // Arrange controls: right, center, left
    controls.appendChild(rightGroup);
    controls.appendChild(centerGroup);
    controls.appendChild(leftGroup);

    container.appendChild(hadithDisplay);
    container.appendChild(controls);

    // State
    let hadeethList = [];
    let current = 0;

    // Fetch hadeeth.json
    fetch('hadeeth.json')
        .then(res => res.json())
        .then(data => {
            hadeethList = Array.isArray(data) ? data : (data.Worksheet || []);
            if (hadeethList.length === 0) {
                hadithDisplay.textContent = 'لا توجد أحاديث.';
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                gotoBtn.disabled = true;
                input.disabled = true;
                copyBtn.disabled = true;
                return;
            }
            showHadith(current);
        })
        .catch(() => {
            hadithDisplay.textContent = 'حدث خطأ أثناء تحميل الأحاديث.';
        });

    function showHadith(idx) {
        if (!hadeethList.length) return;
        current = Math.max(0, Math.min(idx, hadeethList.length - 1));
        const hadithNum = current + 1;
        const total = hadeethList.length;
        const h = hadeethList[current];
        hadithDisplay.innerHTML = `
            <div style="margin-bottom:0.7rem;font-weight:700;font-size:1.2rem;color:var(--primary)">الحديث رقم ${hadithNum} من ${total}</div>
            ${h.title ? `<div class='hadith-title'>${h.title}</div>` : ''}
            ${h.hadith_text ? `<div class='hadith-text'>${h.hadith_text}</div>` : ''}
            ${h.explanation ? `<div style='margin-bottom:0.7rem'><span style='color:var(--secondary);font-weight:700'>الشرح:</span> ${h.explanation}</div>` : ''}
            ${h.word_meanings ? `<div style='margin-bottom:0.7rem'><span style='color:var(--accent);font-weight:700'>معاني الكلمات:</span> ${h.word_meanings}</div>` : ''}
            ${h.benefits ? `<div style='margin-bottom:0.7rem'><span style='color:var(--primary);font-weight:700'>الفوائد:</span> ${h.benefits}</div>` : ''}
            <div class='hadith-meta'>
                ${h.grade ? `<span class='hadith-grade'>الدرجة: ${h.grade}</span>` : ''}
                ${h.takhrij ? `<span class='hadith-takhrij'>التخريج: ${h.takhrij}</span>` : ''}
            </div>
        `;
        input.value = hadithNum;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === hadeethList.length - 1;
        copyBtn.disabled = !h.hadith_text;
    }

    prevBtn.addEventListener('click', function () {
        if (current > 0) showHadith(current - 1);
    });
    nextBtn.addEventListener('click', function () {
        if (current < hadeethList.length - 1) showHadith(current + 1);
    });
    gotoBtn.addEventListener('click', function () {
        const val = parseInt(input.value, 10);
        if (!isNaN(val) && val >= 1 && val <= hadeethList.length) {
            showHadith(val - 1);
        } else {
            input.value = current + 1;
            input.focus();
        }
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') gotoBtn.click();
    });
    copyBtn.addEventListener('click', function () {
        if (!hadeethList.length) return;
        const h = hadeethList[current];
        const text = `${h.hadith_text || ''} [${h.grade || ''} - ${h.takhrij || ''}]`;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = 'تم النسخ!';
            setTimeout(() => { copyBtn.textContent = 'نسخ'; }, 1200);
        });
    });
});
