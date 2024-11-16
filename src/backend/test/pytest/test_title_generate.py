import json
import os
from unittest.mock import patch

import pytest
from title_generate.title_generate import (
    generate_title_from_content,
    get_parameter_from_parameter_store,
    save_title_to_dynamodb,
    send_request_to_openai_api,
)


# Fixture for DynamoDB event
@pytest.fixture
def dynamodb_record():
    return {
        "dynamodb": {
            "NewImage": {
                "user_id": {"S": "test-user-id"},
                "date": {"S": "2024-03-15"},
                "content": {"S": "今日は良い天気だった"},
            }
        }
    }


# Test for generate_title_from_content
def test_generate_title_from_content():
    """ChatGPTを使ったタイトル生成のテスト"""
    diary_content = "今日は楽しい一日でした"
    expected_title = "A joyful day"

    with patch(
        "title_generate.title_generate.get_parameter_from_parameter_store",
        return_value="fake-api-key",
    ), patch(
        "title_generate.title_generate.send_request_to_openai_api",
        return_value=json.dumps(
            {"choices": [{"message": {"content": expected_title}}]}
        ),
    ):
        title = generate_title_from_content(diary_content)
        assert title == expected_title


# Test for save_title_to_dynamodb
def test_save_title_to_dynamodb(dynamodb_record):
    """DynamoDBに生成されたタイトルを保存するテスト"""
    generated_title = "A joyful day"

    with patch("boto3.resource") as mock_dynamodb_resource, patch.dict(
        os.environ, {"TABLE_NAME": "test-table"}
    ):
        table = mock_dynamodb_resource.return_value.Table.return_value
        save_title_to_dynamodb(generated_title, dynamodb_record)
        table.update_item.assert_called_once_with(
            Key={"user_id": "test-user-id", "date": "2024-03-15"},
            UpdateExpression="set title = :t",
            ExpressionAttributeValues={":t": generated_title},
        )


# Test for get_parameter_from_parameter_store
def test_get_parameter_from_parameter_store():
    """パラメータストアからAPIキーを取得するテスト"""
    parameter_name = "OpenAI_API_KEY"
    expected_value = "fake-api-key"

    with patch("boto3.client") as mock_ssm:
        mock_ssm.return_value.get_parameter.return_value = {
            "Parameter": {"Value": expected_value}
        }
        api_key = get_parameter_from_parameter_store(parameter_name)
        assert api_key == expected_value


# Test for send_request_to_openai_api
def test_send_request_to_openai_api():
    """OpenAI APIへのリクエスト送信のテスト"""
    api_endpoint = "https://api.openai.com/v1/chat/completions"
    api_key = "fake-api-key"
    request_data = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": "Please write a title of 10 words or less based on the contents of your diary.",
            },
            {"role": "user", "content": "今日は楽しい一日でした"},
        ],
        "temperature": 0.7,
    }

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.return_value.read.return_value = json.dumps(
            {"choices": [{"message": {"content": "A joyful day"}}]}
        ).encode("utf-8")
        response = send_request_to_openai_api(api_endpoint, api_key, request_data)
        assert (
            json.loads(response)["choices"][0]["message"]["content"] == "A joyful day"
        )
