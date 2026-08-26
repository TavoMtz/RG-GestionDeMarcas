/* ============================================================
 * Blog público — RG Gestión de Marcas
 * Maneja el listado y la vista individual de posts.
 * Lee de Supabase vía claves públicas (anon) — la seguridad se
 * aplica con Row Level Security.
 * ============================================================ */

(function () {
  'use strict';

  const cfg = window.BLOG_CONFIG || {};
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  /* ---------- Helpers ---------- */
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k]; // controlado
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      children.forEach(function (c) { node.appendChild(c); });
    }
    return node;
  }

  function markdownToPlainText(md, maxLen) {
    if (!window.marked || !window.DOMPurify) return '';
    let text = '';
    try {
      const rawHtml = window.marked.parse(md || '', { breaks: true, gfm: true });
      const safeHtml = window.DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
      const tmp = document.createElement('div');
      tmp.innerHTML = safeHtml;
      text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    } catch (e) {
      return '';
    }
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + '…';
  }

  /* ---------- Estado UI (loading / empty / error con acción) ---------- */
  function setState(stateEl, kind, message, action) {
    if (!stateEl) return;
    stateEl.innerHTML = '';
    stateEl.className = 'blog-state blog-state--' + kind;
    const text = document.createElement('span');
    text.className = 'blog-state__text';
    text.textContent = message;
    stateEl.appendChild(text);
    if (action && action.label && typeof action.onClick === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'blog-state__action';
      btn.textContent = action.label;
      btn.addEventListener('click', action.onClick);
      stateEl.appendChild(btn);
    }
  }

  /* ---------- Renderizado: lista de posts ---------- */
  async function renderList() {
    const container = document.getElementById('blogGrid');
    const featuredEl = document.getElementById('blogFeatured');
    const stateEl = document.getElementById('blogState');
    const filterSelect = document.getElementById('blogTagFilter');
    if (!container || !featuredEl || !stateEl) return;

    setState(stateEl, 'loading', 'Cargando publicaciones…');

    const postsRes = await sb.from('posts')
      .select('id, title, slug, excerpt, cover_image, content_md, created_at, tags:post_tags(tags(id,name,slug))')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (postsRes.error) {
      setState(stateEl, 'error',
        'No se pudieron cargar las publicaciones. Intenta de nuevo más tarde.',
        { label: 'Reintentar', onClick: function () { renderList(); } }
      );
      return;
    }

    const posts = postsRes.data || [];

    // Etiquetas únicas existentes en los posts publicados
    const uniqueTags = new Map();
    posts.forEach(p => {
      (p.tags || []).forEach(t => {
        if (t.tags && t.tags.slug && t.tags.name && !uniqueTags.has(t.tags.slug)) {
          uniqueTags.set(t.tags.slug, t.tags.name);
        }
      });
    });
    const sortedTags = Array.from(uniqueTags.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    // Poblar el select
    if (filterSelect) {
      while (filterSelect.options.length > 1) {
        filterSelect.remove(1);
      }
      sortedTags.forEach(({ slug, name }) => {
        const opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = '#' + name;
        filterSelect.appendChild(opt);
      });
      filterSelect.value = '';
    }

    const applyFilter = function () {
      const selected = filterSelect ? filterSelect.value : '';
      const filtered = selected
        ? posts.filter(p => (p.tags || []).some(t => t.tags && t.tags.slug === selected))
        : posts;
      draw(filtered);
    };

    function draw(postsToRender) {
      featuredEl.innerHTML = '';
      container.innerHTML = '';

      if (!postsToRender.length) {
        if (selectedHasFilter(filterSelect)) {
          setState(stateEl, 'empty',
            'No hay publicaciones con esta etiqueta.',
            { label: 'Limpiar filtro', onClick: function () {
                if (filterSelect) { filterSelect.value = ''; }
                draw(posts);
              } }
          );
        } else {
          setState(stateEl, 'empty', 'Aún no hay publicaciones. Vuelve pronto.');
        }
        return;
      }
      setState(stateEl, 'ready', '');

      const featured = postsToRender[0];
      const rest = postsToRender.slice(1);

      if (featured) {
        const featuredHref = './blog.html?slug=' + encodeURIComponent(featured.slug);
        const card = el('article', { class: 'blog-featured__card', 'data-slug': featured.slug });

        if (featured.cover_image) {
          card.appendChild(el('a', {
            class: 'blog-featured__cover-link',
            href: featuredHref,
            'aria-label': featured.title,
            'aria-hidden': 'true',
            tabindex: '-1'
          }, [
            el('div', {
              class: 'blog-featured__cover',
              style: 'background-image:url(' + featured.cover_image.replace(/"/g, '%22') + ')'
            })
          ]));
        } else {
          card.appendChild(el('a', {
            class: 'blog-featured__cover-link',
            href: featuredHref,
            'aria-hidden': 'true',
            tabindex: '-1'
          }, [el('div', { class: 'blog-featured__cover' })]));
        }

        const body = el('div', { class: 'blog-featured__body' });
        const meta = el('div', { class: 'blog-featured__meta' });
        meta.appendChild(el('span', { text: 'Destacado · ' + fmtDate(featured.created_at) }));
        body.appendChild(meta);

        body.appendChild(el('a', {
          class: 'blog-featured__title-link',
          href: featuredHref
        }, [el('h2', { class: 'blog-featured__title', text: featured.title })]));

        const snippet = markdownToPlainText(featured.content_md || '', 250);
        if (snippet) body.appendChild(el('p', { class: 'blog-featured__snippet', text: snippet }));

        if (featured.tags && featured.tags.length) {
          const tagsEl = el('div', { class: 'blog-featured__tags' });
          featured.tags.forEach(t => {
            if (t.tags) tagsEl.appendChild(el('span', { class: 'blog-featured__tag', text: '#' + t.tags.name }));
          });
          if (tagsEl.children.length) body.appendChild(tagsEl);
        }

        body.appendChild(el('a', {
          class: 'blog-featured__cta',
          href: featuredHref,
          text: 'Leer artículo →'
        }));

        card.appendChild(body);
        featuredEl.appendChild(card);
      }

      if (!rest.length) return;

      rest.forEach(p => {
        const postHref = './blog.html?slug=' + encodeURIComponent(p.slug);
        const card = el('article', { class: 'blog-card', 'data-slug': p.slug });

        if (p.cover_image) {
          card.appendChild(el('a', {
            class: 'blog-card__cover-link',
            href: postHref,
            'aria-label': p.title,
            'aria-hidden': 'true',
            tabindex: '-1'
          }, [
            el('div', {
              class: 'blog-card__cover',
              style: 'background-image:url(' + p.cover_image.replace(/"/g, '%22') + ')'
            })
          ]));
        } else {
          card.appendChild(el('a', {
            class: 'blog-card__cover-link',
            href: postHref,
            'aria-hidden': 'true',
            tabindex: '-1'
          }, [el('div', { class: 'blog-card__cover' })]));
        }

        const body = el('div', { class: 'blog-card__body' });
        const meta = el('div', { class: 'blog-card__meta' });
        meta.appendChild(el('span', { text: fmtDate(p.created_at) }));
        body.appendChild(meta);

        body.appendChild(el('a', {
          class: 'blog-card__title-link',
          href: postHref
        }, [el('h3', { class: 'blog-card__title', text: p.title })]));
        body.appendChild(el('p', { class: 'blog-card__excerpt', text: p.excerpt || '' }));

        if (p.tags && p.tags.length) {
          const tagsEl = el('div', { class: 'blog-card__tags' });
          p.tags.forEach(t => {
            if (t.tags) tagsEl.appendChild(el('span', { class: 'blog-card__tag', text: '#' + t.tags.name }));
          });
          if (tagsEl.children.length) body.appendChild(tagsEl);
        }

        const footer = el('div', { class: 'blog-card__footer' });
        footer.appendChild(el('span', { text: 'RG Gestión de Marcas' }));
        footer.appendChild(el('a', {
          class: 'blog-card__readmore',
          href: postHref,
          text: 'Leer →'
        }));
        body.appendChild(footer);

        card.appendChild(body);
        container.appendChild(card);
      });
    }

    function selectedHasFilter(sel) {
      return sel && sel.value && sel.value !== '';
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }
    draw(posts);
  }

  /* ---------- Renderizado: post individual ---------- */
  async function renderPost(slug) {
    const stateEl = document.getElementById('blogState');
    const listEl = document.getElementById('blogListView');
    const postEl = document.getElementById('blogPostView');
    const notFoundBanner = document.getElementById('blogNotFoundBanner');
    setState(stateEl, 'loading', 'Cargando publicación…');

    const res = await sb.from('posts')
      .select('id, title, slug, excerpt, content_md, cover_image, created_at, updated_at, tags:post_tags(tags(id,name,slug))')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (res.error || !res.data) {
      postEl.hidden = true;
      listEl.hidden = false;
      if (notFoundBanner) notFoundBanner.hidden = false;
      renderList();
      return;
    }

    document.title = res.data.title + ' | RG Blog';
    listEl.hidden = true;
    postEl.hidden = false;
    setState(stateEl, 'ready', '');

    if (res.data.cover_image) {
      const cover = el('img', {
        class: 'blog-post__cover',
        src: res.data.cover_image,
        alt: '',
        loading: 'lazy',
        decoding: 'async'
      });
      cover.addEventListener('error', function () {
        cover.style.display = 'none';
      });
      postEl.appendChild(cover);
    }

    const meta = el('div', { class: 'blog-post__meta' });
    meta.appendChild(el('span', { text: fmtDate(res.data.created_at) }));
    if (res.data.updated_at && res.data.updated_at !== res.data.created_at) {
      meta.appendChild(el('span', { text: 'Actualizado ' + fmtDate(res.data.updated_at) }));
    }
    postEl.appendChild(meta);

    postEl.appendChild(el('h1', { class: 'blog-post__title', text: res.data.title }));

    if (res.data.excerpt) {
      postEl.appendChild(el('p', { class: 'blog-post__excerpt', text: res.data.excerpt }));
    }

    // Markdown → DOMPurify (sanitización obligatoria anti-XSS)
    let safeHtml = '';
    if (window.marked && window.DOMPurify) {
      try {
        const rawHtml = window.marked.parse(res.data.content_md || '', { breaks: true, gfm: true });
        safeHtml = window.DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
      } catch (e) {
        safeHtml = '';
      }
    }
    const content = el('div', { class: 'blog-post__content' });
    if (safeHtml) {
      content.innerHTML = safeHtml;
    } else {
      setState(stateEl, 'error',
        'No se pudo renderizar el contenido del artículo.',
        { label: 'Reintentar', onClick: function () { renderPost(slug); } }
      );
    }
    postEl.appendChild(content);

    if (res.data.tags && res.data.tags.length) {
      const tagsEl = el('div', { class: 'blog-post__tags' });
      res.data.tags.forEach(t => {
        if (t.tags) tagsEl.appendChild(el('span', { class: 'blog-post__tag', text: '#' + t.tags.name }));
      });
      if (tagsEl.children.length) postEl.appendChild(tagsEl);
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById('blogPostBack');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = './blog.html';
        }
      });
    }

    const slug = getParam('slug');
    if (slug) {
      renderPost(slug);
    } else {
      document.getElementById('blogListView').hidden = false;
      renderList();
    }
  });
})();
