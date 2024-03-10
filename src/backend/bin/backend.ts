#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();
const targetEnv = app.node.tryGetContext("targetEnv") as string;
console.log(`environment = ${targetEnv}`);
new BackendStack(app, "BackendStack", {});
