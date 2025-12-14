aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 431343616414.dkr.ecr.ap-northeast-1.amazonaws.com

docker build -t sktodo-repo .

docker tag sktodo-repo:latest 431343616414.dkr.ecr.ap-northeast-1.amazonaws.com/sktodo-repo:latest

docker push 431343616414.dkr.ecr.ap-northeast-1.amazonaws.com/sktodo-repo:latest

タスク定義で新しいやつを作る。

Amazon Elastic Container Service
->クラスター
->vtx-cluster
->サービス
->vtx-service
サービスを更新を押す
