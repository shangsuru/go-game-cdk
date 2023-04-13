import {
	CfnOutput,
	RemovalPolicy,
	Stack,
	StackProps,
} from 'aws-cdk-lib'
import {
	AccountRecovery,
	UserPool,
	UserPoolClient,
	VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import {
	IdentityPool,
	UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import { IRole } from 'aws-cdk-lib/aws-iam'
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda'
import * as path from 'path'
import { Table } from 'aws-cdk-lib/aws-dynamodb'

interface AuthStackProps extends StackProps {
	readonly stage: string
	readonly userpoolConstructName: string
	readonly identitypoolConstructName: string
	readonly userTable: Table
}

export class AuthStack extends Stack {
	public readonly identityPoolId: CfnOutput
	public readonly authenticatedRole: IRole
	public readonly unauthenticatedRole: IRole
	public readonly userpool: UserPool

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props)

		const addUserFunc = new Function(this, 'postConfirmTriggerFunc', {
			runtime: Runtime.NODEJS_16_X,
			handler: 'addUserToDB.main',
			code: Code.fromAsset(
				path.join(__dirname, 'functions')
			),
			environment: {
				TABLENAME: props.userTable.tableName,
			},
		})

		const userPool = new UserPool(this, `${props.userpoolConstructName}`, {
			selfSignUpEnabled: true,
			removalPolicy: RemovalPolicy.DESTROY,
			accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
			userVerification: {
				emailStyle: VerificationEmailStyle.CODE,
			},
			autoVerify: {
				email: true,
			},
			standardAttributes: {
				email: {
					required: true,
					mutable: true,
				},
			},
			lambdaTriggers: {
				postConfirmation: addUserFunc,
			},
		})

		props.userTable.grantWriteData(addUserFunc)

		const userPoolClient = new UserPoolClient(
			this,
			`${props.userpoolConstructName}Client`,
			{
				userPool,
			}
		)

		const identityPool = new IdentityPool(
			this,
			props.identitypoolConstructName,
			{
				identityPoolName: props.identitypoolConstructName,
				allowUnauthenticatedIdentities: true,
				authenticationProviders: {
					userPools: [
						new UserPoolAuthenticationProvider({ userPool, userPoolClient }),
					],
				},
			}
		)

		this.authenticatedRole = identityPool.authenticatedRole
		this.unauthenticatedRole = identityPool.unauthenticatedRole
		this.userpool = userPool

		this.identityPoolId = new CfnOutput(this, 'IdentityPoolId', {
			value: identityPool.identityPoolId,
		})

		new CfnOutput(this, 'UserPoolId', {
			value: userPool.userPoolId,
		})

		new CfnOutput(this, 'UserPoolClientId', {
			value: userPoolClient.userPoolClientId,
		})
	}
}
