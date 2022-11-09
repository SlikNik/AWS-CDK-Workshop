import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "../lib/hitcounter";

test("DynamoDB Table Created", () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, "TestConstruct", {
        downstream: new lambda.Function(stack, "TestFunction", {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "hello.handler",
            code: lambda.Code.fromAsset("lambda"),
        }),
    });
    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
    // TDD
    template.hasResourceProperties("AWS::DynamoDB::Table", {
        SSESpecification: {
            SSEEnabled: true,
        },
    });
});

test("Lambda Has Environment Variable", () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, "TestConstruct", {
        downstream: new lambda.Function(stack, "TestFunction", {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "hello.handler",
            code: lambda.Code.fromAsset("lambda"),
        }),
    });
    // THEN
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual({
        Variables: {
            DOWNSTREAM_FUNCTION_NAME: {
                Ref: "TestFunction22AD90FC",
            },
            HITS_TABLE_NAME: {
                Ref: "TestConstructHits080F8C75",
            },
        },
    });
});

test("read capacity can be configured", () => {
    const stack = new cdk.Stack();

    expect(() => {
        new HitCounter(stack, "TestConstructor", {
            downstream: new lambda.Function(stack, "TestFunction", {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: "hello.handler",
                code: lambda.Code.fromAsset("lambda"),
            }),
            readCapacity: 3,
        });
    }).toThrow(/readCapacity must be greater than 5 and less than 20/);
});
