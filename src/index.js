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
  console.log('Hello this is in the beginning of main')
  const webhookUrl = core.getInput('webhook')
  const BLUESCAPE_URL = core.getInput('bluescape_url')
  const RUN_STATUS = core.getInput('run_status')
  const GH_RUN_ID = core.getInput('gh_run_id')
  const GH_REPO_LINK = core.getInput('gh_repo_link')
  const TESTRAIL_PROJECT_ID = core.getInput('testrail_project_id') || undefined
  let PACKAGE = core.getInput('package') || undefined

  const context = github.context
  const GH_REPO_NAME = context.repo.repo
  const BRANCH = context.payload.pull_request.head.ref

  const webhook = new IncomingWebhook(webhookUrl)

  const slackMessage = {
    blocks: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:tada: *GitHub Test Run Complete!* :tada:\n\n Repository: ${GH_REPO_NAME} \nPackage: \`${PACKAGE}\`\n Environment: \`${BLUESCAPE_URL}\`\nStatus: \`${RUN_STATUS}\`\nBranch: \`${BRANCH}\``
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
            url: `https://github.com/Bluescape/thoughtstream-browser_client/actions/runs/${GH_RUN_ID}`
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

  if (!PACKAGE) {
    PACKAGE = 'some test package'
  }

  console.log(`WebhookUrl: ${webhookUrl}`)
  console.log(`BLUESCAP_URL: ${BLUESCAPE_URL}`)
  console.log(`RUN_STATUS: ${RUN_STATUS}`)
  console.log(`BRANCH: ${BRANCH}`)
  console.log(`GH_RUN_ID: ${GH_RUN_ID}`)
  console.log('Hello this is right beforet he webhook sends')
  await webhook.send(slackMessage)
  console.log('Hello world')
}

main().catch((err) => core.setFailed(err.message))
