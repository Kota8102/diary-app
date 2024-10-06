import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest

# モジュールの設定
module_name = 'flower_generate'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'flower_generate', 'flower_generate.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
flower_generate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(flower_generate)


@patch.object(flower_generate.boto3, 'resource')
@patch.object(flower_generate.requests, 'post')
@patch.object(flower_generate, 'get_parameter_from_parameter_store')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable', 'DIFY_API_KEY': 'test_api_key'})
def test_lambda_handler_success(mock_get_parameter, mock_requests_post, mock_boto_resource):
    # モックの設定
    mock_get_parameter.return_value = 'test_api_key'

    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.return_value = {}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    mock_requests_post.return_value.json.return_value = {
        'answer': 'flower_id_123'}

    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "This is a diary entry."},
                        "user_id": {"S": "user123"},
                        "date": {"S": "2024-08-21"}
                    }
                }
            }
        ]
    }

    context = MagicMock()

    # Lambda関数の呼び出し
    response = flower_generate.lambda_handler(event, context)

    # レスポンスのチェック
    assert response['statusCode'] == 200
    assert json.loads(response['body']) == "Processed DynamoDB Stream records."
    mock_boto_resource.assert_called_once()
    mock_requests_post.assert_called_once()


@patch.object(flower_generate.boto3, 'resource')
@patch.object(flower_generate.requests, 'post')
@patch.object(flower_generate, 'get_parameter_from_parameter_store')
@patch.dict('os.environ', {'GENERATIVE_AI_TABLE_NAME': 'TestTable', 'DIFY_API_KEY': 'test_api_key'})
def test_lambda_handler_no_flower_id(mock_get_parameter, mock_requests_post, mock_boto_resource):
    # モックの設定
    mock_get_parameter.return_value = 'test_api_key'

    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.update_item.return_value = {}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    mock_requests_post.return_value.json.return_value = {
        'answer': ''}  # 空のflower_idを返す

    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "This is a diary entry."},
                        "user_id": {"S": "user123"},
                        "date": {"S": "2024-08-21"}
                    }
                }
            }
        ]
    }

    context = MagicMock()

    # Lambda関数の呼び出し
    response = flower_generate.lambda_handler(event, context)

    # レスポンスのチェック
    assert response['statusCode'] == 200
    assert json.loads(response['body']) == "Processed DynamoDB Stream records."


@patch.object(flower_generate.boto3, 'resource')
def test_lambda_handler_table_not_found(mock_boto_resource):
    # モックの設定
    mock_dynamodb = MagicMock()
    mock_dynamodb.Table.side_effect = Exception("Table not found")
    mock_boto_resource.return_value = mock_dynamodb

    # Mock context
    class Context:
        def __init__(self):
            self.identity = MagicMock()
            self.identity.cognito_identity_id = '123'

    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {
                    "NewImage": {
                        "content": {"S": "This is a diary entry."},
                        "user_id": {"S": "user123"},
                        "date": {"S": "2024-08-21"}
                    }
                }
            }
        ]
    }
    context = Context()

    # Call the Lambda function
    response = flower_generate.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert "An error occurred" in body
