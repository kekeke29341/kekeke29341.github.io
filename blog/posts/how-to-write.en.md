This blog is a static GitHub Pages site. There is no build step and no database. Adding a post is two steps.

## 1. Add Markdown

Put a file in `blog/posts/`. For bilingual posts, use the same slug with `.ja.md` and `.en.md`.

The title in `posts.json` is canonical. The body is GitHub Flavored Markdown — lists, emphasis, inline code, and fenced code blocks all work.

Images go under `blog/posts/` as well. Reference them by filename:

```md
![Figure](example.png)
```

## 2. Register it in the index

Append one object to the `posts` array in `blog/posts.json`.

```json
{
  "slug": "my-new-post",
  "date": "2026-08-20",
  "tags": ["LLM"],
  "ja": {
    "title": "新しい記事",
    "excerpt": "Summary for the Japanese listing.",
    "file": "my-new-post.ja.md"
  },
  "en": {
    "title": "A new post",
    "excerpt": "Summary shown on the listing.",
    "file": "my-new-post.en.md"
  }
}
```

- `slug` becomes the URL (`blog/post.html?slug=my-new-post&lang=en`)
- `date` is `YYYY-MM-DD`. Newer dates sort first
- You can omit `en` until a translation exists; Japanese is used as fallback

Commit to `main` and GitHub Pages will publish in a few minutes. If anyone follows the feed, update `blog/rss.xml` with the same post.
