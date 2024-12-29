import base64
import json
import logging
import os
import random
import uuid
from datetime import datetime
from io import BytesIO

import boto3
from botocore.exceptions import ClientError
from PIL import Image

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def validate_input(body):
    """
    バリデーションを行い、入力データの整合性を確認する関数。

    Args:
        body (dict): リクエストボディの JSON データ。

    Raises:
        ValueError: 必須フィールドが不足している場合や日付形式が不正な場合に発生。
    """
    required_fields = ["date", "content"]
    for field in required_fields:
        if field not in body:
            raise ValueError(f"必須フィールドがありません: {field}")

    try:
        datetime.strptime(body["date"], "%Y-%m-%d")
    except ValueError:
        raise ValueError("不正な日付形式です。YYYY-MM-DDの形式を使用してください")


def save_to_dynamodb(user_id, date, content, is_deleted=False):
    """
    DynamoDB に日記のアイテムを保存し、生成した diary_id を返す関数。

    Args:
        user_id (str): ユーザーの一意の ID。
        date (str): 日記の日付。
        content (str): 日記の内容。
        is_deleted (bool): 削除済みフラグ。デフォルトは False。

    Returns:
        str: 新たに生成された日記の ID。
    """
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.getenv("TABLE_NAME"))

    diary_id = str(uuid.uuid4())
    item = {
        "user_id": user_id,
        "date": date,
        "diary_id": diary_id,
        "content": content,
        "is_deleted": is_deleted,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    table.put_item(Item=item)
    return diary_id


def load_random_image_from_s3(bucket_name, prefix):
    """
    指定されたS3バケットとプレフィックスからPNG画像ファイル一覧を取得し、
    その中からランダムで1つの画像を選択してロードし、PIL Imageとして返す。
    Args:
        bucketname (str): 元画像の入ったバケット名
        purefix (str): ランダムに取得した画像の入ったフォルダ名
    Returns:
        ogject: PILイメージオブジェクト。
    Raises:
        ValueError: 指定したプレフィックスがバケット内に存在しない。もしくはPNG画像が存在しない。
        ClientError: S3操作などのAWSクライアントエラー
        Exception: S3操作に関するその他のエラー

    """
    s3 = boto3.client("s3")

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

        # 選んだ画像のみをS3から取得
        resp = s3.get_object(Bucket=bucket_name, Key=chosen_key)
        img = Image.open(resp["Body"]).convert("RGBA")

        return img

    except ClientError as e:
        # S3操作などのAWSクライアントエラー
        raise RuntimeError(f"Failed to get random image from S3: {e}") from e

    except Exception as e:
        # その他の一般的なエラー
        raise RuntimeError(f"Unexpected error in load_random_image_from_s3: {e}") from e


def flower_wrap(flower_id):
    if not flower_id:
        raise ValueError("Invalid flower ID provided.")
    ...
    """
    ランダムに選択した包装紙(front/back)で指定flower_idの花を包み、
    base64エンコードした画像を返すPython関数。
    """
    bucket_name = os.environ["FLOWER_IMAGE_BUCKET_NAME"]

    # パレット（背景）を作成
    palette_width = 700
    palette_height = 700
    palette_color = (0, 0, 0, 0)  # 透明背景
    palette = Image.new("RGBA", (palette_width, palette_height), palette_color)

    # 包装紙(front/back)はランダムに選択
    wraper_front = load_random_image_from_s3(bucket_name, "wrapers_front/")
    wraper_back = load_random_image_from_s3(bucket_name, "wrapers_back/")
    # 花画像は固定キー flowers/{flower_id}.png を読み込む想定
    flower_key = f"single_flowers/{flower_id}.png"
    flower = load_random_image_from_s3(bucket_name, flower_key)

    # 包装紙(背面)をパレットに合成
    wraper_position_back = ((palette_width - wraper_back.width) // 2, 75)
    palette.paste(wraper_back, wraper_position_back, wraper_back)

    # 花をパレットに合成（中心揃え）
    flower_position = ((palette_width - flower.width) // 2, 0)
    palette.paste(flower, flower_position, flower)

    # 包装紙(前面)をパレットに合成
    wraper_position_front = ((palette_width - wraper_front.width) // 2, 75)
    palette.paste(wraper_front, wraper_position_front, wraper_front)

    # 画像をBase64にエンコードして戻す
    buffer = BytesIO()
    try:
        palette.save(buffer, format="PNG")
    except Exception as e:
        raise RuntimeError(f"Failed to save image: {e}")
    buffer.seek(0)
    encoded_image = base64.b64encode(buffer.read()).decode("utf-8")

    return encoded_image


def invoke_flower_lambda(user_id, date, content):
    """
    Flower Lambda を呼び出して日記内容に基づいて花の ID を取得する関数。

    Args:
        user_id (str): ユーザーの一意の ID。
        date (str): 日記の日付。
        content (str): 日記の内容。

    Returns:
        str: 取得された花の ID。

    Raises:
        Exception: 呼び出しやレスポンスの処理が失敗した場合に発生。
    """
    lambda_client = boto3.client("lambda")
    response = lambda_client.invoke(
        FunctionName=os.getenv("FLOWER_SELECT_FUNCTION_NAME"),
        InvocationType="RequestResponse",
        Payload=json.dumps(
            {"user_id": user_id, "date": date, "diary_content": content}
        ),
    )

    logger.info(f"response: {response['Payload']}")
    response_payload = json.loads(response["Payload"].read())
    body = json.loads(response_payload["body"])
    return body["flower_id"]


def lambda_handler(event, context):
    """
    メインの Lambda ハンドラー関数。入力データの検証、DynamoDB への保存、
    Flower Lambda の呼び出しを行い、成功レスポンスを返す。

    Args:
        event (dict): Lambda イベントデータ。
        context (object): Lambda 実行コンテキストオブジェクト。

    Returns:
        dict: HTTP ステータスコード、レスポンスボディ、HTTP ヘッダーを含むレスポンスオブジェクト。
    """
    try:
        body = json.loads(event["body"])
        validate_input(body)

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        date = body["date"]
        content = body["content"]

        # DynamoDB にアイテムを保存
        save_to_dynamodb(user_id, date, content)

        # Flower Lambda を呼び出して花の ID を取得
        flower_id = invoke_flower_lambda(user_id, date, content)
        if not flower_id:
            raise ValueError("Invalid flower ID returned from flower Lambda")

        flower_image = flower_wrap(flower_id)
        if not flower_image:
            raise ValueError("flower Image not found")

        # 成功レスポンスの返却
        return {
            "statusCode": 201,
            "body": json.dumps(
                {
                    "message": "Success",
                    "flower_id": flower_id,
                    "flower_image": flower_image,
                }
            ),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except ValueError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "サーバー内部エラーが発生しました"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        }
