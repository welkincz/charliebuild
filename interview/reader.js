/* Study UI. Banks, topics, and placement rules live in data/taxonomy.json. */
(function () {
  var QUESTION_URL = '/interview/data/questions.json';
  var REPORT_URL = '/interview/data/reports.json';
  var TAXONOMY_URL = '/interview/data/taxonomy.json';
  var STORE_KEY = 'charliebuild-de-prep';

  var questions = [];
  var reports = [];
  var taxonomy = null;
  var store = loadStore();
  var openBanks = {};
  var main = document.getElementById('main');
  var sidebar = document.getElementById('sidebar');
  var crumbs = document.getElementById('crumbs');
  var studyButton = document.getElementById('study-next');
  var navToggle = document.getElementById('nav-toggle');
  var scrim = document.getElementById('scrim');
  var app = document.getElementById('app');
  var drawerQuery = window.matchMedia('(max-width: 860px)');

  function loadStore() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        done: parsed.done && typeof parsed.done === 'object' ? parsed.done : {},
        star: parsed.star && typeof parsed.star === 'object' ? parsed.star : {}
      };
    } catch (error) {
      return { done: {}, star: {} };
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (error) {
      /* Private mode can block storage. The session still works. */
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
    if (value == null || value === '') return '';
    return String(value);
  }

  function asList(value) {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  }

  function slugify(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function humanize(tag) {
    var label = text(tag).replace(/_/g, ' ');
    if (label && label === label.toLowerCase()) {
      return label.replace(/\b[a-z]/g, function (letter) { return letter.toUpperCase(); });
    }
    return label;
  }

  function titleCase(value) {
    var label = text(value);
    if (!label) return '';
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function safeUrl(value) {
    var url = text(value);
    if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) return url;
    return '';
  }

  function hostName(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return '';
    }
  }

  function ruleMatch(item, when) {
    when = when || {};
    if (when.question_type && asList(when.question_type).indexOf(item.question_type) === -1) return false;
    var tags = item.topic || [];
    if (when.topic_any && !asList(when.topic_any).some(function (tag) { return tags.indexOf(tag) !== -1; })) return false;
    if (when.topic_none && asList(when.topic_none).some(function (tag) { return tags.indexOf(tag) !== -1; })) return false;
    return true;
  }

  function placeQuestion(item) {
    var bank = null;
    taxonomy.banks.forEach(function (candidate) {
      if (candidate.name === item.bank) bank = candidate;
    });
    if (!bank) return null;
    var specific = bank.topics.filter(function (topic) { return !topic.fallback; });
    var fallback = bank.topics.filter(function (topic) { return topic.fallback; });
    var ordered = specific.concat(fallback);
    for (var i = 0; i < ordered.length; i++) {
      var topic = ordered[i];
      if (topic.fallback || ruleMatch(item, topic.when)) return { bank: bank, topic: topic };
    }
    return null;
  }

  function questionsInTopic(topicId) {
    return questions.filter(function (item) {
      return item.placement && item.placement.topic.id === topicId;
    });
  }

  function questionsInBank(bankId) {
    return questions.filter(function (item) {
      return item.placement && item.placement.bank.id === bankId;
    });
  }

  function orderedQuestions() {
    var list = [];
    taxonomy.banks.forEach(function (bank) {
      bank.topics.forEach(function (topic) {
        questionsInTopic(topic.id).forEach(function (item) { list.push(item); });
      });
    });
    return list;
  }

  function progress(list) {
    var done = 0;
    list.forEach(function (item) {
      if (store.done[item.archetype_id]) done += 1;
    });
    return { done: done, total: list.length };
  }

  function isDone(item) { return !!store.done[item.archetype_id]; }
  function isStar(item) { return !!store.star[item.archetype_id]; }

  function nextUndone(list) {
    var source = list || orderedQuestions();
    for (var i = 0; i < source.length; i++) {
      if (!isDone(source[i])) return source[i];
    }
    return null;
  }

  function questionHref(item) {
    return '#/' + item.placement.bank.id + '/' + item.placement.topic.id + '/' + item.slug;
  }

  function parseRoute() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (raw.charAt(0) === '/') raw = raw.slice(1);
    var queryIndex = raw.indexOf('?');
    var path = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
    var query = new URLSearchParams(queryIndex === -1 ? '' : raw.slice(queryIndex + 1));
    var parts = path.split('/').filter(Boolean);
    if (!parts.length) return { view: 'hub', query: query, parts: [] };
    if (parts[0] === 'reports') {
      return { view: 'reports', reportSlug: parts[1] || '', query: query, parts: parts };
    }
    var bank = null;
    taxonomy.banks.forEach(function (candidate) {
      if (candidate.id === parts[0]) bank = candidate;
    });
    if (!bank) return { view: 'missing', query: query, parts: parts };
    if (!parts[1]) return { view: 'bank', bank: bank, query: query, parts: parts };
    var topic = null;
    bank.topics.forEach(function (candidate) {
      if (candidate.id === parts[1]) topic = candidate;
    });
    if (!topic) return { view: 'missing', query: query, parts: parts, bank: bank };
    if (!parts[2]) return { view: 'topic', bank: bank, topic: topic, query: query, parts: parts };
    return {
      view: 'question',
      bank: bank,
      topic: topic,
      questionSlug: parts[2],
      query: query,
      parts: parts
    };
  }

  function writeHash(parts, query, replace) {
    var path = parts.filter(Boolean).join('/');
    var search = query && query.toString();
    var next = '#/' + path + (search ? '?' + search : '');
    if (replace) history.replaceState(null, '', next);
    else location.hash = next;
  }

  function load(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error(url + ' returned ' + response.status);
      return response.json();
    });
  }

  function annotate() {
    var seen = {};
    questions.forEach(function (item) {
      item.placement = placeQuestion(item);
      var base = slugify(item.archetype_id || item.question);
      var slug = base;
      var n = 2;
      while (seen[slug]) {
        slug = base + '-' + n;
        n += 1;
      }
      seen[slug] = true;
      item.slug = slug;
    });
    var reportSlugs = {};
    reports.forEach(function (item) {
      var base = slugify(item.title);
      var slug = base || 'report';
      var n = 2;
      while (reportSlugs[slug]) {
        slug = base + '-' + n;
        n += 1;
      }
      reportSlugs[slug] = true;
      item.slug = slug;
      item.linkedQuestions = questions.filter(function (question) {
        return question.source_url && question.source_url === item.source_url;
      });
    });
    questions.forEach(function (item) {
      item.linkedReports = reports.filter(function (report) {
        return report.source_url && report.source_url === item.source_url;
      });
    });
    taxonomy.banks.forEach(function (bank) {
      if (openBanks[bank.id] == null) openBanks[bank.id] = true;
    });
  }

  function pill(kind, label, title) {
    return el('span', { class: 'pill pill-' + kind, text: label, title: title || '' });
  }

  function gradePill(grade) {
    var shown = text(grade) || '–';
    var meaning = shown === 'A'
      ? 'Evidence A: first-hand and recent, about the last 18 months.'
      : shown === 'B'
        ? 'Evidence B: first-hand but older, imprecise, or a third-person rewrite.'
        : 'Evidence grade ' + shown;
    return pill(shown.toLowerCase(), shown, meaning);
  }

  function difficultyPill(value) {
    var shown = text(value);
    if (!shown) return null;
    return pill(shown.toLowerCase(), titleCase(shown), 'Difficulty ' + shown);
  }

  function companyPill(value) {
    if (!text(value)) return null;
    return pill('company', text(value));
  }

  function meter(scope, list) {
    var state = progress(list);
    var bar = el('span');
    bar.style.width = state.total ? (state.done / state.total * 100) + '%' : '0';
    var node = el('div', {
      class: 'meter',
      'data-meter': scope,
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': String(state.total),
      'aria-valuenow': String(state.done),
      'aria-label': scope + ' progress'
    }, [bar]);
    return node;
  }

  function countLabel(scope, list) {
    var state = progress(list);
    return el('span', {
      class: 'count',
      'data-count': scope,
      text: state.done + '/' + state.total
    });
  }

  function starButton(item) {
    var button = el('button', {
      class: 'star' + (isStar(item) ? ' is-on' : ''),
      type: 'button',
      'data-star': item.archetype_id,
      'aria-pressed': isStar(item) ? 'true' : 'false',
      'aria-label': (isStar(item) ? 'Unstar ' : 'Star ') + item.question
    });
    button.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.7l1.9 4 4.4.6-3.2 3.1.8 4.4L10 12.7 5.1 14.8l.8-4.4L2.7 7.3l4.4-.6z"/></svg>';
    return button;
  }

  function doneBox(item) {
    var input = el('input', { type: 'checkbox', 'data-done': item.archetype_id });
    input.checked = isDone(item);
    var label = el('label', { class: 'tick' }, [
      input,
      el('span', { class: 'visually-hidden', text: 'Mark done: ' + item.question })
    ]);
    return label;
  }

  function sourceLink(item) {
    var line = el('p', { class: 'source-line' });
    line.appendChild(gradePill(item.evidence_grade));
    var url = safeUrl(item.source_url);
    var label = text(item.source) || 'Source';
    if (!url) {
      line.appendChild(document.createTextNode(label));
      return line;
    }
    var link = el('a', {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      text: label
    });
    line.appendChild(link);
    var host = hostName(url);
    if (host) line.appendChild(el('span', { class: 'host', text: host }));
    return line;
  }

  function renderCrumbs(route) {
    clear(crumbs);
    var parts = [{ href: '#/', label: 'DE Prep' }];
    if (route.view === 'reports') {
      parts.push({ href: '#/reports', label: 'Reports', current: !route.reportSlug });
      if (route.reportSlug) {
        var report = reports.filter(function (item) { return item.slug === route.reportSlug; })[0];
        parts.push({ label: report ? report.company : 'Report', current: true });
      }
    } else if (route.bank) {
      parts.push({
        href: '#/' + route.bank.id,
        label: route.bank.name,
        current: route.view === 'bank'
      });
      if (route.topic) {
        parts.push({
          href: '#/' + route.bank.id + '/' + route.topic.id,
          label: route.topic.name,
          current: route.view === 'topic'
        });
      }
      if (route.view === 'question') {
        var question = findQuestion(route.questionSlug);
        parts.push({ label: question ? shortTitle(question.question) : 'Question', current: true });
      }
    } else if (route.view === 'hub') {
      parts[0].current = true;
    }
    parts.forEach(function (part, index) {
      if (index) crumbs.appendChild(el('span', { class: 'crumb-sep', text: '/' }));
      if (part.current || !part.href) {
        crumbs.appendChild(el('span', { class: 'crumb-current', text: part.label, 'aria-current': 'page' }));
      } else {
        crumbs.appendChild(el('a', { href: part.href, text: part.label }));
      }
    });
  }

  function shortTitle(value) {
    var label = text(value);
    if (label.length <= 42) return label;
    return label.slice(0, 40).replace(/\s+\S*$/, '') + '…';
  }

  function findQuestion(slug) {
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].slug === slug) return questions[i];
    }
    return null;
  }

  function renderSidebar(route) {
    var scroll = sidebar.scrollTop;
    clear(sidebar);
    sidebar.appendChild(el('p', { class: 'tree-label', text: 'Study path' }));
    taxonomy.banks.forEach(function (bank) {
      var list = questionsInBank(bank.id);
      var open = openBanks[bank.id] !== false;
      var row = el('div', { class: 'tree-bank-row' });
      var chevron = el('button', {
        class: 'tree-chevron',
        type: 'button',
        'aria-expanded': open ? 'true' : 'false',
        'aria-label': (open ? 'Collapse ' : 'Expand ') + bank.name
      });
      chevron.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.2L8 6 4 9.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
      chevron.addEventListener('click', function () {
        openBanks[bank.id] = openBanks[bank.id] === false;
        renderSidebar(parseRoute());
      });
      var link = el('a', {
        href: '#/' + bank.id,
        text: bank.name
      });
      if (route.view === 'bank' && route.bank && route.bank.id === bank.id) {
        link.setAttribute('aria-current', 'page');
      }
      link.setAttribute('data-accent', bank.id);
      row.appendChild(chevron);
      row.appendChild(link);
      row.appendChild(countLabel('bank:' + bank.id, list));
      var topics = el('ul', { class: 'topic-list' });
      if (!open) topics.hidden = true;
      bank.topics.forEach(function (topic) {
        var topicLink = el('a', {
          class: 'topic-link',
          href: '#/' + bank.id + '/' + topic.id
        }, [
          document.createTextNode(topic.name),
          countLabel('topic:' + topic.id, questionsInTopic(topic.id))
        ]);
        var inside = route.topic && route.topic.id === topic.id && route.bank && route.bank.id === bank.id;
        if (inside) topicLink.setAttribute('aria-current', 'page');
        topics.appendChild(el('li', null, [topicLink]));
      });
      var block = el('div', { class: 'tree-bank', 'data-accent': bank.id }, [row, topics]);
      sidebar.appendChild(block);
    });
    var reportsLink = el('a', { class: 'tree-reports', href: '#/reports', text: taxonomy.reports.name });
    if (route.view === 'reports') reportsLink.setAttribute('aria-current', 'page');
    sidebar.appendChild(reportsLink);
    sidebar.scrollTop = scroll;
  }

  function render() {
    var route = parseRoute();
    if (route.view === 'question') {
      var canonical = findQuestion(route.questionSlug);
      if (canonical && (route.bank.id !== canonical.placement.bank.id || route.topic.id !== canonical.placement.topic.id)) {
        history.replaceState(null, '', questionHref(canonical));
        route = parseRoute();
      }
    }
    if (route.bank) openBanks[route.bank.id] = true;
    app.classList.toggle('is-hub', route.view === 'hub');
    document.title = documentTitle(route);
    renderCrumbs(route);
    renderSidebar(route);
    renderMain(route);
    updateStudyButton();
    syncDrawer();
  }

  function documentTitle(route) {
    if (route.view === 'question') {
      var question = findQuestion(route.questionSlug);
      return (question ? question.question : 'Question') + ' — DE prep';
    }
    if (route.view === 'topic') return route.topic.name + ' — DE prep';
    if (route.view === 'bank') return route.bank.name + ' — DE prep';
    if (route.view === 'reports') return 'Interview reports — DE prep';
    return 'DE prep — Charlie Build';
  }

  function renderMain(route) {
    clear(main);
    if (route.view === 'hub') renderHub();
    else if (route.view === 'bank') renderList(route, questionsInBank(route.bank.id), true);
    else if (route.view === 'topic') renderList(route, questionsInTopic(route.topic.id), false);
    else if (route.view === 'question') renderQuestion(route);
    else if (route.view === 'reports') renderReports(route);
    else main.appendChild(el('div', { class: 'wrap' }, [
      el('h1', { text: 'That page is not in this reader.' }),
      el('p', { class: 'lede' }, [el('a', { href: '#/', text: 'Back to the study path' })])
    ]));
  }

  function renderHub() {
    var all = orderedQuestions();
    var state = progress(all);
    var roadmap = el('ol', { class: 'roadmap' });
    taxonomy.banks.forEach(function (bank, index) {
      var list = questionsInBank(bank.id);
      var chips = el('ul', { class: 'topic-chips' });
      bank.topics.forEach(function (topic) {
        chips.appendChild(el('li', null, [
          el('a', { href: '#/' + bank.id + '/' + topic.id }, [
            document.createTextNode(topic.name),
            countLabel('topic:' + topic.id, questionsInTopic(topic.id))
          ])
        ]));
      });
      var card = el('li', { class: 'bank-card', 'data-accent': bank.id }, [
        el('div', { class: 'card-top' }, [
          el('span', { class: 'card-index', text: index < 9 ? '0' + (index + 1) : String(index + 1) }),
          countLabel('bank:' + bank.id, list)
        ]),
        el('h2', null, [el('a', { href: '#/' + bank.id, text: bank.name })]),
        el('p', { class: 'summary', text: bank.summary }),
        el('div', { class: 'card-progress' }, [
          meter('bank:' + bank.id, list),
          el('span', { class: 'count', 'data-count': 'bank-words:' + bank.id, text: progress(list).done + ' of ' + list.length + ' done' })
        ]),
        chips
      ]);
      roadmap.appendChild(card);
    });
    var reportCard = el('li', { class: 'bank-card' }, [
      el('div', { class: 'card-top' }, [
        el('span', { class: 'card-index', text: '05' }),
        el('span', { class: 'count', text: String(reports.length) })
      ]),
      el('h2', null, [el('a', { href: '#/reports', text: taxonomy.reports.name })]),
      el('p', { class: 'summary', text: taxonomy.reports.summary })
    ]);
    roadmap.appendChild(reportCard);

    main.appendChild(el('div', { class: 'wrap' }, [
      el('header', { class: 'hub-head' }, [
        el('p', { class: 'kicker', text: 'Senior / L5 · Toronto' }),
        el('h1', { text: 'A study path for reported DE interviews.' }),
        el('p', { class: 'lede', text: 'Personal prep for Charlie Guo. Only Reported questions are here, each one still attached to its source. Predicted and AI-written questions are not included. Grades are unchanged from the export.' }),
        el('div', { class: 'hub-status' }, [
          meter('all', all),
          el('p', { 'data-count': 'all-words', text: state.done + ' of ' + state.total + ' questions done' }),
          el('p', { text: 'Done and starred stay in this browser.' })
        ])
      ]),
      roadmap,
      el('p', { class: 'note', text: 'A is first-hand and recent, about the last 18 months. B is first-hand but older, imprecise, or a third-person rewrite. This batch has no C grades.' })
    ]));
  }

  function currentFilters(route) {
    return {
      company: route.query.get('company') || 'All',
      grade: route.query.get('grade') || 'All',
      q: route.query.get('q') || ''
    };
  }

  function renderList(route, list, grouped) {
    var filters = currentFilters(route);
    var companies = [];
    (taxonomy.companies || []).forEach(function (name) {
      if (list.some(function (item) { return item.company === name; })) companies.push(name);
    });
    list.forEach(function (item) {
      if (item.company && companies.indexOf(item.company) === -1) companies.push(item.company);
    });

    var search = el('input', {
      class: 'search',
      id: 'qsearch',
      type: 'search',
      placeholder: 'Search questions',
      value: filters.q,
      'aria-label': 'Search questions'
    });
    search.value = filters.q;

    var companyRow = el('div', { class: 'chip-row', role: 'group', 'aria-label': 'Company' });
    companyRow.appendChild(filterChip('company', 'All', filters.company));
    companies.forEach(function (name) {
      companyRow.appendChild(filterChip('company', name, filters.company));
    });
    var gradeRow = el('div', { class: 'chip-row', role: 'group', 'aria-label': 'Evidence grade' });
    ['All', 'A', 'B'].forEach(function (grade) {
      gradeRow.appendChild(filterChip('grade', grade, filters.grade));
    });
    var companyFilter = el('div', { class: 'filter-group' }, [
      el('span', { class: 'filter-label', text: 'Company' }),
      companyRow
    ]);
    var gradeFilter = el('div', { class: 'filter-group' }, [
      el('span', { class: 'filter-label', text: 'Grade' }),
      gradeRow
    ]);

    var head = grouped
      ? el('header', { class: 'view-head' }, [
          el('p', { class: 'kicker', text: 'Bank' }),
          el('h1', { text: route.bank.name }),
          el('p', { class: 'summary', text: route.bank.summary }),
          el('div', { class: 'card-progress' }, [
            meter('bank:' + route.bank.id, list),
            el('span', { class: 'count', 'data-count': 'bank-words:' + route.bank.id, text: progress(list).done + ' of ' + list.length + ' done' })
          ])
        ])
      : el('header', { class: 'view-head' }, [
          el('p', { class: 'kicker', text: route.bank.name }),
          el('h1', { text: route.topic.name }),
          el('p', { class: 'summary', text: route.topic.summary }),
          el('div', { class: 'card-progress' }, [
            meter('topic:' + route.topic.id, list),
            el('span', { class: 'count', 'data-count': 'topic-words:' + route.topic.id, text: progress(list).done + ' of ' + list.length + ' done' })
          ])
        ]);

    var host = el('div', { id: 'list-host' });
    var wrap = el('div', { class: 'wrap' }, [
      head,
      el('div', { class: 'toolbar' }, [
        search,
        companyFilter,
        gradeFilter,
        el('p', { class: 'showing', id: 'showing', text: '' })
      ]),
      host
    ]);
    main.appendChild(wrap);
    search.addEventListener('input', function () {
      updateFilter('q', search.value);
    });
    renderRows();
  }

  function filterChip(kind, value, current) {
    var button = el('button', {
      class: 'chip',
      type: 'button',
      text: value,
      'aria-pressed': value === current ? 'true' : 'false'
    });
    button.setAttribute('data-filter', kind);
    button.setAttribute('data-value', value);
    return button;
  }

  function updateFilter(kind, value) {
    var route = parseRoute();
    var query = new URLSearchParams(route.query);
    if (!value || value === 'All') query.delete(kind);
    else query.set(kind, value);
    writeHash(route.parts, query, true);
    if (kind === 'q') {
      renderRows();
      return;
    }
    document.querySelectorAll('[data-filter="' + kind + '"]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-value') === value ? 'true' : 'false');
    });
    renderRows();
  }

  function activeList() {
    var route = parseRoute();
    if (route.view === 'topic') return { route: route, list: questionsInTopic(route.topic.id), grouped: false };
    if (route.view === 'bank') return { route: route, list: questionsInBank(route.bank.id), grouped: true };
    return null;
  }

  function passes(item, filters) {
    if (filters.company !== 'All' && item.company !== filters.company) return false;
    if (filters.grade !== 'All' && item.evidence_grade !== filters.grade) return false;
    if (filters.q) {
      var haystack = [
        item.question, item.company, item.role, item.archetype_id, (item.topic || []).join(' ')
      ].join(' ').toLowerCase();
      if (haystack.indexOf(filters.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function renderRows() {
    var host = document.getElementById('list-host');
    var context = activeList();
    if (!host || !context) return;
    clear(host);
    var filters = currentFilters(context.route);
    var showing = document.getElementById('showing');
    if (context.grouped) {
      var visible = 0;
      context.route.bank.topics.forEach(function (topic) {
        var rows = numbered(questionsInTopic(topic.id)).filter(function (row) {
          return passes(row.item, filters);
        });
        visible += rows.length;
        if (!rows.length) return;
        host.appendChild(el('section', { class: 'group' }, [
          el('h2', null, [el('a', { href: '#/' + context.route.bank.id + '/' + topic.id, text: topic.name })]),
          el('p', { class: 'summary', text: topic.summary }),
          tableFor(rows)
        ]));
      });
      if (!visible) host.appendChild(el('p', { class: 'empty', text: 'No questions match this filter.' }));
      if (showing) showing.textContent = 'Showing ' + visible;
      return;
    }
    var rows = numbered(context.list).filter(function (row) { return passes(row.item, filters); });
    if (!rows.length) host.appendChild(el('p', { class: 'empty', text: 'No questions match this filter.' }));
    else host.appendChild(tableFor(rows));
    if (showing) showing.textContent = 'Showing ' + rows.length;
  }

  function numbered(list) {
    return list.map(function (item, index) {
      return { item: item, n: index + 1 };
    });
  }

  function tableFor(rows) {
    var table = el('div', { class: 'qtable' });
    table.appendChild(el('div', { class: 'qhead', 'aria-hidden': 'true' }, [
      el('span'),
      el('span'),
      el('span', { text: '#' }),
      el('span', { text: 'Question' }),
      el('span', { text: 'Company' }),
      el('span', { text: 'Difficulty' }),
      el('span', { text: 'Grade' })
    ]));
    rows.forEach(function (row) { table.appendChild(questionRow(row.item, row.n)); });
    return table;
  }

  function questionRow(item, number) {
    var row = el('article', {
      class: 'qrow' + (isDone(item) ? ' is-done' : ''),
      'data-qid': item.archetype_id
    });
    row.appendChild(doneBox(item));
    row.appendChild(starButton(item));
    row.appendChild(el('span', { class: 'num', text: String(number) }));
    row.appendChild(el('a', { class: 'qtitle', href: questionHref(item), text: item.question }));
    var meta = el('div', { class: 'meta-pills' }, [
      companyPill(item.company),
      difficultyPill(item.difficulty),
      gradePill(item.evidence_grade)
    ]);
    row.appendChild(meta);
    return row;
  }

  function renderQuestion(route) {
    var item = findQuestion(route.questionSlug);
    if (!item) {
      main.appendChild(el('div', { class: 'wrap narrow' }, [
        el('h1', { text: 'Question not found.' }),
        el('p', { class: 'lede' }, [el('a', { href: '#/' + route.bank.id + '/' + route.topic.id, text: 'Back to ' + route.topic.name })])
      ]));
      return;
    }
    var siblings = questionsInTopic(item.placement.topic.id);
    var index = siblings.indexOf(item);
    var concepts = el('ul', { class: 'concept-list' });
    (item.topic || []).forEach(function (tag) {
      concepts.appendChild(el('li', { text: humanize(tag) }));
    });
    var testing = [
      'A ' + text(item.difficulty) + ' ' + text(item.question_type) + ' question from the ' + text(item.bank) + ' bank.'
    ];
    if (item.topic && item.topic.length) testing.push('Source tags: ' + item.topic.map(humanize).join(', ') + '.');
    if (item.round) testing.push('Reported in a ' + item.round + ' round.');
    if (item.role) testing.push('Role on the report: ' + item.role + (item.level ? ' (' + item.level + ').' : '.'));

    var askedBits = [item.role, item.level, item.round, item.location, item.date].map(text).filter(Boolean);

    var article = el('article', { class: 'wrap narrow study' }, [
      el('p', { class: 'kicker', text: item.placement.topic.name }),
      el('h1', { text: item.question }),
      el('div', { class: 'pill-row' }, [
        gradePill(item.evidence_grade),
        difficultyPill(item.difficulty),
        companyPill(item.company)
      ]),
      el('div', { class: 'actions' }, [
        doneAction(item),
        starAction(item)
      ]),
      el('h2', { text: 'What this is testing' }),
      el('p', { class: 'prose', text: testing.join(' ') }),
      el('h2', { text: 'Key concepts' }),
      concepts,
      el('h2', { text: 'Asked at' }),
      el('div', { class: 'pill-row' }, [companyPill(item.company)]),
      el('p', { class: 'asked', text: askedBits.join(' · ') }),
      el('h2', { text: 'Source' }),
      el('div', { class: 'source-card' }, [
        sourceLink(item),
        item.archetype_id ? el('p', { class: 'note mono', text: item.archetype_id }) : null
      ]),
      el('p', { class: 'note', text: 'This export has the reported prompt and its source. It does not include a written solution.' })
    ]);

    if (item.linkedReports && item.linkedReports.length) {
      var links = el('div', { class: 'report-links' });
      item.linkedReports.forEach(function (report) {
        links.appendChild(el('a', { href: '#/reports/' + report.slug, text: report.title }));
      });
      article.appendChild(el('h2', { text: 'Interview reports' }));
      article.appendChild(links);
    }

    var related = siblings.filter(function (other) { return other !== item; });
    if (related.length) {
      var relatedList = el('div', { class: 'related' });
      related.forEach(function (other) {
        relatedList.appendChild(el('a', { href: questionHref(other), text: other.question }));
      });
      article.appendChild(el('h2', { text: 'Related in ' + item.placement.topic.name }));
      article.appendChild(relatedList);
    }

    article.appendChild(pager(siblings, index));
    article.appendChild(el('p', { class: 'keys', text: 'j next · k previous' }));
    main.appendChild(article);
  }

  function doneAction(item) {
    var button = el('button', {
      class: 'action' + (isDone(item) ? ' is-on' : ''),
      type: 'button',
      'data-done-button': item.archetype_id,
      text: isDone(item) ? 'Done' : 'Mark done'
    });
    return button;
  }

  function starAction(item) {
    return el('button', {
      class: 'action' + (isStar(item) ? ' is-on' : ''),
      type: 'button',
      'data-star-button': item.archetype_id,
      text: isStar(item) ? 'Starred' : 'Star'
    });
  }

  function pager(list, index) {
    var nav = el('nav', { class: 'pager', 'aria-label': 'Questions in this topic' });
    nav.appendChild(pagerLink(list[index - 1], 'Previous', 'prev'));
    nav.appendChild(pagerLink(list[index + 1], 'Next', 'next'));
    return nav;
  }

  function pagerLink(item, label, side) {
    if (!item) {
      return el('span', { class: side }, [
        el('small', { text: label }),
        el('strong', { text: side === 'prev' ? 'Start of topic' : 'End of topic' })
      ]);
    }
    return el('a', { class: side, href: questionHref(item) }, [
      el('small', { text: label }),
      el('strong', { text: item.question })
    ]);
  }

  function renderReports(route) {
    var order = (taxonomy.companies || []).slice();
    reports.forEach(function (report) {
      if (order.indexOf(report.company) === -1) order.push(report.company);
    });
    var wrap = el('div', { class: 'wrap' }, [
      el('header', { class: 'view-head' }, [
        el('p', { class: 'kicker', text: 'Sources' }),
        el('h1', { text: taxonomy.reports.name }),
        el('p', { class: 'summary', text: reports.length + ' interview reports. ' + taxonomy.reports.summary })
      ])
    ]);
    order.forEach(function (company) {
      var group = reports.filter(function (report) { return report.company === company; });
      if (!group.length) return;
      var section = el('section', { class: 'company-block' }, [
        el('h2', null, [
          document.createTextNode(company),
          el('span', { class: 'count', text: String(group.length) })
        ])
      ]);
      group.forEach(function (report) {
        section.appendChild(reportCard(report, route.reportSlug === report.slug));
      });
      wrap.appendChild(section);
    });
    main.appendChild(wrap);
    if (route.reportSlug) {
      var target = document.getElementById('report-' + route.reportSlug);
      if (target) target.scrollIntoView({ block: 'start' });
    }
  }

  function reportCard(report, open) {
    var details = el('details');
    if (open) details.open = true;
    var summary = el('summary', { text: 'Read report' });
    details.appendChild(summary);
    details.addEventListener('toggle', function () {
      summary.textContent = details.open ? 'Hide report' : 'Read report';
    });
    if (open) summary.textContent = 'Hide report';
    details.appendChild(el('blockquote', { class: 'excerpt', text: text(report.raw_excerpt) }));
    var url = safeUrl(report.source_url);
    if (url) {
      details.appendChild(el('p', { class: 'source-line' }, [
        el('a', { class: 'report-source', href: url, target: '_blank', rel: 'noopener noreferrer', text: text(report.source) || 'Source' }),
        el('span', { class: 'host', text: hostName(url) })
      ]));
    }
    if (report.linkedQuestions.length) {
      var links = el('div', { class: 'related' });
      report.linkedQuestions.forEach(function (question) {
        links.appendChild(el('a', { href: questionHref(question), text: question.question }));
      });
      details.appendChild(el('h2', { text: 'Questions from this report' }));
      details.appendChild(links);
    }
    var meta = [report.role, report.level, report.location].map(text).filter(Boolean).join(' · ');
    var meta2 = [report.round, report.date, report.status].map(text).filter(Boolean).join(' · ');
    return el('article', { class: 'report-card', id: 'report-' + report.slug }, [
      gradePill(report.evidence_grade),
      el('h3', { text: report.title }),
      meta ? el('p', { class: 'report-meta', text: meta }) : null,
      meta2 ? el('p', { class: 'report-meta', text: meta2 }) : null,
      details
    ]);
  }

  function refreshProgress() {
    document.querySelectorAll('[data-meter]').forEach(function (node) {
      var list = listForScope(node.getAttribute('data-meter'));
      if (!list) return;
      var state = progress(list);
      var bar = node.querySelector('span');
      if (bar) bar.style.width = state.total ? (state.done / state.total * 100) + '%' : '0';
      node.setAttribute('aria-valuemax', String(state.total));
      node.setAttribute('aria-valuenow', String(state.done));
    });
    document.querySelectorAll('[data-count]').forEach(function (node) {
      var scope = node.getAttribute('data-count');
      var list = listForScope(scope);
      if (!list) return;
      var state = progress(list);
      if (scope.indexOf('-words') !== -1 || scope === 'all-words') node.textContent = state.done + ' of ' + state.total + ' done';
      else if (scope === 'all-words') node.textContent = state.done + ' of ' + state.total + ' questions done';
      else node.textContent = state.done + '/' + state.total;
    });
    var allWords = document.querySelector('[data-count="all-words"]');
    if (allWords) {
      var allState = progress(orderedQuestions());
      allWords.textContent = allState.done + ' of ' + allState.total + ' questions done';
    }
    document.querySelectorAll('[data-qid]').forEach(function (row) {
      var id = row.getAttribute('data-qid');
      row.classList.toggle('is-done', !!store.done[id]);
      var box = row.querySelector('[data-done]');
      if (box) box.checked = !!store.done[id];
      var star = row.querySelector('[data-star]');
      if (star) {
        star.classList.toggle('is-on', !!store.star[id]);
        star.setAttribute('aria-pressed', store.star[id] ? 'true' : 'false');
      }
    });
  }

  function listForScope(scope) {
    if (!scope) return null;
    if (scope === 'all' || scope === 'all-words') return orderedQuestions();
    if (scope.indexOf('bank-words:') === 0) return questionsInBank(scope.slice('bank-words:'.length));
    if (scope.indexOf('bank:') === 0) return questionsInBank(scope.slice('bank:'.length));
    if (scope.indexOf('topic-words:') === 0) return questionsInTopic(scope.slice('topic-words:'.length));
    if (scope.indexOf('topic:') === 0) return questionsInTopic(scope.slice('topic:'.length));
    return null;
  }

  function setDone(id, on) {
    if (on) store.done[id] = true;
    else delete store.done[id];
    saveStore();
    refreshProgress();
    updateStudyButton();
    var button = document.querySelector('[data-done-button="' + cssEscape(id) + '"]');
    if (button) {
      button.textContent = on ? 'Done' : 'Mark done';
      button.classList.toggle('is-on', on);
    }
  }

  function setStar(id, on) {
    if (on) store.star[id] = true;
    else delete store.star[id];
    saveStore();
    document.querySelectorAll('[data-star="' + cssEscape(id) + '"]').forEach(function (star) {
      star.classList.toggle('is-on', on);
      star.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var button = document.querySelector('[data-star-button="' + cssEscape(id) + '"]');
    if (button) {
      button.textContent = on ? 'Starred' : 'Star';
      button.classList.toggle('is-on', on);
    }
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  function updateStudyButton() {
    if (!studyButton) return;
    var upcoming = nextUndone();
    studyButton.textContent = upcoming ? 'Study next' : 'Review from the start';
  }

  function goStudyNext() {
    var list = orderedQuestions();
    var upcoming = nextUndone(list) || list[0];
    if (upcoming) location.hash = questionHref(upcoming);
  }

  function moveQuestion(direction) {
    var route = parseRoute();
    if (route.view !== 'question') {
      if (direction > 0) goStudyNext();
      return;
    }
    var item = findQuestion(route.questionSlug);
    if (!item) return;
    var siblings = questionsInTopic(item.placement.topic.id);
    var index = siblings.indexOf(item) + direction;
    if (index < 0 || index >= siblings.length) return;
    location.hash = questionHref(siblings[index]);
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    syncDrawer();
  }

  function syncDrawer() {
    var mobile = drawerQuery.matches;
    var open = document.body.classList.contains('drawer-open');
    if (sidebar) sidebar.setAttribute('aria-hidden', mobile && !open ? 'true' : 'false');
    if (navToggle) navToggle.setAttribute('aria-expanded', mobile && open ? 'true' : 'false');
    if (scrim) scrim.hidden = !(mobile && open);
  }

  main.addEventListener('change', function (event) {
    var input = event.target;
    if (!input || !input.getAttribute || !input.getAttribute('data-done')) return;
    setDone(input.getAttribute('data-done'), input.checked);
  });

  main.addEventListener('click', function (event) {
    var star = event.target.closest('[data-star]');
    if (star) {
      event.preventDefault();
      var id = star.getAttribute('data-star');
      setStar(id, !store.star[id]);
      return;
    }
    var doneButton = event.target.closest('[data-done-button]');
    if (doneButton) {
      var doneId = doneButton.getAttribute('data-done-button');
      setDone(doneId, !store.done[doneId]);
      return;
    }
    var starButtonNode = event.target.closest('[data-star-button]');
    if (starButtonNode) {
      var starId = starButtonNode.getAttribute('data-star-button');
      setStar(starId, !store.star[starId]);
      return;
    }
    var filter = event.target.closest('[data-filter]');
    if (filter) updateFilter(filter.getAttribute('data-filter'), filter.getAttribute('data-value'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (event.key === 'j' || event.key === 'J') {
      event.preventDefault();
      moveQuestion(1);
    } else if (event.key === 'k' || event.key === 'K') {
      event.preventDefault();
      moveQuestion(-1);
    }
  });

  if (studyButton) studyButton.addEventListener('click', goStudyNext);
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.body.classList.toggle('drawer-open');
      syncDrawer();
    });
  }
  if (scrim) scrim.addEventListener('click', closeDrawer);
  window.addEventListener('hashchange', function () {
    closeDrawer();
    render();
  });
  if (drawerQuery.addEventListener) drawerQuery.addEventListener('change', syncDrawer);
  else if (drawerQuery.addListener) drawerQuery.addListener(syncDrawer);

  Promise.all([load(QUESTION_URL), load(REPORT_URL), load(TAXONOMY_URL)]).then(function (files) {
    if (!Array.isArray(files[0]) || !Array.isArray(files[1]) || !files[2] || !Array.isArray(files[2].banks)) {
      throw new Error('The study files should be a question list, a report list, and a taxonomy.');
    }
    questions = files[0];
    reports = files[1];
    taxonomy = files[2];
    annotate();
    render();
  }).catch(function (error) {
    clear(main);
    main.appendChild(el('p', {
      class: 'load-error',
      text: 'The study files did not load. From the repo root, run python3 -m http.server 8000 and open /interview/. ' + (error && error.message ? error.message : '')
    }));
  });
})();
