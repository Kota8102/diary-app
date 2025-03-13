import json
import os
import random
from datetime import datetime
from io import BytesIO

import boto3
from botocore.exceptions import ClientError
from PIL import Image

s3 = boto3.client("s3")
sqs = boto3.client("sqs")


def load_random_image_from_s3(bucket_name, prefix):
    """
    指定されたS3バケットとプレフィックスからランダムなPNG画像をロード。
    """
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        if "Contents" not in response:
            raise ValueError(
                f"No images found under prefix {prefix} in bucket {bucket_name}"
            )

        # PNGファイルのみをフィルタ
        png_keys = [
            obj["Key"] for obj in response["Contents"] if obj["Key"].endswith(".png")
        ]
        if not png_keys:
            raise ValueError(
                f"No PNG images found under prefix {prefix} in bucket {bucket_name}"
            )

        # ランダムに1つのキーを選択
        chosen_key = random.choice(png_keys)
        resp = s3.get_object(Bucket=bucket_name, Key=chosen_key)
        img = Image.open(resp["Body"]).convert("RGBA")
        return img

    except ClientError as e:
        raise RuntimeError(f"Error: Failed to get random image from S3: {e}") from e
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {e}") from e


def get_year_week(date: datetime) -> str:
    """指定された日付のISO年週を返す関数。

    渡された日付からISOカレンダーに基づく年と週番号を抽出し、
    'YYYY-WW'の形式でフォーマットした文字列を返します。
    週番号は2桁にゼロパディングされます。

    Args:
        date (datetime): ISO年週を取得するための日付。

    Returns:
        str: 'YYYY-WW'形式のISO年週を表す文字列。
    """
    # 日付からISOカレンダーの情報を取得（年、週、曜日は未使用）
    iso_year, iso_week, _ = date.isocalendar()
    # フォーマット済みの文字列を返す（週番号は2桁にゼロパディング）
    return f"{iso_year}-{iso_week:02d}"


def save_image_to_s3(bucket_name, key, image):
    """
    PIL画像をS3に保存。
    """
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    s3.put_object(Bucket=bucket_name, Key=key, Body=buffer, ContentType="image/png")


def lambda_handler(event, context):
    """
    Lambda関数のエントリーポイント。
    """
    original_bucket = os.environ["ORIGINAL_IMAGE_BUCKET_NAME"]
    flower_bucket = os.environ["FLOWER_BUCKET_NAME"]
    queue_url = os.environ["QUEUE_URL"]

    for record in event["Records"]:
        try:
            # SQSメッセージを処理
            message = json.loads(record["body"])
            user_id = message["user_id"]
            flower_id = message["flower_id"]
            date = message["date"]

            # パレットの作成
            palette_width, palette_height = 700, 700
            palette = Image.new("RGBA", (palette_width, palette_height), (0, 0, 0, 0))

            # 花と花瓶の画像をロード
            flower = load_random_image_from_s3(
                original_bucket, f"single_flowers/{flower_id}.png"
            )
            vase = load_random_image_from_s3(original_bucket, "vases/")

            # 花をパレットに貼り付け
            flower_position = ((palette_width - flower.width) // 2, 0)
            palette.paste(flower, flower_position, flower)

            # 花瓶をパレットに貼り付け
            vase_position = ((palette_width - vase.width) // 2, 120)
            palette.paste(vase, vase_position, vase)

            # 保存先のキーを構築
            today = datetime.now()
            year_week = get_year_week(today)
            output_key = f"{user_id}/{year_week}/{date}.png"

            # 合成画像を保存
            save_image_to_s3(flower_bucket, output_key, palette)

            # SQSメッセージを削除
            sqs.delete_message(
                QueueUrl=queue_url, ReceiptHandle=record["receiptHandle"]
            )

        except Exception as e:
            print(f"Error processing message: {record['messageId']}, error: {str(e)}")

    return {"statusCode": 200, "body": json.dumps("Processing complete.")}
