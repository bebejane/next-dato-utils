#! /usr/bin/env node

import 'dotenv/config'
import { Command } from 'commander'
import { buildClient } from '@datocms/cma-client-node'

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN as string,
  environment: process.env.DATOCMS_ENVIRONMENT as string || 'main',
})

const program = new Command();

program
  .version("1.0.0")
  .description("next dato utils")
  .option("-i, --info", "Info DatoCMS project")
  .option("-t, --test <value>", "Test DatoCMS project")
  .parse(process.argv);

const options = program.opts();

if (options.info)
  info();

async function info() {
  const site = await client.site.find();
  const itemTypes = await client.itemTypes.list();

  console.log(`
${site.name}
-------------------------------
Timezone: ${site.timezone}
Locales: ${site.locales}

MODELS
-------------------------------
${itemTypes.filter(el => !el.modular_block).map(itemType => itemType.api_key).join('\n')}

BLOCKS
-------------------------------
${itemTypes.filter(el => el.modular_block).map(itemType => itemType.api_key).join('\n')}
`)

}
