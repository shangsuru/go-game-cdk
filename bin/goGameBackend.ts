#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AuthStack } from '../lib/authStack'
import { DatabaseStack } from '../lib/databaseStack'
import { APIStack } from '../lib/apiStack'

const app = new cdk.App()

const databaseStack = new DatabaseStack(app, 'DatabaseStack', {})

const authStack = new AuthStack(app, 'AuthStack', {
	stage: 'dev',
	userpoolConstructName: 'GoGameUserPool',
	identitypoolConstructName: 'GoGameIdentityPool',
	userTable: databaseStack.userTable,
})

const apiStack = new APIStack(app, 'AppSyncAPIStack', {
	userpool: authStack.userpool,
	userTable: databaseStack.userTable,
	gameTable: databaseStack.gameTable,
	messageTable: databaseStack.messageTable,
	moveTable: databaseStack.moveTable,
	challengeTable: databaseStack.challengeTable,
	unauthenticatedRole: authStack.unauthenticatedRole,
})
