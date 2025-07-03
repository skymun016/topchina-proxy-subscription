# Surge 订阅更新功能说明

## 📋 配置文件说明

### 1. surge_minimal.conf
- **极简配置**：只有一个代理组
- **基础订阅**：包含基本的外部规则集
- **适合用户**：节点较少，需要简单配置

### 2. surge_simple.conf  
- **简化配置**：包含详细的本地规则
- **部分订阅**：混合本地规则和外部规则集
- **适合用户**：需要自定义规则的用户

### 3. surge_subscription.conf
- **完整订阅**：大量使用外部规则集
- **自动更新**：所有规则都从外部获取
- **适合用户**：希望规则自动保持最新

## 🔄 订阅更新功能

### 自动更新设置
```ini
# 订阅更新设置
update-url = https://raw.githubusercontent.com/yourusername/surge-config/main/surge_subscription.conf
force-http-engine-hosts = %APPEND% raw.githubusercontent.com:443, adrules.top:443
rule-update-interval = 86400  # 24小时自动更新
```

### 外部规则集
配置文件使用以下外部规则集，会自动更新：

#### 广告拦截
- `blackmatrix7/ios_rule_script` - 广告拦截规则
- `adrules.top` - 秋风广告规则

#### 服务分类
- **AI 服务**：OpenAI、Claude、Gemini 等
- **国际媒体**：YouTube、Netflix、Spotify 等  
- **社交媒体**：Telegram、Twitter、Facebook 等
- **游戏平台**：Steam、Epic Games 等
- **苹果服务**：App Store、iCloud 等
- **微软服务**：Office、GitHub 等

#### 地理位置
- **中国大陆**：所有国内网站和服务
- **全球代理**：需要代理的国外网站

## 🛠️ 使用方法

### 方法一：Surge 内置更新
1. 在 Surge 中导入配置文件
2. 进入 **设置** → **配置文件**
3. 点击 **更新配置** 按钮
4. Surge 会自动下载最新规则

### 方法二：手动脚本更新
```bash
# 运行更新脚本
./update_surge_config.sh
```

### 方法三：定时自动更新
```bash
# 添加到 crontab，每周日凌晨2点自动更新
crontab -e

# 添加以下行
0 2 * * 0 /path/to/update_surge_config.sh
```

## 📊 更新内容

### 规则集更新
- ✅ 广告拦截规则（每日更新）
- ✅ 国内外网站分类（每周更新）
- ✅ 新增服务和域名（实时更新）
- ✅ GeoIP 数据库（每月更新）

### 节点更新
- 🔧 需要手动更新节点信息
- 🔧 可以通过机场订阅链接自动更新

## ⚙️ 自定义配置

### 修改更新间隔
```ini
# 修改 rule-update-interval 值（秒）
rule-update-interval = 43200   # 12小时
rule-update-interval = 21600   # 6小时  
rule-update-interval = 86400   # 24小时（推荐）
```

### 添加自定义规则集
```ini
# 在 [Rule] 部分添加
RULE-SET,https://your-custom-rules.com/rules.list,🚀 代理选择
```

### 修改订阅源
```ini
# 修改 update-url 为您的配置文件地址
update-url = https://your-domain.com/surge.conf
```

## 🔍 故障排除

### 更新失败
1. **检查网络连接**：确保能访问 GitHub 和规则源
2. **检查 URL**：确认规则集 URL 是否有效
3. **查看日志**：在 Surge 日志中查看错误信息

### 规则不生效
1. **重启 Surge**：更新后重启应用
2. **清除缓存**：清除 DNS 和规则缓存
3. **检查语法**：确认配置文件语法正确

### 节点连接问题
1. **测试连接**：在代理组中测试节点
2. **更新节点**：检查节点信息是否过期
3. **检查端口**：确认端口没有被占用

## 📝 注意事项

1. **备份配置**：更新前自动备份原配置
2. **测试连接**：更新后测试节点连接
3. **监控流量**：注意流量使用情况
4. **定期检查**：定期检查规则更新效果

## 🎯 推荐设置

- **日常使用**：surge_minimal.conf
- **高级用户**：surge_subscription.conf  
- **自定义需求**：surge_simple.conf

选择适合您需求的配置文件，享受自动更新的便利！
