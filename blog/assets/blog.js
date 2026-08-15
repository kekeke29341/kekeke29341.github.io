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
      medicalNote: "本記事は手法・評価のメモであり、診断・治療の判断には使用できません。",
      toc: "目次",
      related: "関連するメモ",
      medicalSeries: "医療MLメモの読み順",
      llmSeries: "ローカルLLMの読み順",
      seriesBack: "読み順へ",
      copy: "コピー",
      copied: "コピーした"
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
      medicalNote: "This is a methods and evaluation note. It is not for diagnosis or treatment.",
      toc: "Contents",
      related: "Related notes",
      medicalSeries: "Medical ML reading order",
      llmSeries: "Local LLM reading order",
      seriesBack: "Reading order",
      copy: "Copy",
      copied: "Copied"
    }
  };

  const PINNED_TAGS = ["Medical", "LLM", "RAG", "Training", "Evaluation", "Bioinformatics"];
  const TAG_WEIGHT = { Medical: 3, LLM: 2, Bioinformatics: 2, RAG: 2, Evaluation: 2, Training: 1, NLP: 1 };
  const MEDICAL_PATH = [
    { ja: "先に切る", en: "Cut first", slugs: ["patient-level-split", "ehr-temporal-leakage", "ehr-missingness"] },
    { ja: "教師と指標", en: "Labels and metrics", slugs: ["icd-label-noise", "auroc-rare-events", "scanner-shift-imaging"] },
    { ja: "文書とLLM", en: "Text and LLMs", slugs: ["phi-hospital-llm", "guideline-rag-clinical", "clinical-text-from-talk", "radiology-report-nlp"] },
    { ja: "オミクスと腫瘍", en: "Omics and tumor", slugs: ["rnaseq-batch-effects", "cancer-heterogeneity-ml"] }
  ];
  const LLM_PATH = [
    { ja: "先に決める", en: "Decide first", slugs: ["air-gapped-llm-checklist"] },
    { ja: "形", en: "Shape", slugs: ["decoder-only", "rope", "rmsnorm-prenorm", "moe-routing"] },
    { ja: "推論とメモリ", en: "Inference and memory", slugs: ["kv-cache-gqa", "flashattention-io", "quantization-llm", "speculative-decoding", "attention-sink-window", "sampling-beyond-temperature"] },
    { ja: "学習", en: "Training", slugs: ["adamw-transformers", "lora-what-rank-fits", "sft-then-dpo", "distillation-logits"] },
    { ja: "検索と評価", en: "Retrieval and eval", slugs: ["rag-chunking", "rag-evaluation", "tokenizer-bpe-traps", "eval-contamination", "calibration-ece"] }
  ];
  const SERIES = {
    medical: { path: MEDICAL_PATH, page: { ja: "medical.html", en: "medical-en.html" }, labelKey: "medicalSeries" },
    llm: { path: LLM_PATH, page: { ja: "llm.html", en: "llm-en.html" }, labelKey: "llmSeries" }
  };
  const LLM_SLUGS = new Set(LLM_PATH.flatMap((group) => group.slugs));

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

  function seriesNameFor(post) {
    if ((post.tags || []).includes("Medical")) return "medical";
    if (LLM_SLUGS.has(post.slug)) return "llm";
    return "";
  }

  function seriesUrl(lang, name) {
    const series = SERIES[name || "medical"];
    if (!series) return listUrl(lang);
    return series.page[lang === "en" ? "en" : "ja"];
  }

  function siteOrigin() {
    return "https://kekeke29341.github.io";
  }

  function setLinkRel(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  function relatedPosts(posts, current, limit) {
    const mine = new Set(current.tags || []);
    const currentMedical = mine.has("Medical");
    return posts
      .filter((p) => p.slug !== current.slug)
      .map((p) => {
        const tags = p.tags || [];
        const shared = tags.filter((tag) => mine.has(tag));
        let score = shared.reduce((sum, tag) => sum + (TAG_WEIGHT[tag] || 1), 0);
        if (!currentMedical && tags.includes("Medical")) score -= 2;
        return { p, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
      .slice(0, limit)
      .map((row) => row.p);
  }

  function headingId(text, i) {
    const ascii = String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!ascii || ascii.length < 3 || /^\d/.test(ascii)) return "sec-" + (i + 1);
    return ascii;
  }

  function renderToc(article, lang) {
    const heads = Array.from(article.querySelectorAll("h2"));
    const old = document.getElementById("post-toc");
    if (old) old.remove();
    if (heads.length < 3) return;
    const used = new Set();
    heads.forEach((h, i) => {
      let id = h.id || headingId(h.textContent || "", i);
      if (used.has(id)) id = id + "-" + (i + 1);
      used.add(id);
      h.id = id;
    });
    const nav = document.createElement("nav");
    nav.id = "post-toc";
    nav.className = "post-toc";
    nav.setAttribute("aria-label", t(lang, "toc"));
    nav.innerHTML = `<div class="lbl">${t(lang, "toc")}</div><ol>` +
      heads.map((h) => `<li><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join("") +
      "</ol>";
    article.insertAdjacentElement("beforebegin", nav);
  }

  function renderRelated(posts, current, lang) {
    const host = document.getElementById("post-related");
    if (!host) return;
    const picks = relatedPosts(posts, current, 3);
    if (!picks.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = `<div class="lbl">${t(lang, "related")}</div><div class="post-related-grid">` +
      picks.map((p) => {
        const L = loc(p, lang);
        return `<a href="${postUrl(p.slug, lang)}"><div class="ttl">${escapeHtml(L.title)}</div><div class="ex">${escapeHtml(L.excerpt)}</div></a>`;
      }).join("") +
      "</div>";
  }

  function addCopyButtons(article, lang) {
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = t(lang, "copy");
      btn.addEventListener("click", async () => {
        const text = (pre.querySelector("code") || pre).textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = t(lang, "copied");
        } catch (err) {
          btn.textContent = t(lang, "copy");
        }
        setTimeout(() => { btn.textContent = t(lang, "copy"); }, 1600);
      });
      pre.classList.add("has-copy");
      pre.appendChild(btn);
    });
  }

  function setPostMeta(post, lang, L) {
    const page = siteOrigin() + "/blog/" + postUrl(post.slug, lang);
    setLinkRel("canonical", page);
    let json = document.getElementById("post-jsonld");
    if (!json) {
      json = document.createElement("script");
      json.type = "application/ld+json";
      json.id = "post-jsonld";
      document.head.appendChild(json);
    }
    json.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: L.title,
      description: L.excerpt,
      datePublished: post.date,
      inLanguage: lang === "en" ? "en" : "ja",
      url: page,
      author: {
        "@type": "Person",
        name: lang === "en" ? "Teppei Nakano" : "中野哲平",
        url: lang === "en" ? siteOrigin() + "/english_index.html" : siteOrigin() + "/"
      }
    });
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
    let query = new URLSearchParams(location.search).get("q") || "";
    if (searchEl && query) searchEl.value = query;

    function syncListUrl() {
      const url = new URL(location.href);
      if (activeTag) url.searchParams.set("tag", activeTag);
      else url.searchParams.delete("tag");
      const q = query.trim();
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      history.replaceState({}, "", url);
      const langLink = document.querySelector("nav a.lang");
      if (langLink) {
        const other = lang === "en" ? "index.html" : "en.html";
        const qs = url.searchParams.toString();
        langLink.href = other + (qs ? "?" + qs : "");
      }
    }

    function paintTags() {
      tagsEl.innerHTML = [`<button type="button" class="tag-btn${activeTag ? "" : " on"}" data-tag="">${t(lang, "all")}</button>`]
        .concat(tags.map((tag) => `<button type="button" class="tag-btn${activeTag === tag ? " on" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`))
        .join("");
      tagsEl.querySelectorAll(".tag-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeTag = btn.getAttribute("data-tag") || "";
          paint();
        });
      });
    }

    function paint() {
      syncListUrl();
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
    const seriesName = seriesNameFor(post);
    if (backEl) {
      backEl.href = seriesName ? seriesUrl(lang, seriesName) : listUrl(lang);
      backEl.textContent = "← " + t(lang, seriesName ? "seriesBack" : "back");
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
    let seriesEl = document.getElementById("post-series");
    if (!seriesEl) {
      seriesEl = document.createElement("p");
      seriesEl.id = "post-series";
      seriesEl.className = "post-series";
      noteEl.insertAdjacentElement("afterend", seriesEl);
    }
    if (seriesName) {
      seriesEl.hidden = false;
      seriesEl.innerHTML = `<a href="${seriesUrl(lang, seriesName)}">${t(lang, SERIES[seriesName].labelKey)} →</a>`;
    } else {
      seriesEl.hidden = true;
      seriesEl.innerHTML = "";
    }
    document.title = `${L.title} — ${lang === "en" ? "Teppei Nakano" : "中野哲平"}`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", L.excerpt);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", L.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", L.excerpt);
    const relatedEl = document.getElementById("post-related");
    if (relatedEl) relatedEl.setAttribute("aria-label", t(lang, "related"));
    setPostMeta(post, lang, L);

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
    addCopyButtons(article, lang);
    renderToc(article, lang);
    renderRelated(posts, post, lang);

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

  async function renderSeries(opts) {
    const lang = opts.lang || "ja";
    const root = document.getElementById(opts.targetId || "series-groups");
    if (!root) return;
    let posts = [];
    try {
      posts = await loadIndex();
    } catch (err) {
      root.innerHTML = `<div class="empty">${t(lang, "loadError")}</div>`;
      return;
    }
    const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));
    const path = (SERIES[opts.series] || SERIES.medical).path;
    root.innerHTML = path.map((group) => {
      const items = group.slugs.map((slug) => bySlug[slug]).filter(Boolean);
      const cards = items.map((p) => cardHtml(p, lang)).join("");
      return `<section class="series-group"><h2>${escapeHtml(lang === "en" ? group.en : group.ja)}</h2><div class="blog-grid">${cards}</div></section>`;
    }).join("");
    observeReveals(root);
  }

  global.SiteBlog = { renderList, renderPost, renderHomePreview, renderSeries };
})(window);
