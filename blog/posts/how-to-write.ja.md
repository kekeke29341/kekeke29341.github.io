このブログは GitHub Pages の静的サイトです。ビルドもデータベースもありません。記事を足す手順は次の2ステップです。

## 1. Markdown を置く

`blog/posts/` にファイルを追加します。日本語と英語を分ける場合は、同じ slug で `.ja.md` と `.en.md` を並べます。

タイトルは `posts.json` が正です。本文は GitHub Flavored Markdown で、リスト・強調・インラインコード・フェンス付きコードブロックが使えます。

画像を使う場合は `blog/posts/` 配下に置き、Markdown からはファイル名だけ指定します。

```md
![図](example.png)
```

## 2. 索引に1件足す

`blog/posts.json` の `posts` 配列へ、新しいオブジェクトを追加します。

```json
{
  "slug": "my-new-post",
  "date": "2026-08-20",
  "tags": ["LLM"],
  "ja": {
    "title": "新しい記事",
    "excerpt": "一覧と検索に出す要約。",
    "file": "my-new-post.ja.md"
  },
  "en": {
    "title": "A new post",
    "excerpt": "Summary shown on the listing.",
    "file": "my-new-post.en.md"
  }
}
```

- `slug` が URL になります（`blog/post.html?slug=my-new-post`）
- `date` は `YYYY-MM-DD`。新しい日付が上に並びます
- 英語原稿がまだないときは `en` を省略できます。日本語が表示されます

コミットして `main` に載せると、GitHub Pages が数分で公開します。RSS を購読している人がいる場合は `blog/rss.xml` も同じ記事で更新してください。
