const core = require('@actions/core')
const github = require('@actions/github')
const _ = require('lodash')
const { IncomingWebhook } = require('@slack/webhook')

const main = async () => {
  const webhookUrl = core.getInput('webhook')
  const bluescapeUrl = core.getInput('bluescape_url')
  const runStatus = core.getInput('run_status') || undefined
  const testrailProjectId = core.getInput('testrail_project_id') || undefined
  const ghPackage = core.getInput('package') || undefined
  const extraMarkdownText = core.getInput('extra_text') || undefined

  const context = github.context
  const ghRunId = context.runId
  const ghRepoName = context.repo.repo
  const ghBranch =
    _.get(context, ['event', 'branch']) || _.get(context, ['ref'])
  const ghRepoLink = context.payload.repository.html_url
  const webhook = new IncomingWebhook(webhookUrl)

  const testText = [':tada: *Github Test Run Complete!* :tada:']
  testText.push(makeTestLine('Repository', ghRepoName))
  if (bluescapeUrl) testText.push(makeTestLine('Environment', bluescapeUrl))
  testText.push(makeTestLine('Branch', ghBranch))
  if (ghPackage) testText.push(makeTestLine('Package', ghPackage))
  if (runStatus) testText.push(makeTestLine('Status', runStatus))

  const links = []
  links.push(
    makeButtonBlock(
      'Github Run',
      `${ghRepoLink}/actions/runs/${ghRunId}`,
      'primary'
    )
  )
  if (bluescapeUrl) {
    links.push(
      makeButtonBlock(
        'Bluescape Environment',
        `https://client.${bluescapeUrl}/my`
      )
    )
  }
  links.push(makeButtonBlock('Repository', ghRepoLink))
  if (testrailProjectId) {
    links.push(
      makeButtonBlock(
        'Testrail Project',
        `https://testrail.bluescape.com/index.php?/projects/overview/${testrailProjectId}`
      )
    )
  }

  const divider = { type: 'divider' }
  const slackMessage = {
    blocks: []
  }
  slackMessage.blocks.push(divider)
  slackMessage.blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: testText.join('\n')
    }
  })
  if (extraMarkdownText) {
    slackMessage.blocks.push(divider)
    slackMessage.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: extraMarkdownText
      }
    })
    slackMessage.blocks.push(divider)
  }
  slackMessage.blocks.push({
    type: 'actions',
    elements: links
  })
  slackMessage.blocks.push(divider)
  await webhook.send(slackMessage)
}

main().catch((err) => core.setFailed(err.message))

function makeTestLine (name, value) {
  return `${name}: \`${value}\``
}

function makeButtonBlock (title, link, style = undefined) {
  return {
    type: 'button',
    style: style,
    text: {
      type: 'plain_text',
      text: title,
      emoji: true
    },
    value: 'click_me',
    url: link
  }
}
