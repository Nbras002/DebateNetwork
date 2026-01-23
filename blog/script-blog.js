    // جلب قائمة المواضيع من list.json وعرضها ديناميكياً
    fetch('list-topic.json')
      .then(response => response.json())
      .then(data => {
        const list = document.getElementById('blog-list');
        data.forEach(item => {
          const li = document.createElement('li');
          li.className = 'blog-list-item';
          // صورة الموضوع الرئيسية
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = item.title;
          img.className = 'blog-topic-img';
          // عنوان الموضوع
          const a = document.createElement('a');
          a.href = item.file;
          a.textContent = item.title;
          a.className = 'dropdown-link';
          // تجميع العناصر
          li.appendChild(img);
          li.appendChild(a);
          list.appendChild(li);
        });
      });