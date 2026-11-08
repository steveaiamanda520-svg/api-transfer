# ModelPort 本地版

需要 Node.js 22.13 或以上，推荐 Node.js 24 LTS。

## 启动

下载并解压本地运行包后，在解压目录运行：

```sh
npm start
```

Windows 也可双击 `start-local.cmd`。运行包已经包含网页与网关，不需要 npm install。

- 管理后台：http://localhost:8080/
- 用户唯一页面：http://localhost:8080/balance
- 管理员口令：启动时在终端显示。首次运行自动生成，或通过 ADMIN_PASSWORD 设置。
- SQLite 数据、加密主密钥与管理员口令保存在 data 目录。升级或迁移机器时一起保留，不要提交到代码仓库。

## MiniMax 只添加一次

1. 管理员登录后，打开「模型与渠道」，选择 MiniMax。
2. 填写一份订阅的官方 API Key、官方地址、此订阅可用的模型名称。
3. 国内默认官方地址为 https://api.minimax.cn/v1；也支持 https://api.minimaxi.com/v1 和国际站 https://api.minimax.io/v1。密钥与官方地址必须属于同一站点。
4. 创建用户中转 API Key，分配套餐与余额。

无需为 OpenAI 与 Anthropic 分别添加订阅，也没有协议选择框。服务根据客户端请求路径自动匹配 MiniMax 的官方兼容入口；同一个用户 Key 的两种调用共用余额、窗口次数和 Token 总额度。

其他供应商只使用其实际支持的官方原生入口；此版本不把不支持的参数强行转换成另一种协议。OpenAI 此处指 Chat Completions，不包含 Responses API。

## 两种调用方式

OpenAI SDK 的 base_url：`http://localhost:8080/v1`

```python
from openai import OpenAI

client = OpenAI(api_key="sk-mp-你的中转密钥", base_url="http://localhost:8080/v1")
result = client.chat.completions.create(
    model="MiniMax-M3.1-Flash",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好"}],
)
print(result.choices[0].message.content)
```

Anthropic SDK 的 base_url：`http://localhost:8080`（SDK 自动追加 /v1/messages）

```python
from anthropic import Anthropic

client = Anthropic(api_key="sk-mp-同一把中转密钥", base_url="http://localhost:8080")
result = client.messages.create(
    model="MiniMax-M3.1-Flash",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好"}],
)
for block in result.content:
    if block.type == "text":
        print(block.text)
```

两种协议都可以设置 stream=True。工具、系统提示、内容块、thinking 等参数按原生协议转发；官方实际支持范围以模型和订阅为准。OpenAI 流式调用会请求 usage 事件。流提前中断或官方未返回 usage 时，暂按预留额度结算，避免被绕过计费；预留按请求字节数加最大输出 Token 估算，余额过低时可能需要减小 max_tokens。

余额 API：`GET /api/balance`，使用 `Authorization: Bearer sk-mp-...` 或 `x-api-key: sk-mp-...`。
模型列表：`GET /v1/models`，需要同一把用户 API Key。
达到窗口次数上限返回 429；余额或 Token 额度不足返回 402，并提示联系管理员充值或升级套餐。

## 更换域名

复制 `.env.example` 为 `.env.local`。把 PUBLIC_BASE_URL 改为部署域名，例如：

```dotenv
PORT=8080
HOST=127.0.0.1
PUBLIC_BASE_URL=https://api.example.com
```

重启 `npm start`，配置 HTTPS 反向代理把域名请求转发到 127.0.0.1:8080：

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_buffering off;
    proxy_read_timeout 180s;
}
```

客户端 OpenAI base_url 改为 `https://api.example.com/v1`；Anthropic base_url 改为 `https://api.example.com`。不需要改代码、重新添加订阅或重发用户 Key。
后台仍需管理员登录，余额页仅凭用户 Key 查询。正式部署请使用 HTTPS，并保留 data 目录。

## 测试范围

已验证本地 8080 端口的管理员登录、伪造身份拒绝、来源校验、余额查询、单份 MiniMax 订阅自动双路由、两种 SSE 流式返回和统一扣费；同时验证并发次数限制、Token 上限、官方失败返还额度。测试使用模拟的官方响应，没有消耗真实订阅额度。真实调用需要在后台填写有效官方 API Key。

## 主题切换

后台右上角与余额页右上角可打开「更换主题」，支持午夜薄荷、曜石灰、深海蓝、松林绿、星云紫、赤陶红、云雾白、暖砂金八套配色，也可选择「跟随系统」。选中即预览，主题自动保存在当前浏览器，刷新和下次访问会保留。独立本地登录页提供同样的配色选项。
