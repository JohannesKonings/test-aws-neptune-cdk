import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as neptune from "@aws-cdk/aws-neptune";
import * as sagemaker from "@aws-cdk/aws-sagemaker";
import * as iam from "@aws-cdk/aws-iam";
export class NeptuneStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "NeptuneAPI",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
    });

    const vpc = new ec2.Vpc(this, "NeptuneVPC");

    const lambdaFn = new lambda.Function(this, "Lambda Function", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("lambda-fns"),
      memorySize: 1024,
      vpc,
    });

    // set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", lambdaFn);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listPosts",
    });
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createPost",
    });

    const cluster = new neptune.DatabaseCluster(this, "NeptuneCluster", {
      vpc,
      instanceType: neptune.InstanceType.R5_LARGE,
    });

    cluster.connections.allowDefaultPortFromAnyIpv4("Open to the world");

    const writeAddress = cluster.clusterEndpoint.socketAddress;

    new cdk.CfnOutput(this, "writeaddress", {
      value: writeAddress,
    });

    const readAddress = cluster.clusterReadEndpoint.socketAddress;

    new cdk.CfnOutput(this, "readaddress", {
      value: readAddress,
    });

    lambdaFn.addEnvironment("WRITER", writeAddress);
    lambdaFn.addEnvironment("READER", readAddress);

    const role = new iam.Role(this, "NeptuneRole", {
      assumedBy: new iam.ServicePrincipal("sagemaker"),
    });

    const policy = new iam.Policy(this, "NeptunePolicy", {
      policyName: "NeptunePolicy",
      statements: [
        new iam.PolicyStatement({
          actions: ["*"],
          resources: ["*"],
        }),
      ],
    });

    const notebook = new sagemaker.CfnNotebookInstance(
      this,
      "NeptuneNotebook",
      {
        instanceType: "ml.t2.medium",
        volumeSizeInGb: 5,
        roleArn: role.roleArn,
      }
    );

    cdk.Tags.of(this).add("Name", "NeptuneStack");
  }
}
