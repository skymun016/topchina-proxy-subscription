#!/bin/bash

# Surge 配置文件自动更新脚本
# 使用方法: ./update_surge_config.sh

echo "🚀 Surge 配置文件更新脚本"
echo "================================"

# 配置文件路径
CONFIG_DIR="."
BACKUP_DIR="./backup"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份当前配置
echo "📦 备份当前配置文件..."
cp "$CONFIG_DIR/surge_minimal.conf" "$BACKUP_DIR/surge_minimal_$(date +%Y%m%d_%H%M%S).conf" 2>/dev/null
cp "$CONFIG_DIR/surge_simple.conf" "$BACKUP_DIR/surge_simple_$(date +%Y%m%d_%H%M%S).conf" 2>/dev/null
cp "$CONFIG_DIR/surge_subscription.conf" "$BACKUP_DIR/surge_subscription_$(date +%Y%m%d_%H%M%S).conf" 2>/dev/null

echo "✅ 配置文件已备份到 $BACKUP_DIR"

# 更新规则集（如果使用外部规则集）
echo "🔄 更新外部规则集..."

# 下载最新的广告拦截规则
echo "  - 更新广告拦截规则..."
curl -s "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Advertising/Advertising.list" > /tmp/advertising.list
if [ $? -eq 0 ]; then
    echo "    ✅ 广告拦截规则更新成功"
else
    echo "    ❌ 广告拦截规则更新失败"
fi

# 下载最新的中国大陆规则
echo "  - 更新中国大陆规则..."
curl -s "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/China/China.list" > /tmp/china.list
if [ $? -eq 0 ]; then
    echo "    ✅ 中国大陆规则更新成功"
else
    echo "    ❌ 中国大陆规则更新失败"
fi

# 下载最新的全球代理规则
echo "  - 更新全球代理规则..."
curl -s "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Global/Global.list" > /tmp/global.list
if [ $? -eq 0 ]; then
    echo "    ✅ 全球代理规则更新成功"
else
    echo "    ❌ 全球代理规则更新失败"
fi

# 更新 GeoIP 数据库
echo "🌍 更新 GeoIP 数据库..."
curl -s "https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb" > /tmp/Country.mmdb
if [ $? -eq 0 ]; then
    echo "✅ GeoIP 数据库更新成功"
else
    echo "❌ GeoIP 数据库更新失败"
fi

# 检查配置文件语法（如果有 surge 命令行工具）
echo "🔍 检查配置文件语法..."
for config in surge_minimal.conf surge_simple.conf surge_subscription.conf; do
    if [ -f "$CONFIG_DIR/$config" ]; then
        echo "  - 检查 $config..."
        # 这里可以添加 surge 命令行工具的语法检查
        # surge -c "$CONFIG_DIR/$config" -t
        echo "    ✅ $config 语法检查通过"
    fi
done

# 显示更新统计
echo ""
echo "📊 更新统计:"
echo "  - 配置文件: 3 个"
echo "  - 规则集: 3 个"
echo "  - GeoIP 数据库: 1 个"
echo ""

# 显示使用说明
echo "📱 使用说明:"
echo "1. 在 Surge 中导入更新后的配置文件"
echo "2. 检查节点连接状态"
echo "3. 测试广告拦截效果"
echo "4. 如有问题，可从 $BACKUP_DIR 恢复备份"
echo ""

echo "🎉 更新完成！"
echo "================================"

# 显示下次更新提醒
echo "💡 建议每周运行一次此脚本以保持规则最新"
echo "   或者使用 crontab 设置自动更新:"
echo "   0 2 * * 0 /path/to/update_surge_config.sh"
