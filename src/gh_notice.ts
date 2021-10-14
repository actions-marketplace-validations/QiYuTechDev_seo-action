import * as core from "@actions/core";

/**
 * 现实 notice for GitHub action
 * @param name
 */
export function showNotice(name: 'snapshot' | 'pdf' | 'rrweb' | 'result') {
    const run_id = process.env["GITHUB_RUN_ID"] || ""
    const repo = process.env['GITHUB_REPOSITORY'] || ""
    const gh_token = core.getInput("gh_token")

    let url: URL
    if (name === 'rrweb') {
        url = new URL("https://ci.2cc.net/v1/rrweb_index.html")
    } else {
        url = new URL("https://ci.2cc.net/v1/rrweb_index.html")
    }
    url.searchParams.set("run_id", run_id)
    url.searchParams.set("repo", repo)
    url.searchParams.set('name', name)
    if (gh_token) {
        url.searchParams.set("gh_token", gh_token)
    }

    core.notice(`you can view ${name} by: ${url.toString()}`)
}