import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from "./hitcounter";

export class CdkWorkshopStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // defines an AWS Lambda resource
        const hello = new lambda.Function(this, "HelloHandler", {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
            handler: "hello.handler", // file is "hello", function is "handler"
        });

        const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
            downstream: hello,
        });

        // defines an API Gateway REST API resource backed by our "hello" function.
        new apigw.LambdaRestApi(this, "Workshop Endpoint", {
            handler: helloWithCounter.handler,
        });
    }
}
