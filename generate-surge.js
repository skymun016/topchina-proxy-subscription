/**
 * 生成本地 Surge 配置文件
 * 运行: node generate-surge.js
 */

const fs = require('fs');

// 配置
const CONFIG = {
  SOURCE_URL: 'https://raw.githubusercontent.com/TopChina/proxy-list/main/README.md',
  MAX_NODES: 50
};

// 国家代码映射
const COUNTRY_MAP = {
  '美国': 'US', '英国': 'UK', '德国': 'DE', '法国': 'FR', '日本': 'JP',
  '韩国': 'KR', '新加坡': 'SG', '香港': 'HK', '台湾': 'TW', '中国': 'CN',
  '澳大利亚': 'AU', '加拿大': 'CA', '荷兰': 'NL', '意大利': 'IT',
  '西班牙': 'ES', '瑞典': 'SE', '挪威': 'NO', '丹麦': 'DK', '芬兰': 'FI',
  '瑞士': 'CH', '奥地利': 'AT', '比利时': 'BE', '波兰': 'PL', '捷克': 'CZ',
  '俄罗斯': 'RU', '乌克兰': 'UA', '土耳其': 'TR', '印度': 'IN',
  '泰国': 'TH', '越南': 'VN', '马来西亚': 'MY', '印度尼西亚': 'ID',
  '菲律宾': 'PH', '巴西': 'BR', '阿根廷': 'AR', '墨西哥': 'MX',
  '智利': 'CL', '哥伦比亚': 'CO', '秘鲁': 'PE', '南非': 'ZA',
  '埃及': 'EG', '以色列': 'IL', '沙特阿拉伯': 'SA', '阿拉伯联合酋长国': 'AE'
};

/**
 * 获取代理列表
 */
async function fetchProxyList() {
  try {
    const response = await fetch(CONFIG.SOURCE_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('获取代理列表失败:', error);
    throw error;
  }
}

/**
 * 解析代理列表
 */
function parseProxies(content) {
  const proxies = [];
  
  // 匹配表格中的代理信息
  const pattern = /\|\s*([0-9.]+):(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const [, ip, port, country, username] = match;
    
    // 清理数据
    const cleanIp = ip.trim();
    const cleanPort = port.trim();
    const cleanCountry = country.trim();
    const cleanUsername = username.trim();
    
    // 跳过表头和无效数据
    if (cleanIp === 'IP地址' || !cleanIp || !cleanPort.match(/^\d+$/) || !cleanUsername) {
      continue;
    }

    // 验证 IP 地址格式
    if (!cleanIp.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      continue;
    }
    
    // 生成节点名称
    const nodeName = generateNodeName(cleanCountry, cleanIp);

    // 对用户名进行 URL 编码以处理特殊字符
    const encodedUsername = encodeURIComponent(cleanUsername);

    const proxy = {
      name: nodeName,
      server: cleanIp,
      port: parseInt(cleanPort),
      username: encodedUsername,
      password: '1',
      country: cleanCountry
    };
    
    proxies.push(proxy);
  }
  
  return proxies;
}

/**
 * 生成节点名称
 */
function generateNodeName(country, ip) {
  const countryCode = COUNTRY_MAP[country] || country.substring(0, 2).toUpperCase();
  const ipSuffix = ip.split('.').pop();
  return `TC-${countryCode}-${ipSuffix}`;
}

/**
 * 生成 Surge 订阅
 */
function generateSurgeSubscription(proxies) {
  const lines = [
    '# TopChina Proxy Subscription',
    `# Update: ${new Date().toISOString()}`,
    `# Nodes: ${proxies.length}`,
    '# Source: https://github.com/TopChina/proxy-list',
    '',
    '[General]',
    'loglevel = notify',
    'internet-test-url = http://www.gstatic.com/generate_204',
    'proxy-test-url = http://www.gstatic.com/generate_204',
    'test-timeout = 5',
    'ipv6 = false',
    'dns-server = 223.5.5.5, 114.114.114.114, 8.8.8.8, 1.1.1.1',
    'skip-proxy = localhost, *.local, 127.0.0.0/8, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12',
    'bypass-system = true',
    '',
    '[Proxy]'
  ];
  
  // 添加代理节点
  for (const proxy of proxies) {
    const line = `${proxy.name} = http, ${proxy.server}, ${proxy.port}, ${proxy.username}, ${proxy.password}`;
    lines.push(line);
  }
  
  // 添加直连
  lines.push('DIRECT = direct');
  
  // 添加代理组
  lines.push('');
  lines.push('[Proxy Group]');
  const proxyNames = proxies.slice(0, 10).map(p => p.name);
  lines.push(`TopChina = select, ${proxyNames.join(', ')}, DIRECT`);
  lines.push(`Auto = url-test, ${proxyNames.join(', ')}, url=http://www.gstatic.com/generate_204, interval=300`);
  
  // 添加规则
  lines.push('');
  lines.push('[Rule]');
  lines.push('# International websites');
  lines.push('DOMAIN-SUFFIX,google.com,TopChina');
  lines.push('DOMAIN-SUFFIX,youtube.com,TopChina');
  lines.push('DOMAIN-SUFFIX,github.com,TopChina');
  lines.push('DOMAIN-SUFFIX,twitter.com,TopChina');
  lines.push('DOMAIN-SUFFIX,facebook.com,TopChina');
  lines.push('# Chinese websites direct');
  lines.push('DOMAIN-SUFFIX,baidu.com,DIRECT');
  lines.push('DOMAIN-SUFFIX,qq.com,DIRECT');
  lines.push('DOMAIN-SUFFIX,taobao.com,DIRECT');
  lines.push('GEOIP,CN,DIRECT');
  lines.push('FINAL,TopChina');
  
  return lines.join('\n');
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始获取代理列表...');
    
    // 获取并解析代理列表
    const content = await fetchProxyList();
    const proxies = parseProxies(content);
    
    console.log(`📊 找到 ${proxies.length} 个代理节点`);
    
    // 限制节点数量
    const filteredProxies = proxies.slice(0, CONFIG.MAX_NODES);
    console.log(`✂️ 使用前 ${filteredProxies.length} 个节点`);
    
    // 生成配置
    const config = generateSurgeSubscription(filteredProxies);
    
    // 写入文件
    fs.writeFileSync('surge.conf', config, 'utf8');
    
    console.log('✅ surge.conf 文件已生成！');
    console.log('📁 文件位置:', process.cwd() + '/surge.conf');
    console.log('📝 使用方法: 在 Surge 中导入此配置文件');
    
    // 显示前几个节点
    console.log('\n🔗 前5个节点预览:');
    filteredProxies.slice(0, 5).forEach(proxy => {
      console.log(`  ${proxy.name} = http, ${proxy.server}, ${proxy.port}, ${proxy.username}, ${proxy.password}`);
    });
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
