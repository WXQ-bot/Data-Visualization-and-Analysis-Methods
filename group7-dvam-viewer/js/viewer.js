document.addEventListener('DOMContentLoaded', () => {
  // 展开/折叠研究要点
  document.querySelectorAll('.toggle-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.target);
      if (!target) return;
      target.hidden = !target.hidden;
      btn.textContent = target.hidden ? '展开/折叠完整研究要点' : '收起完整研究要点';
    });
  });

  // PDF 卡片点击：在 iframe 中预览
  const cards = Array.from(document.querySelectorAll('.card-item'));
  const frame = document.getElementById('pdf-frame');
  const previewTitle = document.getElementById('preview-title');
  const openNewTab = document.getElementById('open-new-tab');
  const downloadCurrent = document.getElementById('download-current');

  function setPreview(src, title) {
    frame.src = src;
    previewTitle.textContent = title || '文档预览';
    openNewTab.href = src;
    downloadCurrent.href = src;
    openNewTab.style.display = src ? 'inline-block' : 'none';
    downloadCurrent.style.display = src ? 'inline-block' : 'none';
  }

  cards.forEach(c => {
    const btn = c.querySelector('.view-pdf');
    if (btn) btn.addEventListener('click', () => {
      const src = c.dataset.src;
      const title = c.dataset.title || c.querySelector('.card-meta strong').textContent;
      setPreview(src, title);
      document.getElementById('pdf-frame').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // PDF 搜索/过滤
  const pdfSearch = document.getElementById('pdf-search');
  pdfSearch.addEventListener('input', () => {
    const q = pdfSearch.value.trim().toLowerCase();
    cards.forEach(c => {
      const title = (c.dataset.title || '').toLowerCase();
      c.style.display = title.indexOf(q) >= 0 ? '' : 'none';
    });
    // 更新 pdf 计数
    document.getElementById('stat-pdfs').textContent = cards.filter(c => c.style.display !== 'none').length;
  });

  // 标签过滤
  document.getElementById('tag-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.tag');
    if (!btn) return;
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.tag;
    cards.forEach(c => {
      if (tag === 'all') c.style.display = '';
      else {
        const tags = (c.dataset.tags || '').split(',').map(s => s.trim());
        c.style.display = tags.includes(tag) ? '' : 'none';
      }
    });
    document.getElementById('stat-pdfs').textContent = cards.filter(c => c.style.display !== 'none').length;
  });

  // 图片画廊：lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  document.querySelectorAll('.thumb img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.dataset.full || img.src;
      lbCaption.textContent = img.alt || img.closest('figure').querySelector('figcaption')?.textContent || '';
      lightbox.hidden = false;
      lightbox.style.display = 'flex';
    });
  });
  document.getElementById('lb-close').addEventListener('click', () => {
    lightbox.hidden = true;
    lbImg.src = '';
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.hidden = true; lbImg.src=''; } });

  // 页面内快速打开研究摘要
  document.getElementById('open-overview').addEventListener('click', () => {
    document.getElementById('overview').scrollIntoView({behavior:'smooth'});
  });

  // ---- 新增：导航栏默认隐藏，仅在靠近顶部或向上滚动时显示 ----
  (function headerToggleByWheelAndScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const TOP_SHOW = 120; // 靠近顶部时始终显示（px）
    let lastScroll = 0;

    function getScrollY() {
      return document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    // 初始状态：根据当前滚动位置决定是否隐藏（在顶部应可见）
    const initY = getScrollY();
    lastScroll = initY;
    if (initY <= TOP_SHOW) header.classList.remove('hidden');
    else header.classList.add('hidden');

    function onWheel(e) {
      // 兼容 wheel / mousewheel（wheelDelta 为正表示向上）
      const delta = (typeof e.wheelDelta !== 'undefined') ? e.wheelDelta : -e.deltaY;
      const y = getScrollY();

      // 靠近顶部始终显示
      if (y <= TOP_SHOW) {
        header.classList.remove('hidden');
        return;
      }

      if (delta > 0) {
        // 向上滚：显示（且页面未在顶端）
        if (y > 0) header.classList.remove('hidden');
      } else if (delta < 0) {
        // 向下滚：隐藏
        header.classList.add('hidden');
      }
    }

    function onScroll() {
      const y = getScrollY();
      // 靠近顶部始终显示
      if (y <= TOP_SHOW) {
        header.classList.remove('hidden');
      } else {
        // 基于滚动方向决定显示/隐藏（向上显示，向下隐藏）
        if (y < lastScroll) header.classList.remove('hidden');
        else if (y > lastScroll) header.classList.add('hidden');
      }
      lastScroll = y;
    }

    // 绑定事件（兼容不同浏览器事件名）
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('mousewheel', onWheel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
  // ---- 结束新增 ----

  // 改为：拦截所有带 download 的 PDF 链接，优先 fetch -> Blob 下载；失败时回退为直接创建带 download 属性的临时 <a> 并触发点击（不在新标签打开）
  document.addEventListener('click', async (evt) => {
    const a = evt.target.closest('a[download]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.toLowerCase().endsWith('.pdf')) return;

    evt.preventDefault(); // 阻止默认行为（避免在新标签打开）
    const suggestedName = (a.getAttribute('download') || '').trim() || href.split('/').pop();

    try {
      const resp = await fetch(href);
      if (!resp.ok) throw new Error('网络错误：' + resp.status);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const tmp = document.createElement('a');
      tmp.href = blobUrl;
      tmp.download = suggestedName;
      document.body.appendChild(tmp);
      tmp.click();
      tmp.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      // 兜底：创建带 download 的临时链接并触发点击（尽量强制下载，不打开新标签）
      const tmp = document.createElement('a');
      tmp.href = href;
      tmp.download = suggestedName;
      tmp.style.display = 'none';
      document.body.appendChild(tmp);
      tmp.click();
      tmp.remove();
    }
  }, { passive: false });

  // 初始预设 preview & 计数
  const visibleCards = cards.filter(c => c.style.display !== 'none');
  const first = visibleCards[0] || cards[0];
  if (first) setPreview(first.dataset.src, first.dataset.title);

  document.getElementById('stat-pdfs').textContent = cards.length;
  document.getElementById('stat-images').textContent = document.querySelectorAll('.thumb').length;

  // 在 DOMContentLoaded 内（放在统计更新之后或末尾）
  (function assetsTableInteractions() {
    // 已移除搜索/分类与“复制名”功能；保留行 hover 交互（CSS 已定义）
    const rows = Array.from(document.querySelectorAll('.assets-list tbody tr'));
    rows.forEach(r => {
      r.addEventListener('mouseenter', () => r.classList.add('row-hover'));
      r.addEventListener('mouseleave', () => r.classList.remove('row-hover'));
    });
  })();
});