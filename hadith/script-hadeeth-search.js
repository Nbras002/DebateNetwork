// All logic is self-contained and runs after DOMContentLoaded

document.addEventListener('DOMContentLoaded', function () {
    // Hadith search logic for hadeeth-search.html
    if (document.getElementById('search-btn')) {
        let hadeethList = [];
        let hadeethLoaded = false;
        // Remove MAX_RESULTS, we want unlimited results
        // Pagination settings
        const PAGE_SIZE = 10;
        let currentPage = 1;
        let lastResults = [];
        fetch('hadeeth.json')
            .then(res => res.json())
            .then(data => { hadeethList = Array.isArray(data) ? data : (data.Worksheet || []); hadeethLoaded = true; })
            .catch(() => {
                hadeethLoaded = false;
                const resultsDiv = document.getElementById('search-results');
                if (resultsDiv) resultsDiv.textContent = 'تعذر تحميل ملف الأحاديث. تأكد من وجود الملف وترميزه UTF-8.';
            });

        function removeTashkeel(str) {
            // Remove Arabic diacritics
            return str.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
        }

        function renderResultsPage(results, page) {
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '';
            const startIdx = (page - 1) * PAGE_SIZE;
            const endIdx = startIdx + PAGE_SIZE;
            const pageResults = results.slice(startIdx, endIdx);
            pageResults.forEach((h, idx) => {
                const div = document.createElement('div');
                div.className = 'hadith-title';
                div.style.background = '#fff';
                div.style.borderRadius = '8px';
                div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.07)';
                div.style.padding = '1rem 1.2rem 0.7rem 1.2rem';
                div.style.marginBottom = '1.2rem';
                div.style.position = 'relative';
                // Show hadith number (id) if available, otherwise show index+1
                const hadithId = h.id !== undefined ? h.id : (hadeethList.indexOf(h) + 1);
                div.innerHTML = `
                    <div class="hadith-title"><span style="color:var(--primary);font-weight:700">[${hadithId}]</span> ${h.title || ''}</div>
                    <div class="hadith-text">${h.hadith_text || ''}</div>
                    ${h.explanation ? `<div style='margin-bottom:0.7rem'><span style='color:var(--secondary);font-weight:700'>الشرح:</span> ${h.explanation}</div>` : ''}
                    ${h.word_meanings ? `<div style='margin-bottom:0.7rem'><span style='color:var(--accent);font-weight:700'>معاني الكلمات:</span> ${h.word_meanings}</div>` : ''}
                    ${h.benefits ? `<div style='margin-bottom:0.7rem'><span style='color:var(--primary);font-weight:700'>الفوائد:</span> ${h.benefits}</div>` : ''}
                    <div class='hadith-meta'>
                        ${h.grade ? `<span class='hadith-grade'>الدرجة: ${h.grade}</span>` : ''}
                        ${h.takhrij ? `<span class='hadith-takhrij'>التخريج: ${h.takhrij}</span>` : ''}
                    </div>
                    <button class="hadith-search-btn" id="copy-btn-${startIdx + idx}" style="margin-top:0.7rem;">نسخ الحديث</button>
                `;
                resultsDiv.appendChild(div);
                setTimeout(() => {
                    const copyBtn = document.getElementById(`copy-btn-${startIdx + idx}`);
                    if (copyBtn) {
                        copyBtn.onclick = function() {
                            const text = `${h.hadith_text || ''}[${h.takhrij || ''} - ${h.grade || ''}]`;
                            navigator.clipboard.writeText(text).then(() => {
                                copyBtn.textContent = 'تم النسخ!';
                                setTimeout(() => { copyBtn.textContent = 'نسخ الحديث'; }, 1200);
                            });
                        };
                    }
                }, 0);
            });
            // Pagination controls
            renderPagination(results.length, page);
        }

        function renderPagination(total, page) {
            let paginationDiv = document.getElementById('search-pagination');
            if (!paginationDiv) {
                paginationDiv = document.createElement('div');
                paginationDiv.id = 'search-pagination';
                paginationDiv.style.display = 'flex';
                paginationDiv.style.justifyContent = 'center';
                paginationDiv.style.gap = '1rem';
                paginationDiv.style.margin = '2rem 0 1rem 0';
                document.getElementById('search-results').after(paginationDiv);
            }
            paginationDiv.innerHTML = '';
            const totalPages = Math.ceil(total / PAGE_SIZE);
            if (totalPages <= 1) {
                paginationDiv.style.display = 'none';
                return;
            }
            paginationDiv.style.display = 'flex';
            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'السابق';
            prevBtn.disabled = page === 1;
            prevBtn.className = 'hadith-search-btn';
            prevBtn.onclick = function() {
                if (page > 1) {
                    currentPage--;
                    renderResultsPage(lastResults, currentPage);
                }
            };
            paginationDiv.appendChild(prevBtn);
            // Page info
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `صفحة ${page} من ${totalPages}`;
            pageInfo.style.alignSelf = 'center';
            paginationDiv.appendChild(pageInfo);
            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'التالي';
            nextBtn.disabled = page === totalPages;
            nextBtn.className = 'hadith-search-btn';
            nextBtn.onclick = function() {
                if (page < totalPages) {
                    currentPage++;
                    renderResultsPage(lastResults, currentPage);
                }
            };
            paginationDiv.appendChild(nextBtn);
        }

        document.getElementById('search-btn').addEventListener('click', function () {
            const query = document.getElementById('search-text').value.trim();
            const mode = document.querySelector('input[name="tashkeel"]:checked').value;
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '';
            // عداد النتائج
            let countDiv = document.getElementById('search-count');
            if (!countDiv) {
                countDiv = document.createElement('div');
                countDiv.id = 'search-count';
                countDiv.style.margin = '1rem auto 0.5rem auto';
                countDiv.style.color = '#555';
                countDiv.style.fontSize = '1rem';
                countDiv.style.textAlign = 'center';
                countDiv.style.width = '100%';
                resultsDiv.parentNode.insertBefore(countDiv, resultsDiv);
            }
            countDiv.textContent = '';

            if (!query) {
                resultsDiv.textContent = 'يرجى كتابة نص للبحث.';
                // Hide pagination if no results
                let paginationDiv = document.getElementById('search-pagination');
                if (paginationDiv) paginationDiv.style.display = 'none';
                return;
            }
            if (!hadeethLoaded) {
                resultsDiv.textContent = 'جاري تحميل الأحاديث...';
                let paginationDiv = document.getElementById('search-pagination');
                if (paginationDiv) paginationDiv.style.display = 'none';
                return;
            }
            let results = [];
            if (mode === 'with') {
                results = hadeethList.filter(h => h.hadith_text && h.hadith_text.includes(query));
            } else {
                const q = removeTashkeel(query);
                results = hadeethList.filter(h => h.hadith_text && removeTashkeel(h.hadith_text).includes(q));
            }
            const totalMatches = results.length;
            // No slicing, show all results (with pagination)
            countDiv.textContent = `عدد النتائج: ${totalMatches}`;
            if (results.length === 0) {
                resultsDiv.textContent = 'لا توجد نتائج مطابقة.';
                let paginationDiv = document.getElementById('search-pagination');
                if (paginationDiv) paginationDiv.style.display = 'none';
                return;
            }
            lastResults = results;
            currentPage = 1;
            renderResultsPage(results, currentPage);
        });
    }
});