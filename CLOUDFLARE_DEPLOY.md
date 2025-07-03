# TopChina Proxy Subscription - Cloudflare Workers 部署指南

将 TopChina 代理订阅服务部署到 Cloudflare Workers，享受全球 CDN 加速和免费额度。

## 🎯 优势

- ✅ **免费额度**: 每天 100,000 次请求
- ✅ **全球 CDN**: 超快访问速度
- ✅ **自动缓存**: 智能缓存机制
- ✅ **高可用性**: 99.9% 可用性保证
- ✅ **自定义域名**: 支持绑定自己的域名

## 📋 准备工作

### 1. 注册 Cloudflare 账号
访问 [Cloudflare](https://cloudflare.com) 注册免费账号

### 2. 安装 Wrangler CLI
```bash
# 使用 npm 安装
npm install -g wrangler

# 或使用 yarn
yarn global add wrangler
```

### 3. 登录 Cloudflare
```bash
wrangler login
```

## 🚀 快速部署

### 方法1: 自动部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法2: 手动部署

#### 步骤1: 创建 KV 存储空间
```bash
# 创建生产环境 KV
wrangler kv:namespace create "TOPCHINA_CACHE"

# 创建预览环境 KV
wrangler kv:namespace create "TOPCHINA_CACHE" --preview
```

#### 步骤2: 更新配置文件
将返回的 KV ID 填入 `wrangler.toml` 文件：

```toml
[[kv_namespaces]]
binding = "TOPCHINA_CACHE"
id = "your-production-kv-id"
preview_id = "your-preview-kv-id"
```

#### 步骤3: 部署
```bash
wrangler deploy
```

## 📱 使用订阅

部署成功后，你将获得类似这样的链接：

### 基础订阅链接
```
https://topchina-proxy-subscription.your-subdomain.workers.dev/surge
https://topchina-proxy-subscription.your-subdomain.workers.dev/clash
```

### 带参数的订阅链接
```bash
# 限制50个节点
/surge?max=50

# 只要德国节点
/surge?country=德国

# 30个美国节点的 Clash 订阅
/clash?max=30&country=美国
```

## 🌐 绑定自定义域名

### 1. 添加域名到 Cloudflare
在 Cloudflare 控制台添加你的域名

### 2. 配置 Workers 路由
在 `wrangler.toml` 中添加：

```toml
[[routes]]
pattern = "proxy.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 3. 重新部署
```bash
wrangler deploy
```

现在可以通过 `https://proxy.yourdomain.com/surge` 访问

## ⚙️ 配置说明

### wrangler.toml 配置项

```toml
name = "topchina-proxy-subscription"  # Worker 名称
main = "worker.js"                    # 入口文件
compatibility_date = "2024-01-01"     # 兼容性日期

# KV 存储配置
[[kv_namespaces]]
binding = "TOPCHINA_CACHE"            # 绑定名称
id = "your-kv-namespace-id"           # 生产环境 ID
preview_id = "your-preview-kv-id"     # 预览环境 ID

# 环境变量
[vars]
CACHE_DURATION = "3600"               # 缓存时长（秒）
MAX_NODES_LIMIT = "200"               # 最大节点数限制

# 定时任务（可选）
[triggers]
crons = ["0 */1 * * *"]               # 每小时执行一次
```

### 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `CACHE_DURATION` | 3600 | 缓存持续时间（秒） |
| `MAX_NODES_LIMIT` | 200 | 单次请求最大节点数 |

## 📊 监控和管理

### 1. Cloudflare 控制台
访问 [Cloudflare Workers 控制台](https://dash.cloudflare.com/workers) 查看：
- 请求统计
- 错误日志
- 性能指标

### 2. 实时日志
```bash
# 查看实时日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 1h
```

### 3. 状态检查
访问 `/status` 端点查看服务状态：
```
https://your-worker.workers.dev/status
```

## 🔧 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查 wrangler 版本
wrangler --version

# 重新登录
wrangler logout
wrangler login

# 检查配置
wrangler whoami
```

#### 2. KV 存储问题
```bash
# 列出所有 KV 命名空间
wrangler kv:namespace list

# 检查 KV 内容
wrangler kv:key list --binding TOPCHINA_CACHE
```

#### 3. 缓存问题
```bash
# 清除 KV 缓存
wrangler kv:key delete "cache-key" --binding TOPCHINA_CACHE

# 或通过 API 清除
curl -X DELETE "https://your-worker.workers.dev/cache"
```

### 调试模式

在 `worker.js` 中启用调试：

```javascript
// 在 handleRequest 函数开头添加
console.log('Request:', request.url);
console.log('Headers:', [...request.headers.entries()]);
```

## 💰 费用说明

### Cloudflare Workers 免费额度
- **请求数**: 每天 100,000 次
- **CPU 时间**: 每次请求最多 10ms
- **KV 存储**: 1GB 存储空间
- **KV 读取**: 每天 100,000 次

### 超出免费额度后
- **请求**: $0.50 / 百万次请求
- **KV 读取**: $0.50 / 百万次读取
- **KV 写入**: $5.00 / 百万次写入

对于个人使用，免费额度完全够用。

## 🔄 更新和维护

### 更新代码
```bash
# 修改 worker.js 后重新部署
wrangler deploy
```

### 定期维护
- 监控请求量和错误率
- 定期检查源数据可用性
- 根据需要调整缓存策略

## 📝 最佳实践

1. **缓存策略**: 合理设置缓存时间，平衡数据新鲜度和性能
2. **错误处理**: 添加完善的错误处理和降级机制
3. **监控告警**: 设置监控告警，及时发现问题
4. **版本管理**: 使用 Git 管理代码版本
5. **安全考虑**: 避免在代码中硬编码敏感信息

## 🎉 部署完成

部署成功后，你将拥有一个高性能的全球代理订阅服务！

**订阅链接示例**:
- Surge: `https://your-worker.workers.dev/surge?max=50`
- Clash: `https://your-worker.workers.dev/clash?country=德国`

享受全球 CDN 加速的代理订阅服务吧！ 🚀
