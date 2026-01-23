// مقارنة بين روايات القرآن الكريم


// قائمة الروايات وملفاتها
const QURAN_RIWAYAT = [
    { key: 'hafs', file: 'hafs-data-v2-0.json', name: 'حفص عن عاصم' },
    { key: 'shuba', file: 'shuba-data-v2-0.json', name: 'شعبة عن عاصم' },
    { key: 'warsh', file: 'warsh-data-v2-1.json', name: 'ورش عن نافع' },
    { key: 'qaloun', file: 'qaloun-data-v2-1.json', name: 'قالون عن نافع' },
    { key: 'douri', file: 'douri-data-v2-0.json', name: 'الدوري عن أبي عمرو' },
    { key: 'sousi', file: 'sousi-data-v2-0.json', name: 'السوسي عن أبي عمرو' },
];

// كاشنغ بيانات الروايات
const quranDataCache = {};
let surahList = [];

// عناصر الواجهة
const riwayatBtns = document.querySelectorAll('.quran-btn');
const surahSelect = document.getElementById('quran-comp-surah-select');
const ayahInput = document.getElementById('quran-comp-ayah-input');
const compareForm = document.getElementById('quran-comp-form');
const resultDisplay = document.getElementById('quran-comp-result-display');

// الروايات المختارة (2 على الأقل)
let selectedRiwayat = new Set(['hafs', 'shuba']);

// --- منطق أزرار الروايات ---
riwayatBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const key = btn.getAttribute('data-value');
        if (selectedRiwayat.has(key)) {
            if (selectedRiwayat.size > 2) {
                selectedRiwayat.delete(key);
                btn.classList.remove('active');
            }
        } else {
            selectedRiwayat.add(key);
            btn.classList.add('active');
        }
    });
    // تفعيل الحالة الافتراضية
    if (selectedRiwayat.has(btn.getAttribute('data-value'))) {
        btn.classList.add('active');
    }
});

// --- أسماء السور ---
const QURAN_SURAHS = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

// --- تحميل قائمة السور ---
async function loadSurahList() {
    if (surahList.length > 0) return;
    surahList = QURAN_SURAHS;
    surahSelect.innerHTML = surahList.map((name, i) => `<option value="${i+1}">${name}</option>`).join('');
    surahSelect.value = "1";
}

// --- تحميل بيانات الرواية (مع كاشنغ) ---
async function getRiwayaData(key) {
    if (quranDataCache[key]) return quranDataCache[key];
    const riw = QURAN_RIWAYAT.find(r => r.key === key);
    if (!riw) return null;
    try {
        const resp = await fetch('./' + riw.file);
        if (!resp.ok) {
            console.error(`فشل تحميل ملف الرواية: ${riw.file}`, resp.status, resp.statusText);
            return null;
        }
        const data = await resp.json();
        if (!Array.isArray(data)) {
            console.error(`هيكل بيانات غير صحيح للرواية: ${riw.file}`, data);
            return null;
        }
        quranDataCache[key] = data;
        return data;
    } catch (err) {
        console.error(`خطأ في تحميل ملف الرواية: ${riw.file}`, err);
        return null;
    }
}

// --- عند إرسال النموذج: مقارنة ---
compareForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const surahNum = parseInt(surahSelect.value, 10);
    const ayahNum = parseInt(ayahInput.value, 10);
    if (!surahNum || !ayahNum || selectedRiwayat.size < 2) {
        alert('يرجى اختيار سورة، آية، وتحديد روايتين على الأقل.');
        return;
    }
    resultDisplay.style.display = 'block';
    resultDisplay.innerHTML = '<div style="text-align:center;color:gray;">جاري التحميل...</div>';
    // ربط اسم الرواية بالصنف المناسب للخط
    const riwayaFontClassMap = {
        'حفص عن عاصم': 'hafs',
        'شعبة عن عاصم': 'shuba',
        'ورش عن نافع': 'warsh',
        'قالون عن نافع': 'qaloun',
        'الدوري عن أبي عمرو': 'douri',
        'السوسي عن أبي عمرو': 'sousi'
    };
    // تحميل جميع الروايات المختارة
    const results = await Promise.all(Array.from(selectedRiwayat).map(async key => {
        const data = await getRiwayaData(key);
        if (!data) return { key, text: 'تعذر تحميل الرواية', fontClass: '', name: key };
        // إيجاد نص الآية
        const ayahObj = data.find(a => a.sura_no === surahNum && a.aya_no === ayahNum);
        const riw = QURAN_RIWAYAT.find(r => r.key === key);
        const name = riw ? riw.name : key;
        const fontClass = riwayaFontClassMap[name] || '';
        return {
            key,
            name,
            text: ayahObj ? ayahObj.aya_text : 'الآية غير موجودة',
            ref: `${QURAN_SURAHS[surahNum-1]} ${ayahNum}`,
            fontClass
        };
    }));
    // عرض النتائج مع الخط المناسب لكل رواية
    resultDisplay.innerHTML = results.map((r, idx) => `
        <div class="quran-ayah" style="margin-bottom:2rem; position:relative;">
            <div class="quran-ayah-header" style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;width:100%;">
                <span class="quran-ayah-ref" style="order:1;">${r.ref || ''}</span>
                <span class="quran-ayah-riwaya" style="flex:1;text-align:center;order:2;">${r.name || ''}</span>
                <button class="quran-copy-btn" style="order:3;" data-copy-idx="${idx}">نسخ</button>
            </div>
            <div class="quran-ayah-text quran-verse-translation ${r.fontClass}" id="quran-ayah-text-${idx}">${r.text}</div>
        </div>
    `).join('');

    // تفعيل زر النسخ لكل نتيجة
    results.forEach((r, idx) => {
        const btn = document.querySelector(`.quran-copy-btn[data-copy-idx='${idx}']`);
        if (btn) {
            btn.addEventListener('click', async function() {
                const text = document.getElementById(`quran-ayah-text-${idx}`).innerText + ' [' + (r.ref || '') + ' ' + (r.name || '') + ']';
                try {
                    await navigator.clipboard.writeText(text);
                    const oldText = btn.innerText;
                    btn.innerText = 'تم النسخ!';
                    btn.disabled = true;
                    setTimeout(() => {
                        btn.innerText = oldText;
                        btn.disabled = false;
                    }, 1000);
                } catch (e) {
                    btn.innerText = 'خطأ!';
                    setTimeout(() => {
                        btn.innerText = 'نسخ';
                    }, 1000);
                }
            });
        }
    });
});

// عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    loadSurahList();
    if (ayahInput) ayahInput.value = '1';
});
