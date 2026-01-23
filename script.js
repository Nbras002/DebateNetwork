// إمكانية الوصول: تبديل توسيع "aria" في القوائم المنسدلة للتنقل باستخدام لوحة المفاتيح

document.querySelectorAll('.navbar-item.dropdown').forEach(function(dropdown) {
    dropdown.addEventListener('focusin', function() {
        dropdown.setAttribute('aria-expanded', 'true');
    });
    dropdown.addEventListener('focusout', function() {
        dropdown.setAttribute('aria-expanded', 'false');
    });
    dropdown.addEventListener('mouseenter', function() {
        dropdown.setAttribute('aria-expanded', 'true');
    });
    dropdown.addEventListener('mouseleave', function() {
        dropdown.setAttribute('aria-expanded', 'false');
    });
});

// تحديث روابط مواضيع المدونة ديناميكياً من list-topic.json
function updateBlogMenu() {
  fetch('/blog/list-topic.json')
    .then(response => response.json())
    .then(data => {
      var blogDropdowns = document.querySelectorAll('.navbar-menu .dropdown-menu[aria-label="Blog submenu"]');
      blogDropdowns.forEach(function(dropdown) {
        dropdown.innerHTML = '';
        data.forEach(function(item) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '/blog/' + item.file;
          a.textContent = item.title;
          a.className = 'dropdown-link';
          li.appendChild(a);
          dropdown.appendChild(li);
        });
      });
    });
}
document.addEventListener('DOMContentLoaded', updateBlogMenu);