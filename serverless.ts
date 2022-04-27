import type { AWS } from "@serverless/typescript";

import leads from "@functions/leads";

const serverlessConfiguration: AWS = {
  service: "may4-event-api",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dynamodb-local",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: [{ "Fn::GetAtt": ["LeadsTable", "Arn"] }],
      },
    ],
  },
  functions: { leads },
  resources: {
    Resources: {
      LeadsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "leads",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "area_address",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
            {
              AttributeName: "area_address",
              KeyType: "RANGE",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev"],
      start: { migrate: true, inMemory: true },
    },
  },
};

module.exports = serverlessConfiguration;
