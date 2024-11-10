import importlib.util
import json
import os
import urllib
from unittest.mock import MagicMock, patch

import pytest

module_name = 'title_generate'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'title_generate', 'title_generate.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
title_generate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(title_generate)


@patch.dict(os.environ, {'TABLE_NAME': 'TestTable'})
@patch.object(title_generate.boto3, 'resource')
# Mocking boto3 client for Parameter Store
@patch.object(title_generate.boto3, 'client')
@patch.object(title_generate, 'send_request_to_openai_api')
def test_lambda_handler_success(mock_openai_api, mock_boto_client, mock_boto_resource):
    # Mock Parameter Store to return a fake API key
    mock_ssm = MagicMock()
    mock_ssm.get_parameter.return_value = {
        'Parameter': {'Value': 'mocked-api-key'}}
    mock_boto_client.return_value = mock_ssm

    # Mock OpenAI API response
    mock_openai_api.return_value = json.dumps({
        'choices': [{
            'message': {
                'content': 'Generated Diary Title'
            }
        }]
    })

    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_boto_resource.return_value = mock_dynamodb
    mock_dynamodb.Table.return_value = mock_table

    # Create a mock DynamoDB stream event
    event = {
        "Records": [{
            "eventName": "INSERT",
            "dynamodb": {
                "NewImage": {
                    "content": {"S": "This is a diary entry."},
                    "user_id": {"S": "user123"},
                    "date": {"S": "2024-10-18"}
                }
            }
        }]
    }

    # Call the Lambda function
    response = title_generate.lambda_handler(event, None)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body == 'Processed DynamoDB Stream records.'

    # Ensure the title was saved in DynamoDB
    mock_table.update_item.assert_called_once_with(
        Key={'user_id': 'user123', 'date': '2024-10-18'},
        UpdateExpression="set title = :t",
        ExpressionAttributeValues={':t': 'Generated Diary Title'}
    )


@patch.dict(os.environ, {'TABLE_NAME': 'TestTable'})
@patch.object(title_generate.boto3, 'resource')
# Mocking boto3 client for Parameter Store
@patch.object(title_generate.boto3, 'client')
@patch.object(title_generate, 'send_request_to_openai_api')
def test_lambda_handler_error(mock_openai_api, mock_boto_client, mock_boto_resource):
    # Mock Parameter Store to return a fake API key
    mock_ssm = MagicMock()
    mock_ssm.get_parameter.return_value = {
        'Parameter': {'Value': 'mocked-api-key'}}
    mock_boto_client.return_value = mock_ssm

    # Simulate an error from OpenAI API
    mock_openai_api.side_effect = Exception("OpenAI API failure")

    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_boto_resource.return_value = mock_dynamodb
    mock_dynamodb.Table.return_value = mock_table

    # Create a mock DynamoDB stream event
    event = {
        "Records": [{
            "eventName": "INSERT",
            "dynamodb": {
                "NewImage": {
                    "content": {"S": "This is a diary entry."},
                    "user_id": {"S": "user123"},
                    "date": {"S": "2024-10-18"}
                }
            }
        }]
    }

    # Call the Lambda function
    response = title_generate.lambda_handler(event, None)

    # Check the response for error
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert "An error occurred" in body
