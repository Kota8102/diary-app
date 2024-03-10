#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();
const environment = app.node.tryGetContext("ENVIRONMENT") as string;
if (environment == undefined) {
  throw new Error("envrionment is not set");
}
console.log(`environment = ${environment}`);
new BackendStack(app, "BackendStack", {
  environment,
});
