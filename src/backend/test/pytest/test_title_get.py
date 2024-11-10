import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

import pytest

module_name = 'title_get'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'title_get', 'title_get.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
title_get = importlib.util.module_from_spec(spec)
spec.loader.exec_module(title_get)

@patch.object(title_get.boto3, 'resource')
@patch.dict('os.environ', {'TABLE_NAME': 'TestTable'})
def test_lambda_handler_success(mock_boto_resource):
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.get_item.return_value = {'Item': {'title': 'Test Diary Title'}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock event with requestContext and authorizer
    event = {
        "queryStringParameters": {
            "date": "2024-08-21"
        },
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "123"
                }
            }
        }
    }
    
    # Mock context
    context = MagicMock()

    # Call the Lambda function
    response = title_get.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['title'] == 'Test Diary Title'


@patch.object(title_get.boto3, 'resource')
@patch.dict('os.environ', {'TABLE_NAME': 'TestTable'})
def test_lambda_handler_no_title(mock_boto_resource):
    # Set up mock DynamoDB resource
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.get_item.return_value = {}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock event with requestContext and authorizer
    event = {
        "queryStringParameters": {
            "date": "2024-08-21"
        },
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "123"
                }
            }
        }
    }
    
    # Mock context
    context = MagicMock()

    # Call the Lambda function
    response = title_get.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['title'] == ''


@patch.object(title_get.boto3, 'resource')
def test_lambda_handler_table_not_found(mock_boto_resource):
    # Set up mock DynamoDB resource with table not found
    mock_dynamodb = MagicMock()
    mock_dynamodb.Table.side_effect = Exception("Table not found")
    mock_boto_resource.return_value = mock_dynamodb

    # Mock event with requestContext and authorizer
    event = {
        "queryStringParameters": {
            "date": "2024-08-21"
        },
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "123"
                }
            }
        }
    }
    
    # Mock context
    context = MagicMock()

    # Call the Lambda function
    response = title_get.lambda_handler(event, context)

    # Check the response
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert "An error occurred" in body
