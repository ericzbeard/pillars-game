/**
 * Copy the appropriate config file before compilation.
 */
const fs = require("fs-extra");

const subdomain = process.env.SUBDOMAIN;

fs.ensureDirSync('web/dist');
fs.copySync(`web-config/${subdomain}-web-config.ts`, 'web/pillars-web-config.ts');
fs.copySync(`api-config/${subdomain}-api-config.ts`, 'lambdas/pillars-api-config.ts');
