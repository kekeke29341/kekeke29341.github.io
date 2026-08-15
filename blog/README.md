# Blog

GitHub Pages 上の静的ブログです。ビルド不要で、Markdown と JSON だけ更新します。

## 構成

- `index.html` / `en.html` — 一覧（日 / 英）
- `post.html?slug=...` — 本文（`&lang=en` で英語）
- `posts.json` — 公開する記事の索引
- `posts/*.md` — 本文
- `rss.xml` — フィード

## 記事を足す

1. `posts/` に `your-slug.ja.md`（必要なら `your-slug.en.md`）を置く
2. `posts.json` の `posts` 配列に1件追加する
3. 購読者がいる場合は `rss.xml` も更新する
4. コミットして GitHub Pages に載せる

詳細はサイト上の「記事の追加方法」を参照してください。
