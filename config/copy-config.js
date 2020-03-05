/**
 * Copy the appropriate config file before compilation.
 */
const fs = require("fs-extra");

const subdomain = process.env.SUBDOMAIN;

fs.copySync(`config/${subdomain}-config.ts`, 'config/pillars-config.ts');
