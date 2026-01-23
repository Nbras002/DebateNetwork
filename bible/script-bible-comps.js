// Helper: List of translation files and display names
const BIBLE_TRANSLATIONS = [
  { key: 'svd-1865', file: 'svd-1865.json', name: 'فاندايك القديمة' },
  { key: 'svd-1999', file: 'svd-1999.json', name: 'فاندايك الحديثة' },
  { key: 'gna-1993', file: 'gna-1993.json', name: 'الحياة' },
  { key: 'nva-2012', file: 'nva-2012.json', name: 'الأخبار السارة' },
  { key: 'sat-2016', file: 'sat-2016.json', name: 'المشتركة' },
  { key: 'sab-2023', file: 'sab-2023.json', name: 'العربية المبسطة' },
  { key: 'cav-2018', file: 'cav-2018.json', name: 'الكاثوليكية اليسوعية' },
];

// Store loaded translation data
const bibleDataCache = {};
let bookList = [];

// UI Elements
const translationBtns = document.querySelectorAll('.bible-btn');
const bookSelect = document.getElementById('bible-comp-book-select');
const chapterInput = document.getElementById('bible-comp-chapter-input');
const verseInput = document.getElementById('bible-comp-verse-input');
const compareForm = document.getElementById('bible-comp-form');
const resultDisplay = document.getElementById('bible-comp-result-display');

// Track selected translations (at least 2, max all)
let selectedTranslations = new Set(['svd-1865', 'svd-1999']);

// --- Translation Button Logic ---
translationBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const key = btn.getAttribute('data-value');
    if (selectedTranslations.has(key)) {
      if (selectedTranslations.size > 2) {
        selectedTranslations.delete(key);
        btn.classList.remove('active');
      }
    } else {
      selectedTranslations.add(key);
      btn.classList.add('active');
    }
  });
  // Set initial active state
  if (selectedTranslations.has(btn.getAttribute('data-value'))) {
    btn.classList.add('active');
  }
});

// --- Book names (manual, Arabic order) ---
const BIBLE_BOOKS = [
  "سفر التكوين", "سفر الخروج", "سفر اللاويين", "سفر العدد", "سفر التثنية", "سفر يشوع", "سفر القضاة", "سفر راعوث", "سفر صموئيل الأول", "سفر صموئيل الثاني", "سفر الملوك الأول", "سفر الملوك الثاني", "سفر أخبار الأيام الأول", "سفر أخبار الأيام الثاني", "سفر عزرا", "سفر نحميا", "سفر إستير", "سفر أيوب", "سفر المزامير", "سفر الأمثال", "سفر الجامعة", "سفر نشيد الأنشاد", "سفر إشعياء", "سفر إرميا", "سفر مراثي إرميا", "سفر حزقيال", "سفر دانيال", "سفر هوشع", "سفر يوئيل", "سفر عاموس", "سفر عوبديا", "سفر يونان", "سفر ميخا", "سفر ناحوم", "سفر حبقوق", "سفر صفنيا", "سفر حجي", "سفر زكريا", "سفر ملاخي", "إنجيل متى", "إنجيل مرقس", "إنجيل لوقا", "إنجيل يوحنا", "سفر أعمال الرسل", "الرسالة إلى أهل رومية", "الرسالة الأولى إلى أهل كورنثوس", "الرسالة الثانية إلى أهل كورنثوس", "الرسالة إلى أهل غلاطية", "الرسالة إلى أهل أفسس", "الرسالة إلى أهل فيلبي", "الرسالة إلى أهل كولوسي", "الرسالة الأولى إلى أهل تسالونيكي", "الرسالة الثانية إلى أهل تسالونيكي", "الرسالة الأولى إلى تيموثاوس", "الرسالة الثانية إلى تيموثاوس", "الرسالة إلى تيطس", "الرسالة إلى فليمون", "الرسالة إلى العبرانيين", "رسالة يعقوب", "رسالة بطرس الأولى", "رسالة بطرس الثانية", "رسالة يوحنا الأولى", "رسالة يوحنا الثانية", "رسالة يوحنا الثالثة", "رسالة يهوذا", "سفر رؤيا يوحنا" 
];

// --- Load Book List from manual list ---
async function loadBookList() {
  if (bookList.length > 0) return;
  bookList = BIBLE_BOOKS;
  bookSelect.innerHTML = bookList.map((name) => `<option value="${name}">${name}</option>`).join('');
  // Set default selected book to "سفر التكوين"
  bookSelect.value = "سفر التكوين";
}

// --- Load translation data (cache) ---
async function getTranslationData(key) {
  if (bibleDataCache[key]) return bibleDataCache[key];
  const trans = BIBLE_TRANSLATIONS.find(t => t.key === key);
  if (!trans) return null;
  try {
    const resp = await fetch('./' + trans.file);
    if (!resp.ok) {
      console.error(`Failed to fetch translation file: ${trans.file}`, resp.status, resp.statusText);
      return null;
    }
    const data = await resp.json();
    if (!Array.isArray(data)) {
      console.error(`Invalid translation data structure for: ${trans.file}`, data);
      return null;
    }
    bibleDataCache[key] = data;
    return data;
  } catch (err) {
    console.error(`Error loading translation file: ${trans.file}`, err);
    return null;
  }
}

// --- Form submit: Compare ---
compareForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const bookName = bookSelect.value;
  const chapter = parseInt(chapterInput.value, 10);
  const verse = parseInt(verseInput.value, 10);
  if (!bookName || !chapter || !verse || selectedTranslations.size < 2) {
    alert('يرجى اختيار سفر، إصحاح، آية، وتحديد ترجمتين على الأقل.');
    return;
  }
  resultDisplay.style.display = 'block';
  resultDisplay.innerHTML = '<div style="text-align:center;color:gray;">جاري التحميل...</div>';
  // Load all selected translations
  const results = await Promise.all(Array.from(selectedTranslations).map(async key => {
    const data = await getTranslationData(key);
    if (!data) return { key, text: 'تعذر تحميل الترجمة' };
    // Find verse object
    const verseObj = data.find(v => v.book_name === bookName && v.chapter === chapter && v.verse === verse);
    const trans = BIBLE_TRANSLATIONS.find(t => t.key === key);
    return {
      key,
      name: trans ? trans.name : key,
      text: verseObj ? verseObj.text : 'الآية غير موجودة',
      ref: `${bookName} ${chapter}:${verse}`
    };
  }));
  // Render results
  resultDisplay.innerHTML = results.map((r, idx) => `
    <div class="bible-verse" style="margin-bottom:2rem; position:relative;">
      <div class="bible-verse-header" style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;width:100%;">
        <span class="bible-verse-ref" style="order:1;">${r.ref || ''}</span>
        <span class="bible-verse-translation" style="flex:1;text-align:center;order:2;">${r.name || ''}</span>
        <button class="bible-copy-btn" style="order:3;" data-copy-idx="${idx}">نسخ</button>
      </div>
      <div class="bible-verse-text" id="bible-verse-text-${idx}">${r.text}</div>
    </div>
  `).join('');

  // Add copy event listeners for all copy buttons
  results.forEach((r, idx) => {
    const btn = document.querySelector(`.bible-copy-btn[data-copy-idx='${idx}']`);
    if (btn) {
      btn.addEventListener('click', async function() {
        const text = document.getElementById(`bible-verse-text-${idx}`).innerText + ' [' + (r.ref || '') + ' ' + (r.name || '') + ']';
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

// --- On page load ---
window.addEventListener('DOMContentLoaded', () => {
  loadBookList();
  // Set default values for chapter and verse inputs
  if (chapterInput) chapterInput.value = '1';
  if (verseInput) verseInput.value = '1';
});