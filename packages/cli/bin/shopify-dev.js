#!/usr/bin/env node

import { run, flush, Errors, settings } from '@oclif/core';
import { exec, execSync } from "child_process";
import path from 'path';
import { fileURLToPath } from 'url';

console.log("Bundling @shopify/cli-kit and @shopify/cli");
execSync("yarn build", {cwd: path.join(path.dirname(fileURLToPath(import.meta.url)), "../../cli-kit"), stdio: 'ignore'})
execSync("yarn build", {cwd: path.join(path.dirname(fileURLToPath(import.meta.url)), ".."), stdio: 'ignore'})

settings.debug = true;

// Start the CLI
run(void 0, import.meta.url).then(flush).catch(Errors.handle)