import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError

# テスト対象のモジュールファイルのパスを取得
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
LAMBDA_MODULE_PATH = os.path.join(CURRENT_DIR, "..", "..", "lambda", "title_get.py")


# 動的インポート関数
def import_lambda_module():
    try:
        spec = importlib.util.spec_from_file_location(
            "lambda_function", LAMBDA_MODULE_PATH
        )
        if spec is None:
            raise ImportError(f"Could not load spec for module at {LAMBDA_MODULE_PATH}")

        module = importlib.util.module_from_spec(spec)
        if spec.loader is None:
            raise ImportError(f"Spec loader is None for module at {LAMBDA_MODULE_PATH}")

        spec.loader.exec_module(module)
        return module
    except Exception as e:
        raise ImportError(
            f"Failed to import module from {LAMBDA_MODULE_PATH}: {str(e)}"
        )


# テスト対象のモジュールをインポート
lambda_module = import_lambda_module()


@pytest.fixture
def mock_context():
    context = MagicMock()
    context.identity.cognito_identity_id = "test_user_id"
    return context


@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "test_table")
    return None


@pytest.fixture(autouse=True)
def setup_module():
    """各テストの前に実行される設定"""
    global lambda_module
    if lambda_module is None:
        pytest.skip("Lambda module could not be imported")


class TestLambdaHandler:
    def test_missing_date_parameter(self, mock_context):
        """日付パラメータが欠落している場合のテスト"""
        event = {"queryStringParameters": {}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 400
        assert "Missing required parameter: date" in response["body"]

    def test_invalid_date_format(self, mock_context):
        """無効な日付形式の場合のテスト"""
        event = {"queryStringParameters": {"date": None}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 400
        assert "Invalid date format" in response["body"]

    @patch("boto3.resource")
    def test_successful_title_retrieval(self, mock_boto3, mock_context, mock_env):
        """タイトル取得成功時のテスト"""
        mock_table = MagicMock()
        mock_table.get_item.return_value = {"Item": {"title": "Test Title"}}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto3.return_value = mock_dynamodb

        event = {"queryStringParameters": {"date": "2024-01-01"}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 200
        response_body = json.loads(response["body"])
        assert response_body["title"] == "Test Title"

    @patch("boto3.resource")
    def test_dynamodb_client_error(self, mock_boto3, mock_context, mock_env):
        """DynamoDB クライアントエラー時のテスト"""
        mock_table = MagicMock()
        mock_table.get_item.side_effect = ClientError(
            error_response={"Error": {"Message": "Test error"}},
            operation_name="GetItem",
        )
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto3.return_value = mock_dynamodb

        event = {"queryStringParameters": {"date": "2024-01-01"}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 500
        assert "Database operation failed" in response["body"]

    @patch("boto3.resource")
    def test_title_not_found(self, mock_boto3, mock_context, mock_env):
        """タイトルが見つからない場合のテスト"""
        mock_table = MagicMock()
        mock_table.get_item.return_value = {}
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        mock_boto3.return_value = mock_dynamodb

        event = {"queryStringParameters": {"date": "2024-01-01"}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 200
        response_body = json.loads(response["body"])
        assert response_body["title"] == ""

    def test_validate_date(self):
        """日付バリデーション関数のテスト"""
        assert lambda_module.validate_date("2024-01-01") is True
        assert lambda_module.validate_date("") is False
        assert lambda_module.validate_date(None) is False
        assert lambda_module.validate_date(123) is False

    @patch("boto3.resource")
    def test_missing_table_name(self, mock_boto3, mock_context):
        """TABLE_NAME環境変数が設定されていない場合のテスト"""
        event = {"queryStringParameters": {"date": "2024-01-01"}}
        response = lambda_module.lambda_handler(event, mock_context)

        assert response["statusCode"] == 400
        assert "TABLE_NAME environment variable is not set" in response["body"]


class TestCreateResponse:
    """create_response関数のテストクラス"""

    def test_create_response_format(self):
        """レスポンス形式のテスト"""
        test_body = {"message": "test"}
        response = lambda_module.create_response(200, test_body)

        assert response["statusCode"] == 200
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == "*"
        assert json.loads(response["body"]) == test_body


if __name__ == "__main__":
    pytest.main(["-v"])
