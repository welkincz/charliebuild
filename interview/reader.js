/* Study journey. Placement for the original 20 stays in taxonomy.json.
   New sections read catalog, practice, plan, companies, mocks, and markdown. */
(function () {
  var QUESTION_URL = '/interview/data/questions.json';
  var REPORT_URL = '/interview/data/reports.json';
  var TAXONOMY_URL = '/interview/data/taxonomy.json';
  var PRACTICE_URL = '/interview/data/practice.json';
  var CATALOG_URL = '/interview/data/catalog.json';
  var PLAN_URL = '/interview/data/plan.json';
  var COMPANY_URL = '/interview/data/companies.json';
  var MOCK_URL = '/interview/data/mocks.json';
  var REFERENCE_URL = '/interview/data/reference.json';
  var STORE_KEY = 'charliebuild-de-prep';
  var SECTIONS = ['plan', 'learn', 'practice', 'mock', 'companies', 'reference', 'search'];

  var questions = [];
  var reports = [];
  var taxonomy = null;
  var practice = [];
  var catalog = null;
  var plan = null;
  var companies = [];
  var mocks = null;
  var reference = [];
  var bodies = {};
  var store = loadStore();
  var timer = { id: null, left: 0, running: false, round: 0, loop: '' };

  var main = document.getElementById('main');
  var sidebar = document.getElementById('sidebar');
  var crumbs = document.getElementById('crumbs');
  var studyButton = document.getElementById('study-next');
  var navToggle = document.getElementById('nav-toggle');
  var scrim = document.getElementById('scrim');
  var app = document.getElementById('app');
  var searchForm = document.getElementById('search-form');
  var searchInput = document.getElementById('search');

  function loadStore() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        done: parsed.done && typeof parsed.done === 'object' ? parsed.done : {},
        star: parsed.star && typeof parsed.star === 'object' ? parsed.star : {},
        rubric: parsed.rubric && typeof parsed.rubric === 'object' ? parsed.rubric : {}
      };
    } catch (error) {
      return { done: {}, star: {}, rubric: {} };
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (error) {
      /* Storage can be blocked. The page still renders. */
    }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'html') node.innerHTML = value;
        else node.setAttribute(key, value);
      });
    }
    (children || []).forEach(function (child) {
      if (child == null || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function text(value) {
    return value == null ? '' : String(value);
  }

  function slugify(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function pageById(id) {
    return catalog ? byId(catalog.pages, id) : null;
  }

  function practiceById(id) {
    return byId(practice, id);
  }

  function originClass(origin) {
    if (origin === 'Reported+sourced') return 'pill pill-sourced';
    if (origin === 'Reported') return 'pill pill-reported';
    if (origin === 'Worked example') return 'pill pill-worked';
    if (origin === 'Self-check') return 'pill pill-check';
    return 'pill pill-practice';
  }

  function levelClass(level) {
    return level === 'Stretch' ? 'pill pill-stretch' : 'pill pill-core';
  }

  function isDone(id) {
    return !!store.done[id];
  }

  function setDone(id, value) {
    if (value) store.done[id] = true;
    else delete store.done[id];
    saveStore();
  }

  function setStar(id, value) {
    if (value) store.star[id] = true;
    else delete store.star[id];
    saveStore();
  }

  function tick(id) {
    var input = el('input', { type: 'checkbox' });
    input.checked = isDone(id);
    input.addEventListener('click', function (event) {
      event.stopPropagation();
      setDone(id, input.checked);
      render();
    });
    return el('label', { class: 'tick' }, [input]);
  }

  function starButton(id) {
    var button = el('button', {
      class: 'star' + (store.star[id] ? ' is-on' : ''),
      type: 'button',
      'aria-label': store.star[id] ? 'Unstar' : 'Star',
      html: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3.2l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.7l1-6L3.4 9.5l6-.9z"></path></svg>'
    });
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setStar(id, !store.star[id]);
      render();
    });
    return button;
  }

  function meter(done, total) {
    var pct = total ? Math.round((done / total) * 100) : 0;
    return el('span', { class: 'meter', title: done + ' of ' + total }, [
      el('span', { style: 'width:' + pct + '%' })
    ]);
  }

  function parseHash() {
    var raw = (location.hash || '#/plan').replace(/^#/, '');
    if (!raw || raw === '/') raw = '/plan';
    var queryAt = raw.indexOf('?');
    var path = queryAt >= 0 ? raw.slice(0, queryAt) : raw;
    var params = new URLSearchParams(queryAt >= 0 ? raw.slice(queryAt + 1) : '');
    var parts = path.split('/').filter(Boolean);
    if (parts[0] === 'reports') parts = ['companies'];
    if (SECTIONS.indexOf(parts[0]) === -1 && parts.length >= 3) {
      var legacy = practice.filter(function (item) {
        return slugify(item.id) === parts[2];
      })[0];
      if (legacy) parts = ['practice', legacy.id];
    }
    if (SECTIONS.indexOf(parts[0]) === -1) parts = ['plan'];
    return { parts: parts, params: params };
  }

  function stripFront(markdown) {
    var body = text(markdown);
    if (body.indexOf('---') === 0) {
      var end = body.indexOf('\n---', 3);
      if (end !== -1) body = body.slice(end + 4).replace(/^\n+/, '');
    }
    return body;
  }

  function prose(markdown) {
    var html = window.DEMarkdown ? window.DEMarkdown.render(stripFront(markdown)) : '';
    return el('div', { class: 'prose', html: html });
  }

  function fitChrome() {
    var chrome = document.querySelector('.chrome');
    if (chrome) {
      document.documentElement.style.setProperty('--topbar', chrome.offsetHeight + 'px');
    }
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    navToggle.setAttribute('aria-expanded', 'false');
    scrim.hidden = true;
  }

  function setCrumbs(items) {
    clear(crumbs);
    items.forEach(function (item, index) {
      if (index) crumbs.appendChild(el('span', { class: 'crumb-sep', text: '/' }));
      if (item.href) crumbs.appendChild(el('a', { href: item.href, text: item.label }));
      else crumbs.appendChild(el('span', { class: 'crumb-current', text: item.label }));
    });
  }

  function markSection(name) {
    var links = document.querySelectorAll('#sections a');
    for (var i = 0; i < links.length; i += 1) {
      var href = links[i].getAttribute('href') || '';
      var on = href === '#/' + name;
      if (on) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
  }

  function planTasks(week) {
    var tasks = [];
    (week.days || []).forEach(function (day) {
      (day.learn || []).forEach(function (id) { tasks.push('page:' + id); });
      (day.practice || []).forEach(function (id) { tasks.push(id); });
    });
    return tasks;
  }

  function countDone(ids) {
    var unique = [];
    ids.forEach(function (id) {
      if (unique.indexOf(id) === -1) unique.push(id);
    });
    var done = unique.filter(isDone).length;
    return { done: done, total: unique.length };
  }

  function nextStudy() {
    var weeks = (plan && plan.weeks) || [];
    for (var w = 0; w < weeks.length; w += 1) {
      var days = weeks[w].days || [];
      for (var d = 0; d < days.length; d += 1) {
        var links = (days[d].learn || []).map(function (id) { return { id: 'page:' + id, href: '#/learn/' + id }; })
          .concat((days[d].practice || []).map(function (id) { return { id: id, href: '#/practice/' + encodeURIComponent(id) }; }));
        for (var i = 0; i < links.length; i += 1) {
          if (!isDone(links[i].id)) return links[i];
        }
      }
    }
    return null;
  }

  function flatPages() {
    var list = [];
    (catalog.tracks || []).forEach(function (track) {
      (track.pages || []).forEach(function (id) {
        var page = pageById(id);
        if (page) list.push(page);
      });
    });
    return list;
  }

  function filteredPractice(params) {
    var bank = params.get('bank') || '';
    var origin = params.get('origin') || '';
    var level = params.get('level') || '';
    var company = params.get('company') || '';
    var q = (params.get('q') || '').toLowerCase();
    return practice.filter(function (item) {
      if (bank && item.bank !== bank) return false;
      if (origin && item.origin !== origin) return false;
      if (level && item.level !== level) return false;
      if (company && (item.companies || []).indexOf(company) === -1 && !(item.asked_at || []).some(function (row) { return row.company === company; })) return false;
      if (q && (item.title + ' ' + item.prompt).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderSidebar(route) {
    clear(sidebar);
    var section = route.parts[0];
    if (section === 'learn') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Learn' }));
      catalog.tracks.forEach(function (track) {
        var block = el('div', { class: 'tree-bank' });
        block.appendChild(el('p', { class: 'tree-label', text: track.title }));
        track.pages.forEach(function (id) {
          var page = pageById(id);
          if (!page) return;
          var row = el('a', {
            href: '#/learn/' + id,
            class: 'tree-link' + (route.parts[1] === id ? ' is-current' : ''),
            text: page.title
          });
          block.appendChild(row);
        });
        sidebar.appendChild(block);
      });
      return;
    }
    if (section === 'practice') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Banks' }));
      var banks = [];
      practice.forEach(function (item) {
        if (banks.indexOf(item.bank) === -1) banks.push(item.bank);
      });
      sidebar.appendChild(el('a', { href: '#/practice', class: 'tree-link', text: 'All questions' }));
      banks.forEach(function (bank) {
        sidebar.appendChild(el('a', {
          href: '#/practice?bank=' + encodeURIComponent(bank),
          class: 'tree-link',
          text: bank
        }));
      });
      return;
    }
    if (section === 'companies') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Companies' }));
      var sidebarGroup = '';
      companies.forEach(function (company) {
        if (company.group && company.group !== sidebarGroup) {
          sidebarGroup = company.group;
          sidebar.appendChild(el('p', { class: 'tree-label', text: company.group }));
        }
        sidebar.appendChild(el('a', {
          href: '#/companies/' + company.id,
          class: 'tree-link' + (route.parts[1] === company.id ? ' is-current' : ''),
          text: company.name
        }));
      });
      return;
    }
    if (section === 'mock') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Loops' }));
      (mocks.loops || []).forEach(function (loop) {
        sidebar.appendChild(el('a', {
          href: '#/mock/' + loop.id,
          class: 'tree-link',
          text: loop.title
        }));
      });
      return;
    }
    if (section === 'search') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Search' }));
      sidebar.appendChild(el('p', { class: 'summary', text: 'Titles, prompts, and page text.' }));
      return;
    }
    if (section === 'reference') {
      sidebar.appendChild(el('p', { class: 'tree-label', text: 'Reference' }));
      reference.forEach(function (page) {
        sidebar.appendChild(el('a', { href: '#/reference/' + page.id, class: 'tree-link', text: page.title }));
      });
      return;
    }
    sidebar.appendChild(el('p', { class: 'tree-label', text: 'Weeks' }));
    (plan.weeks || []).forEach(function (week) {
      var stats = countDone(planTasks(week));
      sidebar.appendChild(el('a', {
        href: '#/plan/' + week.id,
        class: 'tree-link',
        text: 'Week ' + week.id + (week.optional ? ' · optional' : '') + ' · ' + stats.done + '/' + stats.total
      }));
    });
  }

  function renderPlan(weekId) {
    var weeks = plan.weeks || [];
    var all = [];
    weeks.forEach(function (week) { all = all.concat(planTasks(week)); });
    var overall = countDone(all);
    setCrumbs(weekId ? [{ href: '#/plan', label: 'Plan' }, { label: 'Week ' + weekId }] : [{ label: 'Plan' }]);
    var head = el('div', { class: 'view-head' }, [
      el('h1', { text: weekId ? 'Week ' + weekId : 'Study plan' }),
      el('p', { class: 'summary', text: plan.intro || '' })
    ]);
    var progress = el('p', { class: 'card-progress' }, [
      document.createTextNode(overall.done + ' of ' + overall.total + ' plan links done '),
      meter(overall.done, overall.total)
    ]);
    main.appendChild(head);
    main.appendChild(progress);
    weeks.filter(function (week) { return !weekId || String(week.id) === String(weekId); })
      .forEach(function (week) {
        var stats = countDone(planTasks(week));
        var card = el('article', { class: 'week-card' });
        card.appendChild(el('h2', {}, [
          el('a', { href: '#/plan/' + week.id, text: 'Week ' + week.id + '. ' + week.title })
        ]));
        card.appendChild(el('p', { class: 'summary', text: (week.optional ? 'Optional. ' : '') + week.focus + ' About ' + week.hours + ' hours.' }));
        card.appendChild(el('p', { class: 'card-progress' }, [
          document.createTextNode(stats.done + '/' + stats.total + ' '),
          meter(stats.done, stats.total)
        ]));
        (week.days || []).forEach(function (day) {
          var list = el('ul', { class: 'day-list' });
          var item = el('li', {}, [el('strong', { text: day.label + '. ' })]);
          (day.learn || []).forEach(function (id, index) {
            var page = pageById(id);
            if (index) item.appendChild(document.createTextNode(' · '));
            item.appendChild(el('a', { href: '#/learn/' + id, text: page ? page.title : id }));
          });
          (day.practice || []).forEach(function (id) {
            var row = practiceById(id);
            item.appendChild(document.createTextNode(' · '));
            item.appendChild(el('a', {
              href: '#/practice/' + encodeURIComponent(id),
              text: row ? row.title : id
            }));
          });
          list.appendChild(item);
          card.appendChild(list);
        });
        main.appendChild(card);
      });
  }

  function renderLearnHome() {
    setCrumbs([{ label: 'Learn' }]);
    main.appendChild(el('div', { class: 'view-head' }, [
      el('h1', { text: 'Learn' }),
      el('p', { class: 'summary', text: 'One page per concept. Core is the L4 bar. Stretch is L5. Gap-fill pages say so in the first line.' })
    ]));
    catalog.tracks.forEach(function (track) {
      var block = el('section', { class: 'group' });
      block.appendChild(el('h2', { text: track.title }));
      var list = el('ul', { class: 'day-list' });
      track.pages.forEach(function (id) {
        var page = pageById(id);
        if (!page) return;
        list.appendChild(el('li', {}, [
          el('a', { href: '#/learn/' + id, text: page.title }),
          document.createTextNode(' · ' + page.level + (page.gap ? ' · gap fill' : '') + (isDone('page:' + id) ? ' · done' : ''))
        ]));
      });
      block.appendChild(list);
      main.appendChild(block);
    });
  }

  function renderLearn(id) {
    var page = pageById(id);
    if (!page) {
      main.appendChild(el('p', { class: 'load-error', text: 'That page is not in the catalog.' }));
      return;
    }
    var pages = flatPages();
    var index = pages.findIndex(function (item) { return item.id === id; });
    setCrumbs([
      { href: '#/learn', label: 'Learn' },
      { href: '#/learn', label: page.track },
      { label: page.title }
    ]);
    var article = el('article', { class: 'study' });
    article.appendChild(el('div', { class: 'pill-row' }, [
      el('span', { class: levelClass(page.level), text: page.level }),
      page.gap ? el('span', { class: 'pill pill-stretch', text: 'Gap fill' }) : null
    ]));
    article.appendChild(el('h1', { text: page.title }));
    article.appendChild(el('p', { class: 'summary', text: page.summary }));
    article.appendChild(el('div', { class: 'actions' }, [tick('page:' + id), starButton('page:' + id)]));
    article.appendChild(prose(bodies['learn:' + id] || ''));
    var related = practice.filter(function (item) { return item.topic === id; });
    if (related.length) {
      article.appendChild(el('h2', { text: 'Practice' }));
      var list = el('ul', { class: 'day-list' });
      related.forEach(function (item) {
        list.appendChild(el('li', {}, [
          el('a', { href: '#/practice/' + encodeURIComponent(item.id), text: item.title }),
          document.createTextNode(' · ' + item.origin)
        ]));
      });
      article.appendChild(list);
    }
    var pager = el('div', { class: 'pager' });
    if (index > 0) pager.appendChild(el('a', { href: '#/learn/' + pages[index - 1].id, text: 'Previous · ' + pages[index - 1].title }));
    if (index < pages.length - 1) pager.appendChild(el('a', { href: '#/learn/' + pages[index + 1].id, text: 'Next · ' + pages[index + 1].title }));
    article.appendChild(pager);
    main.appendChild(article);
  }

  function renderPracticeList(params) {
    var rows = filteredPractice(params);
    setCrumbs([{ label: 'Practice' }]);
    main.appendChild(el('div', { class: 'view-head' }, [
      el('h1', { text: params.get('bank') || 'Practice' }),
      el('p', { class: 'summary', text: 'One bank. Asked-at counts use only Reported+sourced items. The other origins are drills.' })
    ]));
    var filters = el('div', { class: 'filters' });
    filters.appendChild(selectFilter(params, 'bank', 'Bank', unique(practice.map(function (item) { return item.bank; }))));
    filters.appendChild(selectFilter(params, 'origin', 'Origin', ['Reported+sourced', 'Reported', 'Worked example', 'Practice', 'Self-check']));
    filters.appendChild(selectFilter(params, 'level', 'Level', ['Core', 'Stretch']));
    filters.appendChild(selectFilter(params, 'company', 'Company', unique([].concat.apply([], practice.map(function (item) { return item.companies || []; })))));
    var q = el('input', { type: 'search', placeholder: 'Filter titles', value: params.get('q') || '' });
    q.addEventListener('change', function () { setParam(params, 'q', q.value.trim()); });
    filters.appendChild(q);
    main.appendChild(filters);
    main.appendChild(el('p', { class: 'showing', text: rows.length + ' items' }));
    var table = el('div', { class: 'qtable' });
    table.appendChild(el('div', { class: 'phead' }, [
      el('span', { text: 'Done' }),
      el('span', { text: 'Star' }),
      el('span', { text: 'Question' }),
      el('span', { text: 'Origin' }),
      el('span', { text: 'Level' })
    ]));
    rows.forEach(function (item) {
      var row = el('a', {
        class: 'prow' + (isDone(item.id) ? ' is-done' : ''),
        href: '#/practice/' + encodeURIComponent(item.id)
      }, [
        tick(item.id),
        starButton(item.id),
        el('span', { class: 'qtitle', text: item.title }),
        el('span', { class: 'meta-pills' }, [
          el('span', { class: originClass(item.origin), text: item.origin }),
          el('span', { class: levelClass(item.level), text: item.level })
        ])
      ]);
      table.appendChild(row);
    });
    main.appendChild(table);
  }

  function unique(values) {
    var out = [];
    values.forEach(function (value) {
      if (value && out.indexOf(value) === -1) out.push(value);
    });
    return out.sort();
  }

  function setParam(params, key, value) {
    var next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    var query = next.toString();
    location.hash = '#/practice' + (query ? '?' + query : '');
  }

  function selectFilter(params, key, label, values) {
    var select = el('select', { 'aria-label': label });
    select.appendChild(el('option', { value: '', text: label }));
    values.forEach(function (value) {
      var option = el('option', { value: value, text: value });
      if (params.get(key) === value) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener('change', function () { setParam(params, key, select.value); });
    return select;
  }

  function renderPractice(id) {
    var item = practiceById(id);
    if (!item) {
      main.appendChild(el('p', { class: 'load-error', text: 'That question is not in the bank.' }));
      return;
    }
    var rows = filteredPractice(parseHash().params);
    var index = rows.findIndex(function (row) { return row.id === id; });
    if (index === -1) {
      rows = practice;
      index = practice.findIndex(function (row) { return row.id === id; });
    }
    var page = pageById(item.topic);
    setCrumbs([
      { href: '#/practice', label: 'Practice' },
      { href: '#/practice?bank=' + encodeURIComponent(item.bank), label: item.bank },
      { label: item.title }
    ]);
    var article = el('article', { class: 'study' });
    article.appendChild(el('div', { class: 'pill-row' }, [
      el('span', { class: originClass(item.origin), text: item.origin }),
      el('span', { class: levelClass(item.level), text: item.level }),
      item.evidence_grade ? el('span', { class: item.evidence_grade === 'A' ? 'pill pill-a' : 'pill pill-b', text: item.evidence_grade }) : null
    ]));
    article.appendChild(el('h1', { text: item.title }));
    article.appendChild(el('div', { class: 'actions' }, [tick(item.id), starButton(item.id)]));
    article.appendChild(el('p', { text: item.prompt }));
    if (page) {
      article.appendChild(el('p', {}, [
        document.createTextNode('Learn: '),
        el('a', { href: '#/learn/' + page.id, text: page.title })
      ]));
    }
    if (item.asked_at && item.asked_at.length) {
      article.appendChild(el('h2', { text: 'Asked at' }));
      item.asked_at.forEach(function (row) {
        var line = el('p', {}, [
          document.createTextNode(row.company + ' · ' + (row.round || 'round') + ' · grade ' + row.grade + ' · '),
          el('a', { href: row.source_url, text: 'Source' })
        ]);
        article.appendChild(line);
      });
    } else if (item.origin === 'Reported' && item.companies && item.companies.length) {
      article.appendChild(el('p', { class: 'summary', text: 'Noted in your notes for ' + item.companies.join(', ') + '. This is not an asked-at count.' }));
    }
    if (item.hint) article.appendChild(el('details', { class: 'fold' }, [el('summary', { text: 'Hint' }), el('p', { text: item.hint })]));
    if (item.approach) article.appendChild(el('details', { class: 'fold', open: 'open' }, [el('summary', { text: 'Approach' }), el('p', { text: item.approach })]));
    if (item.solution) {
      article.appendChild(el('h2', { text: 'Solution' }));
      article.appendChild(prose(item.solution));
    }
    var pager = el('div', { class: 'pager' });
    if (index > 0) pager.appendChild(el('a', { href: '#/practice/' + encodeURIComponent(rows[index - 1].id), text: 'Previous' }));
    if (index >= 0 && index < rows.length - 1) pager.appendChild(el('a', { href: '#/practice/' + encodeURIComponent(rows[index + 1].id), text: 'Next' }));
    article.appendChild(pager);
    main.appendChild(article);
  }

  function companyReports(company) {
    if (!company.report_company) return [];
    return reports.filter(function (report) { return report.company === company.report_company; });
  }

  function renderCompanies() {
    setCrumbs([{ label: 'Companies' }]);
    main.appendChild(el('div', { class: 'view-head' }, [
      el('h1', { text: 'Companies' }),
      el('p', { class: 'summary', text: 'Study order is Meta, then Amazon, then Google, Microsoft, and Uber. Autodesk is live L5 practice. Banks are the safety group. The Oct 7 2026 Toronto snapshot is a volume note, not this order.' })
    ]));
    var indexGroup = '';
    companies.forEach(function (company) {
      if (company.group && company.group !== indexGroup) {
        indexGroup = company.group;
        main.appendChild(el('h2', { text: company.group }));
      }
      var card = el('article', { class: 'co-card' });
      card.appendChild(el('h2', {}, [el('a', { href: '#/companies/' + company.id, text: company.name })]));
      card.appendChild(el('p', { class: 'summary', text: company.role + (company.rank ? ' · rank ' + company.rank : '') + ' · ' + company.level_label }));
      card.appendChild(el('p', { text: company.summary }));
      main.appendChild(card);
    });
  }

  function renderCompany(id) {
    var company = byId(companies, id);
    if (!company) {
      main.appendChild(el('p', { class: 'load-error', text: 'That company page is not in the list.' }));
      return;
    }
    setCrumbs([{ href: '#/companies', label: 'Companies' }, { label: company.name }]);
    var article = el('article', { class: 'study' });
    article.appendChild(el('h1', { text: company.name }));
    article.appendChild(el('p', { class: 'summary', text: company.role + ' · ' + company.level_label }));
    if (company.from_postings) {
      article.appendChild(el('p', { class: 'callout', text: 'From postings (snapshot 2026-10-07). No interview questions are invented for this company.' }));
    }
    article.appendChild(el('p', { text: company.summary }));
    article.appendChild(el('h2', { text: 'What the source actually says' }));
    var list = el('ul');
    (company.loop || []).forEach(function (line) { list.appendChild(el('li', { text: line })); });
    article.appendChild(list);
    if (company.rounds && company.rounds.length) {
      article.appendChild(el('h2', { text: 'Round by round' }));
      company.rounds.forEach(function (round) {
        var block = el('article', { class: 'round-card' });
        block.appendChild(el('h3', { text: round.name + (round.minutes ? ' · ' + round.minutes + ' min' : '') }));
        block.appendChild(el('p', { text: round.focus || '' }));
        var links = el('div', { class: 'stack-links' });
        (round.learn || []).forEach(function (pid) {
          var page = pageById(pid);
          links.appendChild(el('a', { href: '#/learn/' + pid, text: page ? page.title : pid }));
        });
        (round.practice || []).forEach(function (pid) {
          var item = practiceById(pid);
          links.appendChild(el('a', { href: '#/practice/' + encodeURIComponent(pid), text: item ? item.title : pid }));
        });
        block.appendChild(links);
        article.appendChild(block);
      });
    }
    article.appendChild(el('h2', { text: 'Stack signals' }));
    var chips = el('div', { class: 'stack-links' });
    (company.stack || []).forEach(function (name) { chips.appendChild(el('span', { class: 'chip', text: name })); });
    article.appendChild(chips);
    article.appendChild(el('h2', { text: 'Study these pages' }));
    var learn = el('div', { class: 'stack-links' });
    (company.learn || []).forEach(function (pid) {
      var page = pageById(pid);
      learn.appendChild(el('a', { href: '#/learn/' + pid, text: page ? page.title : pid }));
    });
    article.appendChild(learn);
    if (company.practice && company.practice.length) {
      article.appendChild(el('h2', { text: 'Questions' }));
      var qs = el('ul', { class: 'day-list' });
      company.practice.forEach(function (pid) {
        var item = practiceById(pid);
        if (!item) return;
        qs.appendChild(el('li', {}, [
          el('a', { href: '#/practice/' + encodeURIComponent(pid), text: item.title }),
          document.createTextNode(' · ' + item.origin)
        ]));
      });
      article.appendChild(qs);
    }
    var timeline = companyReports(company);
    article.appendChild(el('h2', { text: 'Sourced report timeline' }));
    if (!timeline.length) {
      article.appendChild(el('p', { class: 'summary', text: 'No sourced report in the existing report file for this company.' }));
    }
    timeline.forEach(function (report) {
      var card = el('details', { class: 'fold' });
      card.appendChild(el('summary', { text: (report.date || '') + ' · ' + report.title }));
      card.appendChild(el('p', { text: 'Grade ' + report.evidence_grade + (report.round ? ' · ' + report.round : '') }));
      card.appendChild(el('p', { text: report.raw_excerpt }));
      if (report.source_url) card.appendChild(el('p', {}, [el('a', { href: report.source_url, text: 'Source' })]));
      article.appendChild(card);
    });
    main.appendChild(article);
  }

  function stopTimer() {
    if (timer.id) clearInterval(timer.id);
    timer.id = null;
    timer.running = false;
  }

  function formatTime(seconds) {
    var safe = Math.max(0, seconds);
    var min = Math.floor(safe / 60);
    var sec = safe % 60;
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function renderMock(id) {
    setCrumbs(id ? [{ href: '#/mock', label: 'Mock' }, { label: id }] : [{ label: 'Mock' }]);
    if (!id) {
      main.appendChild(el('div', { class: 'view-head' }, [
        el('h1', { text: 'Mock' }),
        el('p', { class: 'summary', text: 'Meta is the primary mock. Amazon is second, with a leadership-principles round and no sample stories. The bank loop is safety, built from posting requirements.' })
      ]));
      (mocks.loops || []).forEach(function (loop) {
        var card = el('article', { class: 'co-card' });
        card.appendChild(el('h2', {}, [el('a', { href: '#/mock/' + loop.id, text: loop.title })]));
        card.appendChild(el('p', { text: loop.label }));
        main.appendChild(card);
      });
      main.appendChild(el('h2', { text: 'Rubric' }));
      var rubric = el('ul');
      (mocks.rubric || []).forEach(function (row) {
        rubric.appendChild(el('li', { text: row.label + ' — ' + row.help }));
      });
      main.appendChild(rubric);
      return;
    }
    var loop = byId(mocks.loops || [], id);
    if (!loop) {
      main.appendChild(el('p', { class: 'load-error', text: 'That mock is not in the list.' }));
      return;
    }
    if (timer.loop !== id) {
      stopTimer();
      timer.loop = id;
      timer.round = 0;
      timer.left = (loop.rounds[0].minutes || 45) * 60;
    }
    var round = loop.rounds[timer.round] || loop.rounds[0];
    var article = el('article', { class: 'study' });
    article.appendChild(el('h1', { text: loop.title }));
    article.appendChild(el('p', { class: 'callout', text: loop.label }));
    article.appendChild(el('p', { class: 'timer', text: formatTime(timer.left) }));
    var actions = el('div', { class: 'timer-actions' });
    actions.appendChild(el('button', { type: 'button', text: timer.running ? 'Pause' : 'Start', id: 'timer-toggle' }));
    actions.appendChild(el('button', { type: 'button', text: 'Reset round', id: 'timer-reset' }));
    actions.appendChild(el('button', { type: 'button', text: 'Next round', id: 'timer-next' }));
    article.appendChild(actions);
    article.appendChild(el('h2', { text: 'Round ' + (timer.round + 1) + ' · ' + round.name }));
    article.appendChild(el('p', { text: round.minutes + ' minutes. ' + round.ask }));
    var qs = el('ul', { class: 'day-list' });
    (round.practice || []).forEach(function (pid) {
      var item = practiceById(pid);
      qs.appendChild(el('li', {}, [el('a', { href: '#/practice/' + encodeURIComponent(pid), text: item ? item.title : pid })]));
    });
    article.appendChild(qs);
    article.appendChild(el('h2', { text: 'All rounds' }));
    loop.rounds.forEach(function (item, index) {
      var button = el('button', { type: 'button', class: 'linkish', text: (index + 1) + '. ' + item.name + ' (' + item.minutes + 'm)' });
      button.addEventListener('click', function () {
        stopTimer();
        timer.round = index;
        timer.left = item.minutes * 60;
        render();
      });
      article.appendChild(button);
    });
    article.appendChild(el('h2', { text: 'Score this round' }));
    article.appendChild(el('p', { class: 'summary', text: 'Scores stay in this browser. Do not type a personal story into the page.' }));
    var form = el('div', { class: 'rubric' });
    (mocks.rubric || []).forEach(function (row) {
      var key = id + ':' + timer.round + ':' + row.id;
      var select = el('select', { 'aria-label': row.label });
      ['', '1', '2', '3', '4'].forEach(function (value) {
        var option = el('option', { value: value, text: value ? value : '—' });
        if (String(store.rubric[key] || '') === value) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener('change', function () {
        if (select.value) store.rubric[key] = Number(select.value);
        else delete store.rubric[key];
        saveStore();
      });
      form.appendChild(el('label', {}, [document.createTextNode(row.label), select]));
    });
    article.appendChild(form);
    main.appendChild(article);
    document.getElementById('timer-toggle').addEventListener('click', function () {
      if (timer.running) {
        stopTimer();
      } else {
        timer.running = true;
        timer.id = setInterval(function () {
          timer.left -= 1;
          if (timer.left <= 0) {
            timer.left = 0;
            stopTimer();
          }
          var node = document.querySelector('.timer');
          if (node) node.textContent = formatTime(timer.left);
          var toggle = document.getElementById('timer-toggle');
          if (toggle) toggle.textContent = timer.running ? 'Pause' : 'Start';
        }, 1000);
      }
      render();
    });
    document.getElementById('timer-reset').addEventListener('click', function () {
      stopTimer();
      timer.left = round.minutes * 60;
      render();
    });
    document.getElementById('timer-next').addEventListener('click', function () {
      stopTimer();
      timer.round = Math.min(loop.rounds.length - 1, timer.round + 1);
      timer.left = loop.rounds[timer.round].minutes * 60;
      render();
    });
  }

  function renderReference(id) {
    if (!id) {
      setCrumbs([{ label: 'Reference' }]);
      main.appendChild(el('div', { class: 'view-head' }, [
        el('h1', { text: 'Reference' }),
        el('p', { class: 'summary', text: 'Cheat sheet, glossary, and the design template.' })
      ]));
      reference.forEach(function (page) {
        var card = el('article', { class: 'co-card' });
        card.appendChild(el('h2', {}, [el('a', { href: '#/reference/' + page.id, text: page.title })]));
        card.appendChild(el('p', { text: page.summary }));
        main.appendChild(card);
      });
      return;
    }
    var page = byId(reference, id);
    if (!page) {
      main.appendChild(el('p', { class: 'load-error', text: 'That reference page is missing.' }));
      return;
    }
    setCrumbs([{ href: '#/reference', label: 'Reference' }, { label: page.title }]);
    var article = el('article', { class: 'study' });
    article.appendChild(el('h1', { text: page.title }));
    article.appendChild(prose(bodies['ref:' + id] || ''));
    main.appendChild(article);
  }

  function renderSearch(params) {
    var q = (params.get('q') || '').trim();
    if (searchInput && document.activeElement !== searchInput) searchInput.value = q;
    setCrumbs([{ label: 'Search' }]);
    main.appendChild(el('div', { class: 'view-head' }, [
      el('h1', { text: q ? 'Results for “' + q + '”' : 'Search' }),
      el('p', { class: 'summary', text: 'Learn pages, practice, companies, and reference.' })
    ]));
    if (!q) return;
    var needle = q.toLowerCase();
    var hits = [];
    catalog.pages.forEach(function (page) {
      var hay = (page.title + ' ' + page.summary + ' ' + (bodies['learn:' + page.id] || '')).toLowerCase();
      if (hay.indexOf(needle) !== -1) hits.push({ href: '#/learn/' + page.id, label: page.title, kind: 'Learn' });
    });
    practice.forEach(function (item) {
      var hay = (item.title + ' ' + item.prompt + ' ' + item.solution).toLowerCase();
      if (hay.indexOf(needle) !== -1) hits.push({ href: '#/practice/' + encodeURIComponent(item.id), label: item.title, kind: item.origin });
    });
    companies.forEach(function (company) {
      if ((company.name + ' ' + company.summary).toLowerCase().indexOf(needle) !== -1) {
        hits.push({ href: '#/companies/' + company.id, label: company.name, kind: 'Company' });
      }
    });
    reference.forEach(function (page) {
      var hay = (page.title + ' ' + page.summary + ' ' + (bodies['ref:' + page.id] || '')).toLowerCase();
      if (hay.indexOf(needle) !== -1) hits.push({ href: '#/reference/' + page.id, label: page.title, kind: 'Reference' });
    });
    if (!hits.length) {
      main.appendChild(el('p', { class: 'empty', text: 'No matches.' }));
      return;
    }
    var list = el('ul', { class: 'day-list' });
    hits.slice(0, 40).forEach(function (hit) {
      list.appendChild(el('li', {}, [
        el('a', { href: hit.href, text: hit.label }),
        document.createTextNode(' · ' + hit.kind)
      ]));
    });
    main.appendChild(list);
  }

  function render() {
    if (!catalog || !plan) return;
    var route = parseHash();
    stopTimerPaintOnly();
    clear(main);
    app.classList.remove('is-hub');
    markSection(route.parts[0] === 'search' ? '' : route.parts[0]);
    renderSidebar(route);
    closeDrawer();
    var section = route.parts[0];
    var id = route.parts[1] ? decodeURIComponent(route.parts[1]) : '';
    if (section === 'plan') renderPlan(id);
    else if (section === 'learn') id ? renderLearn(id) : renderLearnHome();
    else if (section === 'practice') id ? renderPractice(id) : renderPracticeList(route.params);
    else if (section === 'mock') renderMock(id);
    else if (section === 'companies') id ? renderCompany(id) : renderCompanies();
    else if (section === 'reference') renderReference(id);
    else renderSearch(route.params);
    fitChrome();
  }

  function stopTimerPaintOnly() {
    /* Keep a running timer across re-renders of the same mock.
       Changing routes stops it inside renderMock when the loop id changes.
       Here we only clear the interval if we are leaving the mock page. */
  }

  function loadText(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error(url);
      return response.text();
    });
  }

  function loadJson(url) {
    return loadText(url).then(function (body) { return JSON.parse(body); });
  }

  function boot() {
    Promise.all([
      loadJson(QUESTION_URL),
      loadJson(REPORT_URL),
      loadJson(TAXONOMY_URL),
      loadJson(PRACTICE_URL),
      loadJson(CATALOG_URL),
      loadJson(PLAN_URL),
      loadJson(COMPANY_URL),
      loadJson(MOCK_URL),
      loadJson(REFERENCE_URL)
    ]).then(function (loaded) {
      questions = loaded[0];
      reports = loaded[1];
      taxonomy = loaded[2];
      practice = loaded[3];
      catalog = loaded[4];
      plan = loaded[5];
      companies = loaded[6];
      mocks = loaded[7];
      reference = loaded[8];
      var jobs = [];
      catalog.pages.forEach(function (page) {
        jobs.push(loadText('/interview/content/learn/' + page.file).then(function (body) {
          bodies['learn:' + page.id] = body;
        }));
      });
      reference.forEach(function (page) {
        jobs.push(loadText('/interview/content/reference/' + page.file).then(function (body) {
          bodies['ref:' + page.id] = body;
        }));
      });
      return Promise.all(jobs);
    }).then(function () {
      render();
    }).catch(function (error) {
      clear(main);
      main.appendChild(el('p', { class: 'load-error', text: 'The study files did not load. ' + (error && error.message ? error.message : '') }));
    });
  }

  navToggle.addEventListener('click', function () {
    var open = !document.body.classList.contains('drawer-open');
    document.body.classList.toggle('drawer-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    scrim.hidden = !open;
  });
  scrim.addEventListener('click', closeDrawer);
  studyButton.addEventListener('click', function () {
    var next = nextStudy();
    if (next) location.hash = next.href;
  });
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    location.hash = '#/search?q=' + encodeURIComponent(searchInput.value.trim());
  });
  window.addEventListener('hashchange', function () {
    if (!(timer.running && parseHash().parts[0] === 'mock')) stopTimer();
    render();
  });
  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (event.key !== 'j' && event.key !== 'k') return;
    var route = parseHash();
    if (route.parts[0] === 'practice' && route.parts[1]) {
      var rows = filteredPractice(route.params);
      var id = decodeURIComponent(route.parts[1]);
      var index = rows.findIndex(function (row) { return row.id === id; });
      var nextIndex = index + (event.key === 'j' ? 1 : -1);
      if (rows[nextIndex]) {
        event.preventDefault();
        location.hash = '#/practice/' + encodeURIComponent(rows[nextIndex].id);
      }
      return;
    }
    if (route.parts[0] === 'learn' && route.parts[1]) {
      var pages = flatPages();
      var pageIndex = pages.findIndex(function (page) { return page.id === route.parts[1]; });
      var neighbor = pages[pageIndex + (event.key === 'j' ? 1 : -1)];
      if (neighbor) {
        event.preventDefault();
        location.hash = '#/learn/' + neighbor.id;
      }
      return;
    }
    if (event.key === 'j') {
      var study = nextStudy();
      if (study) {
        event.preventDefault();
        location.hash = study.href;
      }
    }
  });
  window.addEventListener('resize', fitChrome);
  if (!location.hash) location.hash = '#/plan';
  boot();
})();
