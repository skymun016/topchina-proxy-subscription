#!/bin/bash

# TopChina Proxy Subscription - Cloudflare Workers 部署脚本

echo "🚀 TopChina Proxy Subscription - Cloudflare Workers 部署"
echo "=================================================="

# 检查 wrangler 是否已安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请先安装 Wrangler CLI:"
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare"
    wrangler login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
fi

echo "📦 创建 KV 存储空间..."

# 创建生产环境 KV 存储空间
echo "创建生产环境 KV..."
wrangler kv:namespace create "TOPCHINA_CACHE" --preview false > kv_prod.txt 2>&1
KV_ID=$(grep -o 'id = "[^"]*"' kv_prod.txt | cut -d'"' -f2)

# 创建预览环境 KV 存储空间
echo "创建预览环境 KV..."
wrangler kv:namespace create "TOPCHINA_CACHE" --preview > kv_preview.txt 2>&1
PREVIEW_KV_ID=$(grep -o 'id = "[^"]*"' kv_preview.txt | cut -d'"' -f2)

if [ -z "$KV_ID" ] || [ -z "$PREVIEW_KV_ID" ]; then
    echo "❌ 创建 KV 存储空间失败"
    echo "生产环境输出:"
    cat kv_prod.txt
    echo "预览环境输出:"
    cat kv_preview.txt
    exit 1
fi

echo "✅ KV 存储空间创建成功"
echo "   Production ID: $KV_ID"
echo "   Preview ID: $PREVIEW_KV_ID"

# 更新 wrangler.toml 文件
echo "📝 更新配置文件..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-kv-namespace-id/$KV_ID/g" wrangler.toml
    sed -i '' "s/your-preview-kv-namespace-id/$PREVIEW_KV_ID/g" wrangler.toml
else
    # Linux
    sed -i "s/your-kv-namespace-id/$KV_ID/g" wrangler.toml
    sed -i "s/your-preview-kv-namespace-id/$PREVIEW_KV_ID/g" wrangler.toml
fi

echo "🚀 部署到 Cloudflare Workers..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📱 订阅链接:"
    echo "   Surge: https://topchina-proxy-subscription.your-subdomain.workers.dev/surge"
    echo "   Clash: https://topchina-proxy-subscription.your-subdomain.workers.dev/clash"
    echo ""
    echo "🌐 管理面板:"
    echo "   https://dash.cloudflare.com/workers"
    echo ""
    echo "💡 使用示例:"
    echo "   https://your-worker.workers.dev/surge?max=50"
    echo "   https://your-worker.workers.dev/surge?country=德国"
    echo "   https://your-worker.workers.dev/clash?max=30&country=美国"
    echo ""
    echo "⚠️  注意事项:"
    echo "   - 代理用户名每小时自动更新"
    echo "   - 所有代理密码为 1"
    echo "   - 数据缓存1小时"
    echo "   - 建议先测试节点连通性"
else
    echo "❌ 部署失败"
    exit 1
fi
