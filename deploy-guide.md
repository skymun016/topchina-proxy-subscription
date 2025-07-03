# TopChina Proxy Subscription - 完整部署指南

## 🎯 部署方案选择

### 方案1: GitHub + Wrangler CLI（推荐）
- ✅ 版本控制
- ✅ 本地开发调试
- ✅ 完全控制部署过程

### 方案2: GitHub + Cloudflare Pages（简单）
- ✅ 自动部署
- ✅ Git 集成
- ❌ 需要修改代码结构

### 方案3: 直接 Wrangler 部署（最快）
- ✅ 立即部署
- ❌ 无版本控制

---

## 🚀 方案1: GitHub + Wrangler CLI 部署

### 步骤1: 准备 GitHub 仓库

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit: TopChina proxy subscription service"

# 4. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/topchina-proxy-subscription.git

# 5. 推送到 GitHub
git push -u origin main
```

### 步骤2: 本地部署到 Cloudflare

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 运行自动部署脚本
./deploy.sh
```

---

## 🔄 方案2: GitHub + Cloudflare Pages 自动部署

### 步骤1: 修改项目结构

由于 Cloudflare Pages 主要用于静态网站，我们需要创建一个适配版本：

```bash
# 创建 Pages 版本的文件
mkdir pages-version
```

### 步骤2: 创建 Pages 适配文件

我们需要创建一个 `functions` 目录来放置 Cloudflare Pages Functions：

```
pages-version/
├── functions/
│   ├── surge.js
│   ├── clash.js
│   └── _middleware.js
├── index.html
└── wrangler.toml
```

### 步骤3: 在 Cloudflare 控制台设置

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)
2. 选择 "Pages"
3. 点击 "Create a project"
4. 连接你的 GitHub 仓库
5. 设置构建配置：
   - Build command: `echo "No build needed"`
   - Build output directory: `/`

---

## ⚡ 方案3: 直接 Wrangler 部署（最快）

如果你想立即测试，可以直接部署：

```bash
# 1. 确保在项目目录中
cd /path/to/your/project

# 2. 安装 Wrangler（如果还没安装）
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 直接部署
wrangler deploy
```

---

## 📋 详细操作步骤

### 第一步: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击 "New repository"
3. 仓库名称: `topchina-proxy-subscription`
4. 设置为 Public（或 Private）
5. 不要初始化 README（我们已经有文件了）
6. 点击 "Create repository"

### 第二步: 推送代码到 GitHub

```bash
# 在你的项目目录中执行
git init
git add .
git commit -m "feat: TopChina proxy subscription service for Cloudflare Workers"

# 替换为你的实际仓库地址
git remote add origin https://github.com/yourusername/topchina-proxy-subscription.git
git branch -M main
git push -u origin main
```

### 第三步: 部署到 Cloudflare Workers

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare 账号
wrangler login

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

---

## 🔧 环境准备

### 1. 安装 Node.js
```bash
# 检查是否已安装
node --version
npm --version

# 如果没有安装，访问 https://nodejs.org 下载安装
```

### 2. 安装 Git
```bash
# 检查是否已安装
git --version

# macOS: 通过 Xcode Command Line Tools 安装
xcode-select --install

# 或使用 Homebrew
brew install git
```

### 3. 注册 Cloudflare 账号
- 访问 [Cloudflare](https://cloudflare.com)
- 注册免费账号
- 验证邮箱

---

## 🎯 推荐部署流程

### 对于新手用户：
1. **GitHub + Wrangler CLI** - 学习完整的部署流程
2. 先在本地测试
3. 推送到 GitHub 备份
4. 使用 Wrangler 部署

### 对于有经验用户：
1. **直接 Wrangler 部署** - 快速上线
2. 后续再整理到 GitHub

---

## 📱 部署后验证

部署成功后，访问以下链接验证：

```bash
# 检查服务状态
curl https://your-worker.workers.dev/status

# 测试 Surge 订阅
curl https://your-worker.workers.dev/surge?max=5

# 测试 Clash 订阅
curl https://your-worker.workers.dev/clash?max=5
```

---

## 🔍 故障排除

### 常见问题：

1. **Wrangler 登录失败**
   ```bash
   wrangler logout
   wrangler login
   ```

2. **KV 存储创建失败**
   ```bash
   # 手动创建
   wrangler kv:namespace create "TOPCHINA_CACHE"
   wrangler kv:namespace create "TOPCHINA_CACHE" --preview
   ```

3. **部署权限问题**
   - 确保 Cloudflare 账号有 Workers 权限
   - 检查是否超出免费额度

---

## 🎉 完成部署

部署成功后，你将获得：

- 🌍 全球 CDN 加速的订阅服务
- 📱 Surge/Clash 订阅链接
- 🔄 自动更新的代理列表
- 💰 完全免费的服务

**你的订阅链接**：
- Surge: `https://your-worker.workers.dev/surge?max=50`
- Clash: `https://your-worker.workers.dev/clash?max=50`

享受高速稳定的代理订阅服务！🚀
