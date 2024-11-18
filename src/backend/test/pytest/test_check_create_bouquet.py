import os
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from check_create_bouquet.check_create_bouquet import (
    check_bouquet_created,
    count_flowers_in_week,
    get_current_week,
)


@pytest.fixture
def valid_event():
    """有効なLambdaイベントを返す"""
    return {
        "requestContext": {"authorizer": {"claims": {"sub": "test-user-id"}}},
    }


@pytest.fixture
def dynamodb_mock():
    """DynamoDBのモックを返す"""
    with patch("check_create_bouquet.check_create_bouquet.boto3.resource") as mock:
        yield mock


def test_get_current_week():
    """get_current_week関数のテスト"""
    # 固定された日時でテスト
    with patch("check_create_bouquet.check_create_bouquet.datetime") as mock_datetime:
        mock_datetime.now.return_value = datetime(2024, 11, 13, tzinfo=timezone.utc)
        mock_datetime.now.timezone = timezone.utc
        assert get_current_week() == (2024, 46)  # ISOカレンダーの年と週


def test_check_bouquet_created(dynamodb_mock):
    """check_bouquet_created関数のテスト"""
    os.environ["BOUQUET_TABLE_NAME"] = "TEST_TABLE"
    table_mock = dynamodb_mock.return_value.Table.return_value
    table_mock.get_item.return_value = {"Item": {"user_id": "test-user-id"}}

    assert check_bouquet_created("test-user-id", 2024, 46) is True

    table_mock.get_item.return_value = {}
    assert check_bouquet_created("test-user-id", 2024, 46) is False


def test_count_flowers_in_week(dynamodb_mock):
    """count_flowers_in_week関数のテスト"""
    os.environ["BOUQUET_TABLE_NAME"] = "TEST_TABLE"
    os.environ["GENERATIVE_AI_TABLE_NAME"] = "TEST_TABLE"
    table_mock = dynamodb_mock.return_value.Table.return_value
    table_mock.query.return_value = {
        "Items": [{"date": "2024-11-12"}, {"date": "2024-11-13"}]
    }

    flower_count = count_flowers_in_week("test-user-id", 2024, 46)
    assert flower_count == 2
