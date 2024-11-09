import importlib
import json
import os
from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError


# 動的インポート関数
def dynamic_import(module_name, relative_path):
    try:
        # モジュールのパスを絶対パスに変換
        module_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), relative_path)
        )

        # モジュールの仕様（spec）を作成
        spec = importlib.util.spec_from_file_location(module_name, module_path)

        # モジュールオブジェクトを作成
        module = importlib.util.module_from_spec(spec)

        # モジュールを実行
        spec.loader.exec_module(module)

        return module
    except Exception as e:
        print(f"Error loading module {module_name} from {module_path}: {e}")
        return None


# テスト対象のモジュールを動的にインポート
lambda_module = dynamic_import("title_get", "./title_get.py")


@pytest.fixture
def mock_context():
    context = MagicMock()
    context.identity.cognito_identity_id = "test_user_id"
    return context


@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("TABLE_NAME", "test_table")


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
        # DynamoDBのモックを設定
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
