# 快速部署到 Cloudflare Workers

## 🚀 5分钟快速部署

### 步骤1: 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 步骤2: 登录 Cloudflare
```bash
wrangler login
```

### 步骤3: 自动部署
```bash
chmod +x deploy.sh
./deploy.sh
```

**就这么简单！** 🎉

---

## 📱 获取订阅链接

部署成功后，你会看到类似这样的输出：

```
🎉 部署成功！

📱 订阅链接:
   Surge: https://topchina-proxy-subscription.your-subdomain.workers.dev/surge
   Clash: https://topchina-proxy-subscription.your-subdomain.workers.dev/clash
```

### 常用订阅链接示例

```bash
# 基础订阅（默认100个节点）
https://your-worker.workers.dev/surge
https://your-worker.workers.dev/clash

# 限制节点数量
https://your-worker.workers.dev/surge?max=50
https://your-worker.workers.dev/clash?max=30

# 按国家过滤
https://your-worker.workers.dev/surge?country=德国
https://your-worker.workers.dev/surge?country=美国
https://your-worker.workers.dev/surge?country=日本

# 组合使用
https://your-worker.workers.dev/surge?max=20&country=德国
https://your-worker.workers.dev/clash?max=15&country=美国
```

---

## 🔧 手动部署（如果自动脚本失败）

### 1. 创建 KV 存储
```bash
# 创建生产环境 KV
wrangler kv:namespace create "TOPCHINA_CACHE"

# 创建预览环境 KV  
wrangler kv:namespace create "TOPCHINA_CACHE" --preview
```

### 2. 更新配置文件
将返回的 ID 填入 `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "TOPCHINA_CACHE"
id = "你的生产环境ID"
preview_id = "你的预览环境ID"
```

### 3. 部署
```bash
wrangler deploy
```

---

## 📊 支持的国家和节点数量

根据 TopChina 仓库的数据，主要支持：

| 国家 | 大概节点数 | 推荐使用 |
|------|------------|----------|
| 🇩🇪 德国 | 80+ | ⭐⭐⭐⭐⭐ |
| 🇺🇸 美国 | 50+ | ⭐⭐⭐⭐⭐ |
| 🇯🇵 日本 | 20+ | ⭐⭐⭐⭐ |
| 🇬🇧 英国 | 15+ | ⭐⭐⭐⭐ |
| 🇫🇷 法国 | 15+ | ⭐⭐⭐⭐ |
| 🇨🇦 加拿大 | 10+ | ⭐⭐⭐ |
| 🇦🇺 澳大利亚 | 10+ | ⭐⭐⭐ |
| 🇸🇬 新加坡 | 5+ | ⭐⭐⭐ |
| 🇭🇰 香港 | 3+ | ⭐⭐ |

---

## ⚠️ 重要提醒

1. **用户名更新**: TopChina 的代理用户名每小时更新一次
2. **密码固定**: 所有代理的密码都是 `1`
3. **免费额度**: Cloudflare Workers 每天有 100,000 次免费请求
4. **缓存机制**: 数据缓存1小时，自动更新
5. **节点测试**: 建议使用前先测试节点连通性

---

## 🎯 在 Surge 中使用

1. 打开 Surge
2. 点击 "配置" → "订阅"
3. 添加订阅链接：`https://your-worker.workers.dev/surge?max=50`
4. 更新订阅
5. 在代理选择中就能看到 TopChina 节点了

节点命名格式：`TC-{国家代码}-{IP后缀}`
- 例如：`TC-DE-123` (德国节点)
- 例如：`TC-US-456` (美国节点)

---

## 🔍 故障排除

### 部署失败？
```bash
# 检查 wrangler 版本
wrangler --version

# 重新登录
wrangler logout
wrangler login
```

### 订阅无法访问？
1. 检查 Worker 是否部署成功
2. 访问 https://dash.cloudflare.com/workers 查看状态
3. 检查 KV 存储是否正确配置

### 节点无法连接？
1. TopChina 的用户名每小时更新，等待下次更新
2. 检查代理服务器是否在线
3. 确认密码是 `1`

---

## 🎉 完成！

现在你有了一个全球 CDN 加速的代理订阅服务！

**记住你的订阅链接**：
- Surge: `https://your-worker.workers.dev/surge?max=50`
- Clash: `https://your-worker.workers.dev/clash?max=50`

享受高速稳定的代理服务吧！ 🚀
