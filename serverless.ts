import type { AWS } from "@serverless/typescript";

import authorize from "@functions/authorize";
import login from "@functions/login";
import logout from "@functions/logout";
import visitLeads from "@functions/visit-leads";

const serverlessConfiguration: AWS = {
  service: "may4-event-api",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dynamodb-local",
  ],
  useDotenv: true,
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
        Action: ["dynamodb:Query", "dynamodb:Scan", "dynamodb:GetItem"],
        Resource: [{ "Fn::GetAtt": ["LeadsTable", "Arn"] }],
      },
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
        Resource: [{ "Fn::GetAtt": ["TeamsTable", "Arn"] }],
      },
    ],
  },
  functions: {
    authorize,
    login,
    logout,
    visitLeads,
  },
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
      TeamsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "teams",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      SeedDataBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "seed-data",
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
