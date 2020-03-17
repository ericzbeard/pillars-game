/**
 * Copy the appropriate config file before compilation.
 */
const fs = require("fs-extra");

const subdomain = process.env.SUBDOMAIN;

fs.ensureDirSync('web/dist');
fs.copySync(`config/${subdomain}-web-config.ts`, 'config/pillars-web-config.ts');
fs.copySync(`config/${subdomain}-api-config.ts`, 'config/pillars-api-config.ts');
