/**
 * TopChina Proxy List to Surge/Clash Subscription
 * Cloudflare Workers 版本
 */

// 配置
const CONFIG = {
  SOURCE_URL: 'https://raw.githubusercontent.com/TopChina/proxy-list/main/README.md',
  CACHE_DURATION: 3600, // 1小时缓存
  MAX_NODES_DEFAULT: 100,
  MAX_NODES_LIMIT: 200
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
    
    // 跳过表头
    if (cleanIp === 'IP地址' || !cleanIp || !cleanPort.match(/^\d+$/)) {
      continue;
    }
    
    // 生成节点名称
    const nodeName = generateNodeName(cleanCountry, cleanIp);
    
    const proxy = {
      name: nodeName,
      server: cleanIp,
      port: parseInt(cleanPort),
      username: cleanUsername,
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
 * 过滤代理
 */
function filterProxies(proxies, maxNodes, countryFilter) {
  let filtered = [...proxies];
  
  // 国家过滤
  if (countryFilter) {
    filtered = filtered.filter(proxy => 
      proxy.country.toLowerCase().includes(countryFilter.toLowerCase())
    );
  }
  
  // 限制数量
  if (maxNodes && maxNodes > 0) {
    filtered = filtered.slice(0, Math.min(maxNodes, CONFIG.MAX_NODES_LIMIT));
  }
  
  return filtered;
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
    ''
  ];
  
  // 添加代理节点
  for (const proxy of proxies) {
    const line = `${proxy.name} = http, ${proxy.server}, ${proxy.port}, ${proxy.username}, ${proxy.password}`;
    lines.push(line);
  }
  
  return lines.join('\n');
}

/**
 * 生成 Clash 订阅
 */
function generateClashSubscription(proxies) {
  const clashProxies = proxies.map(proxy => ({
    name: proxy.name,
    type: 'http',
    server: proxy.server,
    port: proxy.port,
    username: proxy.username,
    password: proxy.password
  }));
  
  const config = {
    proxies: clashProxies,
    'proxy-groups': [
      {
        name: 'TopChina',
        type: 'select',
        proxies: clashProxies.slice(0, 10).map(p => p.name)
      }
    ]
  };
  
  return JSON.stringify(config, null, 2);
}

/**
 * 生成首页 HTML
 */
function generateIndexHTML(origin) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TopChina Proxy Subscription</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .url { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
        .example { background: #e8f4fd; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .country-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 10px 0; }
        .country-item { padding: 5px 10px; background: #f0f0f0; border-radius: 4px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 TopChina Proxy Subscription</h1>
        <p>自动抓取 TopChina/proxy-list 仓库的代理节点</p>
    </div>

    <div class="section">
        <h2>📱 订阅链接</h2>
        <h3>Surge 订阅</h3>
        <div class="url">${origin}/surge</div>

        <h3>Clash 订阅</h3>
        <div class="url">${origin}/clash</div>
    </div>

    <div class="section">
        <h2>⚙️ 参数说明</h2>
        <ul>
            <li><code>max</code> - 最大节点数量 (默认100，最大200)</li>
            <li><code>country</code> - 国家过滤</li>
        </ul>
        
        <div class="example">
            <h4>使用示例：</h4>
            <div class="url">${origin}/surge?max=50</div>
            <div class="url">${origin}/surge?country=德国</div>
            <div class="url">${origin}/clash?max=30&country=美国</div>
        </div>
    </div>

    <div class="section">
        <h2>🌍 支持的国家</h2>
        <div class="country-list">
            <div class="country-item">🇺🇸 美国</div>
            <div class="country-item">🇩🇪 德国</div>
            <div class="country-item">🇯🇵 日本</div>
            <div class="country-item">🇬🇧 英国</div>
            <div class="country-item">🇫🇷 法国</div>
            <div class="country-item">🇨🇦 加拿大</div>
            <div class="country-item">🇦🇺 澳大利亚</div>
            <div class="country-item">🇸🇬 新加坡</div>
            <div class="country-item">🇭🇰 香港</div>
            <div class="country-item">🇹🇼 台湾</div>
        </div>
    </div>

    <div class="section">
        <h2>ℹ️ 使用说明</h2>
        <ul>
            <li>代理用户名每小时自动更新</li>
            <li>所有代理密码均为 <code>1</code></li>
            <li>数据缓存1小时，自动更新</li>
            <li>建议先测试节点连通性</li>
        </ul>
        
        <p>数据来源: <a href="https://github.com/TopChina/proxy-list" target="_blank">TopChina/proxy-list</a></p>
    </div>
</body>
</html>`;
}

/**
 * 主处理函数
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 解析查询参数
  const maxNodes = parseInt(url.searchParams.get('max')) || CONFIG.MAX_NODES_DEFAULT;
  const countryFilter = url.searchParams.get('country');
  
  try {
    // 路由处理
    if (pathname === '/') {
      const origin = `${url.protocol}//${url.host}`;
      return new Response(generateIndexHTML(origin), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    if (pathname === '/surge' || pathname === '/clash') {
      // 尝试从缓存获取
      const cacheKey = `topchina-proxies-${Math.floor(Date.now() / (CONFIG.CACHE_DURATION * 1000))}`;
      let proxies = await TOPCHINA_CACHE.get(cacheKey, 'json');
      
      if (!proxies) {
        // 获取并解析代理列表
        const content = await fetchProxyList();
        proxies = parseProxies(content);
        
        // 存储到缓存
        await TOPCHINA_CACHE.put(cacheKey, JSON.stringify(proxies), {
          expirationTtl: CONFIG.CACHE_DURATION
        });
      }
      
      // 过滤代理
      const filteredProxies = filterProxies(proxies, maxNodes, countryFilter);
      
      if (pathname === '/surge') {
        const config = generateSurgeSubscription(filteredProxies);
        return new Response(config, {
          headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } else {
        const config = generateClashSubscription(filteredProxies);
        return new Response(config, {
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }
    
    if (pathname === '/status') {
      const status = {
        timestamp: new Date().toISOString(),
        cache_duration: CONFIG.CACHE_DURATION,
        max_nodes_limit: CONFIG.MAX_NODES_LIMIT,
        source: CONFIG.SOURCE_URL
      };
      
      return new Response(JSON.stringify(status, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    // 404
    return new Response('Not Found', { status: 404 });
    
  } catch (error) {
    console.error('处理请求失败:', error);
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Cloudflare Workers 事件监听器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
