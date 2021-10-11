import fs from "fs";
import path from "path";
import os from "os";
import * as core from "@actions/core";
import artifact from "@actions/artifact"
import {Ci, RestCiArgs} from "qiyu-seo"
import {cliRun} from "./cli";
import {debugMode} from "./debug";


async function uploadFile(name: string, file: string) {
    const client = artifact.create()
    await client.uploadArtifact(name, [file], path.dirname(file), {continueOnError: true})
}

/**
 * 运行 custom 代码
 */
export async function runCode() {
    const url: string = core.getInput("url")
    const code_file: string = core.getInput("code")
    const snapshot = core.getBooleanInput("snapshot")
    const pdf = core.getBooleanInput("pdf")
    const video = core.getBooleanInput("video")
    const rrweb = core.getBooleanInput("rrweb")
    const timeout = Number(core.getInput("timeout"))

    const code = fs.readFileSync(`${process.env['GITHUB_WORKSPACE']}/${code_file}`, {encoding: 'utf-8'})

    core.info(`try to visit url: ${url}`)
    core.info(`js code:\n${code}\n\n`)

    const args: RestCiArgs = {
        url: url,
        fn_code: code,
        timeout: timeout,
        auto_close: true,
        snapshot: snapshot,
        pdf: pdf,
        video: video,
        rrweb: rrweb,
    }

    const bearer = process.env['SEO_REST_API_BEARER'] || 'seo'

    if (debugMode() && os.platform() === 'linux') {
        cliRun("sudo", ["netstat", "-plnt"])
    }

    let success = true;
    const resp = await Ci.do_post({body: args, security: {bearer}},
        async (resp) => {
            return await resp.json()
        },
        async (resp) => {
            const txt = await resp.text()
            success = false
            core.setFailed(`失败:
http code: ${resp.status} 
result: ${txt}
`)
        })

    if (success) {
        if (snapshot && resp.data?.snapshot_file) {
            await uploadFile("snapshot", resp.data.snapshot_file)
        }
        if (pdf && resp.data?.pdf_file) {
            await uploadFile("pdf", resp.data.pdf_file)
        }
        if (rrweb && resp.data?.rrweb_file) {
            await uploadFile("rrweb", resp.data.rrweb_file)
        }
        core.info("success:")
        core.info(JSON.stringify(resp, null, 2))
    }
}
