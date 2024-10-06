import base64
import importlib.util
import json
import os
from unittest.mock import MagicMock, patch

module_name = 'flower_get'
module_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '../..', 'lambda', 'flower_get', 'flower_get.py'))
spec = importlib.util.spec_from_file_location(module_name, module_path)
flower_get = importlib.util.module_from_spec(spec)
spec.loader.exec_module(flower_get)


@patch.object(flower_get.boto3, 'resource')
@patch.object(flower_get.boto3, 'client')
@patch.dict('os.environ', {
    'GENERATIVE_AI_TABLE_NAME': 'TestTable',
    'BUCKET_NAME': 'TestBucket'
})
def test_lambda_handler_success(mock_boto_client, mock_boto_resource):
    # Mock DynamoDB response
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.get_item.return_value = {
        'Item': {'flower_id': 'mock-flower-id'}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock S3 response
    mock_s3 = MagicMock()
    mock_s3.get_object.return_value = {
        'Body': MagicMock(read=MagicMock(return_value=b'mock-image-data'))
    }
    mock_boto_client.return_value = mock_s3

    # Mock event with authorizer claims
    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "mock-user-id"
                }
            },
        },
        "queryStringParameters": {
            "date": "2024-08-21"
        }
    }

    # Call the Lambda function
    response = flower_get.lambda_handler(event, None)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    # Base64 encode the mock image data
    assert body['Image'] == base64.b64encode(
        b'mock-image-data').decode('utf-8')


@patch.object(flower_get.boto3, 'resource')
@patch.object(flower_get.boto3, 'client')
@patch.dict('os.environ', {
    'GENERATIVE_AI_TABLE_NAME': 'TestTable',
    'BUCKET_NAME': 'TestBucket'
})
def test_lambda_handler_failure(mock_boto_client, mock_boto_resource):
    # Mock DynamoDB response with no flower_id
    mock_dynamodb = MagicMock()
    mock_table = MagicMock()
    mock_table.get_item.return_value = {'Item': {}}
    mock_dynamodb.Table.return_value = mock_table
    mock_boto_resource.return_value = mock_dynamodb

    # Mock event with authorizer claims
    event = {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "mock-user-id"
                }
            },
        },
        "queryStringParameters": {
            "date": "2024-08-21"
        }
    }

    # Call the Lambda function
    response = flower_get.lambda_handler(event, None)

    # Check the response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['Image'] == ""
