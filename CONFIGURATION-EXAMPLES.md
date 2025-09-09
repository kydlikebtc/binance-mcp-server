# Binance MCP Server 配置示例和最佳实践

## 📚 配置示例集合

### 1. 新手入门配置

**适用场景**: 第一次使用，需要安全的测试环境

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_testnet_api_key",
        "BINANCE_SECRET_KEY": "your_testnet_secret_key",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**特点**:

- ✅ 使用测试网，100%安全
- ✅ 适中的日志级别
- ✅ 简单配置，易于上手

### 2. 生产环境配置

**适用场景**: 熟悉功能后的正式交易

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_mainnet_api_key",
        "BINANCE_SECRET_KEY": "your_mainnet_secret_key",
        "BINANCE_TESTNET": "false",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

**特点**:

- ⚠️ 真实交易环境
- 📊 较少的日志输出
- 🔒 需要严格的安全配置

### 3. 开发调试配置

**适用场景**: 开发者调试或详细排错

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_testnet_api_key",
        "BINANCE_SECRET_KEY": "your_testnet_secret_key",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      }
    }
  }
}
```

**特点**:

- 🔍 详细调试信息
- 🛠️ 开发环境优化
- 📝 完整错误追踪

### 4. 高级用户配置

**适用场景**: 专业交易员，需要完整功能

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_mainnet_api_key",
        "BINANCE_SECRET_KEY": "your_mainnet_secret_key",
        "BINANCE_TESTNET": "false",
        "LOG_LEVEL": "info",
        "SERVER_MODE": "stdio"
      }
    }
  }
}
```

**特点**:

- 🚀 生产环境，完整功能
- ⚡ 优化的性能设置
- 📊 平衡的日志记录

### 5. 远程 HTTP 部署配置

**适用场景**: 云服务器部署，多人共享

#### 服务器端配置 (docker-compose.yml)

```yaml
version: '3.8'
services:
  binance-mcp-server:
    build: .
    ports:
      - '3000:3000'
    environment:
      - SERVER_MODE=http
      - PORT=3000
      - HOST=0.0.0.0
      - LOG_LEVEL=info
      # API密钥通过环境变量或secrets管理
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/message']
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 客户端配置 (Claude Desktop)

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "sse",
      "args": ["https://your-server.com:3000/message"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key",
        "BINANCE_TESTNET": "false"
      }
    }
  }
}
```

## 🎯 平台特定配置

### macOS 配置

**配置文件路径**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/Projects/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**验证配置**:

```bash
# 检查配置文件语法
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool

# 检查路径是否存在
ls -la "/Users/yourname/Projects/binance-mcp-server/build/index.js"
```

### Windows 配置

**配置文件路径**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\binance-mcp-server\\build\\index.js"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**验证配置**:

```cmd
# 检查配置文件语法 (需要安装Python)
python -m json.tool %APPDATA%\Claude\claude_desktop_config.json

# 检查路径是否存在
dir "C:\Users\YourName\binance-mcp-server\build\index.js"
```

### Linux 配置

**配置文件路径**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/home/yourname/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 🔐 安全配置最佳实践

### 1. API 密钥安全等级分类

#### 🟢 测试级 (最安全)

```json
{
  "env": {
    "BINANCE_TESTNET": "true",
    "BINANCE_API_KEY": "testnet_key_...",
    "BINANCE_SECRET_KEY": "testnet_secret_..."
  }
}
```

**适用**: 学习、测试、开发

#### 🟡 交易级 (中等安全)

```json
{
  "env": {
    "BINANCE_TESTNET": "false",
    "BINANCE_API_KEY": "mainnet_key_...",
    "BINANCE_SECRET_KEY": "mainnet_secret_..."
  }
}
```

**权限要求**:

- ✅ 现货交易
- ✅ 合约交易
- ✅ 读取权限
- ❌ 提现权限 (禁用)

#### 🔴 高风险级 (不推荐)

```json
{
  "env": {
    "BINANCE_TESTNET": "false",
    "BINANCE_API_KEY": "full_permission_key_...",
    "BINANCE_SECRET_KEY": "full_permission_secret_..."
  }
}
```

**包含**: 提现权限 - **强烈不推荐**

### 2. 网络安全配置

#### IP 白名单设置 (推荐)

```
Binance API管理 → 编辑API → IP访问限制
添加固定IP: 123.456.789.123
```

#### 动态 IP 处理

```bash
# 获取当前IP的脚本
curl -4 ifconfig.me

# 更新白名单 (手动操作)
# 每次IP变化后需要更新Binance设置
```

### 3. 权限最小化原则

**推荐权限配置**:

```
✅ 现货及杠杆交易 - 必需
✅ 合约交易 - 必需
✅ 统一账户 - 必需
✅ 读取权限 - 必需
❌ 提现权限 - 禁用
❌ 内部转账 - 禁用
❌ 子账户 - 非必需时禁用
```

## ⚙️ 性能优化配置

### 1. 高频交易配置

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["--max-old-space-size=2048", "/path/to/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "warn",
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

### 2. 内存优化配置

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["--max-old-space-size=1024", "--gc-interval=100", "/path/to/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

## 🚨 故障排除配置

### 1. 调试配置模板

```json
{
  "mcpServers": {
    "binance-mcp-server": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_testnet_key",
        "BINANCE_SECRET_KEY": "your_testnet_secret",
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 2. 常见问题诊断

#### 问题：路径错误

```bash
# 检查文件是否存在
ls -la "/path/to/binance-mcp-server/build/index.js"

# 检查权限
stat "/path/to/binance-mcp-server/build/index.js"
```

#### 问题：Node.js 版本

```bash
# 检查Node.js版本 (需要 >= 18)
node --version

# 检查npm版本
npm --version
```

#### 问题：依赖缺失

```bash
# 重新安装依赖
cd /path/to/binance-mcp-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🔧 高级配置技巧

### 1. 环境变量文件

创建 `.env` 文件（仅开发环境）:

```bash
# .env
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_TESTNET=true
LOG_LEVEL=debug
```

**注意**: ⚠️ 生产环境不要使用.env 文件，直接在 Claude Desktop 配置中设置

### 2. 多环境配置管理

#### development.json

```json
{
  "mcpServers": {
    "binance-dev": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "BINANCE_TESTNET": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

#### production.json

```json
{
  "mcpServers": {
    "binance-prod": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "BINANCE_TESTNET": "false",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

### 3. 配置验证脚本

```bash
#!/bin/bash
# validate-config.sh

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "🔍 验证Claude Desktop配置..."

# 检查文件存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 检查JSON语法
if ! python -m json.tool "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "❌ JSON语法错误"
    exit 1
fi

# 检查必要字段
if ! grep -q "binance-mcp-server" "$CONFIG_FILE"; then
    echo "❌ 缺少binance-mcp-server配置"
    exit 1
fi

# 检查可执行文件
BUILD_PATH=$(python -c "
import json
with open('$CONFIG_FILE') as f:
    config = json.load(f)
    args = config['mcpServers']['binance-mcp-server']['args']
    print(args[0] if args else '')
")

if [ ! -f "$BUILD_PATH" ]; then
    echo "❌ 构建文件不存在: $BUILD_PATH"
    echo "💡 请运行: npm run build"
    exit 1
fi

echo "✅ 配置验证通过"
```

## 📊 监控和日志配置

### 1. 日志级别说明

```json
{
  "LOG_LEVEL": "debug"    // 详细调试 (开发)
  "LOG_LEVEL": "info"     // 一般信息 (默认)
  "LOG_LEVEL": "warn"     // 警告信息 (生产推荐)
  "LOG_LEVEL": "error"    // 仅错误 (最小化)
}
```

### 2. 日志查看方法

#### macOS

```bash
# Console应用查看
open /Applications/Utilities/Console.app

# 或者命令行查看
log stream --predicate 'process == "Claude"' --level debug
```

#### Windows

```
事件查看器 → Windows日志 → 应用程序
筛选: 来源 = Claude Desktop
```

#### Linux

```bash
# 查看系统日志
journalctl -u claude-desktop
```

---

## 📞 获取配置支持

- **配置模板**: 参考上述示例直接复制修改
- **路径问题**: 使用绝对路径，避免~或环境变量
- **权限问题**: 确保 API 密钥权限正确配置
- **网络问题**: 检查防火墙和代理设置

**重要提醒**:

- 🔒 永远不要在公开场合分享真实的 API 密钥
- 🧪 新功能先在测试网验证
- 📱 启用 2FA 提高账户安全性
- 🔄 定期更换 API 密钥
