import * as core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import * as github from '@actions/github';
import yaml from 'js-yaml';

async function fetchUsernameMapping(octokit, owner) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo: '.github',
      path: 'discourse.yml',
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const config = yaml.load(content);

    return config?.usernames || {};
  } catch (error) {
    core.debug(`Could not fetch discourse.yml: ${error.message}`);
    return {};
  }
}

async function run() {
  try {
    const context = github.context;
    const {owner, repo} = context.repo;
    const release = context.payload.release;
    const discourseBaseUrl = core.getInput('discourse-base-url', { required: true });
    const discourseApiKey = core.getInput('discourse-api-key', { required: true });
    const manualUsername = core.getInput('discourse-author-username').trim();
    const discourseCategory = core.getInput('discourse-category') || '';
    const discourseTags = core.getMultilineInput('discourse-tags') || [];
    const packageName = core.getInput('package-name') || repo;

    // Get the GitHub username of the release author
    const githubUsername = release?.author?.login;

    // Keep existing behavior for backwards compatibility:
    // manual input remains the authoritative value with a 'system' fallback.
    // Username mapping is additive and only attempted when no manual override is set.
    let discourseAuthorUsername = manualUsername || 'system';
    if (manualUsername) {
      discourseAuthorUsername = manualUsername;
      core.info(`Using manual Discourse username '${discourseAuthorUsername}'`);
    } else {
      // Fetch username mapping from .github/discourse.yml when a token is available.
      const token = core.getInput('github-token') || process.env.GITHUB_TOKEN;
      if (token && githubUsername) {
        const octokit = github.getOctokit(token);
        const usernameMapping = await fetchUsernameMapping(octokit, owner);
        if (usernameMapping[githubUsername]) {
          discourseAuthorUsername = usernameMapping[githubUsername];
          core.info(`Mapped GitHub user '${githubUsername}' to Discourse user '${discourseAuthorUsername}'`);
        } else {
          core.info(`No username mapping found for '${githubUsername}', using default 'system'`);
        }
      } else {
        core.info(`No GitHub token or release author available, using default 'system'`);
      }
    }

    const client = new HttpClient('discourse-api-client');
    client.requestOptions = {
      headers: {
        'Api-Key': discourseApiKey,
        'Api-Username': discourseAuthorUsername
      }
    }

    const title = `${repo} ${release.tag_name} released`;
    const topic = {
      title,
      raw: `[${title}](${release.html_url})

${release.body}`,
    }

    if (discourseCategory !== "") {
      topic["category"] = parseInt(discourseCategory, 10);
    }

    if (discourseTags.length > 0) {
      topic["tags"] = discourseTags;
    }

    const { result: data } = await client.postJson(`${discourseBaseUrl}/posts.json`, topic);

    const topicUrl = `${discourseBaseUrl}/t/${data.topic_slug}/${data.topic_id}`;
    core.setOutput('topic-url', topicUrl);
    core.info(`Topic created: ${topicUrl}`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
