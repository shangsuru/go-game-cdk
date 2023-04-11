#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GoGameCdkStack } from '../lib/go_game_cdk-stack';

const app = new cdk.App();
new GoGameCdkStack(app, 'GoGameCdkStack');
