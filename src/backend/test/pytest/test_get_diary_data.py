import base64
import os
from datetime import datetime
from unittest.mock import MagicMock, patch

from get_diary_data.get_diary_data import (
    get_body,
    get_image,
    get_title,
    validate_date,
)

# 環境変数を設定
os.environ["AWS_DEFAULT_REGION"] = "ap-northeast-1"
os.environ["GENERATIVE_AI_TABLE_NAME"] = "test_generative_ai_table"
os.environ["DIARY_TABLE_NAME"] = "test_generative_ai_table"


# validate_dateのテスト
def test_validate_date():
    """日付形式のバリデーションが正しく動作するかをテスト"""
    assert validate_date("2024-03-15") is True
    assert (
        validate_date("2024-03-32") is True
    )  # フォーマットは正しいが無効な日付は後で検証
    assert validate_date("20240315") is False
    assert validate_date("invalid-date") is False


# get_imageのテスト
@patch("get_diary_data.get_diary_data.boto3.client")
def test_get_image(mock_boto3_client):
    """S3から画像を取得する関数のテスト"""
    os.environ["FLOWER_BUCKET_NAME"] = "test_flower_bucket"
    mock_s3_client = MagicMock()
    mock_boto3_client.return_value = mock_s3_client
    test_image_data = b"test_image_data"
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=test_image_data))
    }

    result = get_image("test-user-id", "2024-03-15")
    assert result == base64.b64encode(test_image_data).decode("utf-8")
    year_week = datetime.now().strftime("%Y-%U")
    mock_s3_client.get_object.assert_called_once_with(
        Bucket="test_flower_bucket",
        Key=f"test-user-id/{year_week}/2024-03-15.png",
    )


# get_titleのテスト
@patch("get_diary_data.get_diary_data.dynamodb.Table")
def test_get_title(mock_dynamodb_table):
    """DynamoDBからタイトルを取得する関数のテスト"""
    mock_table = MagicMock()
    mock_table.get_item.return_value = {"Item": {"title": "Test Title"}}
    mock_dynamodb_table.return_value = mock_table

    result = get_title("test-user-id", "2024-03-15")
    assert result == "Test Title"

    mock_table.get_item.assert_called_once_with(
        Key={"user_id": "test-user-id", "date": "2024-03-15"}
    )


@patch("get_diary_data.get_diary_data.dynamodb.Table")
def test_get_title_no_item(mock_dynamodb_table):
    """DynamoDBにタイトルが存在しない場合のテスト"""
    mock_table = MagicMock()
    mock_table.get_item.return_value = {}
    mock_dynamodb_table.return_value = mock_table

    result = get_title("test-user-id", "2024-03-15")
    assert result is None


# get_bodyのテスト
@patch("get_diary_data.get_diary_data.dynamodb.Table")
def test_get_body(mock_dynamodb_table):
    """DynamoDBから本文を取得する関数のテスト"""
    mock_table = MagicMock()
    mock_table.get_item.return_value = {"Item": {"content": "Test Body"}}
    mock_dynamodb_table.return_value = mock_table

    result = get_body("test-user-id", "2024-03-15")
    assert result == "Test Body"

    mock_table.get_item.assert_called_once_with(
        Key={"user_id": "test-user-id", "date": "2024-03-15"}
    )


@patch("get_diary_data.get_diary_data.dynamodb.Table")
def test_get_body_no_item(mock_dynamodb_table):
    """DynamoDBに本文が存在しない場合のテスト"""
    mock_table = MagicMock()
    mock_table.get_item.return_value = {}
    mock_dynamodb_table.return_value = mock_table

    result = get_body("test-user-id", "2024-03-15")
    assert result is None
