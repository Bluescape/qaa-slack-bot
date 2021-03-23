# qaa-slack-bot
Upon specified event, this GitHub Action sends a message detailing repository, package, environment, status, and branch to a specified Slack channel via a webhook.

Optionally it will also link the related TestRail project. 

## Usage
### Pre-requisites
Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](https://github.com/Bluescape/qaa-slack-bot/blob/develop/.github/workflows/qaa_slack_bot.yml) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
The only mandatory input is
- `webhook`: The webhook for the Slack channel in which to send the message


The rest of these inputs are optional 
- `run_status`: The status of your github runn; if using repo_dispatch, can be obtained with `${{repo_dispatch.result}}`
- `bluescape_url`: The url of the environment that you're testing against. Make sure that it includes the TLD or else Slack will complain and it will fail! (i.e, `stg1.bluescape.com`)
- `package`: The package that your test runs are testing on 
- `testrail_project_id`: The project ID of your TestRail project

If you're running a cronjob, due to minimal context given during one, you will have to add these two lines to your workflow: 
```
server_url: ${{ env.GITHUB_CONTEXT.server_url }}
repository: ${{ env.GITHUB_CONTEXT.repository }}
```

Note that `gh_run_id` is now obtained autotmatically from the Github context, so don't pass it in! 

There is also a debug option: Add `debug: "true"` to your workflow step and the slack bot will log the Github context, as seen from the script, to the console.
## Example Workflow
```yaml
  - name: Send result to slack 
    uses: Bluescape/qaa-slack-bot@v0.0.8
    with: 
      webhook: ${{ secrets.SLACK_WEBHOOK }}
      run_status: ${{ needs.repo_dispatch.result }}
      bluescape_url: ${{ fromJson(needs.setup.outputs.environment)[0] }}
      package: qa-perf-collab 
```
This will send the `run_status`, `bluescape_url`, and `testrail_project_id` to the Slack channel via its webhook. 

The output of this will look like so
![Example image](example_output.png)
