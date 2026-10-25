/* Buildless portfolio: content.js owns content; this file owns interactions. */
(() => {
    'use strict';

    const content = window.portfolioContent;
    if (!content || !Array.isArray(content.projects)) return;
    const projects = content.projects;
    const images = window.portfolioImages || {};
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const safeURL = value => {
        try {
            const url = new URL(value, location.href);
            return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : '';
        } catch { return ''; }
    };
    const imageURL = (path, size = 960) => {
        const variants = images[path]?.variants;
        return variants?.find(item => item.width >= size)?.src || variants?.at(-1)?.src || path;
    };
    function imageMarkup(path, alt, className = '', size = 960, lazy = true) {
        const data = images[path];
        const variants = data?.variants.filter((item, i, all) => all.findIndex(other => other.width === item.width) === i);
        const srcset = variants?.map(item => `${encodeURI(item.src)} ${item.width}w`).join(', ');
        return `<img class="${className}" src="${escapeHTML(safeURL(imageURL(path, size)))}"
            ${srcset ? `srcset="${escapeHTML(srcset)}" sizes="${size > 960 ? '(max-width: 920px) 100vw, 840px' : '(max-width: 768px) 88vw, (max-width: 1200px) 45vw, 560px'}"` : ''}
            width="${data?.width || 640}" height="${data?.height || 360}"
            alt="${escapeHTML(alt)}" loading="${lazy ? 'lazy' : 'eager'}" decoding="async">`;
    }

    // Images remain visible on cached loads, and failed loads have a readable fallback.
    document.addEventListener('load', event => {
        if (event.target instanceof HTMLImageElement) event.target.classList.add('loaded');
    }, true);
    document.addEventListener('error', event => {
        const img = event.target;
        if (!(img instanceof HTMLImageElement)) return;
        img.classList.add('loaded', 'image-error');
        if (img.id === 'lbImg') return;
        if (img.dataset.fallback) {
            const path = img.dataset.fallback;
            delete img.dataset.fallback;
            img.removeAttribute('srcset');
            img.src = path;
        }
    }, true);

    // Keep native button semantics, including Space and Enter activation.
    function createCard(project, index) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'project-card';
        card.dataset.project = index;
        card.dataset.category = project.category;
        card.setAttribute('aria-label', `查看 ${project.title} 详情`);
        card.setAttribute('aria-haspopup', 'dialog');
        const badges = [
            project.documents?.length ? '<span class="card-doc-badge">↗ DOC</span>' : '',
            project.videoUrl ? '<span class="card-video-badge">▷ VIDEO</span>' : ''
        ].join('');
        card.innerHTML = `<span class="card-img-wrap">
            ${imageMarkup(project.thumb, `${project.title} · ${project.category}`, 'card-img')}
            <span class="card-img-overlay"></span><span class="card-inner-glow"></span>
            <span class="card-badges">${badges}</span>
            </span><span class="card-info">
            <span class="card-category">${escapeHTML(project.category)}</span>
            <span class="card-title">${escapeHTML(project.title)}</span>
            <span class="card-desc">${escapeHTML(project.desc.split('\n')[0])}</span>
            <span class="card-cta">查看详情 <span class="arrow">↗</span></span></span>`;
        $('img', card).dataset.fallback = project.thumb;
        return card;
    }

    projects.forEach((project, index) => {
        if (project.featured) $('#projectsGrid').append(createCard(project, index));
        $('#allProjectsGrid').append(createCard(project, index));
    });
    const leadImage = $('#projectsGrid .project-card img');
    if (leadImage) leadImage.sizes = '(max-width: 768px) 88vw, (max-width: 1520px) 86vw, 1307px';
    const allCards = $$('#allProjectsGrid .project-card');
    const categories = ['全部', ...new Set(projects.map(project => project.category))];
    for (const category of categories) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn';
        button.textContent = category;
        button.dataset.filter = category;
        button.setAttribute('aria-pressed', String(category === '全部'));
        button.classList.toggle('active', category === '全部');
        $('#filterBar').append(button);
    }
    function filterProjects(category) {
        let count = 0;
        for (const card of allCards) {
            card.hidden = category !== '全部' && card.dataset.category !== category;
            if (!card.hidden) count++;
        }
        $$('#filterBar button').forEach(button => {
            const active = button.dataset.filter === category;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        $('#filterStatus').textContent = `${category} / ${count} 个作品`;
    }
    filterProjects('全部');
    $('#filterBar').addEventListener('click', event => {
        const button = event.target.closest('[data-filter]');
        if (button) filterProjects(button.dataset.filter);
    });
    for (const grid of [$('#projectsGrid'), $('#allProjectsGrid')]) {
        grid.addEventListener('click', event => {
            const card = event.target.closest('[data-project]');
            if (card) openDetail(Number(card.dataset.project), card);
        });
    }

    // Nested dialogs: only the topmost dialog is interactive; restore opener focus.
    const shell = $('#pageShell');
    const detail = $('#detailOverlay');
    const detailContent = $('#detailContent');
    const lightbox = $('#lightbox');
    let currentProject = 0;
    let detailOpener;
    let lightboxOpener;
    let gallery = [];
    let imageIndex = 0;
    let previousScroll = 0;

    function openDetail(index, opener) {
        const project = projects[index];
        if (!project) return;
        if (detail.hidden) {
            detailOpener = opener || document.activeElement;
            previousScroll = window.scrollY;
            document.body.style.top = `-${previousScroll}px`;
            document.body.classList.add('modal-open');
            shell.inert = true;
            $('#backTop').inert = true;
            $('.skip-link').inert = true;
        }
        currentProject = index;
        gallery = [...new Set([project.thumb, ...(project.gallery || [])].filter(Boolean))];
        const meta = (project.meta || []).map(item => `<div class="meta-item"><span class="meta-label">${escapeHTML(item.label)}</span><span class="meta-value">${escapeHTML(item.value)}</span></div>`).join('');
        const docs = (project.documents || []).map(doc => `<a class="doc-link" href="${escapeHTML(safeURL(doc.url))}" target="_blank" rel="noopener noreferrer">↗ ${escapeHTML(doc.name)} <span class="doc-type">${escapeHTML(doc.type.toUpperCase())}</span></a>`).join('');
        const prev = (index - 1 + projects.length) % projects.length;
        const next = (index + 1) % projects.length;
        detailContent.innerHTML = `
            <button type="button" class="gallery-trigger hero-trigger" data-image="0" aria-label="放大查看 ${escapeHTML(project.title)} 主图">${imageMarkup(project.thumb, `${project.title} 主图`, 'detail-hero-img', 1920, false)}<span class="image-hint">查看大图 ↗</span></button>
            <div class="detail-category">${escapeHTML(project.category)}</div>
            <h2 class="detail-title" id="detailTitle">${escapeHTML(project.title)}</h2>
            ${project.videoUrl ? `<a href="${escapeHTML(safeURL(project.videoUrl))}" target="_blank" rel="noopener noreferrer" class="detail-video-link">▷ 观看完整视频 ↗</a>` : ''}
            <p class="detail-desc">${escapeHTML(project.desc)}</p>
            ${meta ? `<div class="detail-meta">${meta}</div>` : ''}
            ${gallery.length > 1 ? `<div class="detail-gallery">${gallery.slice(1).map((path, i) => {
                const caption = project.galleryCaptions?.[path];
                return `<figure class="gallery-item"><button type="button" class="gallery-trigger" data-image="${i + 1}" aria-label="放大查看 ${escapeHTML(project.title)} · ${escapeHTML(caption || `第 ${i + 2} 张图片`)}">${imageMarkup(path, `${project.title} · ${caption || i + 2}`)}</button>${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''}</figure>`;
            }).join('')}</div>` : ''}
            ${docs ? `<div class="detail-doc-section"><h3>项目文档</h3><div class="doc-links">${docs}</div></div>` : ''}
            <div class="detail-nav">
                <button type="button" class="detail-nav-btn prev" data-next-project="${prev}"><span><span class="detail-nav-label">← 上一个作品</span><span class="detail-nav-title">${escapeHTML(projects[prev].title)}</span></span></button>
                <button type="button" class="detail-nav-btn next" data-next-project="${next}"><span><span class="detail-nav-label">下一个作品 →</span><span class="detail-nav-title">${escapeHTML(projects[next].title)}</span></span></button>
            </div>`;
        detail.hidden = false;
        detail.classList.add('show');
        detail.scrollTop = 0;
        $('.detail-close').focus({ preventScroll: true });
    }
    function closeDetail() {
        if (!lightbox.hidden) closeLightbox();
        detail.hidden = true;
        detail.classList.remove('show');
        shell.inert = false;
        $('#backTop').inert = false;
        $('.skip-link').inert = false;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo({ top: previousScroll, behavior: 'instant' });
        detailOpener?.focus({ preventScroll: true });
    }
    function showImage() {
        const path = gallery[imageIndex];
        if (!path) return;
        const img = $('#lbImg');
        $('#imageStatus').textContent = '图片加载中…';
        img.classList.remove('image-error');
        img.onload = () => { $('#imageStatus').textContent = ''; };
        img.onerror = () => { $('#imageStatus').textContent = '图片暂时无法加载，可尝试查看原图。'; };
        img.src = imageURL(path, 1920);
        const project = projects[currentProject];
        const caption = project.galleryCaptions?.[path];
        img.alt = `${project.title} · ${caption || `${imageIndex + 1} / ${gallery.length}`}`;
        $('#originalImage').href = safeURL(path);
        $('#lbCounter').textContent = `${imageIndex + 1} / ${gallery.length}`;
        $$('.lb-nav button').forEach(button => { button.disabled = gallery.length < 2; });
    }
    function openLightbox(index, opener) {
        imageIndex = index;
        lightboxOpener = opener;
        detail.inert = true;
        lightbox.hidden = false;
        lightbox.classList.add('show');
        showImage();
        $('.lb-close').focus();
    }
    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.classList.remove('show');
        detail.inert = false;
        lightboxOpener?.focus({ preventScroll: true });
    }
    function stepImage(delta) {
        if (!gallery.length) return;
        imageIndex = (imageIndex + delta + gallery.length) % gallery.length;
        showImage();
    }
    detailContent.addEventListener('click', event => {
        const imageButton = event.target.closest('[data-image]');
        const navButton = event.target.closest('[data-next-project]');
        if (imageButton) openLightbox(Number(imageButton.dataset.image), imageButton);
        if (navButton) openDetail(Number(navButton.dataset.nextProject));
    });
    $('.detail-close').addEventListener('click', closeDetail);
    $('.lb-close').addEventListener('click', closeLightbox);
    $$('.lb-nav button').forEach((button, index) => button.addEventListener('click', () => stepImage(index ? 1 : -1)));
    detail.addEventListener('click', event => { if (event.target === detail) closeDetail(); });
    lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', event => {
        const dialog = !lightbox.hidden ? lightbox : !detail.hidden ? detail : null;
        if (!dialog) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            dialog === lightbox ? closeLightbox() : closeDetail();
        }
        if (dialog === lightbox && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            stepImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
        if (event.key === 'Tab') {
            const focusable = $$('button:not(:disabled), a[href], [tabindex="0"]', dialog).filter(el => el.getClientRects().length);
            const first = focusable[0], last = focusable.at(-1);
            if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
                event.preventDefault(); last?.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault(); first?.focus();
            }
        }
    });
    let touchStart;
    lightbox.addEventListener('touchstart', event => {
        touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    lightbox.addEventListener('touchend', event => {
        if (!touchStart || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) stepImage(dx < 0 ? 1 : -1);
        touchStart = null;
    }, { passive: true });

    // Navigation and a single scroll update per paint.
    const menuToggle = $('#menuToggle');
    function setMenu(open) {
        menuToggle.setAttribute('aria-expanded', String(open));
        $('#navLinks').classList.toggle('open', open);
    }
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    $('#navLinks').addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('click', event => { if (!$('#mainNav').contains(event.target)) setMenu(false); });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); menuToggle.focus(); }
    });
    $('.more-projects-btn').addEventListener('click', () => $('#all-projects').scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth' }));
    $('#backTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: motionQuery.matches ? 'instant' : 'smooth' }));
    let scrollPending = false;
    const sections = $$('main > section[id]');
    const navLinks = $$('#navLinks a[href^="#"]');
    function updateScroll() {
        if (detail.hidden) {
            const y = window.scrollY;
            const height = document.documentElement.scrollHeight - innerHeight;
            $('#mainNav').classList.toggle('scrolled', y > 60);
            $('#backTop').classList.toggle('show', y > 600);
            $('#backTop').tabIndex = y > 600 ? 0 : -1;
            $('#scrollProgress').style.transform = `scaleX(${height > 0 ? Math.min(y / height, 1) : 0})`;
            let current = '';
            for (const section of sections) if (section.getBoundingClientRect().top <= 160) current = section.id;
            if (current === 'all-projects') current = 'projects';
            navLinks.forEach(link => {
                if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }
        scrollPending = false;
    }
    function scheduleScroll() {
        if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
    }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    updateScroll();

    // Observe once; never poll every card or schedule repeated reveal timers on scroll.
    $$('.counter-item').forEach((item, index) => {
        const counter = content.counters[index];
        if (!counter) return;
        $('.counter-num', item).textContent = `${counter.target.toLocaleString()}+`;
        $('.counter-label', item).textContent = counter.label;
    });
    if ('IntersectionObserver' in window && !motionQuery.matches) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('will-reveal');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -24px 0px', threshold: 0.05 });
        $$('.reveal, .project-card').forEach(element => {
            element.classList.add('will-reveal');
            observer.observe(element);
        });
        motionQuery.addEventListener('change', event => {
            if (event.matches) { $$('.will-reveal').forEach(el => el.classList.remove('will-reveal')); observer.disconnect(); }
        });
    }

    // Contact feedback is shared by pointer and keyboard interactions.
    let toastTimer;
    function toast(message) {
        const element = $('#toast');
        element.textContent = message;
        element.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { element.hidden = true; }, 3500);
    }
    async function copyText(value) {
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(value);
            toast(`已复制：${value}`);
        } catch {
            const input = document.createElement('textarea');
            const previousFocus = document.activeElement;
            input.value = value;
            input.className = 'clipboard-fallback';
            document.body.append(input);
            input.select();
            let copied = false;
            try { copied = document.execCommand('copy'); } catch { /* Show manual fallback below. */ }
            input.remove();
            previousFocus?.focus({ preventScroll: true });
            toast(copied ? `已复制：${value}` : `无法自动复制，请长按或选中文字：${value}`);
        }
    }
    $$('[data-copy]').forEach(button => button.addEventListener('click', () => copyText(button.dataset.copy)));

    const timeFormat = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });
    let clockTimer;
    function updateClock() {
        const time = timeFormat.format(new Date());
        const hour = Number(time.split(':')[0]);
        $('#clockTime').textContent = time;
        $('#clockGreeting').textContent = `${hour >= 5 && hour < 12 ? '早上好' : hour >= 12 && hour < 18 ? '下午好' : '晚上好'} · 北京时间`;
    }
    function syncClock() {
        clearInterval(clockTimer);
        if (!document.hidden) { updateClock(); clockTimer = setInterval(updateClock, 1000); }
    }
    syncClock();
    $('#copyrightYear').textContent = new Date().getFullYear();
    document.addEventListener('visibilitychange', syncClock);

    // Load the email SDK only after a valid user submission, never during first paint.
    let emailSDK;
    function loadEmailSDK() {
        if (window.emailjs) return Promise.resolve(window.emailjs);
        if (!emailSDK) {
            emailSDK = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                let timer;
                const fail = () => {
                    clearTimeout(timer);
                    script.remove();
                    emailSDK = undefined;
                    reject(new Error('邮件服务暂时无法连接，请稍后重试或使用邮件客户端。'));
                };
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
                script.async = true;
                script.onload = () => {
                    clearTimeout(timer);
                    if (window.emailjs) resolve(window.emailjs);
                    else fail();
                };
                script.onerror = fail;
                timer = setTimeout(fail, 12000);
                document.head.append(script);
            });
        }
        return emailSDK;
    }
    const form = $('#contactForm');
    let sending = false;
    $('button[type="submit"]', form).disabled = false;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending || !form.reportValidity() || $('#companyWebsite').value) return;
        if ($('#contactMessage').value.replace(/\s/g, '').length < 10) {
            $('#formStatus').textContent = '请填写至少 10 个非空白字符的消息内容。';
            $('#contactMessage').focus();
            return;
        }
        if (!$('#contactSubject').value.trim()) {
            $('#formStatus').textContent = '请填写消息主题。';
            $('#contactSubject').focus();
            return;
        }
        sending = true;
        const button = $('button[type="submit"]', form);
        button.disabled = true;
        button.textContent = '正在发送…';
        form.setAttribute('aria-busy', 'true');
        $('#formStatus').textContent = '正在连接邮件服务，请稍候…';
        const config = content.emailService;
        const fields = $$('#contactEmail, #contactSubject, #contactMessage');
        // Snapshot before awaiting network so later edits cannot change this submission.
        const payload = {
            user_email: $('#contactEmail').value.trim(),
            subject: $('#contactSubject').value.trim(),
            message: `${$('#contactMessage').value.trim()}\n\n回复邮箱：${$('#contactEmail').value.trim()}`
        };
        fields.forEach(field => { field.readOnly = true; });
        let sendTimer;
        try {
            const sdk = await loadEmailSDK();
            sdk.init(config.publicKey);
            await Promise.race([
                sdk.send(config.serviceId, config.templateId, payload),
                new Promise((_, reject) => {
                    sendTimer = setTimeout(() => reject(new Error('发送结果尚未确认，内容已保留。请勿立即重复发送，可通过邮件客户端联系我。')), 20000);
                })
            ]);
            $('#formStatus').textContent = '消息已发送，谢谢你的联系！';
            form.reset();
        } catch (error) {
            $('#formStatus').textContent = error instanceof Error ? error.message : '发送未成功，内容已保留。请稍后重试，或使用下方邮件客户端链接。';
        } finally {
            clearTimeout(sendTimer);
            sending = false;
            button.disabled = false;
            button.textContent = '发送消息 ↗';
            form.removeAttribute('aria-busy');
            fields.forEach(field => { field.readOnly = false; });
        }
    });
})();
