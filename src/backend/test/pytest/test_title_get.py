import json
from unittest.mock import MagicMock

from title_get.title_get import create_response, validate_date

def test_create_response_success():
    """create_response関数の正常系テスト"""
    # テストデータ
    status_code = 200
    body = {"message": "テストメッセージ"}

    # 関数の実行
    response = create_response(status_code, body)

    # アサーション
    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"

    # bodyが正しくJSONシリアライズされていることを確認
    decoded_body = json.loads(response["body"])
    assert decoded_body == body


def test_validate_date():
    """validate_date関数のテスト"""
    # 正常系のテスト
    assert validate_date("2024-03-15") is True
    assert validate_date("2023-12-31") is True

    # 異常系のテスト
    assert validate_date("") is False  # 空文字列
    assert validate_date(None) is False  # None
    assert validate_date(123) is False  # 数値
    assert validate_date(["2024-03-15"]) is False  # リスト

    assert validate_date({"date": "2024-03-15"}) is False  # 辞書

def create_mock_context():
    """テスト用のモックコンテキストを作成"""
    context = MagicMock()
    context.identity = MagicMock()
    context.identity.cognito_identity_id = "test-user-id"
    return context
