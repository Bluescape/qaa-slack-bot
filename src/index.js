const core = require('@actions/core')
const github = require('@actions/github')
const { IncomingWebhook } = require('@slack/webhook')

/*
const webhookUrl = 'https://hooks.slack.com/services/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'
const BLUESCAPE_URL = 'notarealurl'
const RUN_STATUS = 'notarealstatus'
const BRANCH = 'notarealbranch'
const GH_RUN_ID = 'notarealrunid'
*/
const main = async () => {
  const webhookUrl = core.getInput('webhook')
  const BLUESCAPE_URL = core.getInput('bluescape_url')
  const RUN_STATUS = core.getInput('run_status')
  const GH_RUN_ID = core.getInput('gh_run_id')
  const TESTRAIL_PROJECT_ID = core.getInput('testrail_project_id') || undefined
  let PACKAGE = core.getInput('package') || undefined

  const context = github.context
  const GH_REPO_NAME = context.repo.repo
  const BRANCH = context.payload.pull_request.head.ref
  const GH_REPO_LINK = context.payload.repository.html_url
  const webhook = new IncomingWebhook(webhookUrl)

  if (PACKAGE === undefined) {
    PACKAGE = 'Package was not defined!'
  }

  const slackMessage = {
    blocks: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:tada: *GitHub Test Run Complete!* :tada:\n\n Repository: \`${GH_REPO_NAME}\` \nPackage: \`${PACKAGE}\`\n Environment: \`${BLUESCAPE_URL}\`\nStatus: \`${RUN_STATUS}\`\nBranch: \`${BRANCH}\``
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            style: 'primary',
            text: {
              type: 'plain_text',
              text: 'GitHub Run',
              emoji: true
            },
            value: 'click_me',
            url: `${GH_REPO_LINK}/actions/runs/${GH_RUN_ID}`
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Bluescape Environment',
              emoji: true
            },
            value: 'click_me',
            url: `https://client.${BLUESCAPE_URL}/my`
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Repository',
              emoji: true
            },
            value: 'click_me',
            url: `${GH_REPO_LINK}`
          }
        ]
      },
      {
        type: 'divider'
      }
    ]
  }

  if (TESTRAIL_PROJECT_ID) {
    slackMessage.blocks[2].elements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'TestRail Project',
        emoji: true
      },
      value: 'click_me',
      url: `https://testrail.bluescape.com/index.php?/projects/overview/${TESTRAIL_PROJECT_ID}`
    })
  }

  await webhook.send(slackMessage)
}

main().catch((err) => core.setFailed(err.message))
