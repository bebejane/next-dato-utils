#! /usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { buildClient } from '@datocms/cma-client-node';
import dedent from 'dedent-js';
import { table } from 'table';
const version = '1.0.0';
if (!process.env.DATOCMS_API_TOKEN)
    throw new Error('DATOCMS_API_TOKEN is required');
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
const program = new Command();
program
    .version(version)
    .description(`next-dato-utils v${version}`)
    .option("-i, --info", "Info DatoCMS project")
    .option("-t, --test <value>", "Test DatoCMS project")
    .parse(process.argv);
const options = program.opts();
if (options.info)
    info();
async function info() {
    const site = await client.site.find();
    const usage = await client.dailyUsages.list();
    const itemTypes = await client.itemTypes.list();
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
        ...usage.map(el => [el.date, el.cda_api_calls, el.cma_api_calls])
    ];
    console.log(dedent(`
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

    
    ${table(usageTable, { header: { alignment: 'center', content: 'Usage (CDA / CMA)' } })}
    Last month:\t${usageTotal.last.cda} / ${usageTotal.last.cma}
    Current:\t${usageTotal.curreent.cda} / ${usageTotal.curreent.cma}

  `));
}
//# sourceMappingURL=index.js.map