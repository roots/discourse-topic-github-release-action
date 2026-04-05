# Discourse Topic GitHub Release Action

The `discourse-topic-github-release-action` is a JavaScript action that can post published GitHub releases from a repository to a Discourse instance.

We use this on our main projects to [automatically post releases to Roots Discourse](https://discourse.roots.io/tag/releases?order=created).

Other projects using this action:

* [Jenkins](https://community.jenkins.io/c/blog/23)
* [NetBird](https://forum.netbird.io/tag/releases)
* [Aleph](https://aleph.discourse.group/tag/release/2)

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
        github-token: ${{ github.token }}
        discourse-category: 11
        discourse-tags:
          releases
```

## Username Mapping

The action automatically maps GitHub usernames to Discourse usernames by reading a `discourse.yml` file from your organization's `.github` repository.

### Setting up username mapping

1. Create a `.github` repository in your organization if it doesn't exist
2. Add a `discourse.yml` file with the following format:

```yaml
usernames:
  github-username: discourse-username
  another-user: their-discourse-name
```

When a release is published, the action will:

1. Detect the GitHub username of the person who published the release
2. Look up their username in the mapping
3. Use the mapped Discourse username when creating the topic

For backward compatibility, if `discourse-author-username` is provided, that value is used directly. Otherwise, the action attempts username mapping (when a GitHub token is available) and falls back to `system`.

## Setup

### `discourse-api-key`

**Required** Discourse API key. Use a [GitHub secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for this value.

### `discourse-base-url`

**Required** Discourse base URL. Use a [GitHub secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for this value.

### `discourse-author-username`

Username for creating the topic on Discourse.

**Default**: `system` (if omitted, username mapping is attempted when a GitHub token is available)

### `github-token`

**Optional** GitHub token for fetching the `.github/discourse.yml` file. The action uses this input first, then `GITHUB_TOKEN` if available.

The token must be able to read `owner/.github/discourse.yml` (repository contents read access). If that file cannot be read, the action falls back to `system`.

### `discourse-category`

Category ID used for creating the topic on Discourse.

### `discourse-tags`

Tags applied to the topic when creating the topic on Discourse.
