# 배포 가이드

이 앱은 React PWA와 Express API/Trading Bot Engine을 같은 Node 서버에서 실행합니다.

## 로컬 production 실행

```bash
npm install
npm run build
npm start
```

접속 URL:

```text
http://localhost:4000/
```

## 필수 환경변수

실전 주문 배포 시 플랫폼 환경변수에만 넣고, 저장소에는 커밋하지 않습니다.

```text
PORT=4000
TOSS_TRADING_MODE=live
TOSS_LIVE_ORDER_ENABLED=true
TOSS_CLIENT_ID=...
TOSS_CLIENT_SECRET=...
TOSS_API_BASE_URL=https://openapi.tossinvest.com
TOSS_ACCOUNT_SEQ=...
```

안전한 테스트 배포는 아래처럼 둡니다.

```text
TOSS_TRADING_MODE=test
TOSS_LIVE_ORDER_ENABLED=false
```

## Render 배포

`render.yaml`을 포함했습니다. Render에서 Blueprint로 연결하면 Docker 기반으로 배포할 수 있습니다.

주의:

- SQLite 파일은 `/app/data`에 저장됩니다.
- Render persistent disk가 `/app/data`에 마운트되어야 거래 로그가 유지됩니다.
- 실전 키는 Render Dashboard의 Environment Variables에 직접 넣습니다.
- 실전 주문을 켜려면 `TOSS_TRADING_MODE=live`와 `TOSS_LIVE_ORDER_ENABLED=true`가 둘 다 필요합니다.

## Vercel 비추천

이 앱은 상시 실행 백엔드 봇과 SQLite를 사용하므로 Vercel 서버리스 구조보다 Render/Railway/Fly 같은 Node 서버형 배포가 맞습니다.

## 현재 무료 Vercel 배포

무료 PWA 데모 배포 URL:

```text
https://toss-stock-auto-trader-deploy.vercel.app/
```

주의:

- `.env`와 실전 토스 키는 배포하지 않았습니다.
- 배포본은 `TOSS_TRADING_MODE=test`로 동작합니다.
- Vercel 서버리스는 장시간 실행되는 자동매매 봇과 영구 SQLite 저장소에는 적합하지 않습니다.
- 실전 자동매매 운영은 Render/Railway/Fly 같은 상시 실행 서버에 환경변수를 넣어 배포해야 합니다.

## 무료 Render 실사용 운영

Render Free Web Service는 idle 시 sleep 되므로, 무료 외부 cron으로 아래 엔드포인트를 1분 또는 5분마다 호출합니다.

```text
POST https://YOUR_RENDER_URL/api/bot/tick
```

`tick`은 서버 내부에서 한국 시간 기준으로 전략 시간을 판단합니다.

- 09:00~09:10: 스캔 시작/후보 갱신
- 09:10 이후: 1등 후보 자동 매수 요청
- 14:50 이후: 보유 종목 강제 매도 요청

무료 cron 예:

- cron-job.org
- EasyCron free plan

Render 환경변수에는 아래 값을 직접 넣어야 합니다.

```text
TOSS_TRADING_MODE=live
TOSS_LIVE_ORDER_ENABLED=true
TOSS_CLIENT_ID=...
TOSS_CLIENT_SECRET=...
TOSS_API_BASE_URL=https://openapi.tossinvest.com
TOSS_ACCOUNT_SEQ=...
```
