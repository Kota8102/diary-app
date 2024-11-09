import json
import logging
import os

import boto3

logger = logging.getLogger(__name__)


def get_title_from_dynamodb(user_id, date):
    """ユーザーIDと日付を使用してDynamoDBからタイトルを取得する

    Args:
        user_id (string): cognitoユーザープールからのユーザーID
        date (string): 日記エントリーの日付

    Returns:
        title (string): chatGPTによって生成されたタイトル

    """

    # 環境変数が設定されていない場合はエラー
    table_name = os.environ["TABLE_NAME"]
    if not table_name:
        logger.error("TABLE_NAME environment variable is not set.")
        raise ValueError("TABLE_NAME environment variable is not set.")

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    try:
        logger.info(f"Retrieving title for user_id: {user_id} and date: {date}")
        response = table.get_item(Key={"user_id": user_id, "date": date})

        if "Item" in response:
            return response["Item"].get("title")
        else:
            return None
    except Exception as e:
        logger.error(f"DynamoDBからのデータ取得中にエラーが発生しました: {e}")
        return None


def lambda_handler(event, context):
    """ユーザーIDと日付に基づいて日記のタイトルをDynamoDBから取得するAWS Lambda
    ハンドラー関数。

    Args:
        event (dict): クエリパラメータなどを含む受信リクエストの詳細
        context (object): ランタイム情報を提供するコンテキストオブジェクト

    Returns:
        dict: ステータスコード、ヘッダー、JSONボディを含むHTTPレスポンス
    """
    try:
        user_id = context.identity.cognito_identity_id
        date = event["queryStringParameters"]["date"]

        # DynamoDBからアイテムを取得
        title = get_title_from_dynamodb(user_id, date)

        if title:
            logger.info(f"Retrieved title: {title}")
            return {
                "statusCode": 200,
                "body": json.dumps({"title": title}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        else:
            logger.info("No title found")
            return {
                "statusCode": 200,
                "body": json.dumps({"title": ""}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return {
            "statusCode": 400,
            "body": json.dumps(f"An error occurred: {str(e)}"),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
