/* Progressive enhancement: the complete archive and articles work without JS. */
(() => {
  "use strict";
  const archive = document.querySelector('[data-writing-archive]');
  if (archive) {
    const entries = [...archive.querySelectorAll('[data-writing-entry]')];
    const search = archive.querySelector('#writing-search');
    const topic = archive.querySelector('#writing-topic');
    const source = archive.querySelector('#writing-source');
    const buttons = [...archive.querySelectorAll('[data-kind-filter]')];
    const clears = [...archive.querySelectorAll('.clear-filters')];
    let kind = 'All';
    const normalize = value => value.toLocaleLowerCase().normalize('NFKC');
    const sources = [...new Set(entries.map(entry => entry.dataset.source))].sort();
    sources.forEach(name => source.add(new Option(name, name)));
    archive.querySelector('.source-control').hidden = sources.length < 2;
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    topic.value = params.get('topic') || '';
    source.value = params.get('source') || '';
    if (['Notes', 'Poetry'].includes(params.get('kind'))) kind = params.get('kind');
    function filter() {
      let count = 0;
      const query = normalize(search.value.trim());
      entries.forEach(entry => {
        const topics = JSON.parse(entry.dataset.topics || '[]') || [];
        const visible = (kind === 'All' || entry.dataset.kind === kind)
          && (!topic.value || topics.includes(topic.value))
          && (!source.value || entry.dataset.source === source.value)
          && (!query || normalize(entry.dataset.search + ' ' + topics.join(' ')).includes(query));
        entry.hidden = !visible;
        if (visible) count++;
      });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.kindFilter === kind)));
      const active = Boolean(query || topic.value || source.value || kind !== 'All');
      archive.querySelector('#writing-count').textContent = active ? `${count} of ${entries.length} entries` : `${count} entries, newest first`;
      archive.querySelector('.writing-empty').hidden = count > 0;
      clears[0].hidden = !active;
      const next = new URL(location.href);
      ['q', 'topic', 'source', 'kind'].forEach(key => next.searchParams.delete(key));
      if (query) next.searchParams.set('q', search.value.trim());
      if (topic.value) next.searchParams.set('topic', topic.value);
      if (source.value) next.searchParams.set('source', source.value);
      if (kind !== 'All') next.searchParams.set('kind', kind);
      history.replaceState(null, '', next);
    }
    buttons.forEach(button => button.addEventListener('click', () => { kind = button.dataset.kindFilter; filter(); }));
    let timer;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(filter, 150); });
    [topic, source].forEach(control => control.addEventListener('change', filter));
    clears.forEach(button => button.addEventListener('click', () => { clearTimeout(timer); search.value = ''; topic.value = ''; source.value = ''; kind = 'All'; filter(); search.focus(); }));
    archive.querySelector('.writing-controls').hidden = false;
    filter();
  }
  const content = document.querySelector('#article-content');
  if (content) {
    const headings = [...content.querySelectorAll('h2,h3')];
    if (headings.length >= 3) {
      const list = document.querySelector('#reading-toc');
      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
        const item = document.createElement('li');
        if (heading.tagName === 'H3') item.className = 'toc-subheading';
        const link = document.createElement('a');
        link.href = '#' + encodeURIComponent(heading.id);
        link.textContent = heading.textContent;
        item.append(link); list.append(item);
      });
      document.querySelector('.reading-guide').hidden = false;
    }
  }
  const comments = document.querySelector('#load-comments');
  if (comments) {
    comments.hidden = false;
    comments.addEventListener('click', () => {
      comments.disabled = true;
      document.querySelector('#comments-status').textContent = 'Loading comments from Disqus…';
      window.disqus_config = function () {
        this.page.identifier = comments.dataset.identifier;
        this.page.url = comments.dataset.url;
        this.callbacks.onReady = [() => { document.querySelector('#comments-status').textContent = ''; comments.hidden = true; }];
      };
      const script = document.createElement('script');
      script.src = 'https://anuragjain67-github.disqus.com/embed.js';
      script.async = true;
      script.onerror = () => { document.querySelector('#comments-status').textContent = 'Comments could not load. Please try again.'; comments.disabled = false; };
      document.head.append(script);
    });
  }
})();
