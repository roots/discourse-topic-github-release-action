# roots-discourse-post-release-action

The `roots-discourse-post-release-action` is a JavaScript action that can post published GitHub releases from a repository to a Discourse instance.

We use this on our main projects to [automatically post releases to Roots Discourse](https://discourse.roots.io/tag/releases?order=created).

## Example usage

```yaml
name: Post release topic on Discourse

on:
  release:
    types: [published]

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
    - uses: roots/discourse-topic-github-release-action@main
      with:
        discourse-api-key: ${{ secrets.DISCOURSE_RELEASES_API_KEY }}
        discourse-base-url: ${{ secrets.DISCOURSE_BASE_URL }}
        discourse-author-username: ben
        discourse-category: 11
        discourse-tags:
          releases
```

## Setup

### `discourse-api-key`

**Required** Discourse API key. Use a [GitHub secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for this value.

### `discourse-base-url`

**Required** Discourse base URL. Use a [GitHub secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for this value.

### `discourse-author-username`

Username used for creating the topic on Discourse.

**Default**: `system`

### `discourse-category`

Category ID used for creating the topic on Discourse.

### `discourse-tags`

Tags applied to the topic when creating the topic on Discourse.
