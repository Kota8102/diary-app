import json
import logging
import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1")

# ロガーの設定
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

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

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """HTTP レスポンスを生成する

    Args:
        status_code (int): HTTPステータスコード
        body (dict): レスポンスボディ

    Returns:
        dict: フォーマット済みのHTTPレスポンス
    """
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    }

def validate_date(date: str) -> bool:
    """日付形式を検証する

    Args:
        date (str): 検証する日付文字列

def get_title_from_dynamodb(user_id: str, date: str) -> Optional[str]:
    """ユーザーIDと日付を使用してDynamoDBからタイトルを取得する

    Args:
        user_id (str): cognitoユーザープールからのユーザーID
        date (str): 日記エントリーの日付

    Returns:
        Optional[str]: chatGPTによって生成されたタイトル、見つからない場合はNone

    Raises:
        ValueError: 環境変数が設定されていない場合
    """
    table_name = os.environ.get("TABLE_NAME")
    if not table_name:
        logger.error("TABLE_NAME environment variable is not set.")
        raise ValueError("TABLE_NAME environment variable is not set.")

    table = dynamodb.Table(table_name)

    logger.info(f"Retrieving title for user_id: {user_id} and date: {date}")

    try:
        response = table.get_item(Key={"user_id": user_id, "date": date})
        logger.info(f"Retrieved title: {response.get('Item', {}).get('title')}")
        return response.get("Item", {}).get("title")

    except ClientError as e:
        logger.error(f"DynamoDB client error: {e.response['Error']['Message']}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving data from DynamoDB: {e}")
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """ユーザーIDと日付に基づいて日記のタイトルをDynamoDBから取得するAWS Lambda
    ハンドラー関数。

    Args:
        event (dict): クエリパラメータなどを含む受信リクエストの詳細
        context (object): ランタイム情報を提供するコンテキストオブジェクト

    Returns:
        dict: ステータスコード、ヘッダー、JSONボディを含むHTTPレスポンス
    """
    try:
        # クエリパラメータの取得と検証
        query_params = event.get("queryStringParameters", {})
        if not query_params or "date" not in query_params:
            return create_response(400, {"error": "Missing required parameter: date"})

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = query_params["date"]

        if not validate_date(date):
            return create_response(400, {"error": "Invalid date format"})

        # DynamoDBからタイトルを取得
        title = get_title_from_dynamodb(user_id, date)

        return create_response(200, {"title": title or ""})

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return create_response(400, {"error": str(e)})

    except ClientError as e:
        logger.error(f"DynamoDB error: {str(e)}")
        return create_response(500, {"error": "Database operation failed"})

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(
            500,
            {
                "error": "Internal server error",
                "details": str(e)
                if os.environ.get("DEBUG")
                else "Please contact support",
            },
        )
