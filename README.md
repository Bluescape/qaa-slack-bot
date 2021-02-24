# qaa-slack-bot
Upon specified event, this GitHub Action sends a message detailing repository, packag, environment, status, and branch to a specified Slack channel via a webhook.

Optionally it will also link the related TestRail project. 

## Usage
### Pre-requisites
Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](https://github.com/Bluescape/qaa-slack-bot/blob/develop/.github/workflows/qaa_slack_bot.yml) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
The only mandatory input is
- `webhook`: The webhook for the Slack channel in which to send the message


The rest of these inputs are optional 
- `gh_run_id`: The run_id of your Github run, can be obtained using `${{ github.run_id}}`. 
- `run_status`: The status of your github runn; if using repo_dispatch, can be obtained with `${{repo_dispatch.result}}`
- `bluescape_url`: The url of the environment that you're testing against. Make sure that it includes the TLD or else Slack will complain and it will fail! (i.e, `stg1.bluescape.com`)
- `package`: The package that your test runs are testing on 
- `testrail_project_id`: The project ID of your TestRail project

## Example Workflow
On every pull request created against develop or repo dispatch, report results to Slack
```yaml
name: QAA-slack-poster
on: [pull_request, repository_dispatch]

env: 
  node-version: 12.x
  SLACK_WEBHOOK_URL: https://hooks.slack.com/services/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

jobs: 
  post-to-slack:
    runs-on: ubuntu-latest
    steps: 
      - name: Dump Github context
        env: 
          GITHUB_CONTEXT: ${{ toJson(github) }}
        run: echo "$GITHUB_CONTEXT"
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with: 
          node-version: '12.x'
      - name: Install dependencies
        run: npm install
      - name: Run script 
        uses: ./
        with: 
          webhook: ${{ env.SLACK_WEBHOOK_URL }}
          run_status: "passed"
          bluescape_url: "stg1.bluescape.com"
          testrail_project_id: "15"
```
This will send the `run_status`, `bluescape_url`, and `testrail_project_id` to the Slack channel via its webhook. 

The output of this will look like so
![Example image](example_output.png)
