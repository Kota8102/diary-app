import base64
import os
from unittest.mock import MagicMock, patch

os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["FLOWER_BUCKET_NAME"] = "bucket"

import pytest
from flower_get.flower_get import (
    get_flower_id_from_dynamodb,
    get_img_from_s3,
    validate_query_params,
)


# validate_query_paramsのテスト
def test_validate_query_params():
    """validate_query_params関数のテスト"""
    event = {"queryStringParameters": {"date": "2024-03-15"}}
    assert validate_query_params(event) == "2024-03-15"


def test_validate_query_params_error():
    """日付パラメータが不正な場合のテスト"""

    event = {"queryStringParameters": {}}
    with pytest.raises(ValueError):
        validate_query_params(event)

    event = {"queryStringParameters": {"date": "error"}}
    with pytest.raises(ValueError):
        validate_query_params(event)

    event = {"queryStringParameters": {"date": "20240315"}}
    with pytest.raises(ValueError):
        validate_query_params(event)


# fixtureで有効なeventデータを定義
@pytest.fixture
def valid_event():
    return {
        "requestContext": {"authorizer": {"claims": {"sub": "test-user-id"}}},
        "queryStringParameters": {"date": "2024-03-20"},
    }


# fixtureでS3からの画像レスポンスを定義
@pytest.fixture
def s3_image_response():
    return b"test_image_data"


# get_flower_id_from_dynamodbのテスト
@patch("flower_get.flower_get.dynamodb.get_item")
def test_get_flower_id_from_dynamodb(mock_get_item):
    """DynamoDBからflower_idを取得する関数のテスト"""

    # DynamoDBのレスポンスをモック
    mock_get_item.return_value = {"Item": {"flower_id": {"S": "flower-123"}}}

    user_id = "test-user-id"
    date = "2024-03-20"

    # 関数を呼び出して結果を検証
    result = get_flower_id_from_dynamodb(user_id, date)
    assert result == "flower-123"

    # DynamoDBの呼び出しを確認
    mock_get_item.assert_called_once_with(
        TableName="TEST_TABLE",  # 環境変数を使う部分は適宜mockで対応可能
        Key={
            "user_id": {"S": user_id},
            "date": {"S": date},
        },
    )


# get_img_from_s3のテスト
@patch("flower_get.flower_get.boto3.client")
def test_get_img_from_s3(mock_boto3_client, s3_image_response):
    """S3から画像を取得する関数のテスト"""

    # S3クライアントのモック
    mock_s3_client = MagicMock()
    mock_boto3_client.return_value = mock_s3_client

    # S3レスポンスをモック
    mock_s3_client.get_object.return_value = {
        "Body": MagicMock(read=MagicMock(return_value=s3_image_response))
    }

    flower_id = "flower-123"

    # 関数を呼び出して結果を検証
    result = get_img_from_s3(flower_id)
    assert result == base64.b64encode(s3_image_response).decode("utf-8")

    # S3の呼び出しを確認
    mock_s3_client.get_object.assert_called_once_with(
        Bucket="bucket",  # 環境変数を使う部分は適宜mockで対応可能
        Key="flowers/flower-123.png",
    )
