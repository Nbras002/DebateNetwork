// قائمة ملفات الترجمات
const TRANSLATIONS = [
  { file: 'svd-1865.json', label: 'فاندايك القديمة' },
  { file: 'svd-1999.json', label: 'فاندايك الحديثة' },
  { file: 'nva-2012.json', label: 'الحياة' },
  { file: 'sat-2016.json', label: 'العربية المبسطة' },
  { file: 'sab-2023.json', label: 'الكتاب الشريف' },
  { file: 'gna-1993.json', label: 'العربية المشتركة' },
  { file: 'cav-2018.json', label: 'الكاثوليكية اليسوعية' },
];

let currentTranslation = TRANSLATIONS[0].file;
let bibleData = [];
let booksList = [];

const bookSelect = document.getElementById('book-select');
const chapterInput = document.getElementById('chapter-input');
const verseInput = document.getElementById('verse-input');
const viewBtn = document.getElementById('view-btn');
const display = document.getElementById('bible-text-display');
const btns = document.querySelectorAll('.bible-btn');
const prevBtn = document.getElementById('prev-verse-btn');
const nextBtn = document.getElementById('next-verse-btn');

// اسم الترجمة الحالي
function getCurrentTranslationLabel() {
  const t = TRANSLATIONS.find(t => t.file === currentTranslation);
  return t ? t.label : '';
}

// Highlight the active translation button
function updateActiveBtn() {
  btns.forEach(btn => {
    if (btn.getAttribute('data-json') === currentTranslation) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// تحميل ملف JSON للترجمة المحددة
async function loadTranslation(jsonFile) {
  display.innerHTML = 'يرجى اختيار السفر والإصحاح والعدد ثم أضغط عرض النص.';
  try {
    const res = await fetch(jsonFile);
    bibleData = await res.json();
    currentTranslation = jsonFile;
    fillBooks();
    updateActiveBtn();
  } catch (e) {
    display.innerHTML = 'تعذر تحميل الترجمة.';
  }
}

// تعبئة قائمة الأسفار
function fillBooks() {
  const books = [...new Set(bibleData.map(v => v.book_name))];
  booksList = books;
  bookSelect.innerHTML = books.map((b, i) => `<option value="${b}">${b}</option>`).join('');
}

// عرض النص المطلوب
function showText() {
  const book = bookSelect.value;
  const chapter = parseInt(chapterInput.value);
  const verse = parseInt(verseInput.value);
  const found = bibleData.find(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
  if (found) {
    const translationName = getCurrentTranslationLabel();
    display.innerHTML = `
      <div class='bible-verse'>
        <div class='bible-verse-header'>
          <span class='bible-verse-ref'>${book} ${chapter}:${verse}</span>
          <span class='bible-verse-translation' style="flex:1;text-align:center;">${translationName}</span>
          <button class='bible-copy-btn' id='bible-copy-btn' title='نسخ'>نسخ</button>
        </div>
        <div class='bible-verse-text' id='bible-verse-text'>${found.text}</div>
      </div>
    `;
    const copyBtn = document.getElementById('bible-copy-btn');
    copyBtn.addEventListener('click', function() {
      const text = `${found.text} [${book} ${chapter}:${verse} ${translationName}]`;
      navigator.clipboard.writeText(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'تم النسخ!';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.disabled = false;
      }, 1000);
    });
  } else {
    display.innerHTML = 'لم يتم العثور على النص.';
  }
}

function prevVerseHandler() {
  let chapter = parseInt(chapterInput.value);
  let verse = parseInt(verseInput.value);
  const book = bookSelect.value;
  const idx = bibleData.findIndex(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
  if (idx > 0) {
    const prev = bibleData.slice(0, idx).reverse().find(v => v.book_name === book);
    if (prev) {
      chapterInput.value = prev.chapter;
      verseInput.value = prev.verse;
      showText();
    }
  }
}
function nextVerseHandler() {
  let chapter = parseInt(chapterInput.value);
  let verse = parseInt(verseInput.value);
  const book = bookSelect.value;
  const idx = bibleData.findIndex(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
  if (idx >= 0) {
    const next = bibleData.slice(idx + 1).find(v => v.book_name === book);
    if (next) {
      chapterInput.value = next.chapter;
      verseInput.value = next.verse;
      showText();
    }
  }
}

// أزرار التالي والسابق
prevBtn.addEventListener('click', () => {
  let chapter = parseInt(chapterInput.value);
  let verse = parseInt(verseInput.value);
  const book = bookSelect.value;
  // البحث عن العدد السابق
  const idx = bibleData.findIndex(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
  if (idx > 0) {
    const prev = bibleData.slice(0, idx).reverse().find(v => v.book_name === book);
    if (prev) {
      chapterInput.value = prev.chapter;
      verseInput.value = prev.verse;
      showText();
    }
  }
});
nextBtn.addEventListener('click', () => {
  let chapter = parseInt(chapterInput.value);
  let verse = parseInt(verseInput.value);
  const book = bookSelect.value;
  // البحث عن العدد التالي
  const idx = bibleData.findIndex(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
  if (idx >= 0) {
    const next = bibleData.slice(idx + 1).find(v => v.book_name === book);
    if (next) {
      chapterInput.value = next.chapter;
      verseInput.value = next.verse;
      showText();
    }
  }
});

// تغيير الترجمة عند الضغط على زر
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    loadTranslation(btn.getAttribute('data-json'));
  });
});

// عند الضغط على زر عرض النص
viewBtn.addEventListener('click', showText);

// عند تغيير السفر، إعادة تعيين الإصحاح والآية
bookSelect.addEventListener('change', () => {
  chapterInput.value = 1;
  verseInput.value = 1;
});

// تحميل الترجمة الافتراضية عند بدء الصفحة
window.addEventListener('DOMContentLoaded', () => {
  loadTranslation(currentTranslation);
});