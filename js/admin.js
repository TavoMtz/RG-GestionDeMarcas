/* ============================================================
 * Admin del Blog — RG Gestión de Marcas
 * Autenticación, CRUD de posts, gestión de tags,
 * subida de portada al bucket "blog-covers". Seguridad vía RLS.
 * ============================================================ */

(function () {
  'use strict';

  const cfg = window.BLOG_CONFIG || {};
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.sessionStorage
    }
  });

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

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) children.forEach(c => node.appendChild(c));
    return node;
  }

  function showNotice(text, type) {
    const n = document.getElementById('adminNotice');
    if (!n) return;
    n.textContent = text;
    n.className = 'admin-notice is-visible admin-notice--' + (type || 'success');
    clearTimeout(showNotice._t);
    showNotice._t = setTimeout(() => { n.classList.remove('is-visible'); }, 4500);
  }

  /* ---------- Login ---------- */
  function showLogin() {
    document.getElementById('adminLogin').hidden = false;
    document.getElementById('adminApp').hidden = true;
    document.getElementById('adminPasswordChange').hidden = true;
  }

  function showApp(user) {
    document.getElementById('adminLogin').hidden = true;
    document.getElementById('adminApp').hidden = false;
    document.getElementById('adminPasswordChange').hidden = true;
    document.getElementById('adminUserEmail').textContent = user.email || '';
    initEditor();
    loadPosts();
  }

  async function handleLogin(ev) {
    ev.preventDefault();
    const errEl = document.getElementById('adminLoginError');
    errEl.classList.remove('is-visible');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    const { error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    btn.textContent = 'Entrar';
    if (error) {
      errEl.textContent = 'No fue posible iniciar sesión. Verifica tus credenciales.';
      errEl.classList.add('is-visible');
    }
  }

  async function handleLogout() {
    await sb.auth.signOut();
    showLogin();
  }

  /* ---------- Cambio de contraseña obligatorio (primer inicio) ---------- */
  function passwordNeedsChange(user) {
    return !!(user && user.user_metadata && user.user_metadata.must_change_password);
  }

  function showPasswordChange(user) {
    document.getElementById('adminLogin').hidden = true;
    document.getElementById('adminApp').hidden = true;
    document.getElementById('adminPasswordChange').hidden = false;
    document.getElementById('passwordChangeEmail').textContent = user.email || '';
    const errEl = document.getElementById('passwordChangeError');
    errEl.classList.remove('is-visible');
    errEl.textContent = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    const btn = document.getElementById('passwordChangeBtn');
    const logoutBtn = document.getElementById('passwordChangeLogoutBtn');
    btn.disabled = false;
    logoutBtn.disabled = false;
    btn.textContent = 'Guardar y continuar';
  }

  async function handlePasswordChange(ev) {
    ev.preventDefault();
    const errEl = document.getElementById('passwordChangeError');
    errEl.classList.remove('is-visible');
    errEl.textContent = '';
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    const btn = document.getElementById('passwordChangeBtn');
    const logoutBtn = document.getElementById('passwordChangeLogoutBtn');
    const originalText = btn.textContent;

    if (typeof newPwd !== 'string' || newPwd.length < 8) {
      errEl.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
      errEl.classList.add('is-visible');
      return;
    }
    if (newPwd !== confirmPwd) {
      errEl.textContent = 'Las contraseñas no coinciden.';
      errEl.classList.add('is-visible');
      return;
    }

    btn.disabled = true;
    logoutBtn.disabled = true;
    btn.textContent = 'Guardando…';
    try {
      const { data, error } = await sb.auth.updateUser({
        password: newPwd,
        data: { must_change_password: false }
      });
      if (error) throw error;
      let updated = data && data.user;
      if (!updated) {
        const { data: ref } = await sb.auth.getUser();
        updated = ref && ref.user;
      }
      if (!updated) throw new Error('No se pudo obtener la sesión actualizada.');
      showApp(updated);
    } catch (e) {
      errEl.textContent = 'No fue posible actualizar la contraseña. '
        + (e && e.message ? e.message : '');
      errEl.classList.add('is-visible');
      btn.disabled = false;
      logoutBtn.disabled = false;
      btn.textContent = originalText;
    }
  }

  /* ---------- Tags ---------- */
  async function loadTags() {
    const { data } = await sb.from('tags').select('id, name, slug').order('name');
    return data || [];
  }

  async function upsertTagsByNames(names) {
    const cleaned = Array.from(new Set(names.map(s => s.trim()).filter(Boolean)));
    if (!cleaned.length) return [];
    const rows = cleaned.map(name => ({ name, slug: slugify(name) }));
    const { data } = await sb.from('tags').upsert(rows, { onConflict: 'slug' }).select();
    return data || [];
  }

  /* ---------- Editor ---------- */
  let editingId = null;
  let coverFile = null;
  let editorInitialized = false;

  function initEditor() {
    if (editorInitialized) return;
    editorInitialized = true;

    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    titleInput.addEventListener('input', () => {
      if (!editingId) slugInput.value = slugify(titleInput.value);
    });

    document.getElementById('postNewBtn').addEventListener('click', () => resetEditor());
    document.getElementById('postForm').addEventListener('submit', handleSavePost);
    document.getElementById('postCancelBtn').addEventListener('click', resetEditor);
    document.getElementById('postDeleteBtn').addEventListener('click', handleDeletePost);

    document.getElementById('postCoverFile').addEventListener('change', (ev) => {
      coverFile = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
      const prev = document.getElementById('postCoverPreview');
      prev.innerHTML = '';
      if (coverFile) {
        const img = el('img', { src: URL.createObjectURL(coverFile), alt: 'Vista previa' });
        prev.appendChild(img);
      }
    });

    resetEditor();
  }

  function resetEditor() {
    editingId = null;
    coverFile = null;
    document.getElementById('postEditorTitle').textContent = 'Nuevo post';
    document.getElementById('postTitle').value = '';
    document.getElementById('postSlug').value = '';
    document.getElementById('postExcerpt').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postCoverUrl').value = '';
    document.getElementById('postStatus').value = 'draft';
    document.getElementById('postTags').value = '';
    document.getElementById('postCoverFile').value = '';
    document.getElementById('postCoverPreview').innerHTML = '';
    document.getElementById('postDeleteBtn').hidden = true;
  }

  async function loadPostIntoEditor(postId) {
    const { data: p, error } = await sb.from('posts')
      .select('id, title, slug, excerpt, content_md, cover_image, status, tags:post_tags(tags(id,name))')
      .eq('id', postId).single();

    if (error || !p) { showNotice('No se pudo cargar el post.', 'error'); return; }

    editingId = p.id;
    document.getElementById('postEditorTitle').textContent = 'Editar post';
    document.getElementById('postTitle').value = p.title || '';
    document.getElementById('postSlug').value = p.slug || '';
    document.getElementById('postExcerpt').value = p.excerpt || '';
    document.getElementById('postContent').value = p.content_md || '';
    document.getElementById('postCoverUrl').value = p.cover_image || '';
    document.getElementById('postStatus').value = p.status || 'draft';
    document.getElementById('postTags').value = (p.tags || []).map(t => t.name).join(', ');
    document.getElementById('postDeleteBtn').hidden = false;

    const prev = document.getElementById('postCoverPreview');
    prev.innerHTML = '';
    if (p.cover_image) prev.appendChild(el('img', { src: p.cover_image, alt: p.title }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSavePost(ev) {
    ev.preventDefault();

    const saveBtn = document.getElementById('postSaveBtn');
    saveBtn.disabled = true;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Guardando…';

    try {
      const { data: userData } = await sb.auth.getUser();
      const userId = userData && userData.user ? userData.user.id : null;

      const title = document.getElementById('postTitle').value.trim();
      const slugRaw = document.getElementById('postSlug').value.trim();
      const slug = slugRaw || slugify(title);
      const excerpt = document.getElementById('postExcerpt').value.trim();
      const content_md = document.getElementById('postContent').value.trim();
      const status = document.getElementById('postStatus').value;
      const tagsRaw = document.getElementById('postTags').value;
      const explicitCoverUrl = document.getElementById('postCoverUrl').value.trim();

      if (!title || !slug || !content_md) {
        showNotice('Título, slug y contenido son obligatorios.', 'error');
        saveBtn.disabled = false; saveBtn.textContent = originalText; return;
      }

      let cover_image = explicitCoverUrl || null;
      if (coverFile) {
        const safeName = slug + '-' + Date.now() + '-' + coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = 'covers/' + safeName;
        const { error: upErr } = await sb.storage.from('blog-covers').upload(path, coverFile, {
          cacheControl: '3600', upsert: false
        });
        if (upErr) {
          showNotice('No se pudo subir la portada: ' + upErr.message, 'error');
          saveBtn.disabled = false; saveBtn.textContent = originalText; return;
        }
        const { data: pub } = sb.storage.from('blog-covers').getPublicUrl(path);
        cover_image = pub.publicUrl;
      }

      const payload = {
        title, slug, excerpt, content_md, cover_image, status,
        author_id: userId
      };

      let savedId = editingId;
      if (editingId) {
        const { error } = await sb.from('posts').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await sb.from('posts').insert(payload).select('id').single();
        if (error) throw error;
        savedId = data.id;
      }

      const tagNames = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const tagRows = await upsertTagsByNames(tagNames);
      await sb.from('post_tags').delete().eq('post_id', savedId);
      if (tagRows.length) {
        await sb.from('post_tags').insert(tagRows.map(t => ({ post_id: savedId, tag_id: t.id })));
      }

      showNotice(editingId ? 'Post actualizado.' : 'Post creado.', 'success');
      resetEditor();
      loadPosts();
    } catch (e) {
      showNotice('Error: ' + (e.message || 'intenta de nuevo'), 'error');
    } finally {
      saveBtn.disabled = false; saveBtn.textContent = originalText;
    }
  }

  async function handleDeletePost() {
    if (!editingId) return;
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return;
    const { error } = await sb.from('posts').delete().eq('id', editingId);
    if (error) { showNotice('No se pudo eliminar.', 'error'); return; }
    showNotice('Post eliminado.', 'success');
    resetEditor();
    loadPosts();
  }

  /* ---------- Listado de posts (admin) ---------- */
  async function loadPosts() {
    const list = document.getElementById('adminPostsList');
    list.innerHTML = '';
    const { data, error } = await sb.from('posts')
      .select('id, title, slug, status, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      list.appendChild(el('div', { class: 'admin-post-row', text: 'Error al cargar los posts.' }));
      return;
    }
    if (!data || !data.length) {
      list.appendChild(el('div', { class: 'admin-post-row', text: 'Aún no hay posts. Crea el primero desde el formulario de arriba.' }));
      return;
    }
    data.forEach(p => {
      const row = el('div', { class: 'admin-post-row' });
      const info = el('div', { style: 'flex:1;min-width:0' });
      info.appendChild(el('div', { class: 'admin-post-row__title', text: p.title }));
      const meta = el('div', { class: 'admin-post-row__meta' });
      const status = el('span', {
        class: 'admin-post-row__status admin-post-row__status--' + p.status,
        text: p.status === 'published' ? 'Publicado' : 'Borrador'
      });
      meta.appendChild(status);
      meta.appendChild(el('span', { text: '/blog/' + p.slug }));
      meta.appendChild(el('span', { text: 'Editado ' + fmtDate(p.updated_at || p.created_at) }));
      info.appendChild(meta);
      row.appendChild(info);

      const actions = el('div', { class: 'admin-post-row__actions' });
      const editBtn = el('button', { class: 'admin-btn admin-btn--ghost', text: 'Editar' });
      editBtn.addEventListener('click', () => loadPostIntoEditor(p.id));
      actions.appendChild(editBtn);

      const viewBtn = el('a', {
        class: 'admin-btn admin-btn--ghost',
        text: 'Ver',
        href: './blog.html?slug=' + encodeURIComponent(p.slug),
        target: '_blank'
      });
      actions.appendChild(viewBtn);

      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    const pwChangeForm = document.getElementById('passwordChangeForm');
    const pwChangeLogoutBtn = document.getElementById('passwordChangeLogoutBtn');
    if (pwChangeForm) pwChangeForm.addEventListener('submit', handlePasswordChange);
    if (pwChangeLogoutBtn) pwChangeLogoutBtn.addEventListener('click', handleLogout);

    const passwordInput = document.getElementById('loginPassword');
    const toggleBtn = document.getElementById('togglePassword');
    const toggleIcon = toggleBtn ? toggleBtn.querySelector('i') : null;
    if (toggleBtn && passwordInput && toggleIcon) {
      toggleBtn.addEventListener('click', function () {
        const showing = passwordInput.type === 'text';
        passwordInput.type = showing ? 'password' : 'text';
        toggleIcon.classList.toggle('fa-eye-slash', showing);
        toggleIcon.classList.toggle('fa-eye', !showing);
        toggleBtn.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
    }

    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session && session.user) {
          if (passwordNeedsChange(session.user)) showPasswordChange(session.user);
          else showApp(session.user);
        } else {
          showLogin();
        }
      } else if (event === 'SIGNED_OUT') {
        showLogin();
      }
    });
  });
})();
