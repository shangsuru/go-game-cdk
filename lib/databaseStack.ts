import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

interface DatabaseStackProps extends StackProps {}

export class DatabaseStack extends Stack {
	public readonly userTable: Table
	public readonly gameTable: Table
	public readonly messageTable: Table
	public readonly moveTable: Table
	public readonly challengeTable: Table

	constructor(scope: Construct, id: string, props: DatabaseStackProps) {
		super(scope, id, props)

		const userTable = new Table(this, 'UserTable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		userTable.addGlobalSecondaryIndex({
			indexName: 'users-by-username',
			partitionKey: { name: 'username', type: AttributeType.STRING },
			sortKey: { name: 'createdAt', type: AttributeType.STRING },
		})

		const userTableServiceRole = new Role(this, 'UserTableServiceRole', {
			assumedBy: new ServicePrincipal('dynamodb.amazonaws.com'),
		})

		userTableServiceRole.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [`${userTable.tableArn}/index/users-by-username`],
				actions: ['dymamodb:Query'],
			})
		)

		const gameTable = new Table(this, 'GameTable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		const messageTable = new Table(this, 'MessageTable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		const moveTable = new Table(this, 'MoveTable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		const challengeTable = new Table(this, 'ChallengeTable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'id', type: AttributeType.STRING },
		})

		this.userTable = userTable
		this.gameTable = gameTable
		this.messageTable = messageTable
		this.moveTable = moveTable
		this.challengeTable = challengeTable
	}
}
