const core = require('@actions/core')
const github = require('@actions/github')
const { IncomingWebhook } = require('@slack/webhook')

const main = async () => {
  const webhookUrl = core.getInput('webhook')
  const bluescapeUrl = core.getInput('bluescape_url')
  const runStatus = core.getInput('run_status') || undefined
  const ghRunId = core.getInput('gh_run_id')
  const testrailProjectId = core.getInput('testrail_project_id') || undefined
  const ghPackage = core.getInput('package') || undefined

  const context = github.context
  const ghRepoName = context.repo.repo
  const ghBranch = context.payload.pull_request.head.ref
  const ghRepoLink = context.payload.repository.html_url
  const webhook = new IncomingWebhook(webhookUrl)

  const testText = [':tada: *Github Test Run Complete!* :tada:']
  testText.push(makeTestLine('Repository', ghRepoName))
  testText.push(makeTestLine('Environment', bluescapeUrl))
  testText.push(makeTestLine('Branch', ghBranch))
  if (ghPackage) testText.push(makeTestLine('Package', ghPackage))
  if (runStatus) testText.push(makeTestLine('Status', runStatus))

  const blocks = []
  blocks.push(makeLinkBlock('Github Run', `${ghRepoLink}/actions/runs/${ghRunId}`))
  blocks.push(makeLinkBlock('Bluescape Environment', `https://client.${bluescapeUrl}/my`))
  blocks.push(makeLinkBlock('Repository', ghRepoLink))
  if (testrailProjectId) blocks.push(makeLinkBlock('Testrail Project', testrailProjectId))

  console.log(testText)
  console.log(blocks)
  const slackMessage = {
    blocks: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: testText.join('\n')
        }
      },
      {
        type: 'actions',
        elements: blocks
      },
      {
        type: 'divider'
      }
    ]
  }
  await webhook.send(slackMessage)
}

main().catch((err) => core.setFailed(err.message))

function makeTestLine (name, value) {
  return `${name}: \`${value}\``
}

function makeLinkBlock (title, link) {
  return {
    type: 'button',
    text: {
      type: 'plain_text',
      text: title,
      emoji: true
    },
    value: 'click_me',
    url: link
  }
}
