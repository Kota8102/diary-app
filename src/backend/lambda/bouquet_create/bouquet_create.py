import json
import logging
import os
from datetime import datetime, timedelta

import boto3
from PIL import Image

logger = logging.getLogger(__name__)
formatter = logging.Formatter(
    "[%(asctime)s - %(levelname)s - %(filename)s(func:%(funcName)s, line:%(lineno)d)] %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

ORIGINAL_IMAGE_BUCKET_NAME = os.environ["ORIGINAL_IMAGE_BUCKET_NAME"]
BOUQUET_BUCKET_NAME = os.environ["BOUQUET_BUCKET_NAME"]
GENERATIVE_AI_TABLE_NAME = os.environ["GENERATIVE_AI_TABLE_NAME"]
BOUQUET_TABLE_NAME = os.environ["BOUQUET_TABLE_NAME"]

bouquet_table = dynamodb.Table(BOUQUET_TABLE_NAME)


class DecideFlowerPos:
    """
    花束の配置位置を決定するクラス

    Attributes:
        n (int): 花の数
        flowers (list): 花の種類リスト
    """

    def __init__(self, n, flowers):
        """
        DecideFlowerPosの初期化メソッド。花の数と種類を受け取り、配置位置を決定する。

        Args:
            n (int): 花の数
            flowers (list): 花の種類リスト
        """
        self.n = n
        self.flowers = sorted(flowers)
        self.def_flowers_pos()

    def def_flowers_pos(self):
        """
        花束の配置パターンを定義する。
        花の数（n）に応じて適切な位置を設定する。
        """
        if self.n == 5:
            self.flower_pos = {
                (1, 1, 1, 1, 1): [
                    [400, 180],
                    [250, 180],
                    [100, 180],
                    [150, 70],
                    [300, 70],
                ],
                (1, 1, 1, 1, 2): [
                    [100, 180],
                    [250, 150],
                    [400, 180],
                    [150, 70],
                    [350, 50],
                ],
                (1, 1, 1, 1, 3): [
                    [100, 180],
                    [250, 150],
                    [400, 180],
                    [150, 70],
                    [350, 50],
                ],
                (1, 1, 1, 2, 2): [
                    [150, 70],
                    [250, 150],
                    [400, 180],
                    [150, 180],
                    [350, 50],
                ],
                (1, 1, 1, 2, 3): [
                    [150, 70],
                    [250, 180],
                    [400, 180],
                    [150, 200],
                    [350, 70],
                ],
                (1, 1, 1, 3, 3): [
                    [150, 70],
                    [250, 180],
                    [400, 180],
                    [150, 200],
                    [350, 70],
                ],
                (1, 1, 2, 2, 2): [
                    [380, 180],
                    [300, 50],
                    [180, 70],
                    [150, 200],
                    [280, 180],
                ],
                (1, 1, 2, 2, 3): [
                    [380, 180],
                    [300, 50],
                    [180, 70],
                    [280, 180],
                    [150, 200],
                ],
                (1, 1, 2, 3, 3): [
                    [380, 180],
                    [300, 50],
                    [180, 70],
                    [280, 180],
                    [150, 200],
                ],
                (1, 1, 3, 3, 3): [
                    [380, 180],
                    [300, 50],
                    [180, 70],
                    [280, 180],
                    [150, 200],
                ],
                (1, 2, 2, 2, 2): [
                    [380, 180],
                    [300, 50],
                    [150, 70],
                    [280, 180],
                    [150, 200],
                ],
                (1, 2, 2, 2, 3): [
                    [120, 200],
                    [300, 50],
                    [150, 70],
                    [310, 180],
                    [450, 180],
                ],
                (1, 2, 2, 3, 3): [
                    [120, 180],
                    [300, 200],
                    [350, 60],
                    [180, 70],
                    [450, 180],
                ],
                (1, 2, 3, 3, 3): [
                    [120, 180],
                    [300, 180],
                    [350, 60],
                    [180, 70],
                    [450, 180],
                ],
                (1, 3, 3, 3, 3): [
                    [120, 180],
                    [300, 180],
                    [350, 60],
                    [180, 70],
                    [450, 180],
                ],
                (2, 2, 2, 2, 2): [
                    [190, 210],
                    [330, 190],
                    [350, 60],
                    [170, 70],
                    [460, 200],
                ],
                (2, 2, 2, 2, 3): [
                    [460, 180],
                    [325, 170],
                    [350, 40],
                    [170, 70],
                    [190, 210],
                ],
                (2, 2, 2, 3, 3): [
                    [170, 70],
                    [325, 170],
                    [350, 40],
                    [460, 180],
                    [190, 210],
                ],
                (2, 2, 3, 3, 3): [
                    [170, 70],
                    [325, 170],
                    [350, 40],
                    [460, 180],
                    [190, 190],
                ],
                (2, 3, 3, 3, 3): [
                    [170, 70],
                    [325, 170],
                    [350, 40],
                    [460, 180],
                    [190, 190],
                ],
                (3, 3, 3, 3, 3): [
                    [170, 70],
                    [325, 170],
                    [350, 40],
                    [460, 180],
                    [190, 190],
                ],
            }

        elif self.n == 6:
            self.flower_pos = {
                (1, 1, 1, 1, 1, 1): [
                    [200, 200],
                    [300, 200],
                    [400, 200],
                    [200, 250],
                    [300, 250],
                    [400, 250],
                ],
                (1, 1, 1, 1, 1, 2): [
                    [400, 200],
                    [270, 60],
                    [400, 80],
                    [150, 200],
                    [270, 180],
                    [150, 80],
                ],
                (1, 1, 1, 1, 1, 3): [
                    [400, 200],
                    [270, 60],
                    [400, 80],
                    [150, 180],
                    [270, 180],
                    [150, 80],
                ],
                (1, 1, 1, 1, 2, 2): [
                    [150, 80],
                    [270, 180],
                    [400, 80],
                    [380, 200],
                    [280, 90],
                    [150, 200],
                ],
                (1, 1, 1, 1, 2, 3): [
                    [150, 80],
                    [270, 180],
                    [320, 40],
                    [380, 180],
                    [280, 90],
                    [150, 200],
                ],
                (1, 1, 1, 1, 3, 3): [
                    [280, 80],
                    [380, 80],
                    [150, 200],
                    [380, 180],
                    [160, 90],
                    [270, 190],
                ],
                (1, 1, 1, 2, 2, 2): [
                    [280, 40],
                    [380, 170],
                    [150, 210],
                    [380, 80],
                    [160, 80],
                    [270, 190],
                ],
                (1, 1, 1, 2, 2, 3): [
                    [270, 190],
                    [380, 170],
                    [150, 210],
                    [360, 40],
                    [160, 80],
                    [280, 90],
                ],
                (1, 1, 1, 2, 3, 3): [
                    [270, 180],
                    [380, 160],
                    [150, 200],
                    [360, 40],
                    [160, 80],
                    [280, 90],
                ],
                (1, 1, 1, 3, 3, 3): [
                    [270, 180],
                    [380, 160],
                    [150, 200],
                    [360, 40],
                    [160, 80],
                    [280, 90],
                ],
                (1, 1, 2, 2, 2, 2): [
                    [360, 40],
                    [130, 200],
                    [400, 180],
                    [290, 180],
                    [140, 80],
                    [250, 60],
                ],
                (1, 1, 2, 2, 2, 3): [
                    [360, 40],
                    [130, 200],
                    [250, 60],
                    [290, 180],
                    [140, 80],
                    [410, 190],
                ],
                (1, 1, 2, 2, 3, 3): [
                    [360, 40],
                    [130, 200],
                    [250, 60],
                    [410, 190],
                    [140, 80],
                    [290, 180],
                ],
                (1, 1, 2, 3, 3, 3): [
                    [280, 170],
                    [130, 180],
                    [250, 80],
                    [410, 190],
                    [140, 80],
                    [360, 40],
                ],
                (1, 1, 3, 3, 3, 3): [
                    [390, 40],
                    [130, 180],
                    [280, 170],
                    [410, 190],
                    [140, 80],
                    [290, 60],
                ],
                (1, 2, 2, 2, 2, 2): [
                    [130, 180],
                    [390, 30],
                    [280, 190],
                    [410, 180],
                    [140, 80],
                    [290, 60],
                ],
                (1, 2, 2, 2, 2, 3): [
                    [130, 180],
                    [290, 70],
                    [280, 200],
                    [410, 180],
                    [150, 80],
                    [400, 30],
                ],
                (1, 2, 2, 2, 3, 3): [
                    [130, 180],
                    [290, 70],
                    [280, 200],
                    [410, 90],
                    [150, 80],
                    [410, 200],
                ],
                (1, 2, 2, 3, 3, 3): [
                    [130, 180],
                    [330, 70],
                    [280, 200],
                    [450, 110],
                    [170, 80],
                    [410, 220],
                ],
                (1, 2, 3, 3, 3, 3): [
                    [130, 180],
                    [300, 70],
                    [280, 200],
                    [430, 60],
                    [170, 80],
                    [410, 180],
                ],
                (1, 3, 3, 3, 3, 3): [
                    [130, 180],
                    [300, 70],
                    [280, 200],
                    [430, 60],
                    [170, 70],
                    [410, 180],
                ],
                (2, 2, 2, 2, 2, 2): [
                    [130, 180],
                    [300, 70],
                    [280, 200],
                    [410, 50],
                    [170, 60],
                    [410, 180],
                ],
                (2, 2, 2, 2, 2, 3): [
                    [130, 180],
                    [280, 80],
                    [280, 200],
                    [410, 180],
                    [170, 60],
                    [410, 50],
                ],
                (2, 2, 2, 2, 3, 3): [
                    [170, 60],
                    [260, 90],
                    [280, 200],
                    [410, 180],
                    [130, 180],
                    [370, 50],
                ],
                (2, 2, 2, 3, 3, 3): [
                    [170, 60],
                    [260, 110],
                    [320, 200],
                    [430, 180],
                    [130, 180],
                    [370, 50],
                ],
                (2, 2, 3, 3, 3, 3): [
                    [170, 60],
                    [410, 180],
                    [260, 200],
                    [130, 180],
                    [280, 80],
                    [410, 50],
                ],
                (2, 3, 3, 3, 3, 3): [
                    [170, 60],
                    [400, 170],
                    [260, 200],
                    [130, 180],
                    [280, 80],
                    [410, 50],
                ],
                (3, 3, 3, 3, 3, 3): [
                    [150, 60],
                    [380, 220],
                    [260, 180],
                    [130, 180],
                    [310, 60],
                    [430, 120],
                ],
            }

        elif self.n == 7:
            self.flower_pos = {
                (1, 1, 1, 1, 1, 1, 1): [
                    [100, 180],
                    [150, 90],
                    [230, 160],
                    [330, 30],
                    [350, 90],
                    [350, 180],
                    [500, 120],
                ],
                (1, 1, 1, 1, 1, 1, 2): [
                    [100, 180],
                    [150, 90],
                    [230, 160],
                    [330, 30],
                    [350, 180],
                    [500, 120],
                    [350, 100],
                ],
                (1, 1, 1, 1, 1, 1, 3): [
                    [100, 180],
                    [150, 90],
                    [230, 160],
                    [330, 30],
                    [350, 90],
                    [500, 120],
                    [380, 220],
                ],
                (1, 1, 1, 1, 1, 2, 2): [
                    [100, 180],
                    [230, 160],
                    [330, 30],
                    [350, 90],
                    [350, 180],
                    [180, 90],
                    [500, 180],
                ],
                (1, 1, 1, 1, 1, 2, 3): [
                    [100, 180],
                    [150, 90],
                    [330, 30],
                    [350, 90],
                    [480, 120],
                    [230, 180],
                    [380, 220],
                ],
                (1, 1, 1, 1, 1, 3, 3): [
                    [100, 180],
                    [150, 90],
                    [330, 30],
                    [350, 100],
                    [480, 120],
                    [230, 180],
                    [380, 220],
                ],
                (1, 1, 1, 1, 2, 2, 2): [
                    [100, 180],
                    [150, 90],
                    [350, 100],
                    [480, 120],
                    [230, 170],
                    [330, 30],
                    [380, 220],
                ],
                (1, 1, 1, 1, 2, 2, 3): [
                    [100, 180],
                    [150, 90],
                    [350, 100],
                    [480, 120],
                    [230, 170],
                    [380, 220],
                    [330, 30],
                ],
                (1, 1, 1, 1, 2, 3, 3): [
                    [100, 180],
                    [150, 90],
                    [350, 100],
                    [480, 120],
                    [230, 170],
                    [330, 30],
                    [380, 220],
                ],
                (1, 1, 1, 1, 3, 3, 3): [
                    [100, 180],
                    [150, 90],
                    [350, 100],
                    [480, 120],
                    [230, 170],
                    [330, 30],
                    [380, 220],
                ],
                (1, 1, 1, 2, 2, 2, 2): [
                    [150, 90],
                    [330, 30],
                    [500, 120],
                    [180, 180],
                    [270, 90],
                    [480, 200],
                    [350, 180],
                ],
                (1, 1, 1, 2, 2, 3, 3): [
                    [150, 90],
                    [330, 30],
                    [500, 120],
                    [270, 90],
                    [480, 200],
                    [350, 180],
                    [180, 180],
                ],
                (1, 1, 1, 2, 3, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [500, 120],
                    [270, 90],
                    [420, 230],
                    [350, 150],
                    [180, 180],
                ],
                (1, 1, 1, 3, 3, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [500, 120],
                    [270, 90],
                    [420, 230],
                    [350, 150],
                    [180, 180],
                ],
                (1, 1, 2, 2, 2, 2, 2): [
                    [150, 60],
                    [330, 30],
                    [480, 150],
                    [270, 90],
                    [420, 140],
                    [350, 220],
                    [180, 180],
                ],
                (1, 1, 2, 2, 2, 2, 3): [
                    [150, 60],
                    [330, 30],
                    [180, 180],
                    [270, 90],
                    [320, 200],
                    [480, 220],
                    [420, 140],
                ],
                (1, 1, 2, 2, 2, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [270, 90],
                    [320, 200],
                    [480, 220],
                    [180, 180],
                    [420, 140],
                ],
                (1, 1, 2, 2, 3, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [270, 90],
                    [320, 200],
                    [180, 180],
                    [420, 140],
                    [480, 220],
                ],
                (1, 1, 2, 3, 3, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [270, 90],
                    [180, 180],
                    [320, 200],
                    [420, 140],
                    [480, 220],
                ],
                (1, 1, 3, 3, 3, 3, 3): [
                    [150, 60],
                    [330, 30],
                    [180, 180],
                    [270, 90],
                    [320, 200],
                    [420, 140],
                    [480, 220],
                ],
                (1, 2, 2, 2, 2, 2, 2): [
                    [480, 120],
                    [150, 60],
                    [180, 180],
                    [350, 30],
                    [270, 130],
                    [320, 200],
                    [420, 220],
                ],
                (1, 2, 2, 2, 2, 2, 3): [
                    [480, 120],
                    [150, 60],
                    [350, 30],
                    [270, 130],
                    [320, 200],
                    [420, 220],
                    [180, 180],
                ],
                (1, 2, 2, 2, 2, 3, 3): [
                    [480, 120],
                    [150, 60],
                    [270, 130],
                    [320, 200],
                    [420, 220],
                    [180, 180],
                    [350, 30],
                ],
                (1, 2, 2, 2, 3, 3, 3): [
                    [480, 120],
                    [150, 60],
                    [270, 130],
                    [320, 200],
                    [180, 180],
                    [350, 30],
                    [420, 220],
                ],
                (1, 2, 2, 3, 3, 3, 3): [
                    [480, 120],
                    [270, 130],
                    [320, 200],
                    [150, 60],
                    [180, 180],
                    [350, 30],
                    [420, 220],
                ],
                (1, 2, 3, 3, 3, 3, 3): [
                    [480, 120],
                    [270, 130],
                    [150, 60],
                    [180, 180],
                    [320, 200],
                    [350, 30],
                    [420, 220],
                ],
                (1, 3, 3, 3, 3, 3, 3): [
                    [480, 120],
                    [270, 130],
                    [150, 60],
                    [180, 180],
                    [320, 200],
                    [350, 30],
                    [420, 220],
                ],
                (2, 2, 2, 2, 2, 2, 2): [
                    [90, 180],
                    [350, 30],
                    [200, 180],
                    [290, 90],
                    [320, 200],
                    [160, 80],
                    [450, 180],
                ],
                (2, 2, 2, 2, 2, 2, 3): [
                    [110, 180],
                    [390, 30],
                    [450, 180],
                    [290, 90],
                    [350, 200],
                    [180, 80],
                    [220, 180],
                ],
                (2, 2, 2, 2, 2, 3, 3): [
                    [110, 180],
                    [180, 80],
                    [450, 180],
                    [290, 90],
                    [350, 200],
                    [390, 40],
                    [220, 180],
                ],
                (2, 2, 2, 2, 3, 3, 3): [
                    [110, 180],
                    [350, 200],
                    [450, 180],
                    [290, 90],
                    [180, 80],
                    [390, 70],
                    [220, 180],
                ],
                (2, 2, 2, 3, 3, 3, 3): [
                    [220, 180],
                    [290, 90],
                    [450, 180],
                    [350, 200],
                    [180, 80],
                    [390, 70],
                    [110, 180],
                ],
                (2, 2, 3, 3, 3, 3, 3): [
                    [220, 180],
                    [350, 200],
                    [450, 180],
                    [290, 90],
                    [180, 80],
                    [390, 60],
                    [110, 180],
                ],
                (2, 3, 3, 3, 3, 3, 3): [
                    [220, 180],
                    [350, 200],
                    [450, 180],
                    [310, 90],
                    [180, 80],
                    [390, 30],
                    [110, 180],
                ],
                (3, 3, 3, 3, 3, 3, 3): [
                    [220, 200],
                    [350, 200],
                    [450, 180],
                    [310, 90],
                    [180, 80],
                    [390, 30],
                    [110, 180],
                ],
            }
        else:
            logger.error("Error: n is not expected value")
        return 0

    def flowers_pattern_matching(self):
        """
        花の配置パターンを取得する。

        Returns:
            list: 花の配置位置のリスト
        """
        return self.flower_pos.get(tuple(self.flowers), [])


class MkBouquet(DecideFlowerPos):
    """
    花束を作成するクラス

    Attributes:
        flower_images (list): 花の画像リスト
        original_flowers (list): オリジナルの花の種類リスト
    """

    def __init__(self, n, flowers):
        """
        MkBouquetの初期化メソッド。花の数と種類を受け取り、花のタイプ順にソートしてから花束作成に必要な設定を行う。

        Args:
            n (int): 花の数
            flowers (list): 花の種類リスト
        """
        flower_types = [self.extract_flower_type(flower_id) for flower_id in flowers]
        super().__init__(n, flower_types)  # 抽出した数値のリストを使用

        # flower type の昇順で original_flowers をソートして保持
        self.original_flowers = sorted(flowers, key=self.extract_flower_type)
        self.flower_images = []

    def extract_flower_type(self, flower_id):
        """
        flower_idから花のタイプを抽出する。

        Args:
            flower_id (str): 花のID（例: 'lily1'）

        Returns:
            int: 花のタイプ（1: lily, 2: tulip, 3: sunflower）
        """
        flower_name = "".join([c for c in flower_id if c.isalpha()])
        flower_type_dic = {"lily": 1, "tulip": 2, "sunflower": 3}
        return flower_type_dic.get(flower_name, 0)

    def mk_bouquet(self):
        """
        花束の画像を作成する。

        Returns:
            Image: 作成された花束の画像
        """

        self.set_bouquet_parts()
        bouquet = self.flower_images[0]
        flower_position = self.flowers_pattern_matching()

        if not flower_position:
            logger.info("Error: No matching position pattern found.")
            return None

        for i, pos in enumerate(flower_position):
            x, y = pos
            flower_image = self.flower_images[i + 1]
            bouquet.paste(flower_image, (x, y), flower_image)

        return bouquet

    def set_bouquet_parts(self):
        """
        花束を構成する包み紙と花の画像を設定する。
        """
        self.set_wrapping_paper()
        self.set_flowers()

    def set_wrapping_paper(self):
        """
        包み紙の画像を設定する。
        """
        wrapping_image = self.load_image("wrapping/wrapping1.png")
        self.flower_images.append(wrapping_image)

    def set_flowers(self):
        """
        花の画像を設定する。
        """
        for flower_id in self.original_flowers:
            flower_image = self.load_image(f"flowers/{flower_id}.png")
            self.flower_images.append(flower_image)

    def load_image(self, key):
        """
        S3から指定された画像をロードする。

        Args:
            key (str): S3バケット内の画像キー

        Returns:
            Image: ロードされた画像
        """
        obj = s3.get_object(Bucket=ORIGINAL_IMAGE_BUCKET_NAME, Key=key)
        img = Image.open(obj["Body"]).convert("RGBA")
        return img


def get_week_dates(date):
    """
    指定された日付からその週の全日付を取得する。

    Args:
        date (str): 基準となる日付（例: '2024-10-19'）

    Returns:
        tuple: 週の全日付リストと週の開始日
    """
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    start_of_week = date_obj - timedelta(days=date_obj.weekday())
    return start_of_week, [
        (start_of_week + timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range((date_obj - start_of_week).days + 1)
    ]


def get_flowers(user_id, dates):
    """
    DynamoDBから指定された日付リストに対応する花のIDを取得する。

    Args:
        user_id (str): ユーザーID
        dates (list): 日付リスト

    Returns:
        list: 花のIDリスト
    """
    table = dynamodb.Table(GENERATIVE_AI_TABLE_NAME)
    flowers = []
    for date in dates:
        try:
            response = table.get_item(Key={"user_id": user_id, "date": date})
            if "Item" in response:
                flowers.append(response["Item"]["flower_id"])
        except Exception:
            continue
    return flowers


def get_year_week(date: str) -> str:
    """指定された日付のISO年週を返す関数。

    渡された日付からISOカレンダーに基づく年と週番号を抽出し、
    'YYYY-WW'の形式でフォーマットした文字列を返します。
    週番号は2桁にゼロパディングされます。

    Args:
        date (datetime): ISO年週を取得するための日付。

    Returns:
        str: 'YYYY-WW'形式のISO年週を表す文字列。
    """
    dt = datetime.strptime(date, "%Y-%m-%d")
    iso_year, iso_week, _ = dt.isocalendar()
    return f"{iso_year}-{iso_week:02d}"


def save_bouquet_record(user_id, year_week):
    """
    bouquet_tableにuser_idとyear-week形式の週を保存する。

    Args:
        user_id (str): ユーザーID
        start_of_week (datetime): 週の開始日
    """
    bouquet_table.put_item(Item={"user_id": user_id, "year_week": year_week})


def lambda_handler(event, context):
    """
    Lambda関数のメインハンドラー。
    指定された日付に基づき花束を作成し、S3に保存した後、DynamoDBに記録を残す。

    Args:
        event (dict): Lambda関数のイベント情報
        context (LambdaContext): ランタイム情報

    Returns:
        dict: HTTPレスポンス
    """
    date = event["queryStringParameters"].get("date")
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

    if not date:
        return create_response(400, {"error": "date parameter is required"})

    start_of_week, dates = get_week_dates(date)
    flowers = get_flowers(user_id, dates)

    if not flowers:
        return {"statusCode": 404, "body": json.dumps({"error": "No flowers found"})}

    n = len(flowers)
    bouquet_maker = MkBouquet(n, flowers)
    bouquet_image = bouquet_maker.mk_bouquet()

    year_week = get_year_week(start_of_week)
    output_key = f"bouquets/{user_id}/{year_week}.png"
    save_bouquet_to_s3(bouquet_image, output_key)
    save_bouquet_record(user_id, year_week)

    return create_response(
        200,
        {
            "message": "Bouquet created",
            "bouquet_url": f"s3://{BOUQUET_BUCKET_NAME}/{output_key}",
        },
    )


def save_bouquet_to_s3(bouquet_image, key):
    """
    花束の画像を一時保存し、S3バケットにアップロードする。

    Args:
        bouquet_image (Image): 作成された花束の画像
        key (str): S3バケット内の保存キー
    """
    temp_file_path = f"/tmp/{key.split('/')[-1]}"
    bouquet_image.save(temp_file_path, format="PNG")
    s3.upload_file(temp_file_path, BOUQUET_BUCKET_NAME, key)


def create_response(status_code, body):
    """
    HTTPレスポンスを生成します。

    Args:
        status_code (int): HTTPステータスコード。
        body (dict): レスポンスボディ。

    Returns:
        dict: フォーマット済みのHTTPレスポンス。
    """
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    }
