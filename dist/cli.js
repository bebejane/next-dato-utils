#! /usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "dotenv/config", "commander", "@datocms/cma-client-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("dotenv/config");
    const commander_1 = require("commander");
    const cma_client_node_1 = require("@datocms/cma-client-node");
    const client = (0, cma_client_node_1.buildClient)({
        apiToken: process.env.DATOCMS_API_TOKEN,
        environment: process.env.DATOCMS_ENVIRONMENT || 'main',
    });
    const program = new commander_1.Command();
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
`);
    }
});
//# sourceMappingURL=cli.js.map