// قائمة ملفات الترجمات للبحث
const BIBLE_SEARCH_TRANSLATIONS = [
  { file: 'svd-1865.json', label: 'فاندايك القديمة' },
  { file: 'svd-1999.json', label: 'فاندايك الحديثة' },
  { file: 'nva-2012.json', label: 'الحياة' },
  { file: 'sat-2016.json', label: 'العربية المبسطة' },
  { file: 'sab-2023.json', label: 'الكتاب الشريف' },
  { file: 'gna-1993.json', label: 'العربية المشتركة' },
  { file: 'cav-2018.json', label: 'الكاثوليكية اليسوعية' },
];

let bibleSearchCurrentTranslation = BIBLE_SEARCH_TRANSLATIONS[0].file;
let bibleSearchData = [];

const translationBtns = document.querySelectorAll('#bible-search-translation-btns .bible-btn');
const searchInput = document.getElementById('bible-search-text');
const searchBtn = document.getElementById('bible-search-btn');
const searchResults = document.getElementById('bible-search-results');

// Helper: remove tashkeel (diacritics)
function removeTashkeel(text) {
  return text.replace(/[\u064B-\u0652]/g, '');
}

// تحميل ملف JSON للترجمة المحددة
async function loadBibleSearchTranslation(jsonFile) {
  searchResults.innerHTML = '<div style="text-align:center">جاري تحميل الترجمة...</div>';
  try {
    const res = await fetch(jsonFile);
    bibleSearchData = await res.json();
    bibleSearchCurrentTranslation = jsonFile;
    searchResults.innerHTML = '';
  } catch (e) {
    searchResults.innerHTML = '<div style="color:red">تعذر تحميل الترجمة.</div>';
  }
}

let currentResults = [];
let currentPage = 1;
const RESULTS_PER_PAGE = 10;

function renderResultsPage(page) {
  const totalPages = Math.ceil(currentResults.length / RESULTS_PER_PAGE);
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;
  const start = (page - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const pageResults = currentResults.slice(start, end);
  let html = pageResults.map((v, i) => `
    <div class="bible-verse" style="background:#f9f9f9;border-radius:8px;padding:1rem;margin-bottom:1.2rem;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
      <div class="bible-verse-header" style="display:flex;justify-content:space-between;align-items:flex-start;width:100%;margin-bottom:0.7rem;">
        <span class="bible-verse-ref" style="font-weight:700;color:#3949ab;font-size:1.1rem;">${v.book_name} ${v.chapter}:${v.verse}</span>
        <button class="bible-copy-btn" id="bible-copy-btn-${start + i}" title="نسخ">نسخ</button>
      </div>
      <div class="bible-verse-text" style="color:#000;font-size:1.18rem;font-weight:600;text-align:center;">${v.text}</div>
    </div>
  `).join('');
  // Pagination controls
  if (totalPages > 1) {
    html += `<div style="display:flex;justify-content:center;gap:0.5rem;margin:1.5rem 0;">
      <button id="bible-prev-page" ${page === 1 ? 'disabled' : ''} style="padding:0.5rem 1.2rem;border-radius:7px;border:none;background:var(--primary);color:white;font-family:'Amiri',serif;font-size:1.05rem;cursor:pointer;">السابق</button>
      <span style="align-self:center;font-size:1.08rem;">صفحة ${page} من ${totalPages}</span>
      <button id="bible-next-page" ${page === totalPages ? 'disabled' : ''} style="padding:0.5rem 1.2rem;border-radius:7px;border:none;background:var(--primary);color:white;font-family:'Amiri',serif;font-size:1.05rem;cursor:pointer;">التالي</button>
    </div>`;
  }
  searchResults.innerHTML = html;
  // Copy listeners
  pageResults.forEach((v, i) => {
    const btn = document.getElementById(`bible-copy-btn-${start + i}`);
    if (btn) {
      btn.addEventListener('click', function() {
        const text = `${v.text} [${v.book_name} ${v.chapter}:${v.verse}]`;
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
    const prevBtn = document.getElementById('bible-prev-page');
    const nextBtn = document.getElementById('bible-next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => renderResultsPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => renderResultsPage(currentPage + 1));
  }
}

// البحث في النصوص
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) {
    document.getElementById('bible-search-limit-msg')?.remove();
    searchResults.innerHTML = '<div style="color:red">يرجى إدخال نص للبحث.</div>';
    return;
  }
  const tashkeelOption = document.querySelector('input[name="bible-tashkeel"]:checked').value;
  if (tashkeelOption === 'without') {
    const queryNoTashkeel = removeTashkeel(query);
    currentResults = bibleSearchData.filter(v => removeTashkeel(v.text).includes(queryNoTashkeel));
  } else {
    currentResults = bibleSearchData.filter(v => v.text.includes(query));
  }
  document.getElementById('bible-search-limit-msg')?.remove();
  if (currentResults.length === 0) {
    searchResults.innerHTML = '<div style="color:gray">لم يتم العثور على نتائج.</div>';
    return;
  }
  // عرض رسالة الحد أعلى النتائج
  const limitMsg = document.createElement('div');
  limitMsg.id = 'bible-search-limit-msg';
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

// تغيير الترجمة عند الضغط على زر
translationBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    translationBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('bible-search-limit-msg')?.remove();
    searchResults.innerHTML = '';
    currentResults = [];
    currentPage = 1;
    loadBibleSearchTranslation(btn.getAttribute('data-json'));
  });
});

// تحميل الترجمة الافتراضية عند بدء الصفحة
window.addEventListener('DOMContentLoaded', () => {
  // Set default active button for svd-1865.json
  translationBtns.forEach(btn => {
    if (btn.getAttribute('data-json') === 'svd-1865.json') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  loadBibleSearchTranslation(bibleSearchCurrentTranslation);
});
