import base64
import logging
import os

import boto3

# ログ設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def decode_image_data(encoded_body):
    """
    Base64 エンコードされた画像データをデコード

    Args:
        encoded_body (string): Base64 エンコードされた画像データ。

    Returns:
        bytes: デコードされた画像データ。

    Raises:
        ValueError: `encoded_body` が無効な Base64 データの場合。
    """
    try:
        return base64.b64decode(encoded_body)
    except Exception as e:
        raise ValueError("Invalid base64-encoded image data") from e


def upload_to_s3(key, data, content_type="image/png"):
    """
    S3 に画像データをアップロード

    Args:
        key (string): S3 バケット内のファイルのキー（パス）。
        data (bytes): アップロードする画像データ。
        content_type (string): 画像のコンテンツタイプ（デフォルトは "image/png"）。

    Raises:
        RuntimeError: S3 アップロード中にエラーが発生した場合。
    """
    # S3 クライアントの初期化
    s3_client = boto3.client("s3")
    # S3 バケット名
    bucket = os.environ["USER_SETTINGS_BUCKET"]
    try:
        s3_client.put_object(
            Bucket=bucket, Key=key, Body=data, ContentType=content_type
        )
        logger.info(f"Image uploaded successfully to {bucket}/{key}")
    except Exception as e:
        raise RuntimeError(f"Failed to upload image to S3: {str(e)}") from e


def lambda_handler(event, context):
    """
    Lambda 関数のエントリーポイント。API Gateway からのリクエストを処理し、ユーザーのプロフィール画像を S3 にアップロード。

    Args:
        event (dict): API Gateway からのリクエストイベント。
        context (object): Lambda 実行環境の情報。

    Returns:
        dict: レスポンスコードとメッセージを含む辞書。
    """
    logger.info("upload profile image function")
    try:
        # Cognito Authorizer から user_id を取得
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        # リクエストの body から画像データを取得
        body = event.get("body", "")
        image_data = decode_image_data(body)

        # S3 パスを設定
        s3_key = f"profile/image/{user_id}.png"

        # S3 にアップロード
        upload_to_s3(s3_key, image_data)

        # 成功レスポンスを返す
        return {
            "statusCode": 200,
            "body": f"Profile image uploaded successfully for user_id: {user_id}",
        }

    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return {"statusCode": 400, "body": f"Invalid input: {str(ve)}"}
    except RuntimeError as re:
        logger.error(f"Runtime error: {str(re)}")
        return {"statusCode": 500, "body": f"Server error: {str(re)}"}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"statusCode": 500, "body": f"Failed to upload image: {str(e)}"}
