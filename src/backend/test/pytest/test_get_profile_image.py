import os
from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError
from get_profile_image.get_profile_image import get_image_from_s3

# 環境変数の設定
os.environ["USER_SETTINGS_BUCKET"] = "test-bucket"


# fixtureでS3からの画像レスポンスを定義
@pytest.fixture
def s3_image_response():
    return b"test_image_data"


# get_image_from_s3のテスト
@patch("get_profile_image.get_profile_image.boto3.client")
def test_get_image_from_s3(mock_boto3_client, s3_image_response):
    """S3から画像を取得する関数のテスト"""

    # S3クライアントのモック
    mock_s3_client = MagicMock()
    mock_boto3_client.return_value = mock_s3_client

    # S3レスポンスをモック
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=s3_image_response)),
        "ContentType": "image/png",
    }

    s3_key = "profile/image/test-user-id.png"

    # 関数を呼び出して結果を検証
    result_data, result_content_type = get_image_from_s3(s3_key)
    assert result_data == s3_image_response
    assert result_content_type == "image/png"

    # S3の呼び出しを確認
    mock_s3_client.get_object.assert_called_once_with(
        Bucket="test-bucket",
        Key=s3_key,
    )


def test_get_image_from_s3_no_such_key_error():
    """S3からのキーが存在しない場合のエラーテスト"""
    with patch("get_profile_image.get_profile_image.boto3.client") as mock_boto3_client:
        mock_s3_client = MagicMock()
        mock_boto3_client.return_value = mock_s3_client

        # NoSuchKey エラーをシミュレート
        error_response = {
            "Error": {
                "Code": "NoSuchKey",
                "Message": "The specified key does not exist.",
            }
        }
        mock_s3_client.get_object.side_effect = ClientError(error_response, "GetObject")

        s3_key = "profile/image/non-existent-user-id.png"

        with pytest.raises(FileNotFoundError):
            get_image_from_s3(s3_key)
