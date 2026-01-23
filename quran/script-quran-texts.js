// When clicking the quran-view-btn, display the ayah from all riwayat in quran-text-display

document.addEventListener('DOMContentLoaded', function() {
    const riwayat = [
        { name: 'رواية حفص عن عاصم', file: 'hafs-data-v2-0.json', btnId: 'btn-hafs' },
        { name: 'رواية شعبة عن عاصم', file: 'shuba-data-v2-0.json', btnId: 'btn-shuba' },
        { name: 'رواية ورش عن نافع', file: 'warsh-data-v2-1.json', btnId: 'btn-warsh' },
        { name: 'رواية قالون عن نافع', file: 'qaloun-data-v2-1.json', btnId: 'btn-qaloun' },
        { name: 'رواية الدوري عن أبي عمرو', file: 'douri-data-v2-0.json', btnId: 'btn-douri' },
        { name: 'رواية السوسي عن أبي عمرو', file: 'sousi-data-v2-0.json', btnId: 'btn-sousi' }
    ];
    const surahSelect = document.getElementById('surah-select');
    const ayahInput = document.getElementById('ayah-input');
    const viewBtn = document.getElementById('view-ayah-btn');
    const display = document.getElementById('quran-text-display-unique') || document.getElementById('quran-text-display');
    const riwayaBtns = riwayat.map(r => document.getElementById(r.btnId));
    const prevAyahBtn = document.getElementById('prev-ayah-btn');
    const nextAyahBtn = document.getElementById('next-ayah-btn');
    let selectedRiwayaIdx = 0; // Default: حفص

    // Highlight default on load
    function updateRiwayaBtns() {
        riwayaBtns.forEach((btn, idx) => {
            if (idx === selectedRiwayaIdx) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    updateRiwayaBtns();

    // Add click listeners to narration buttons
    riwayaBtns.forEach((btn, idx) => {
        btn.addEventListener('click', function() {
            selectedRiwayaIdx = idx;
            updateRiwayaBtns();
            showAyah();
        });
    });

    // Helper: fetch JSON
    function fetchJSON(file) {
        return fetch('quran/' + file)
            .then(r => { if (!r.ok) throw new Error('not ok'); return r.json(); })
            .catch(() => fetch(file).then(r => { if (!r.ok) throw new Error('not ok'); return r.json(); }));
    }

    const surahNames = [
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
    surahSelect.innerHTML = '';
    surahNames.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = name;
        surahSelect.appendChild(opt);
    });

    // تحديث عدد الآيات المتاحة في السورة المختارة حسب القراءة
    function updateAyahInputMax() {
        const surahNum = parseInt(surahSelect.value);
        const r = riwayat[selectedRiwayaIdx];
        fetchJSON(r.file).then(data => {
            let maxAyah = 1;
            if (Array.isArray(data)) {
                // مصفوفة: ابحث عن أكبر aya_no في السورة المختارة
                const ayat = data.filter(a => a.sura_no === surahNum);
                maxAyah = Math.max(...ayat.map(a => a.aya_no));
            } else if (data.surahs && data.surahs[surahNum-1] && data.surahs[surahNum-1].ayahs) {
                maxAyah = data.surahs[surahNum-1].ayahs.length;
            }
            ayahInput.max = maxAyah;
            if (parseInt(ayahInput.value) > maxAyah) {
                ayahInput.value = maxAyah;
            }
        });
    }

    function showAyah() {
        const surahNum = parseInt(surahSelect.value);
        const ayahNum = parseInt(ayahInput.value);
        display.innerHTML = '<div style="text-align:center;font-size:1.1rem;color:gray">جاري التحميل...</div>';
        const r = riwayat[selectedRiwayaIdx];
        // ربط اسم الرواية بالصنف المناسب للخط
        const riwayaFontClassMap = {
            'رواية حفص عن عاصم': 'hafs',
            'رواية شعبة عن عاصم': 'shuba',
            'رواية ورش عن نافع': 'warsh',
            'رواية قالون عن نافع': 'qaloun',
            'رواية الدوري عن أبي عمرو': 'douri',
            'رواية السوسي عن أبي عمرو': 'sousi'
        };
        const fontClass = riwayaFontClassMap[r.name] || '';
        updateAyahInputMax();
        fetchJSON(r.file).then(data => {
            let ayahText = '';
            let surahName = surahNames[surahNum-1] || '';
            if (!data) {
                ayahText = '<span style="color:red">تعذر تحميل بيانات الرواية</span>';
            } else if (Array.isArray(data)) {
                // استخراج اسم السورة من أول آية تطابق رقم السورة الحالي
                const ayahObj = data.find(a => a.sura_no === surahNum && a.aya_no === ayahNum);
                if (ayahObj && ayahObj.aya_text) {
                    ayahText = ayahObj.aya_text;
                    if (ayahObj.sura_name_ar) {
                        surahName = ayahObj.sura_name_ar.trim();
                    }
                } else {
                    ayahText = '<span style="color:red">لا توجد آية بهذا الرقم</span>';
                }
            } else if (data.surahs && data.surahs[surahNum-1] && data.surahs[surahNum-1].ayahs) {
                if (data.surahs[surahNum-1].ayahs[ayahNum-1] && data.surahs[surahNum-1].ayahs[ayahNum-1].text) {
                    ayahText = data.surahs[surahNum-1].ayahs[ayahNum-1].text;
                } else {
                    ayahText = '<span style="color:red">لا توجد آية بهذا الرقم</span>';
                }
                // تحديث اسم السورة من البيانات إذا توفر
                if (data.surahs[surahNum-1].name) {
                    surahName = data.surahs[surahNum-1].name;
                }
            } else {
                ayahText = '<span style="color:red">لا توجد آية بهذا الرقم</span>';
            }
            let copyText = ayahText.replace(/<[^>]+>/g, '') + ` [${surahName} ${ayahNum} ${r.name}]`;
            display.innerHTML = `<div class="quran-verse">
                <div class="quran-verse-header">
                    <span class="quran-verse-ref">${r.name}</span>
                    <span class="quran-surah-name">${surahName}</span>
                    <button class="quran-copy-btn" id="copy-btn-main" data-copy="${copyText.replace(/"/g, '&quot;')}">نسخ</button>
                </div>
                <div class="quran-verse-translation ${fontClass}">${ayahText}</div>
            </div>`;
            // Copy button
            const btn = document.getElementById('copy-btn-main');
            if (btn) {
                btn.addEventListener('click', function() {
                    const text = btn.getAttribute('data-copy');
                    navigator.clipboard.writeText(text);
                    const old = btn.textContent;
                    btn.textContent = 'نسخ!';
                    setTimeout(() => { btn.textContent = old; }, 1000);
                });
            }
        });
    }

    // عند الضغط على زر عرض النص
    viewBtn.addEventListener('click', showAyah);
    // عند تغيير السورة من القائمة المنسدلة
    surahSelect.addEventListener('change', function() {
        ayahInput.value = 1; // إعادة تعيين الآية للأولى عند تغيير السورة
        updateAyahInputMax();
        showAyah();
    });
    // عند تغيير القراءة
    riwayaBtns.forEach((btn, idx) => {
        btn.addEventListener('click', function() {
            updateAyahInputMax();
        });
    });
    // عند تغيير رقم الآية مباشرة
    ayahInput.addEventListener('change', showAyah);
    // عند الضغط على Enter في حقل الآية
    ayahInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') showAyah(); });
    // عند تحميل الصفحة
    updateAyahInputMax();
    showAyah();

    // تفعيل زر السابق
    if (prevAyahBtn) {
        prevAyahBtn.addEventListener('click', function() {
            let ayahNum = parseInt(ayahInput.value);
            if (ayahNum > 1) {
                ayahInput.value = ayahNum - 1;
                showAyah();
            }
        });
    }
    // تفعيل زر التالي
    if (nextAyahBtn) {
        nextAyahBtn.addEventListener('click', function() {
            let ayahNum = parseInt(ayahInput.value);
            ayahInput.value = ayahNum + 1;
            showAyah();
        });
    }
});
