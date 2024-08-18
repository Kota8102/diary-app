import json
import os

import boto3


def lambda_handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.getenv("TABLE_NAME"))

    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    date = event["queryStringParameters"]["date"]

    try:
        # DynamoDB テーブルからアイテムをクエリ
        response = table.get_item(
            Key={
                "user_id": user_id,
                "date": date,
            }
        )
        item = response.get("Item")

        if not item:
            return {
                "statusCode": 200,
                "body": json.dumps(""),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }

        return {
            "statusCode": 200,
            "body": json.dumps(item),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(f"Error reading diary: {str(e)}"),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
