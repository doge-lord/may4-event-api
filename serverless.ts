import type { AWS } from "@serverless/typescript";

import seedData from "@functions/seed-data";
import authorize from "@functions/authorize";
import login from "@functions/login";
import logout from "@functions/logout";
import visitLead from "@functions/visit-lead";
import endInvestigation from "@functions/end-investigation";
import teamsLeadCount from "@functions/teams-lead-count";

const serverlessConfiguration: AWS = {
  service: "may4-event-api",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dynamodb-local",
    "serverless-s3-local",
    "serverless-offline",
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
      S3_SEED_DATA_BUCKET:
        "${self:service}-${sls:stage, self:provider.stage}-seed-data",
      LEADS_TABLE: "leads-table-${sls:stage, self:provider.stage}",
      TEAMS_TABLE: "teams-table-${sls:stage, self:provider.stage}",
      JWT_SECRET: "${ssm:${self:service}.JWT_SECRET}",
      JWT_EXPIRY_DAYS: "${ssm:${self:service}.JWT_EXPIRY_DAYS}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
              "dynamodb:BatchWriteItem",
            ],
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
              "dynamodb:BatchWriteItem",
            ],
            Resource: [{ "Fn::GetAtt": ["TeamsTable", "Arn"] }],
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: [
              "arn:aws:s3:::${self:provider.environment.S3_SEED_DATA_BUCKET}/*",
            ],
          },
        ],
      },
    },
  },
  functions: {
    seedData,
    authorize,
    login,
    logout,
    visitLead,
    endInvestigation,
    teamsLeadCount,
  },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin":
              "'http://localhost:8080'",
            "gatewayresponse.header.Access-Control-Allow-Methods":
              "'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD'",
            "gatewayresponse.header.Access-Control-Allow-Headers":
              "'X-Requested-With, X-HTTP-Method-Override, Cache-Control, Content-Language, Content-Length, Content-Type, Expires, Cookie, Set-Cookie, Last-Modified, Pragma, Accept, WWW-Authenticate, Server-Authorization'",
            "gatewayresponse.header.Access-Control-Allow-Expose-Headers":
              "'X-Requested-With, X-HTTP-Method-Override, Cache-Control, Content-Language, Content-Length, Content-Type, Expires, Cookie, Set-Cookie, Last-Modified, Pragma, Accept, WWW-Authenticate, Server-Authorization'",
            "gatewayresponse.header.Access-Control-Allow-Credentials": "'true'",
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: { Ref: "ApiGatewayRestApi" },
        },
      },
      LeadsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.LEADS_TABLE}",
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
          TableName: "${self:provider.environment.TEAMS_TABLE}",
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
          BucketName: "${self:provider.environment.S3_SEED_DATA_BUCKET}",
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
      start: { migrate: true, inMemory: true, seed: true },
      seed: {
        domain: {
          sources: [
            {
              table: "${self:provider.environment.LEADS_TABLE}",
              sources: ["./mock-data/leads.json"],
            },
            {
              table: "${self:provider.environment.TEAMS_TABLE}",
              sources: ["./mock-data/teams.json"],
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
