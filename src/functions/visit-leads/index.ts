import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "leads/{id}/visit",
        authorizer: {
          name: "authorize",
          resultTtlInSeconds: 300,
          type: "request",
        },
      },
    },
  ],
};
