#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const commander_1 = require("commander");
const cma_client_node_1 = require("@datocms/cma-client-node");
const dedent_js_1 = __importDefault(require("dedent-js"));
const table_1 = require("table");
const version = '1.0.0';
const program = new commander_1.Command();
program
    .version(version)
    .description(`next-dato-utils v${version}`)
    .option("-i, --info", "Info DatoCMS project")
    .option("-u, --usage", "Usage DatoCMS project")
    .option("-to, --token <value>", "Api token")
    .option("-t, --test <value>", "Test DatoCMS project")
    .parse(process.argv);
const options = program.opts();
const apiToken = options.token ?? process.env.DATOCMS_API_TOKEN;
if (!apiToken)
    throw new Error('DATOCMS_API_TOKEN is required');
const client = (0, cma_client_node_1.buildClient)({
    apiToken,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
if (options.info)
    info();
if (options.usage)
    usage();
async function info() {
    const [site, itemTypes, webhooks, plugins, buildTriggers] = await Promise.all([
        client.site.find(),
        client.itemTypes.list(),
        client.webhooks.list(),
        client.plugins.list(),
        client.buildTriggers.list(),
    ]);
    const text = (0, dedent_js_1.default)(`
    ${site.name}
    ${buildTriggers.find(t => t.frontend_url)?.frontend_url ?? 'No frontend url'}

    -------------------------------
    Timezone: ${site.timezone}
    Locales: ${site.locales}

    Models
    -------------------------------
    ${itemTypes.filter(el => !el.modular_block).map(itemType => itemType.api_key).join('\n')}

    Blocks
    -------------------------------
    ${itemTypes.filter(el => el.modular_block).map(itemType => itemType.api_key).join('\n')}

    Webhooks
    -------------------------------
    ${webhooks.map(webhook => `${webhook.name}\n${webhook.url}`).join('\n\n')}

    Build Triggers
    -------------------------------
    ${buildTriggers.map(t => `${t.name}\n${t.frontend_url}`).join('\n')}

    Plugins
    -------------------------------
    ${plugins.map(plugin => `${plugin.name}`).join('\n')}
  `);
    console.log(text);
}
async function usage() {
    const [site, usage] = await Promise.all([client.site.find(), client.dailyUsages.list()]);
    const fNumber = (num) => !num ? 0 : num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const usageTotal = {
        last: {
            days: usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth()).length,
            cda: usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth()).reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth()).reduce((acc, el) => acc + el.cma_api_calls, 0),
        },
        current: {
            days: usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).length,
            cda: usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).reduce((acc, el) => acc + el.cma_api_calls, 0),
        }
    };
    const usageTable = [
        ['Date', 'CDA', 'CMA'],
        ...usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).map(el => [
            el.date,
            fNumber(el.cda_api_calls),
            fNumber(el.cma_api_calls)
        ])
    ];
    const text = (0, dedent_js_1.default)(`
    ${site.name}
    
    ${(0, table_1.table)(usageTable, { header: { alignment: 'center', content: 'Usage (CDA / CMA)' } })}
    Last month:\t${fNumber(usageTotal.last.cda)} (${fNumber(usageTotal.last.cda / usageTotal.last.days)}) / ${fNumber(usageTotal.last.cma)} (${fNumber(usageTotal.last.cma / usageTotal.last.days)})
    Current:\t${fNumber(usageTotal.current.cda)} (${fNumber(usageTotal.current.cda / usageTotal.current.days)}) / ${fNumber(usageTotal.current.cma)} (${fNumber(usageTotal.current.cma / usageTotal.current.days)})

  `);
    console.log(text);
}
//# sourceMappingURL=index.js.map