import base64
import json
import logging
import os
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# DynamoDBクライアント
dynamodb = boto3.client("dynamodb")


def get_flower_id_from_dynamodb(user_id: str, date: str) -> str:
    """
    DynamoDBからflower_idを取得する

    Args:
        user_id (str): ユーザーID
        date (str): 日付

    Returns:
        str: flower_id
    """
    table_name = os.environ["GENERATIVE_AI_TABLE_NAME"]

    try:
        response = dynamodb.get_item(
            TableName=table_name, Key={"user_id": {"S": user_id}, "date": {"S": date}}
        )
        if "Item" in response:
            flower_id = response["Item"]["flower_id"]["S"]
            logger.info(f"Flower ID retrieved: {flower_id}")
            return flower_id
        else:
            logger.info(f"No flower ID found for user_id: {user_id}, date: {date}")
            return ""
    except ClientError as e:
        logger.error(f"DynamoDB ClientError: {e}")
        raise


def get_img_from_s3(flower_id: str) -> str:
    """
    S3から画像を取得する

    Args:
        flower_id (str): Flower ID

    Returns:
        str: 画像のバイナリデータ（Base64エンコード済み）
    """
    s3 = boto3.client("s3")
    bucket_name = os.environ["FLOWER_BUCKET_NAME"]
    s3_key = f"flowers/{flower_id}.png"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        body = response["Body"].read()
        logger.info(f"Image fetched from S3: {s3_key}")
        return base64.b64encode(body).decode("utf-8")
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            logger.info(f"Image not found: {s3_key}")
            return None
        logger.error(f"S3 operation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Error processing S3 response: {e}")
        return None


def create_response(
    status_code: int, body: dict = None, is_image: bool = False
) -> dict:
    """
    レスポンスを生成する

    Args:
        status_code (int): HTTPステータスコード
        body (dict, optional): レスポンスボディ
        is_image (bool, optional): 画像レスポンスかどうか

    Returns:
        dict: APIGatewayのレスポンス形式
    """
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "image/png" if is_image else "application/json",
    }

    response = {"statusCode": status_code, "headers": headers}

    if body is not None:
        response["body"] = json.dumps(body)
        if is_image:
            response["isBase64Encoded"] = True

    return response


def validate_query_params(event: Dict[str, Any]) -> str:
    """
    クエリパラメータを検証する

    Args:
        event (Dict[str, Any]): イベント

    Returns:
        str: 検証済みの日付文字列

    Raises:
        ValueError: 日付パラメータが不正な場合
    """
    query_params = event.get("queryStringParameters", {})
    if not query_params or "date" not in query_params:
        logger.error("Missing required parameter: date")
        raise ValueError("Missing required parameter: date")

    date = query_params["date"]

    # yyyy-mm-dd形式かチェック
    import re

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        logger.error("Date must be in yyyy-mm-dd format")
        raise ValueError("Date must be in yyyy-mm-dd format")

    return date


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    花の画像を取得する

    Args:
        event (Dict[str, Any]): イベント
        context (Any): コンテキスト

    Returns:
        Dict[str, Any]: レスポンス
    """
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    date = validate_query_params(event)

    try:
        # DynamoDBからflower_idを取得
        flower_id = get_flower_id_from_dynamodb(user_id, date)
        if not flower_id:
            return create_response(404, {"error": "Flower not found"})

        # S3から画像を取得
        if flower_id:
            image = get_img_from_s3(flower_id)
        if image:
            return create_response(status_code=200, body=image, is_image=True)
        else:
            return create_response(404, {"error": "Image not found"})
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
