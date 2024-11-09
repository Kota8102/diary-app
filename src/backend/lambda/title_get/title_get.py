import json
import logging
import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
dynamodb = boto3.resource("dynamodb")


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

    Returns:
        bool: 日付が有効な場合True
    """
    # ここに日付バリデーションロジックを実装
    return bool(date and isinstance(date, str))


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

    try:
        logger.info(f"Retrieving title for user_id: {user_id} and date: {date}")
        response = table.get_item(Key={"user_id": user_id, "date": date})
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

        user_id = context.identity.cognito_identity_id
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
