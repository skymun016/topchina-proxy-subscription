#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TopChina Proxy List to Surge Subscription Converter
自动抓取 TopChina/proxy-list 仓库的代理节点并转换为 Surge 订阅格式
"""

import requests
import re
import base64
import json
from datetime import datetime
from typing import List, Dict, Tuple
import argparse
import sys

class TopChinaToSurge:
    def __init__(self):
        self.source_url = "https://raw.githubusercontent.com/TopChina/proxy-list/main/README.md"
        self.proxies = []
        
    def fetch_proxy_list(self) -> str:
        """获取代理列表原始数据"""
        try:
            print("正在获取代理列表...")
            response = requests.get(self.source_url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"获取代理列表失败: {e}")
            sys.exit(1)
    
    def parse_proxies(self, content: str) -> List[Dict]:
        """解析代理列表"""
        proxies = []
        
        # 提取更新时间和代理数量
        update_match = re.search(r'更新日期\*\* (\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})', content)
        count_match = re.search(r'本次发布有效代理(\d+)个', content)
        
        update_time = update_match.group(1) if update_match else "未知"
        proxy_count = count_match.group(1) if count_match else "0"
        
        print(f"更新时间: {update_time}")
        print(f"代理数量: {proxy_count}")
        
        # 解析表格中的代理信息
        # 匹配格式: | IP:端口 | 国家 | 用户名 |
        pattern = r'\|\s*([0-9.]+):(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|'
        matches = re.findall(pattern, content)
        
        for match in matches:
            ip, port, country, username = match
            
            # 清理数据
            ip = ip.strip()
            port = port.strip()
            country = country.strip()
            username = username.strip()
            
            # 跳过表头
            if ip == "IP地址" or not ip or not port.isdigit():
                continue
                
            # 生成节点名称
            node_name = self.generate_node_name(country, ip)
            
            proxy = {
                'name': node_name,
                'type': 'http',
                'server': ip,
                'port': int(port),
                'username': username,
                'password': '1',
                'country': country
            }
            
            proxies.append(proxy)
        
        print(f"成功解析 {len(proxies)} 个代理节点")
        return proxies
    
    def generate_node_name(self, country: str, ip: str) -> str:
        """生成节点名称"""
        # 国家名称映射
        country_map = {
            '美国': 'US', '英国': 'UK', '德国': 'DE', '法国': 'FR',
            '日本': 'JP', '韩国': 'KR', '新加坡': 'SG', '香港': 'HK',
            '台湾': 'TW', '中国': 'CN', '澳大利亚': 'AU', '加拿大': 'CA',
            '荷兰': 'NL', '意大利': 'IT', '西班牙': 'ES', '瑞典': 'SE',
            '挪威': 'NO', '丹麦': 'DK', '芬兰': 'FI', '瑞士': 'CH',
            '奥地利': 'AT', '比利时': 'BE', '波兰': 'PL', '捷克': 'CZ',
            '俄罗斯': 'RU', '乌克兰': 'UA', '土耳其': 'TR', '印度': 'IN',
            '泰国': 'TH', '越南': 'VN', '马来西亚': 'MY', '印度尼西亚': 'ID',
            '菲律宾': 'PH', '巴西': 'BR', '阿根廷': 'AR', '墨西哥': 'MX',
            '智利': 'CL', '哥伦比亚': 'CO', '秘鲁': 'PE', '南非': 'ZA',
            '埃及': 'EG', '以色列': 'IL', '沙特阿拉伯': 'SA', '阿拉伯联合酋长国': 'AE'
        }
        
        country_code = country_map.get(country, country[:2].upper())
        ip_suffix = ip.split('.')[-1]  # 使用IP最后一段作为标识
        
        return f"TC-{country_code}-{ip_suffix}"
    
    def generate_surge_config(self, proxies: List[Dict]) -> str:
        """生成 Surge 配置"""
        if not proxies:
            return "# 没有可用的代理节点\n"
        
        config_lines = []
        
        # 添加配置头部注释
        config_lines.append("# TopChina Proxy List - Surge Configuration")
        config_lines.append(f"# 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        config_lines.append(f"# 节点数量: {len(proxies)}")
        config_lines.append("# 来源: https://github.com/TopChina/proxy-list")
        config_lines.append("")
        
        # 生成代理节点配置
        config_lines.append("[Proxy]")
        
        for proxy in proxies:
            # Surge HTTP 代理格式
            # 节点名 = http, 服务器, 端口, 用户名, 密码
            line = f"{proxy['name']} = http, {proxy['server']}, {proxy['port']}, {proxy['username']}, {proxy['password']}"
            config_lines.append(line)
        
        config_lines.append("")
        
        # 生成代理组
        config_lines.append("[Proxy Group]")
        
        # 所有节点列表
        all_nodes = [proxy['name'] for proxy in proxies]
        
        # 主选择组
        config_lines.append(f"TopChina = select, {', '.join(all_nodes[:10])}")  # 限制前10个避免过长
        
        # 按国家分组
        country_groups = {}
        for proxy in proxies:
            country = proxy['country']
            if country not in country_groups:
                country_groups[country] = []
            country_groups[country].append(proxy['name'])
        
        # 生成国家分组（只生成节点数>=2的国家）
        for country, nodes in country_groups.items():
            if len(nodes) >= 2:
                country_code = self.generate_node_name(country, "0").split('-')[1]
                group_name = f"TopChina-{country_code}"
                config_lines.append(f"{group_name} = select, {', '.join(nodes[:5])}")  # 限制每组最多5个节点
        
        return '\n'.join(config_lines)
    
    def save_config(self, config: str, filename: str = None):
        """保存配置文件"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"topchina_surge_{timestamp}.conf"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(config)
            print(f"配置文件已保存: {filename}")
        except Exception as e:
            print(f"保存配置文件失败: {e}")
    
    def run(self, output_file: str = None, max_nodes: int = None):
        """运行转换程序"""
        print("TopChina Proxy List to Surge Converter")
        print("=" * 50)
        
        # 获取代理列表
        content = self.fetch_proxy_list()
        
        # 解析代理
        proxies = self.parse_proxies(content)
        
        if not proxies:
            print("没有找到可用的代理节点")
            return
        
        # 限制节点数量
        if max_nodes and len(proxies) > max_nodes:
            print(f"限制节点数量为 {max_nodes}")
            proxies = proxies[:max_nodes]
        
        # 生成配置
        config = self.generate_surge_config(proxies)
        
        # 保存配置
        self.save_config(config, output_file)
        
        print("\n转换完成!")
        print(f"总节点数: {len(proxies)}")
        
        # 显示部分配置预览
        print("\n配置预览:")
        print("-" * 30)
        lines = config.split('\n')
        for i, line in enumerate(lines[:15]):  # 显示前15行
            print(line)
        if len(lines) > 15:
            print("...")

def main():
    parser = argparse.ArgumentParser(description='TopChina Proxy List to Surge Converter')
    parser.add_argument('-o', '--output', help='输出文件名')
    parser.add_argument('-m', '--max-nodes', type=int, help='最大节点数量')
    parser.add_argument('--json', action='store_true', help='同时输出JSON格式')
    
    args = parser.parse_args()
    
    converter = TopChinaToSurge()
    converter.run(args.output, args.max_nodes)

if __name__ == "__main__":
    main()
