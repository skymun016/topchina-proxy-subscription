#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TopChina Proxy List Subscription Generator
生成 TopChina 代理列表的订阅服务
"""

import requests
import re
import base64
import json
from datetime import datetime
from flask import Flask, Response, request
import threading
import time
import os

app = Flask(__name__)

class TopChinaSubscription:
    def __init__(self):
        self.source_url = "https://raw.githubusercontent.com/TopChina/proxy-list/main/README.md"
        self.cache_file = "topchina_cache.json"
        self.cache_duration = 3600  # 1小时缓存
        self.proxies = []
        self.last_update = 0
        
    def fetch_and_parse(self):
        """获取并解析代理列表"""
        try:
            print(f"[{datetime.now()}] 正在更新代理列表...")
            response = requests.get(self.source_url, timeout=30)
            response.raise_for_status()
            content = response.text
            
            # 解析代理
            proxies = []
            pattern = r'\|\s*([0-9.]+):(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|'
            matches = re.findall(pattern, content)
            
            for match in matches:
                ip, port, country, username = match
                ip, port, country, username = ip.strip(), port.strip(), country.strip(), username.strip()
                
                if ip == "IP地址" or not ip or not port.isdigit():
                    continue
                
                node_name = self.generate_node_name(country, ip)
                proxy = {
                    'name': node_name,
                    'server': ip,
                    'port': int(port),
                    'username': username,
                    'country': country
                }
                proxies.append(proxy)
            
            self.proxies = proxies
            self.last_update = time.time()
            
            # 保存缓存
            cache_data = {
                'proxies': proxies,
                'last_update': self.last_update,
                'update_time': datetime.now().isoformat()
            }
            
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            
            print(f"[{datetime.now()}] 更新完成，共 {len(proxies)} 个节点")
            
        except Exception as e:
            print(f"[{datetime.now()}] 更新失败: {e}")
            self.load_cache()
    
    def load_cache(self):
        """加载缓存"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                    self.proxies = cache_data.get('proxies', [])
                    self.last_update = cache_data.get('last_update', 0)
                    print(f"[{datetime.now()}] 加载缓存，共 {len(self.proxies)} 个节点")
        except Exception as e:
            print(f"[{datetime.now()}] 加载缓存失败: {e}")
            self.proxies = []
    
    def should_update(self):
        """检查是否需要更新"""
        return time.time() - self.last_update > self.cache_duration
    
    def generate_node_name(self, country: str, ip: str) -> str:
        """生成节点名称"""
        country_map = {
            '美国': 'US', '英国': 'UK', '德国': 'DE', '法国': 'FR', '日本': 'JP',
            '韩国': 'KR', '新加坡': 'SG', '香港': 'HK', '台湾': 'TW', '中国': 'CN',
            '澳大利亚': 'AU', '加拿大': 'CA', '荷兰': 'NL', '意大利': 'IT',
            '西班牙': 'ES', '瑞典': 'SE', '挪威': 'NO', '丹麦': 'DK', '芬兰': 'FI',
            '瑞士': 'CH', '奥地利': 'AT', '比利时': 'BE', '波兰': 'PL', '捷克': 'CZ',
            '俄罗斯': 'RU', '乌克兰': 'UA', '土耳其': 'TR', '印度': 'IN',
            '泰国': 'TH', '越南': 'VN', '马来西亚': 'MY', '印度尼西亚': 'ID',
            '菲律宾': 'PH', '巴西': 'BR', '阿根廷': 'AR', '墨西哥': 'MX'
        }
        
        country_code = country_map.get(country, country[:2].upper())
        ip_suffix = ip.split('.')[-1]
        return f"TC-{country_code}-{ip_suffix}"
    
    def get_proxies(self, max_nodes=None, country_filter=None):
        """获取代理列表"""
        if self.should_update():
            self.fetch_and_parse()
        elif not self.proxies:
            self.load_cache()
            if not self.proxies:
                self.fetch_and_parse()
        
        proxies = self.proxies.copy()
        
        # 国家过滤
        if country_filter:
            proxies = [p for p in proxies if country_filter.lower() in p['country'].lower()]
        
        # 限制数量
        if max_nodes:
            proxies = proxies[:max_nodes]
        
        return proxies
    
    def generate_surge_subscription(self, proxies):
        """生成 Surge 订阅"""
        lines = []
        
        # 添加注释
        lines.append(f"# TopChina Proxy Subscription")
        lines.append(f"# Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f"# Nodes: {len(proxies)}")
        lines.append("")
        
        # 代理节点
        for proxy in proxies:
            line = f"{proxy['name']} = http, {proxy['server']}, {proxy['port']}, {proxy['username']}, 1"
            lines.append(line)
        
        return '\n'.join(lines)
    
    def generate_clash_subscription(self, proxies):
        """生成 Clash 订阅"""
        clash_proxies = []
        
        for proxy in proxies:
            clash_proxy = {
                'name': proxy['name'],
                'type': 'http',
                'server': proxy['server'],
                'port': proxy['port'],
                'username': proxy['username'],
                'password': '1'
            }
            clash_proxies.append(clash_proxy)
        
        config = {
            'proxies': clash_proxies,
            'proxy-groups': [
                {
                    'name': 'TopChina',
                    'type': 'select',
                    'proxies': [p['name'] for p in clash_proxies[:10]]
                }
            ]
        }
        
        return config

# 创建全局实例
subscription_service = TopChinaSubscription()

@app.route('/')
def index():
    """首页"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>TopChina Proxy Subscription</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>TopChina Proxy Subscription Service</h1>
        <h2>订阅链接:</h2>
        <ul>
            <li><a href="/surge">Surge 订阅</a> - <code>/surge</code></li>
            <li><a href="/clash">Clash 订阅</a> - <code>/clash</code></li>
        </ul>
        
        <h2>参数说明:</h2>
        <ul>
            <li><code>max</code> - 最大节点数量，如: <code>/surge?max=50</code></li>
            <li><code>country</code> - 国家过滤，如: <code>/surge?country=美国</code></li>
        </ul>
        
        <h2>示例:</h2>
        <ul>
            <li><a href="/surge?max=20">/surge?max=20</a> - 限制20个节点</li>
            <li><a href="/surge?country=德国">/surge?country=德国</a> - 只要德国节点</li>
            <li><a href="/clash?max=30&country=美国">/clash?max=30&country=美国</a> - 30个美国节点</li>
        </ul>
        
        <p>数据来源: <a href="https://github.com/TopChina/proxy-list">TopChina/proxy-list</a></p>
    </body>
    </html>
    """
    return html

@app.route('/surge')
def surge_subscription():
    """Surge 订阅"""
    max_nodes = request.args.get('max', type=int)
    country_filter = request.args.get('country')
    
    proxies = subscription_service.get_proxies(max_nodes, country_filter)
    config = subscription_service.generate_surge_subscription(proxies)
    
    return Response(config, mimetype='text/plain; charset=utf-8')

@app.route('/clash')
def clash_subscription():
    """Clash 订阅"""
    max_nodes = request.args.get('max', type=int)
    country_filter = request.args.get('country')
    
    proxies = subscription_service.get_proxies(max_nodes, country_filter)
    config = subscription_service.generate_clash_subscription(proxies)
    
    return Response(
        json.dumps(config, ensure_ascii=False, indent=2),
        mimetype='application/json; charset=utf-8'
    )

@app.route('/status')
def status():
    """状态信息"""
    status_info = {
        'total_proxies': len(subscription_service.proxies),
        'last_update': datetime.fromtimestamp(subscription_service.last_update).isoformat() if subscription_service.last_update else None,
        'cache_valid': not subscription_service.should_update(),
        'next_update': datetime.fromtimestamp(subscription_service.last_update + subscription_service.cache_duration).isoformat() if subscription_service.last_update else None
    }
    
    return Response(
        json.dumps(status_info, ensure_ascii=False, indent=2),
        mimetype='application/json; charset=utf-8'
    )

def auto_update():
    """自动更新线程"""
    while True:
        try:
            if subscription_service.should_update():
                subscription_service.fetch_and_parse()
            time.sleep(300)  # 每5分钟检查一次
        except Exception as e:
            print(f"[{datetime.now()}] 自动更新错误: {e}")
            time.sleep(300)

if __name__ == '__main__':
    # 启动自动更新线程
    update_thread = threading.Thread(target=auto_update, daemon=True)
    update_thread.start()
    
    # 初始加载
    subscription_service.load_cache()
    if not subscription_service.proxies:
        subscription_service.fetch_and_parse()
    
    print("TopChina Proxy Subscription Service")
    print("访问 http://localhost:5000 查看订阅链接")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
