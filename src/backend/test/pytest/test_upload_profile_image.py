import base64
import os
from unittest.mock import MagicMock, patch

import pytest

os.environ["USER_SETTINGS_BUCKET"] = "test-bucket"

from upload_profile_image.upload_profile_image import (
    MAX_FILE_SIZE_BYTES,
    decode_image_data,
    upload_to_s3,
    validate_image,
)


# decode_image_data 関数のテスト
def test_decode_image_data():
    """decode_image_data 関数のテスト"""
    encoded_image = base64.b64encode(b"image data").decode("utf-8")
    decoded_image = decode_image_data(encoded_image)

    # デコード後のデータが bytes 型であることを確認
    assert isinstance(decoded_image, bytes)
    assert decoded_image == b"image data"


def test_decode_image_data_exceeds_max_size():
    """画像データが最大サイズを超える場合のテスト"""
    large_image_data = base64.b64encode(b"A" * (MAX_FILE_SIZE_BYTES + 1)).decode(
        "utf-8"
    )
    with pytest.raises(ValueError, match="exceeds maximum size"):
        decode_image_data(large_image_data)


# Base64 エンコードされた無効なデータが渡された場合
def test_decode_image_data_invalid():
    """無効な Base64 データが渡された場合のテスト"""
    invalid_base64 = "invalid_base64_string"
    with pytest.raises(ValueError):
        decode_image_data(invalid_base64)


# validate_image 関数のテスト
def test_validate_image_valid_png():
    """有効な PNG 画像の MIME タイプを検証"""
    data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    mime = validate_image(data)
    assert mime == "image/png"


def test_validate_image_invalid_format():
    """無効な画像フォーマットの場合のテスト"""
    data = b"not an image"
    with pytest.raises(ValueError, match="Unsupported image format"):
        validate_image(data)


# upload_to_s3 関数のテスト
@patch("upload_profile_image.upload_profile_image.boto3.client")
def test_upload_to_s3(mock_boto_client):
    """upload_to_s3 関数のテスト"""
    # モックされた S3 クライアントの put_object メソッド
    mock_s3 = MagicMock()
    mock_boto_client.return_value = mock_s3

    # テスト用データ
    user_id = "test-user-id"
    image_data = b"image data"
    s3_key = f"profile/image/{user_id}.png"
    content_type = "image/png"

    # upload_to_s3 を呼び出し
    upload_to_s3(s3_key, image_data, content_type)

    # put_object メソッドが正しい引数で呼ばれたことを確認
    mock_s3.put_object.assert_called_once_with(
        Bucket="test-bucket",
        Key=s3_key,
        Body=image_data,
        ContentType=content_type,
    )
