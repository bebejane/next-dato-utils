#! /usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { buildClient } from '@datocms/cma-client-node';
import dedent from 'dedent-js';
import { table } from 'table';
const version = '1.0.0';
const program = new Command();
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
const client = buildClient({
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
    const text = dedent(`
    ${site.name}
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
    const [site, usage] = await Promise.all([
        client.site.find(),
        client.dailyUsages.list()
    ]);
    const usageTotal = {
        last: {
            cda: usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth()).reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usage.filter(el => new Date(el.date).getMonth() < new Date().getMonth()).reduce((acc, el) => acc + el.cma_api_calls, 0),
        },
        curreent: {
            cda: usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).reduce((acc, el) => acc + el.cda_api_calls + el.cma_api_calls, 0),
            cma: usage.filter(el => new Date(el.date).getMonth() === new Date().getMonth()).reduce((acc, el) => acc + el.cma_api_calls, 0),
        }
    };
    const usageTable = [
        ['Date', 'CDA', 'CMA'],
        ...usage.map(el => [el.date, el.cda_api_calls.toLocaleString(), el.cma_api_calls.toLocaleString()])
    ];
    const text = dedent(`
    ${site.name}
    
    ${table(usageTable, { header: { alignment: 'center', content: 'Usage (CDA / CMA)' } })}
    Last month:\t${usageTotal.last.cda.toLocaleString()} / ${usageTotal.last.cma.toLocaleString()}
    Current:\t${usageTotal.curreent.cda.toLocaleString()} / ${usageTotal.curreent.cma.toLocaleString()} 
  `);
    console.log(text);
}
//# sourceMappingURL=index.js.map