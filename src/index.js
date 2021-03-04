const core = require('@actions/core')
const github = require('@actions/github')
const _ = require('lodash')
const { IncomingWebhook } = require('@slack/webhook')

const main = async () => {
  const parameters = getGithubParameters()

  const context = github.context
  const ghRunId = context.runId
  const ghRepoName = context.repo.repo
  const ghBranch =
    _.get(context, ['event', 'branch']) || _.get(context, ['ref'])
  const ghRepoLink =
    _.get(context, ['payload', 'repository', 'html_url']) || _.get(context, 'event', 'repository', 'html_url')
  const webhook = new IncomingWebhook(parameters.webhookUrl)

  const testText = [':tada: *Github Test Run Complete!* :tada:']
  testText.push(makeTestLine('Repository', ghRepoName))
  if (parameters.bluescapeUrl) testText.push(makeTestLine('Environment', parameters.bluescapeUrl))
  testText.push(makeTestLine('Branch', ghBranch))
  if (parameters.ghPackage) testText.push(makeTestLine('Package', parameters.ghPackage))
  if (parameters.runStatus) testText.push(makeTestLine('Status', parameters.runStatus))

  const links = []
  links.push(
    makeButtonBlock(
      'Github Run',
      `${ghRepoLink}/actions/runs/${ghRunId}`,
      'primary'
    )
  )
  if (parameters.bluescapeUrl) {
    links.push(
      makeButtonBlock(
        'Bluescape Environment',
        `https://client.${parameters.bluescapeUrl}/my`
      )
    )
  }
  links.push(makeButtonBlock('Repository', ghRepoLink))
  if (parameters.testrailProjectId) {
    links.push(
      makeButtonBlock(
        'Testrail Project',
        `https://testrail.bluescape.com/index.php?/projects/overview/${parameters.testrailProjectId}`
      )
    )
  }
  if (parameters.testrailRunId) {
    links.push(
      makeButtonBlock(
        'Testrail Run',
        `https://testrail.bluescape.com/index.php?/runs/view/${parameters.testrailRunId}`
      )
    )
  }
  if (parameters.grafanaLink) {
    links.push(
      makeButtonBlock(
        'Grafana',
        grafanaLinkBuilder(
          parameters.grafanaLink,
          parameters.testStartTime,
          parameters.testEndTime,
          parameters.bluescapeUrl,
          parameters.grafanaProduct,
          parameters.grafanaFeature,
          parameters.grafanaProcess
        )
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
  if (parameters.extraMarkdownText) {
    slackMessage.blocks.push(divider)
    slackMessage.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: parameters.extraMarkdownText.replace(/\\n/g, '\n')
      }
    })
    slackMessage.blocks.push(divider)
  }
  slackMessage.blocks.push({
    type: 'actions',
    elements: links
  })
  slackMessage.blocks.push(divider)
  console.log(JSON.stringify(slackMessage))
  await webhook.send(slackMessage)
}

main().catch((err) => core.setFailed(err.message))

function getGithubParameters () {
  const output = {}
  output.webhookUrl = core.getInput('webhook')
  output.bluescapeUrl = core.getInput('bluescape_url') || undefined
  output.runStatus = core.getInput('run_status') || undefined
  output.testrailProjectId = core.getInput('testrail_project_id') || undefined
  output.ghPackage = core.getInput('package') || undefined
  output.extraMarkdownText = core.getInput('extra_text') || undefined
  output.testrailRunId = core.getInput('testrail_run_id') || undefined
  output.grafanaLink = core.getInput('grafana_link') || undefined
  output.testStartTime = core.getInput('test_start_time') || undefined
  output.testEndTime = core.getInput('test_end_time') || undefined
  output.grafanaProduct = core.getInput('grafana_product') || undefined
  output.grafanaFeature = core.getInput('grafana_feature') || undefined
  output.grafanaProcess = core.getInput('grafana_process') || undefined
  return output
}

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

function grafanaLinkBuilder (base, startTime, endTime, environment, product, feature, process) {
  const grafanaUrl = new URL(base)
  if (startTime) grafanaUrl.searchParams.append('from', startTime)
  if (endTime) grafanaUrl.searchParams.append('to', endTime)
  if (environment) grafanaUrl.searchParams.append('var-Environment', environment)
  if (product) grafanaUrl.searchParams.append('var-Product', product)
  if (feature) grafanaUrl.searchParams.append('var-Feature', feature)
  if (process) grafanaUrl.searchParams.append('var-Process', process)
  return grafanaUrl
}
