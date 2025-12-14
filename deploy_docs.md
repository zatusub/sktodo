# AWS ECR & ECS デプロイガイド

このガイドでは、コンテナ化した Vite アプリケーションを Amazon ECR にプッシュし、Amazon ECS (Fargate) で実行する手順を説明します。

## 前提条件

- AWS CLI がインストールされ、設定されていること (`aws configure`)
- Docker がインストールされ、起動していること
- AWS アカウントの権限 (ECR, ECS, IAM など) があること

## 1. 変数の設定 (PowerShell)

作業を効率化するため、PowerShell で環境変数を設定します。
`<YOUR_AWS_ACCOUNT_ID>` と `<REGION>` (例: ap-northeast-1) はご自身の環境に合わせて変更してください。

```powershell
$AWS_ACCOUNT_ID="431343616414"
$REGION="ap-northeast-1"
$REPO_NAME="sktodo-repo"
$IMAGE_TAG="latest"
$ECR_URI="431343616414.dkr.ecr.ap-northeast-1.amazonaws.com/sktodo-repo"
```

## 2. ECR リポジトリの作成

まだリポジトリがない場合は作成します。

```powershell
aws ecr create-repository --repository-name $REPO_NAME --region $REGION
```

## 3. Docker イメージのビルドとタグ付け

```powershell
# イメージのビルド (ローカルの .env が含まれます)
docker build -t $REPO_NAME .

# タグ付け
docker tag ${REPO_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
```

## 4. ECR へのログインとプッシュ

```powershell
# ECRへのログインパスワードを取得し、Dockerログイン
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# イメージのプッシュ
docker push ${ECR_URI}:${IMAGE_TAG}
```

## 5. ECS (Fargate) へのデプロイ

### クラスターの作成 (初回のみ)

ECS コンソール、または CLI でクラスターを作成します。

### タスク定義の作成

ECS コンソールで「新しいタスク定義の作成」を選択します。

- **起動タイプ**: Fargate
- **OS/アーキテクチャ**: Linux/X86_64
- **タスクメモリ**: 0.5 GB (最小構成)
- **タスク CPU**: 0.25 vCPU
- **コンテナの定義**:
  - **名前**: sktodo-container
  - **イメージ URI**: 上記の `$ECR_URI` (例: `123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/sktodo-repo:latest`)
  - **ポートマッピング**: コンテナポート 80 (プロトコル: TCP)

### サービスの作成

クラスター内で「サービス」を作成します。

- **起動タイプ**: Fargate
- **タスク定義**: 作成したタスク定義を選択
- **サービス名**: sktodo-service
- **タスク数**: 1
- **ネットワーキング**:
  - VPC とサブネットを選択
  - **パブリック IP の自動割り当て**: ENABLED (これがないとインターネットからアクセスできません)
  - セキュリティグループ: ポート 80 (HTTP) を許可するルールを追加

## 6. 動作確認

サービスの「タスク」タブから実行中のタスクをクリックし、「パブリック IP」を確認します。
ブラウザで `http://<パブリックIP>` にアクセスし、アプリが表示されれば成功です。
