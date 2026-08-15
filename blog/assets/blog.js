(function (global) {
  const COPY = {
    ja: {
      all: "すべて",
      search: "記事を検索",
      empty: "該当する記事がありません。",
      loadError: "記事一覧を読み込めませんでした。",
      missing: "記事が見つかりません。",
      back: "ブログ一覧へ",
      prev: "前の記事",
      next: "次の記事",
      minRead: "分で読める",
      medicalNote: "本記事は手法・評価のメモであり、診断・治療の判断には使用できません。"
    },
    en: {
      all: "All",
      search: "Search posts",
      empty: "No matching posts.",
      loadError: "Could not load the post index.",
      missing: "This post was not found.",
      back: "Back to blog",
      prev: "Previous",
      next: "Next",
      minRead: "min read",
      medicalNote: "This is a methods and evaluation note. It is not for diagnosis or treatment."
    }
  };

  const PINNED_TAGS = ["Medical", "LLM", "RAG", "Training", "Evaluation", "Bioinformatics"];

  function t(lang, key) {
    return (COPY[lang] || COPY.ja)[key];
  }

  function formatDate(iso, lang) {
    const [y, m, d] = iso.split("-");
    return lang === "en" ? `${y}.${m}.${d}` : `${y}.${m}.${d}`;
  }

  function loc(post, lang) {
    return post[lang] || post.ja || post.en;
  }

  function readingMinutes(text, lang) {
    if (lang === "en") {
      const words = (text.trim().match(/\S+/g) || []).length;
      return Math.max(1, Math.round(words / 220));
    }
    const chars = text.replace(/\s+/g, "").length;
    return Math.max(1, Math.round(chars / 450));
  }

  function postUrl(slug, lang) {
    return lang === "en"
      ? `post.html?slug=${encodeURIComponent(slug)}&lang=en`
      : `post.html?slug=${encodeURIComponent(slug)}`;
  }

  function listUrl(lang) {
    return lang === "en" ? "en.html" : "index.html";
  }

  async function loadIndex() {
    const res = await fetch("posts.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("index");
    const data = await res.json();
    return (data.posts || []).slice().sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
    });
  }

  function cardHtml(post, lang) {
    const L = loc(post, lang);
    const tags = (post.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <a class="blog-card reveal" href="${postUrl(post.slug, lang)}">
        <div class="meta">
          <span class="date">${formatDate(post.date, lang)}</span>
        </div>
        <h2>${escapeHtml(L.title)}</h2>
        <p>${escapeHtml(L.excerpt)}</p>
        <div class="tags">${tags}</div>
      </a>`;
  }

  const mathSlots = [];

  function protectMath(md) {
    mathSlots.length = 0;
    const codes = [];
    let out = md.replace(/```[\s\S]*?```/g, (block) => {
      codes.push(block);
      return `@@CODE${codes.length - 1}@@`;
    });
    out = out.replace(/\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)/g, (block) => {
      mathSlots.push(block);
      return `@@MATH${mathSlots.length - 1}@@`;
    });
    return out.replace(/@@CODE(\d+)@@/g, (_, i) => codes[+i]);
  }

  function restoreMath(html) {
    return html.replace(/@@MATH(\d+)@@/g, (_, i) => mathSlots[+i]);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function observeReveals(root) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  async function renderList(opts) {
    const lang = opts.lang || "ja";
    const grid = document.getElementById("blog-grid");
    const tagsEl = document.getElementById("blog-tags");
    const searchEl = document.getElementById("blog-search");
    if (searchEl) searchEl.placeholder = t(lang, "search");

    let posts = [];
    try {
      posts = await loadIndex();
    } catch (err) {
      grid.innerHTML = `<div class="empty">${t(lang, "loadError")}</div>`;
      return;
    }

    const found = Array.from(new Set(posts.flatMap((p) => p.tags || [])));
    const tags = PINNED_TAGS.filter((tag) => found.includes(tag))
      .concat(found.filter((tag) => !PINNED_TAGS.includes(tag)).sort());
    let activeTag = new URLSearchParams(location.search).get("tag") || "";
    if (activeTag && !found.includes(activeTag)) activeTag = "";
    let query = "";

    function paintTags() {
      tagsEl.innerHTML = [`<button type="button" class="tag-btn${activeTag ? "" : " on"}" data-tag="">${t(lang, "all")}</button>`]
        .concat(tags.map((tag) => `<button type="button" class="tag-btn${activeTag === tag ? " on" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`))
        .join("");
      tagsEl.querySelectorAll(".tag-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeTag = btn.getAttribute("data-tag") || "";
          const url = new URL(location.href);
          if (activeTag) url.searchParams.set("tag", activeTag);
          else url.searchParams.delete("tag");
          history.replaceState({}, "", url);
          paint();
        });
      });
    }

    function paint() {
      paintTags();
      const q = query.trim().toLowerCase();
      const filtered = posts.filter((p) => {
        const L = loc(p, lang);
        const hay = `${L.title} ${L.excerpt} ${(p.tags || []).join(" ")}`.toLowerCase();
        const tagOk = !activeTag || (p.tags || []).includes(activeTag);
        const qOk = !q || hay.includes(q);
        return tagOk && qOk;
      });
      if (!filtered.length) {
        grid.innerHTML = `<div class="empty">${t(lang, "empty")}</div>`;
        return;
      }
      grid.innerHTML = filtered.map((p) => cardHtml(p, lang)).join("");
      observeReveals(grid);
    }

    if (searchEl) {
      searchEl.addEventListener("input", () => {
        query = searchEl.value;
        paint();
      });
    }
    paint();
  }

  async function renderPost(opts) {
    const params = new URLSearchParams(location.search);
    const slug = params.get("slug") || "";
    const lang = params.get("lang") === "en" ? "en" : (opts.lang || "ja");
    const article = document.getElementById("post-body");
    const titleEl = document.getElementById("post-title");
    const dateEl = document.getElementById("post-date");
    const tagsEl = document.getElementById("post-tags");
    const readEl = document.getElementById("post-read");
    const navEl = document.getElementById("post-nav");
    const backEl = document.getElementById("post-back");
    const langEl = document.getElementById("post-lang");

    if (backEl) {
      backEl.href = listUrl(lang);
      backEl.textContent = "← " + t(lang, "back");
    }

    let posts = [];
    try {
      posts = await loadIndex();
    } catch (err) {
      titleEl.textContent = t(lang, "loadError");
      return;
    }

    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx < 0) {
      titleEl.textContent = t(lang, "missing");
      article.innerHTML = `<p>${t(lang, "missing")}</p>`;
      return;
    }

    const post = posts[idx];
    const L = loc(post, lang);
    const otherLang = lang === "en" ? "ja" : "en";
    const isMedical = (post.tags || []).includes("Medical");
    if (backEl) {
      backEl.href = isMedical ? listUrl(lang) + "?tag=Medical" : listUrl(lang);
    }
    if (langEl) {
      langEl.href = postUrl(post.slug, otherLang);
      langEl.textContent = otherLang === "en" ? "EN" : "日本語";
    }

    document.documentElement.lang = lang;
    const brand = document.querySelector("nav .brand");
    if (brand) brand.href = lang === "en" ? "../english_index.html" : "../index.html";
    titleEl.textContent = L.title;
    dateEl.textContent = formatDate(post.date, lang);
    tagsEl.innerHTML = (post.tags || []).map((tag) => {
      const href = listUrl(lang) + "?tag=" + encodeURIComponent(tag);
      return `<a class="tag" href="${href}">${escapeHtml(tag)}</a>`;
    }).join("");
    let noteEl = document.getElementById("post-note");
    if (!noteEl) {
      noteEl = document.createElement("p");
      noteEl.id = "post-note";
      noteEl.className = "post-note";
      tagsEl.parentElement.insertAdjacentElement("afterend", noteEl);
    }
    if (isMedical) {
      noteEl.hidden = false;
      noteEl.textContent = t(lang, "medicalNote");
    } else {
      noteEl.hidden = true;
      noteEl.textContent = "";
    }
    document.title = `${L.title} — ${lang === "en" ? "Teppei Nakano" : "中野哲平"}`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", L.excerpt);

    const mdRes = await fetch("posts/" + L.file, { cache: "no-cache" });
    if (!mdRes.ok) {
      article.innerHTML = `<p>${t(lang, "missing")}</p>`;
      return;
    }
    const md = await mdRes.text();
    readEl.textContent = `${readingMinutes(md, lang)} ${t(lang, "minRead")}`;

    const parse = (global.marked && global.marked.parse) || global.marked;
    const raw = parse(protectMath(md));
    article.innerHTML = global.DOMPurify.sanitize(restoreMath(raw));
    article.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src && !/^(https?:|data:|\/)/.test(src)) img.src = "posts/" + src;
    });
    if (global.hljs) {
      article.querySelectorAll("pre code").forEach((el) => global.hljs.highlightElement(el));
    }
    if (global.renderMathInElement) {
      global.renderMathInElement(article, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    }

    const olderPost = posts[idx + 1];
    const newerPost = posts[idx - 1];
    let nav = "";
    if (olderPost) {
      nav += `<a href="${postUrl(olderPost.slug, lang)}"><div class="lbl">${t(lang, "prev")}</div><div class="ttl">${escapeHtml(loc(olderPost, lang).title)}</div></a>`;
    } else {
      nav += `<div class="spacer"></div>`;
    }
    if (newerPost) {
      nav += `<a class="next" href="${postUrl(newerPost.slug, lang)}"><div class="lbl">${t(lang, "next")}</div><div class="ttl">${escapeHtml(loc(newerPost, lang).title)}</div></a>`;
    }
    navEl.innerHTML = nav;
  }

  async function renderHomePreview(opts) {
    const lang = opts.lang || "ja";
    const root = document.getElementById(opts.targetId || "home-blog");
    if (!root) return;
    const limit = opts.limit || 3;
    try {
      const res = await fetch(opts.indexUrl || "blog/posts.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("index");
      const data = await res.json();
      let posts = (data.posts || []).slice().sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
      });
      if (opts.tag) posts = posts.filter((p) => (p.tags || []).includes(opts.tag));
      if (opts.excludeTag) posts = posts.filter((p) => !(p.tags || []).includes(opts.excludeTag));
      posts = posts.slice(0, limit);
      const prefix = opts.postPrefix || "blog/";
      root.innerHTML = posts.map((post) => {
        const L = loc(post, lang);
        const href = prefix + postUrl(post.slug, lang);
        const tags = (post.tags || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
        return `
          <a class="blog-card reveal" href="${href}">
            <div class="meta"><span class="date">${formatDate(post.date, lang)}</span></div>
            <h2>${escapeHtml(L.title)}</h2>
            <p>${escapeHtml(L.excerpt)}</p>
            <div class="tags">${tags}</div>
          </a>`;
      }).join("");
      observeReveals(root);
    } catch (err) {
      root.innerHTML = "";
    }
  }

  global.SiteBlog = { renderList, renderPost, renderHomePreview };
})(window);
