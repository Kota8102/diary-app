import base64
import json
import os
from unittest.mock import MagicMock, patch

import pytest
from diary_create.diary_create import (
    get_img_from_s3,
    invoke_flower_lambda,
    save_to_dynamodb,
    validate_input,
)


def test_validate_input():
    """validate_input関数の正常系と異常系のテスト"""
    # 正常系
    body = {"date": "2024-03-15", "content": "今日は散歩をしました。"}
    validate_input(body)  # 例外が発生しなければ成功

    # 異常系
    with pytest.raises(ValueError, match="必須フィールドがありません: date"):
        validate_input({"content": "今日は散歩をしました。"})

    with pytest.raises(
        ValueError, match="不正な日付形式です。YYYY-MM-DDの形式を使用してください"
    ):
        validate_input({"date": "15-03-2024", "content": "今日は散歩をしました。"})


@patch("boto3.client")
def test_get_img_from_s3(mock_boto_client):
    """get_img_from_s3関数のテスト"""
    # モックの準備
    s3_client_mock = MagicMock()
    mock_boto_client.return_value = s3_client_mock
    s3_client_mock.get_object.return_value = {
        "Body": MagicMock(read=lambda: b"fake_image_data")
    }

    os.environ["ORIGINAL_IMAGE_BUCKET_NAME"] = "TEST_BUCKET"
    # テスト実行
    flower_id = "test_flower_id"
    image_data = get_img_from_s3(flower_id)

    # アサーション
    s3_client_mock.get_object.assert_called_once_with(
        Bucket=os.environ["ORIGINAL_IMAGE_BUCKET_NAME"], Key=f"flowers/{flower_id}.png"
    )
    assert image_data == base64.b64encode(b"fake_image_data").decode("utf-8")


@patch("boto3.resource")
def test_save_to_dynamodb(mock_boto_resource):
    """save_to_dynamodb関数のテスト"""
    # モックの準備
    dynamodb_mock = MagicMock()
    table_mock = MagicMock()
    mock_boto_resource.return_value = dynamodb_mock
    dynamodb_mock.Table.return_value = table_mock

    # テストデータ
    user_id = "test-user-id"
    date = "2024-03-15"
    content = "今日は散歩をしました。"

    # 関数の実行
    diary_id = save_to_dynamodb(user_id, date, content)

    # アサーション
    dynamodb_mock.Table.assert_called_once_with(os.getenv("TABLE_NAME"))
    table_mock.put_item.assert_called_once()
    assert isinstance(diary_id, str)  # diary_id は文字列であるべき


@patch("boto3.client")
def test_invoke_flower_lambda(mock_boto_client):
    """invoke_flower_lambda関数のテスト"""
    # モックの準備
    lambda_client_mock = MagicMock()
    mock_boto_client.return_value = lambda_client_mock
    lambda_client_mock.invoke.return_value = {
        "Payload": MagicMock(
            read=lambda: json.dumps(
                {"body": json.dumps({"flower_id": "test_flower_id"})}
            ).encode("utf-8")
        )
    }

    # テストデータ
    user_id = "test-user-id"
    date = "2024-03-15"
    content = "今日は散歩をしました。"

    # 関数の実行
    flower_id = invoke_flower_lambda(user_id, date, content)

    # アサーション
    lambda_client_mock.invoke.assert_called_once_with(
        FunctionName=os.getenv("FLOWER_SELECT_FUNCTION_NAME"),
        InvocationType="RequestResponse",
        Payload=json.dumps(
            {"user_id": user_id, "date": date, "diary_content": content}
        ),
    )
    assert flower_id == "test_flower_id"
