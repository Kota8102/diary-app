#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment");
new BackendStack(app, "BackendStack", {
  environment,
});
