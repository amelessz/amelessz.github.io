var stage;
var siteNavShown = true;

function triggerSiteNav() {
    return;
}

function updateSidebar() {
    if (window.innerWidth <= 768 || window.innerHeight <= 600) {
        $('#side-bar').innerWidth($('#stage').width());
        $('#main-container').removeClass('col-sm-9');
    } else {
        var sidebarW =
            stage.width() - $('#main-container').outerWidth() + (window.innerWidth - stage.innerWidth()) / 2;
        $('#side-bar').outerWidth(sidebarW);
        $('#main-container').addClass('col-sm-9');
    }
}

// ===== Dark Mode =====
function initDarkMode() {
    var toggle = document.querySelector('.dark-mode-toggle');
    if (!toggle) return;
    var icon = toggle.querySelector('i');
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.className = 'fa fa-sun-o';
    }
    toggle.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.className = 'fa fa-moon-o';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.className = 'fa fa-sun-o';
        }
    });
}

// ===== Back to Top =====
function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > window.innerHeight) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Search =====
function initSearch() {
    var trigger = document.querySelector('.search-trigger');
    var overlay = document.querySelector('.search-overlay');
    var input = document.querySelector('.search-input');
    var results = document.querySelector('.search-results');
    var closeBtn = document.querySelector('.search-close');
    if (!trigger || !overlay) return;

    var searchData = null;

    function loadSearchData(callback) {
        if (searchData) { callback(); return; }
        $.getJSON('/content.json', function (data) {
            searchData = data.posts || [];
            callback();
        }).fail(function () {
            results.innerHTML = '<li class="search-hint">Search index not found.</li>';
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function doSearch(keyword) {
        if (!keyword) {
            results.innerHTML = '';
            return;
        }
        keyword = keyword.toLowerCase();
        var html = '';
        var count = 0;
        for (var i = 0; i < searchData.length; i++) {
            var item = searchData[i];
            if (item.title.toLowerCase().indexOf(keyword) !== -1 ||
                item.text.toLowerCase().indexOf(keyword) !== -1) {
                html += '<li><a href="' + item.path + '">' + item.title +
                    '<span class="search-date">' + formatDate(item.date) + '</span></a></li>';
                count++;
                if (count >= 20) break;
            }
        }
        results.innerHTML = html || '<li class="search-hint">No results found.</li>';
    }

    function openSearch() {
        overlay.classList.add('active');
        input.value = '';
        results.innerHTML = '';
        input.focus();
        loadSearchData(function () {});
    }

    function closeSearch() {
        overlay.classList.remove('active');
        input.value = '';
        results.innerHTML = '';
    }

    trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
    });

    closeBtn.addEventListener('click', closeSearch);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeSearch();
        }
    });

    var searchTimer;
    input.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            doSearch(input.value.trim());
        }, 200);
    });
}

// ===== Table of Contents =====
function initTOC() {
    var container = document.querySelector('.toc-container');
    if (!container) return;

    var postContent = document.querySelector('.post-abstract');
    if (!postContent) return;

    var headings = postContent.querySelectorAll('h1, h2, h3, h4');
    if (headings.length < 2) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    var tocList = container.querySelector('.toc-list');
    var tocTitle = container.querySelector('.toc-title');
    var tocToggle = container.querySelector('.toc-toggle');

    for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (!h.id) {
            h.id = 'toc-heading-' + i;
        }
        var li = document.createElement('li');
        li.className = 'toc-' + h.tagName.toLowerCase();
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(this.getAttribute('href').substring(1));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        li.appendChild(a);
        tocList.appendChild(li);
    }

    // Toggle collapse
    tocTitle.addEventListener('click', function () {
        tocList.classList.toggle('collapsed');
        tocToggle.textContent = tocList.classList.contains('collapsed') ? '▸' : '▾';
    });

    // Scroll spy
    var tocLinks = tocList.querySelectorAll('a');
    var headingElements = Array.prototype.slice.call(headings);

    function updateActiveTOC() {
        var scrollPos = window.scrollY + 100;
        var current = null;
        for (var j = 0; j < headingElements.length; j++) {
            if (headingElements[j].offsetTop <= scrollPos) {
                current = j;
            }
        }
        for (var k = 0; k < tocLinks.length; k++) {
            tocLinks[k].parentNode.classList.remove('active');
        }
        if (current !== null && tocLinks[current]) {
            tocLinks[current].parentNode.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveTOC);
    updateActiveTOC();
}

$(document).ready(function () {
    stage = $('#stage');
    $(window).resize(function () {
        updateSidebar();
    });
    updateSidebar();
    $('#main-container').removeClass('invisible');
    $('#main-container').addClass('fadeInTop');
    if (window.innerWidth <= 768) {
        $('#side-bar').removeClass('invisible');
        $('#side-bar').addClass('fadeInTop');
    } else {
        $('#side-bar').removeClass('invisible');
        $('#side-bar').addClass('fadeInRight');
    }
    $('.site-title').click(function () {
        $('.site-title a')[0].click();
    });

    initDarkMode();
    initBackToTop();
    initSearch();
    initTOC();
});
