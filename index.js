const core = require('@actions/core');
const http = require('@actions/http-client');
const github = require('@actions/github');

async function run() {
  try {
    const context = github.context;
    const {owner, repo} = context.repo;
    const release = context.payload.release;
    const discourseBaseUrl = core.getInput('discourse-base-url', { required: true });
    const discourseApiKey = core.getInput('discourse-api-key', { required: true });
    const discourseAuthorUsername = core.getInput('discourse-author-username') || 'system';
    const discourseCategory = core.getInput('discourse-category') || '';
    const discourseTags = core.getMultilineInput('discourse-tags') || [];
    const packageName = core.getInput('package-name') || repo;

    const client = new http.HttpClient('discourse-api-client');
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
