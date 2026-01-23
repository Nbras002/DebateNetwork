// --- Quran Search Script (Bible Search Logic) ---
const riwayaFiles = [
    { file: 'hafs-data-v2-0.json', label: 'حفص عن عاصم' },
    { file: 'shuba-data-v2-0.json', label: 'شعبة عن عاصم' },
    { file: 'warsh-data-v2-1.json', label: 'ورش عن نافع' },
    { file: 'qaloun-data-v2-1.json', label: 'قالون عن نافع' },
    { file: 'douri-data-v2-0.json', label: 'الدوري عن أبي عمرو' },
    { file: 'sousi-data-v2-0.json', label: 'السوسي عن أبي عمرو' },
];
let quranSearchCurrentRiwaya = riwayaFiles[0].file;
let quranSearchData = [];
let currentResults = [];
let currentPage = 1;
const RESULTS_PER_PAGE = 10;
const riwayaBtns = document.querySelectorAll('#quran-search-riwaya-btns-unique .quran-btn');
const searchInput = document.getElementById('quran-search-text-unique');
const searchBtn = document.getElementById('quran-search-btn-unique');
const searchResults = document.getElementById('quran-search-results-unique');

function removeTashkeel(text) {
    return text.replace(/[\u064B-\u0652]/g, '');
}

// تحميل ملف JSON للرواية المحددة
async function loadQuranSearchRiwaya(jsonFile) {
    searchResults.innerHTML = '<div style="text-align:center">جاري تحميل الرواية...</div>';
    try {
        const res = await fetch(jsonFile);
        quranSearchData = await res.json();
        quranSearchCurrentRiwaya = jsonFile;
        searchResults.innerHTML = '';
    } catch (e) {
        searchResults.innerHTML = '<div style="color:red">تعذر تحميل الرواية.</div>';
    }
}

function renderResultsPage(page) {
    const totalPages = Math.ceil(currentResults.length / RESULTS_PER_PAGE);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    const pageResults = currentResults.slice(start, end);
    // اسم الرواية الحالي
    const riwayaName = riwayaFiles.find(r => r.file === quranSearchCurrentRiwaya)?.label || '';
    // ربط اسم الملف بالصنف المناسب للخط
    const riwayaFontClassMap = {
        'hafs-data-v2-0.json': 'hafs',
        'shuba-data-v2-0.json': 'shuba',
        'warsh-data-v2-1.json': 'warsh',
        'qaloun-data-v2-1.json': 'qaloun',
        'douri-data-v2-0.json': 'douri',
        'sousi-data-v2-0.json': 'sousi'
    };
    const fontClass = riwayaFontClassMap[quranSearchCurrentRiwaya] || '';
    let html = pageResults.map((v, i) => `
        <div class="quran-verse" style="background:#f9f9f9;border-radius:8px;padding:1rem;margin-bottom:1.2rem;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
            <div class="quran-verse-header" style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;margin-bottom:0.7rem;">
                <span class="quran-verse-ref" style="font-weight:700;color:#3949ab;font-size:1.1rem;">${v.surah} ${v.ayahNum}</span>
                <button class="quran-copy-btn" id="quran-copy-btn-${start + i}" title="نسخ">نسخ</button>
            </div>
            <div class="quran-verse-text quran-verse-translation ${fontClass}" style="color:#000;font-size:1.18rem;font-weight:600;text-align:center;">${v.text}</div>
        </div>
    `).join('');
    // Pagination controls
    if (totalPages > 1) {
        html += `<div style="display:flex;justify-content:center;gap:0.5rem;margin:1.5rem 0;">
            <button id="quran-prev-page" ${page === 1 ? 'disabled' : ''} style="padding:0.5rem 1.2rem;border-radius:7px;border:none;background:var(--primary);color:white;font-family:'Amiri',serif;font-size:1.05rem;cursor:pointer;">السابق</button>
            <span style="align-self:center;font-size:1.08rem;">صفحة ${page} من ${totalPages}</span>
            <button id="quran-next-page" ${page === totalPages ? 'disabled' : ''} style="padding:0.5rem 1.2rem;border-radius:7px;border:none;background:var(--primary);color:white;font-family:'Amiri',serif;font-size:1.05rem;cursor:pointer;">التالي</button>
        </div>`;
    }
    searchResults.innerHTML = html;
    // Copy listeners
    pageResults.forEach((v, i) => {
        const btn = document.getElementById(`quran-copy-btn-${start + i}`);
        if (btn) {
            btn.addEventListener('click', function() {
                const text = `${v.text} [${v.surah} ${v.ayahNum} ${riwayaName}]`;
                navigator.clipboard.writeText(text);
                const original = btn.textContent;
                btn.textContent = 'تم النسخ!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = original;
                    btn.disabled = false;
                }, 1000);
            });
        }
    });
    // Pagination listeners
    if (totalPages > 1) {
        const prevBtn = document.getElementById('quran-prev-page');
        const nextBtn = document.getElementById('quran-next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => renderResultsPage(currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => renderResultsPage(currentPage + 1));
    }
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) {
        document.getElementById('quran-search-limit-msg')?.remove();
        searchResults.innerHTML = '<div style="color:red">يرجى إدخال نص للبحث.</div>';
        return;
    }
    const tashkeelOption = document.querySelector('input[name="quran-tashkeel-unique"]:checked').value;
    if (tashkeelOption === 'without') {
        const queryNoTashkeel = removeTashkeel(query);
        currentResults = (Array.isArray(quranSearchData) ? quranSearchData : []).filter(v => removeTashkeel(v.aya_text || v.text || '').includes(queryNoTashkeel)).map(v => ({
            surah: v.sura_name_ar || v.sura_name_en || '',
            surahNum: v.sura_no || '',
            ayahNum: v.aya_no || '',
            text: v.aya_text || v.text || ''
        }));
    } else {
        currentResults = (Array.isArray(quranSearchData) ? quranSearchData : []).filter(v => (v.aya_text || v.text || '').includes(query)).map(v => ({
            surah: v.sura_name_ar || v.sura_name_en || '',
            surahNum: v.sura_no || '',
            ayahNum: v.aya_no || '',
            text: v.aya_text || v.text || ''
        }));
    }
    document.getElementById('quran-search-limit-msg')?.remove();
    if (currentResults.length === 0) {
        searchResults.innerHTML = '<div style="color:gray">لم يتم العثور على نتائج.</div>';
        return;
    }
    // عرض رسالة الحد أعلى النتائج
    const limitMsg = document.createElement('div');
    limitMsg.id = 'quran-search-limit-msg';
    limitMsg.textContent = `عدد النتائج: ${currentResults.length}`;
    limitMsg.style.background = '#fff';
    limitMsg.style.padding = '0.7rem 1rem';
    limitMsg.style.margin = '1.5rem auto 0 auto';
    limitMsg.style.maxWidth = '700px';
    limitMsg.style.borderRadius = '8px';
    limitMsg.style.textAlign = 'center';
    limitMsg.style.fontWeight = '700';
    limitMsg.style.fontSize = '1.08rem';
    limitMsg.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
    searchResults.parentNode.insertBefore(limitMsg, searchResults);
    renderResultsPage(1);
});

// تغيير الرواية عند الضغط على زر
riwayaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        riwayaBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('quran-search-limit-msg')?.remove();
        searchResults.innerHTML = '';
        currentResults = [];
        currentPage = 1;
        loadQuranSearchRiwaya(btn.getAttribute('data-json'));
    });
});

// تحميل الرواية الافتراضية عند بدء الصفحة
window.addEventListener('DOMContentLoaded', () => {
    // Set default active button for hafs-data-v2-0.json
    riwayaBtns.forEach(btn => {
        if (btn.getAttribute('data-json') === 'hafs-data-v2-0.json') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    loadQuranSearchRiwaya(quranSearchCurrentRiwaya);
});
