import base64
import logging
import os

import boto3
from botocore.exceptions import ClientError

# ログ設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_image_from_s3(key):
    """
    S3 から画像データを取得

    Args:
        key (string): S3 バケット内のファイルのキー（パス）。

    Returns:
        bytes: 取得した画像データ。
        string: 画像のコンテンツタイプ。

    Raises:
        RuntimeError: S3 からデータを取得中にエラーが発生した場合。
    """
    # S3 クライアントの初期化
    s3_client = boto3.client("s3")
    bucket = os.environ["USER_SETTINGS_BUCKET"]

    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        data = response["Body"].read()
        content_type = response["ContentType"]
        return data, content_type
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise FileNotFoundError(
                f"The key {key} does not exist in bucket {bucket}"
            ) from e
        raise RuntimeError(f"Failed to retrieve image from S3: {str(e)}") from e


def lambda_handler(event, context):
    """
    Lambda 関数のエントリーポイント。API Gateway からのリクエストを処理し、ユーザーのプロフィール画像を S3 から取得。

    Args:
        event (dict): API Gateway からのリクエストイベント。
        context (object): Lambda 実行環境の情報。

    Returns:
        dict: レスポンスコードとメッセージを含む辞書。
    """
    logger.info("get profile image function")
    try:
        # Cognito Authorizer から user_id を取得
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        # S3 パスを設定
        s3_key = f"profile/image/{user_id}.png"

        # S3 から画像を取得
        image_data, content_type = get_image_from_s3(s3_key)

        # Base64 エンコード
        encoded_image = base64.b64encode(image_data).decode("utf-8")

        # 成功レスポンスを返す
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": content_type,
                "Content-Encoding": "base64",
                "Access-Control-Allow-Origin": "*",
            },
            "body": encoded_image,
            "isBase64Encoded": True,
        }

    except FileNotFoundError as fe:
        logger.error(f"File not found: {str(fe)}")
        return {"statusCode": 404, "body": f"Image not found: {str(fe)}"}
    except RuntimeError as re:
        logger.error(f"Runtime error: {str(re)}")
        return {"statusCode": 500, "body": f"Server error: {str(re)}"}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"statusCode": 500, "body": f"Failed to retrieve image: {str(e)}"}
