import base64
import json
import os
from unittest.mock import MagicMock, patch

import pytest
from diary_create.diary_create import (
    flower_wrap,
    invoke_flower_lambda,
    save_to_dynamodb,
    validate_input,
)
from PIL import Image


def test_validate_input():
    """validate_input関数の正常系と異常系のテスト"""
    # 正常系
    body = {"date": "2024-03-15", "content": "今日は散歩をしました。"}
    validate_input(body)  # 例外が発生しなければ成功

    # 異常系
    with pytest.raises(ValueError, match="Error: Required field is missing. date"):
        validate_input({"content": "今日は散歩をしました。"})

    with pytest.raises(
        ValueError,
        match="Error: Invalid date format. Please use the YYYY-MM-DD format.",
    ):
        validate_input({"date": "15-03-2024", "content": "今日は散歩をしました。"})


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


@pytest.fixture
def mock_env():
    original_env = dict(os.environ)
    os.environ["FLOWER_IMAGE_BUCKET_NAME"] = "test-bucket"
    yield
    os.environ.clear()
    os.environ.update(original_env)


@patch("diary_create.diary_create.load_random_image_from_s3")
def test_flower_wrap_success(mock_load_random_image, mock_env):
    """
    flower_wrap関数の正常系テスト
    """

    # ① front包装紙
    wraper_front = Image.new("RGBA", (100, 200), (255, 0, 0, 128))
    # ② back包装紙
    wraper_back = Image.new("RGBA", (100, 200), (0, 255, 0, 128))
    # ③ 花画像
    flower = Image.new("RGBA", (50, 100), (0, 0, 255, 128))

    # load_random_image_from_s3の戻り値を順番に返す
    mock_load_random_image.side_effect = [wraper_front, wraper_back, flower]

    # 実行
    result = flower_wrap("sample_flower_id")

    # 結果がBase64デコード可能であることを確認
    decoded = base64.b64decode(result)
    assert isinstance(decoded, bytes)
    assert len(decoded) > 0
