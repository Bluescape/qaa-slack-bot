const core = require('@actions/core')
const { IncomingWebhook } = require('@slack/webhook')

/*
const webhookUrl = 'https://hooks.slack.com/services/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'
const BLUESCAPE_URL = 'notarealurl'
const RUN_STATUS = 'notarealstatus'
const BRANCH = 'notarealbranch'
const GH_RUN_ID = 'notarealrunid'
*/
const main = async () => { 
  console.log("Hello this is in the beginning of main")
  const webhookUrl = core.getInput('webhook')
  const BLUESCAPE_URL = core.getInput('bluescape_url')
  const RUN_STATUS = core.getInput('run_status')
  const BRANCH = core.getInput('branch')
  const GH_RUN_ID = core.getInput('gh_run_id')
  const webhook = new IncomingWebhook(webhookUrl)
  console.log("Hello this is right beforet he webhook sends")
  await webhook.send({
    blocks: [
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:tada: *GitHub Test Run Complete!* :tada:\n\n Repository: \`browser_client\` \nPackage: \`e2e-webc\`\n Environment: \`${BLUESCAPE_URL}\`\nStatus: \`${RUN_STATUS}\`\nBranch: \`${BRANCH}\``
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
            url: 'https://github.com/Bluescape/thoughtstream-browser_client'
          }
        ]
      },
      {
        type: 'divider'
      }
    ]
  })
  console.log('Hello world')
}

main().catch((err) => core.setFailed(err.message))
