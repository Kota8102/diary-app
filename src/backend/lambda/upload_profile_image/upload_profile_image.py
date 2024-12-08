import base64
import logging
import os

import boto3

# S3 バケット名
S3_BUCKET = os.environ["USER_SETTINGS_BUCKET"]

# S3 クライアントの初期化
s3_client = boto3.client("s3")

# ログ設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        # Cognito Authorizer から user_id を取得
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        # リクエストの body から画像データを取得
        body = event["body"]
        is_base64_encoded = event.get("isBase64Encoded", False)

        if is_base64_encoded:
            image_data = base64.b64decode(body)
        else:
            image_data = body.encode("utf-8")

        # S3 パスを設定
        s3_key = f"profile/image/{user_id}.png"

        # S3 にアップロード
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_data,
            ContentType="image/png",
        )

        logger.info(f"Image uploaded successfully to {S3_BUCKET}/{s3_key}")

        # レスポンスを返す
        return {
            "statusCode": 200,
            "body": f"Profile image uploaded successfully for user_id: {user_id}",
        }

    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return {"statusCode": 500, "body": f"Failed to upload image: {str(e)}"}
