import { dbClient } from "@libs/db-client";
import * as bcrypt from "bcryptjs";

import { Team } from "@libs/models/team";
import { Lead } from "@libs/models/lead";

export class TeamManager {
  static async login(id: string, password: string) {
    const { Item: result } = await dbClient
      .get({
        TableName: "teams",
        Key: { id },
      })
      .promise();

    if (!result) {
      throw new Error("ITEM_NOT_FOUND");
    }

    const match = await bcrypt.compare(password, result.password);

    if (!match) {
      throw new Error("PASSWORD_DOES_NOT_MATCH");
    }

    return this._parseToModel(result);
  }

  static async getTeamById(id: string) {
    const { Item: result } = await dbClient
      .get({
        TableName: "teams",
        Key: { id },
      })
      .promise();

    if (!result) {
      throw new Error("ITEM_NOT_FOUND");
    }

    return this._parseToModel(result);
  }

  static async markLeadAsVisited(id: string, lead: Lead) {
    const params = {
      ExpressionAttributeNames: {
        "#leadsVisited": "leadsVisited",
        "#investigationEndDate": "investigationEndDate",
      },
      ExpressionAttributeValues: {
        ":leadsVisited": [
          {
            leadId: lead.id,
            address: lead.address,
            timestamp: Date.now(),
          },
        ],
      },
      UpdateExpression:
        "SET #leadsVisited = list_append(#leadsVisited, :leadsVisited)",
      ConditionExpression: "attribute_not_exists(#investigationEndDate)",
      Key: { id },
      TableName: "teams",
      ReturnValues: "ALL_NEW",
    };

    try {
      const { Attributes } = await dbClient.update(params).promise();
      return this._parseToModel(Attributes);
    } catch (error) {
      if (error.code === "ConditionalCheckFailedException") {
        const team = await this.getTeamById(id);

        if (team.leadsVisited.some(({ leadId }) => leadId === lead.id)) {
          return team;
        }

        throw new Error("ACTION_NOT_ALLOWED");
      }

      throw error;
    }
  }

  static async endInvestigation(id: string) {
    const params = {
      ExpressionAttributeNames: {
        "#investigationEndDate": "investigationEndDate",
      },
      ExpressionAttributeValues: {
        ":investigationEndDate": Date.now(),
      },
      UpdateExpression: "SET #investigationEndDate = :investigationEndDate",
      ConditionExpression: "attribute_not_exists(#investigationEndDate)",
      Key: { id },
      TableName: "teams",
      ReturnValues: "ALL_NEW",
    };

    try {
      const { Attributes } = await dbClient.update(params).promise();

      return this._parseToModel(Attributes);
    } catch (error) {
      if (error.code === "ConditionalCheckFailedException") {
        throw new Error("ACTION_NOT_ALLOWED");
      }
      throw error;
    }
  }

  private static _parseToModel(item: any): Team {
    const { id, leadsVisited, investigationEndDate, solutionEndDate } = item;

    const distinctLeadsCount = Array.from(
      leadsVisited.reduce((acc, val) => acc.add(val.leadId), new Set())
    ).length;

    return {
      id,
      leadsVisited,
      distinctLeadsCount,
      investigationEndDate,
      solutionEndDate,
    };
  }
}
