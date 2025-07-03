# TopChina Proxy List to Surge Converter

自动抓取 [TopChina/proxy-list](https://github.com/TopChina/proxy-list) 仓库的代理节点并转换为 Surge/Clash 订阅格式。

## 功能特点

- 🔄 自动抓取最新代理列表
- 📱 支持 Surge 和 Clash 格式
- 🌍 支持按国家过滤节点
- 📊 支持限制节点数量
- ⚡ 智能缓存机制
- 🔗 提供订阅服务接口

## 快速开始

### 1. 安装依赖
```bash
pip install requests flask
```

### 2. 命令行使用（一次性转换）
```bash
# 生成 Surge 配置文件
python topchina_to_surge.py

# 限制50个节点
python topchina_to_surge.py -m 50

# 指定输出文件
python topchina_to_surge.py -o my_surge.conf
```

### 3. 启动订阅服务（动态更新）
```bash
python topchina_subscription.py
```

访问 `http://localhost:5000` 查看订阅链接。

## 订阅链接

| 格式 | 链接 | 说明 |
|------|------|------|
| Surge | `http://localhost:5000/surge` | Surge 配置格式 |
| Clash | `http://localhost:5000/clash` | Clash 配置格式 |

### 支持参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `max` | 最大节点数量 | `/surge?max=50` |
| `country` | 国家过滤 | `/surge?country=美国` |

### 使用示例

```bash
# 获取前20个节点的 Surge 订阅
curl http://localhost:5000/surge?max=20

# 获取德国节点
curl http://localhost:5000/surge?country=德国

# 获取30个美国节点的 Clash 订阅
curl http://localhost:5000/clash?max=30&country=美国
```

## 配置示例

### Surge 格式输出
```ini
# TopChina Proxy Subscription
# Update: 2025-01-03 15:30:00
# Nodes: 50

TC-AU-141 = http, 144.48.37.141, 8081, afY491o7YfK00koaXQD9kUjqxmS8lQRhtvyM9X3lRadAdjAgCpJVJFvlcShV8OmVxsnp5o63PElOVpFduiCmYA==, 1
TC-DE-242 = http, 193.108.116.242, 8081, afY491o7YfK00koaXQD9kUjqxmS8lQRhtvyM9X3lRadpntpIO-x9365BTO48Mmc4xsnp5o63PElOVpFduiCmYA==, 1
```

### 在 Surge 中使用

1. 复制订阅链接：`http://your-server:5000/surge?max=50`
2. 在 Surge 中添加订阅
3. 更新订阅即可获取最新节点

## 节点命名规则

格式：`TC-{国家代码}-{IP后缀}`

支持的主要国家：
- 🇺🇸 US (美国) - 大量节点
- 🇩🇪 DE (德国) - 大量节点  
- 🇯🇵 JP (日本) - 多个节点
- 🇬🇧 UK (英国) - 多个节点
- 🇫🇷 FR (法国) - 多个节点
- 🇨🇦 CA (加拿大) - 多个节点
- 🇦🇺 AU (澳大利亚) - 多个节点
- 🇸🇬 SG (新加坡) - 少量节点
- 🇭🇰 HK (香港) - 少量节点

## 部署到服务器

### 方法1: 直接运行
```bash
# 后台运行
nohup python topchina_subscription.py > topchina.log 2>&1 &
```

### 方法2: 使用 systemd
```bash
# 创建服务文件
sudo nano /etc/systemd/system/topchina.service
```

```ini
[Unit]
Description=TopChina Proxy Subscription
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/topchina
ExecStart=/usr/bin/python3 topchina_subscription.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl enable topchina
sudo systemctl start topchina
```

### 方法3: 使用 Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .
RUN pip install requests flask

EXPOSE 5000
CMD ["python", "topchina_subscription.py"]
```

```bash
# 构建和运行
docker build -t topchina-subscription .
docker run -d -p 5000:5000 topchina-subscription
```

## 重要说明

### ⚠️ 注意事项

1. **用户名更新**: TopChina 的用户名每小时更新，订阅服务会自动获取最新用户名
2. **密码固定**: 所有代理密码都是 `1`
3. **节点质量**: 建议先测试节点连通性
4. **使用限制**: 请遵守代理服务使用条款

### 🔧 故障排除

**获取失败**:
- 检查网络连接到 GitHub
- 确认防火墙设置

**节点无法连接**:
- 用户名可能已过期（等待下次更新）
- 检查代理服务器状态

**服务无法启动**:
- 检查端口 5000 是否被占用
- 确认依赖已正确安装

## 许可证

仅供学习研究使用，请遵守相关法律法规。
