# 読んだ論文

自分の投稿論文（`mypapers/`）とは別に、読んだ論文のメモです。ビルド不要です。

## 足し方

1. `notes/` に `slug.ja.md` と `slug.en.md` を置く
2. `papers.json` の `papers` 配列に1件追加する
3. 購読者がいる場合は `rss.xml` と `rss-en.xml` も更新する

```json
{
  "slug": "example-paper",
  "year": 2024,
  "read": "2026-08-20",
  "authors": "Name et al.",
  "venue": "NeurIPS",
  "title": "Official English title",
  "arxiv": "2401.00001",
  "tags": ["LLM"],
  "related": ["rope"],
  "ja": { "takeaway": "現場に持ち帰る一点。", "file": "example-paper.ja.md" },
  "en": { "takeaway": "One takeaway for the work.", "file": "example-paper.en.md" }
}
```

`related` はブログ記事の slug です。arXiv が無いときは `doi` を置きます。
