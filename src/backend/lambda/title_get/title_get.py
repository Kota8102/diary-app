import json
import os

import boto3


def lambda_handler(event, context):
    """指定されたユーザーIDと日付に基づいて、DynamoDBから日記のタイトルを取得するAWS Lambdaハンドラ関数。

    この関数は以下を行います:
    - コンテキストからユーザーIDを抽出（Cognitoアイデンティティを使用）。
    - 受信イベントのクエリパラメータから日付を抽出。
    - ユーザーIDと日付を使用してDynamoDBから日記のタイトルを取得。
    - タイトルが見つかった場合は、HTTP 200ステータスコードでタイトルを含むJSONレスポンスを返却。
    - タイトルが見つからなかった場合は、空のタイトルを返却。
    - 例外が発生した場合は、HTTP 400ステータスコードとエラーメッセージを返却。

    Args:
        event (dict): クエリパラメータやその他のデータを含む受信リクエストの詳細。
        context (object): 実行時情報を提供するコンテキストオブジェクト。

    Returns:
        dict: ステータスコード、ヘッダー、JSON本文を含むHTTPレスポンス。
    """
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = event["queryStringParameters"]["date"]

        # Fetch item from DynamoDB
        title = get_title_from_dynamodb(user_id, date)

        if title:
            return {
                "statusCode": 200,
                "body": json.dumps({"title": title}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        else:
            return {
                "statusCode": 200,
                "body": json.dumps({"title": ""}),
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
    except Exception as e:
        print(f"error!! {e}")
        return {
            "statusCode": 400,
            "body": json.dumps(f"An error occurred: {str(e)}"),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }


def get_title_from_dynamodb(user_id, date):
    """DynamoDBからユーザーIDと日付を使用してタイトルを取得。

    Args:
        user_id (string): CognitoユーザープールからのユーザーID
        date (string): 日記のエントリーの日付

    Returns:
        title (string): ChatGPTによって生成されたタイトル
    """
    dynamodb = boto3.resource("dynamodb")
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={"user_id": user_id, "date": date})

        if "Item" in response:
            return response["Item"].get("title")
        else:
            return None
    except Exception as e:
        print(f"Error fetching data from DynamoDB: {e}")
        return None
