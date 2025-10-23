#! /usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { buildClient } from '@datocms/cma-client-node';
import dedent from 'dedent-js';
import { table } from 'table';
import generateGqlFiles from './generate-gql2.js';
import prettyBytes from 'pretty-bytes';
const version = '1.0.0';
const program = new Command();
program
    .version(version)
    .description(`next-dato-utils v${version}`)
    .option("-i, --info", "Info DatoCMS project")
    .option("-u, --usage", "Usage DatoCMS project")
    .option("-g, --gql", "Generate GQL")
    .option("-to, --token <value>", "Api token")
    .option("-t, --test <value>", "Test DatoCMS project")
    .parse(process.argv);
const options = program.opts();
const apiToken = options.token ?? process.env.DATOCMS_API_TOKEN;
if (!apiToken)
    throw new Error('DATOCMS_API_TOKEN is required');
const client = buildClient({
    apiToken,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
if (options.info)
    info();
if (options.usage)
    usage();
if (options.gql)
    generateGqlFiles();
async function info() {
    const [site, itemTypes, webhooks, plugins, buildTriggers] = await Promise.all([
        client.site.find(),
        client.itemTypes.list(),
        client.webhooks.list(),
        client.plugins.list(),
        client.buildTriggers.list(),
    ]);
    const text = dedent(`
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
    const usageLast = usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth());
    const usageCurrent = usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth());
    const usageTotal = {
        last: {
            days: usageLast.length,
            cda: usageLast.reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usageLast.reduce((acc, el) => acc + el.cma_api_calls, 0),
            bytes: usageLast.reduce((acc, el) => acc + el.assets_traffic_bytes, 0),
        },
        current: {
            days: usageCurrent.length,
            cda: usageCurrent.reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usageCurrent.reduce((acc, el) => acc + el.cma_api_calls, 0),
            bytes: usageCurrent.reduce((acc, el) => acc + el.assets_traffic_bytes, 0),
        }
    };
    const usageTable = [
        ['Date', 'CDA', 'CMA', "Traffic"],
        ...usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).map(el => [
            el.date,
            fNumber(el.cda_api_calls),
            fNumber(el.cma_api_calls),
            prettyBytes(el.assets_traffic_bytes, { maximumFractionDigits: 1 })
        ])
    ];
    const totalTable = [
        ['Period', 'CDA', 'CDA (avg)', 'CMA', 'CMA (avg)', 'Traffic'],
        ['Last month', fNumber(usageTotal.last.cda), fNumber(usageTotal.last.cda / usageTotal.last.days), fNumber(usageTotal.last.cma), fNumber(usageTotal.last.cma / usageTotal.last.days), prettyBytes(usageTotal.last.bytes, { maximumFractionDigits: 1 })],
        ['Current', fNumber(usageTotal.current.cda), fNumber(usageTotal.current.cda / usageTotal.current.days), fNumber(usageTotal.current.cma), fNumber(usageTotal.current.cma / usageTotal.current.days), prettyBytes(usageTotal.current.bytes, { maximumFractionDigits: 1 })]
    ];
    const text = dedent(`
    ${site.name}
    
    ${table(usageTable, { header: { alignment: 'center', content: 'Usage (CDA / CMA)' } })}
    ${table(totalTable, { header: { alignment: 'center', content: `${site.name} - Totals` } })}

  `);
    console.log(text);
}
//# sourceMappingURL=index.js.map