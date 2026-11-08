# ModelPort · API Transfer

模型 API 中转站，支持供应商订阅管理、用户密钥、余额查询、套餐限流和管理员测试聊天。

## 本地启动

需要 Node.js 22.13 或以上，推荐 Node.js 24。源码首次运行需安装依赖：

```bash
npm install
npm run local
```

后台地址：http://localhost:8080/。启动终端显示管理员口令，首次运行自动生成。
用户唯一页面：http://localhost:8080/balance，仅用 API Key 查询余额和剩余额度。

源码中的 `npm start` 用于 Worker 构建预览，本地服务请使用 `npm run local`。

## MiniMax 一份订阅，两种调用方式

管理员在「模型与渠道」添加一次 MiniMax 订阅，填入官方密钥和模型列表即可。无须分别配置协议。

| 客户端 | Base URL | 请求路径 |
| --- | --- | --- |
| OpenAI SDK | http://localhost:8080/v1 | POST /v1/chat/completions |
| Anthropic SDK | http://localhost:8080 | POST /v1/messages |

两种请求自动路由到 MiniMax 对应的官方接口，同一把用户中转 Key 共用余额、窗口次数和 Token 额度。支持原生工具参数和 SSE 流式返回。OpenAI 在此指 Chat Completions，暂不含 Responses API。

管理员可配置每 5 小时调用次数、Token 总额度及 Token 单价。次数耗尽返回 429，余额或 Token 不足返回 402；官方失败会返还预留额度。

其他供应商只转发其官方支持的协议。支持 OpenAI、Anthropic、MiniMax、GLM、DeepSeek、通义千问和 Moonshot 的渠道配置。

## 配置与域名

复制 `.env.example` 为 `.env.local`；可设置端口、域名和管理员口令。
部署正式域名时，把 `PUBLIC_BASE_URL` 改为例如 `https://api.example.com`，配置 HTTPS 反向代理转发到8080端口，并修改客户端 Base URL。

运行数据和加密主密钥保存在 `data/`，迁移时应一起保留。真实密钥、数据库和运行配置不进入仓库。
仓库不包含原作者的托管站点身份；本地版无需托管服务，在线部署需使用自己的环境配置。

## 验证与打包

```bash
npm run test:gateway
npm run local:build
npm run test:local
npm run package:local
```

打包产物位于 `outputs/modelport-local/`，包含已构建的网页与原生 Node 服务，可在装有 Node.js 的机器上直接 `npm start`，无需安装 npm 依赖。

测试覆盖双协议、SSE、单份 MiniMax 订阅共享计费、并发限流、Token 上限、管理员登录与失败返还。官方响应使用模拟数据，真实调用需自行配置有效官方密钥。

更详细的 SDK 示例和域名迁移说明见 [LOCAL_README.md](LOCAL_README.md)。其中运行包的 `npm start` 指打包后的独立目录。
