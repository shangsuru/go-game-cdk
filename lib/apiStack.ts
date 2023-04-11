import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import * as path from 'path'
import {
	GraphqlApi,
	Schema,
	AuthorizationType,
	FieldLogLevel,
	MappingTemplate,
} from '@aws-cdk/aws-appsync-alpha'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { IRole } from 'aws-cdk-lib/aws-iam'

interface APIStackProps extends StackProps {
	userpool: UserPool
	userTable: Table
	gameTable: Table
	messageTable: Table
	moveTable: Table
	challengeTable: Table
	unauthenticatedRole: IRole
}

export class APIStack extends Stack {
	constructor(scope: Construct, id: string, props: APIStackProps) {
		super(scope, id, props)

		const api = new GraphqlApi(this, 'GoGame', {
			name: 'GoGame',
			schema: Schema.fromAsset(path.join(__dirname, 'graphql/schema.graphql')),
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: AuthorizationType.USER_POOL,
					userPoolConfig: {
						userPool: props.userpool,
					},
				},
			},
			logConfig: {
				fieldLogLevel: FieldLogLevel.ALL,
			},
			xrayEnabled: true,
		})

		const userTableDataSource = api.addDynamoDbDataSource(
			'UserTableDataSource',
			props.userTable
		)

		userTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'updateUser',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.updateUser.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		userTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getUser',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getUser.req.vtl')
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getUser.res.vtl')
			),
		})

		const gameTableDataSource = api.addDynamoDbDataSource(
			'GameTableDataSource',
			props.gameTable
		)

		gameTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'createGame',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.createGame.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		gameTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'finishGame',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.finishGame.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		gameTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getActiveGame',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getActiveGame.req.vtl')
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getActiveGame.res.vtl')
			),
		})

		gameTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getOwnGames',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getOwnGames.req.vtl')
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getOwnGames.res.vtl')
			),
		})

		const messageTableDataSource = api.addDynamoDbDataSource(
			'MessageTableDataSource',
			props.gameTable
		)

		messageTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'sendMessage',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.sendMessage.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		const moveTableDataSource = api.addDynamoDbDataSource(
			'MoveTableDataSource',
			props.gameTable
		)

		moveTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'makeMove',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.makeMove.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		const challengeTableDataSource = api.addDynamoDbDataSource(
			'ChallengeTableDataSource',
			props.gameTable
		)

		challengeTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'createChallenge',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.createChallenge.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		challengeTableDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'deleteChallenge',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(
					__dirname,
					'graphql/mappingTemplates/Mutation.deleteChallenge.req.vtl'
				)
			),
			responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
		})

		challengeTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'getChallenges',
			requestMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getChallenges.req.vtl')
			),
			responseMappingTemplate: MappingTemplate.fromFile(
				path.join(__dirname, 'graphql/mappingTemplates/Query.getChallenges.res.vtl')
			),
		})

		new CfnOutput(this, 'GraphQLAPIURL', {
			value: api.graphqlUrl,
		})

		new CfnOutput(this, 'GraphQLAPIID', {
			value: api.apiId,
		})
	}
}
