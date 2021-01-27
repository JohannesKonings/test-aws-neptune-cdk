import * as cdk from '@aws-cdk/core';
const {
  CfnDBCluster,
  CfnDBSubnetGroup,
  CfnDBInstance,
  CfnDBParameterGroup,
  CfnDBClusterParameterGroup
} = require("@aws-cdk/aws-neptune");

export class NeptuneStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbCluster = new CfnDBCluster(this, "NeptuneDBCluster", {

    });
  }
}
