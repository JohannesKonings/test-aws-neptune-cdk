#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { NeptuneStack } = require('../lib/neptune-stack');

const app = new cdk.App();
new NeptuneStack(app, 'NeptuneStack');
