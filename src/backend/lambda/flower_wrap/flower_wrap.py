import base64
import json
import os
import random
from io import BytesIO

import boto3
from PIL import Image


def create_palette(width, height, color=(255, 255, 255, 255)):
    """
    任意の大きさと色のパレット（背景）を作成する
    """
    return Image.new("RGBA", (width, height), color)


def load_random_image_from_s3(bucket_name, prefix, scale_factor=1.0):
    """
    指定されたS3バケットとプレフィックスからPNG画像ファイル一覧を取得し、
    その中からランダムで1つの画像を選択してロードし、PIL Imageとして返す。
    """
    s3 = boto3.client("s3")
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
    if scale_factor != 1:
        img = img.resize(
            (int(img.width * scale_factor), int(img.height * scale_factor))
        )
    return img


def lambda_handler(event, context):
    # 環境変数からS3バケット名を取得
    bucket_name = os.environ["FLOWER_BUCKET_NAME"]

    # パレットの大きさを指定
    palette_width = 700
    palette_height = 700
    palette_color = (0, 0, 0, 0)  # 背景透過

    # パレットを作成
    palette = create_palette(palette_width, palette_height, color=palette_color)

    # ランダムに1つの包装紙(front/back)と花をS3から選択
    wraper_front = load_random_image_from_s3(
        bucket_name, "wrapers_front/", scale_factor=1.0
    )
    wraper_back = load_random_image_from_s3(
        bucket_name, "wrapers_back/", scale_factor=1.0
    )
    flower = load_random_image_from_s3(bucket_name, "single_flowers/", scale_factor=1.0)

    # 包装紙(背面)をパレットに貼り付け
    wraper_position_back = ((palette_width - wraper_back.width) // 2, 75)
    palette.paste(wraper_back, wraper_position_back, wraper_back)

    # 花をパレットに貼り付け（中心揃え）
    flower_position = ((palette_width - flower.width) // 2, 0)
    palette.paste(flower, flower_position, flower)

    # 包装紙(前面)をパレットに貼り付け
    wraper_position_front = ((palette_width - wraper_front.width) // 2, 75)
    palette.paste(wraper_front, wraper_position_front, wraper_front)

    # 合成結果をBase64にエンコードして返す
    buffer = BytesIO()
    palette.save(buffer, format="PNG")
    buffer.seek(0)
    encoded_image = base64.b64encode(buffer.read()).decode("utf-8")

    return {
        "statusCode": 200,
        "body": json.dumps(
            {"message": "Flower wrapped successfully", "image_base64": encoded_image}
        ),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    }
