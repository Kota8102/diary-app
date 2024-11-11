import json
import os
from unittest.mock import MagicMock, patch

import pytest
from flower_select.flower_select import (
    get_parameter_from_parameter_store,
    lambda_handler,
    save_to_dynamodb,
    select_flower,
    select_flower_using_api,
)


def create_mock_context():
    """テスト用のモックコンテキストを作成"""
    context = MagicMock()
    context.identity = MagicMock()
    context.identity.cognito_identity_id = "test-user-id"
    return context


# Fixture for lambda event
@pytest.fixture
def lambda_event():
    return {
        "user_id": "test-user-id",
        "date": "2024-03-15",
        "diary_content": "今日は良い天気だった",
    }


# Test for select_flower
def test_select_flower():
    """select_flower関数のテスト"""
    diary_content = "今日は楽しい一日でした"
    with patch("flower_select.flower_select.get_parameter_from_parameter_store", return_value="fake-api-key"), \
            patch("flower_select.flower_select.select_flower_using_api", return_value="flower-id-123") as mock_select_flower_using_api:
        flower_id = select_flower(diary_content)
        assert flower_id == "flower-id-123"
        mock_select_flower_using_api.assert_called_once_with(
            "fake-api-key", diary_content)


# Test for save_to_dynamodb
def test_save_to_dynamodb():
    """save_to_dynamodb関数のテスト"""
    user_id = "test-user-id"
    date = "2024-03-15"
    flower_id = "flower-id-123"

    with patch("boto3.resource") as mock_dynamodb_resource, patch.dict(os.environ, {"GENERATIVE_AI_TABLE_NAME": "test-table"}):
        table = mock_dynamodb_resource.return_value.Table.return_value
        save_to_dynamodb(user_id, date, flower_id)

        # DynamoDBのupdate_itemが正しく呼ばれたか確認
        table.update_item.assert_called_once_with(
            Key={"user_id": user_id, "date": date},
            UpdateExpression="set flower_id = :flower",
            ExpressionAttributeValues={":flower": flower_id},
        )


# Test for get_parameter_from_parameter_store
def test_get_parameter_from_parameter_store():
    """get_parameter_from_parameter_store関数のテスト"""
    parameter_name = "DIFY_API_KEY"
    expected_value = "fake-api-key"

    with patch("boto3.client") as mock_ssm_client:
        mock_ssm_client.return_value.get_parameter.return_value = {
            "Parameter": {"Value": expected_value}}
        api_key = get_parameter_from_parameter_store(parameter_name)
        assert api_key == expected_value


# Test for select_flower_using_api
def test_select_flower_using_api():
    """select_flower_using_api関数のテスト"""
    api_key = "fake-api-key"
    query = "今日は楽しい一日でした"
    expected_flower_id = "flower-id-123"

    with patch("requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.json.return_value = {"answer": expected_flower_id}
        mock_post.return_value = mock_response

        flower_id = select_flower_using_api(api_key, query)
        assert flower_id == expected_flower_id

        # リクエストの内容を確認
        mock_post.assert_called_once_with(
            'https://api.dify.ai/v1/chat-messages',
            headers={'Authorization': f'Bearer {api_key}',
                     'Content-Type': 'application/json'},
            json={
                'query': query,
                'inputs': {},
                'response_mode': 'blocking',
                'user': "user",
                'auto_generate_name': True
            }
        )
