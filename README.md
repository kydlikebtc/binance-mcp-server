# Binance MCP Server

🚀 **专业级币安交易 MCP 服务器** - 为 Claude Desktop 提供完整的币安交易功能

一个基于 Binance 官方 API 的 MCP（Model Context Protocol）服务器，支持统一账户（Portfolio Margin）的现货和合约交易功能。通过用户友好的对话界面，让复杂的加密货币交易变得简单直观。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/binance-mcp-server)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 核心亮点

- 🔥 **35 个专业工具** - 涵盖账户管理、现货交易、合约交易、市场数据、高级分析
- 📝 **用户友好输出** - 中文界面，结构化显示，包含详细说明和操作建议
- 🛡️ **完善的安全机制** - 参数验证、错误处理、API 限制保护
- 🎯 **智能风险管理** - 内置风险计算、仓位管理、套利分析工具
- 🚀 **双运行模式** - 支持本地 stdio 和远程 HTTP 部署
- 🧪 **测试网支持** - 完整的测试环境，安全练习交易

## 功能特性

### 🏦 账户管理

- 查询账户余额（统一账户总览）
- 查询持仓信息（现货和合约）
- 查询保证金信息
- 查询账户状态和权限

### 💰 现货交易

- 市价单/限价单/止损单下单
- 订单撤销和批量撤销
- 查询当前委托订单
- 查询历史订单和交易记录

### 🚀 合约交易

- 开仓/平仓（做多/做空）
- 设置杠杆倍数和保证金模式
- 支持多种订单类型（市价、限价、止损、止盈）
- 查询持仓信息和交易历史
- 批量平仓功能

### 📈 市场数据

- 实时价格获取（现货/合约）
- K 线数据查询
- 订单簿深度数据
- 24 小时价格变动统计
- 交易所信息查询

## 快速开始

### 1. 安装和构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 获取 Binance API 密钥

1. 访问 [Binance API 管理页面](https://www.binance.com/cn/my/settings/api-management)
2. 创建新的 API 密钥
3. **重要：** 确保启用以下权限：
   - ✅ 现货及杠杆交易
   - ✅ 合约交易
   - ✅ 统一账户
   - ✅ 读取权限

### 3. 配置 Claude Desktop

这是 MCP 的标准配置方式，API 密钥直接在 Claude Desktop 配置文件中设置。

#### 配置文件位置：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 配置内容：

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": ["/绝对路径/到/你的/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_binance_api_key_here",
        "BINANCE_SECRET_KEY": "your_binance_secret_key_here",
        "BINANCE_TESTNET": "false",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**配置说明：**

- 将路径替换为项目的完整绝对路径
- 在 `env` 中直接填入你的 Binance API 密钥
- `BINANCE_TESTNET` 设置为 `"true"` 可使用测试网
- `LOG_LEVEL` 可设置为 `"debug"`, `"info"`, `"warn"`, `"error"`

### 4. 重启 Claude Desktop

保存配置文件后，重启 Claude Desktop 以加载 MCP 服务器。

## 📚 使用示例

### 🏦 账户管理

```
请查询我的Binance账户余额和持仓情况
```

```
显示我的现货和合约持仓详细信息
```

### 💰 现货交易

```
在BTCUSDT现货市场买入价值100 USDT的BTC
```

```
限价卖出0.01个BTC，价格设置为45000 USDT
```

```
查看我当前的现货委托订单
```

### 🚀 合约交易

```
在BTCUSDT永续合约开多仓，数量0.1BTC，使用10倍杠杆
```

```
平掉我在ETHUSDT合约的所有空头持仓
```

```
将BTCUSDT合约杠杆调整为20倍
```

### 📈 市场数据

```
获取BTCUSDT的当前价格和24小时涨跌情况
```

```
显示BTCUSDT的1小时K线数据，最近24根
```

```
查看BTCUSDT的订单簿深度，分析流动性
```

### 🎯 风险管理和高级分析

```
计算在BTCUSDT合约中，愿意承担50 USDT风险，入场价格45000，止损价格44000，使用10倍杠杆的合适仓位大小
```

```
分析我的统一账户风险状况，包括保证金使用率和持仓分布
```

```
检查BTC现货和合约市场的套利机会
```

```
获取当前市场热门交易对和整体趋势分析
```

## 可用工具 (共 35 个)

### 账户管理工具 (5 个)

| 工具名称                    | 描述                                       |
| --------------------------- | ------------------------------------------ |
| `binance_account_info`      | 获取账户基本信息，包括账户类型、交易权限等 |
| `binance_spot_balances`     | 获取现货余额，包括可用和冻结余额           |
| `binance_portfolio_account` | 获取统一账户信息，包括保证金和未实现盈亏   |
| `binance_futures_positions` | 获取合约持仓，包括入场价格、盈亏、杠杆等   |
| `binance_account_status`    | 检查 API 连接状态和时间同步                |

### 现货交易工具 (6 个)

| 工具名称                     | 描述                               |
| ---------------------------- | ---------------------------------- |
| `binance_spot_buy`           | 现货买入操作，支持市价/限价单      |
| `binance_spot_sell`          | 现货卖出操作，支持市价/限价单      |
| `binance_spot_cancel_order`  | 取消指定现货订单                   |
| `binance_spot_open_orders`   | 查询当前现货委托订单               |
| `binance_spot_order_history` | 查询现货历史订单，支持时间范围筛选 |
| `binance_spot_trade_history` | 查询现货成交记录，包含手续费信息   |

### 合约交易工具 (9 个)

| 工具名称                            | 描述                          |
| ----------------------------------- | ----------------------------- |
| `binance_futures_buy`               | 合约做多开仓，支持市价/限价单 |
| `binance_futures_sell`              | 合约做空开仓，支持市价/限价单 |
| `binance_futures_cancel_order`      | 取消指定合约订单              |
| `binance_futures_cancel_all_orders` | 批量取消指定合约的所有订单    |
| `binance_futures_open_orders`       | 查询当前合约委托订单          |
| `binance_futures_order_history`     | 查询合约历史订单              |
| `binance_futures_position_info`     | 获取详细持仓信息和盈亏状况    |
| `binance_futures_close_position`    | 市价平仓指定合约持仓          |
| `binance_futures_set_leverage`      | 修改合约杠杆倍数(1-125 倍)    |

### 市场数据工具 (9 个)

| 工具名称                      | 描述                         |
| ----------------------------- | ---------------------------- |
| `binance_get_price`           | 获取指定交易对的实时价格     |
| `binance_get_24hr_ticker`     | 获取 24 小时价格变动统计     |
| `binance_get_orderbook`       | 获取订单簿深度，分析流动性   |
| `binance_get_klines`          | 获取 K 线数据，用于技术分析  |
| `binance_get_all_prices`      | 批量获取所有交易对价格       |
| `binance_futures_prices`      | 获取合约标记价格             |
| `binance_futures_24hr_ticker` | 获取合约 24 小时价格统计     |
| `binance_server_time`         | 获取服务器时间，检查时间同步 |
| `binance_exchange_info`       | 获取交易所信息和交易规则     |

### 高级分析工具 (6 个)

| 工具名称                                | 描述                           |
| --------------------------------------- | ------------------------------ |
| `binance_calculate_position_size`       | 根据风险管理计算合适的仓位大小 |
| `binance_analyze_portfolio_risk`        | 分析账户风险状况和资产配置     |
| `binance_get_market_summary`            | 获取市场概况和热门交易对分析   |
| `binance_compare_symbols`               | 比较多个交易对的价格表现       |
| `binance_check_arbitrage_opportunities` | 检查现货合约套利机会           |
| `binance_analyze_price_action`          | 分析价格走势和技术指标         |

## 安全说明

### API 密钥安全

- 🔒 API 密钥存储在 Claude Desktop 配置文件中，仅本地可访问
- 🔑 建议定期更换 API 密钥
- 🌐 在 Binance 中限制 API 密钥的 IP 访问范围
- 📱 启用 2FA 双重认证

### 交易安全

- 💰 从小额开始，熟悉功能后再增加资金
- 🧪 先在测试网环境下练习（设置 `BINANCE_TESTNET: "true"`）
- 📊 设置合理的止损止盈
- ⚡ 避免高频交易以免触发 API 限制

## 🛠️ 部署选项

### 本地部署 (推荐)

适合个人使用，配置在 Claude Desktop 中：

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": ["/path/to/binance-mcp-server/build/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key",
        "BINANCE_TESTNET": "false"
      }
    }
  }
}
```

### 远程 HTTP 部署

适合团队使用或云端部署：

#### 使用 Docker

```bash
# 构建镜像
docker build -t binance-mcp-server .

# 运行容器
docker run -d -p 3000:3000 \
  -e BINANCE_API_KEY=your_api_key \
  -e BINANCE_SECRET_KEY=your_secret_key \
  -e BINANCE_TESTNET=false \
  --name binance-mcp \
  binance-mcp-server
```

#### 使用 Docker Compose

```bash
# 编辑docker-compose.yml中的环境变量
docker-compose up -d
```

Claude Desktop 配置（HTTP 模式）：

```json
{
  "mcpServers": {
    "binance": {
      "command": "sse",
      "args": ["http://your-server:3000/message"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

## 🔧 开发指南

### 项目架构

```
src/
├── index.ts              # MCP服务器入口，处理stdio/HTTP模式
├── api/
│   └── client.ts         # Binance API客户端封装
├── tools/                # MCP工具模块
│   ├── account.ts        # 账户管理工具 (5个)
│   ├── spot.ts          # 现货交易工具 (6个)
│   ├── futures.ts       # 合约交易工具 (9个)
│   ├── market.ts        # 市场数据工具 (9个)
│   └── advanced.ts      # 高级分析工具 (6个)
├── utils/               # 核心工具函数
│   ├── logger.ts        # 日志系统
│   ├── validation.ts    # 参数验证
│   └── formatter.ts     # 结果格式化
└── types/
    └── binance.d.ts     # TypeScript类型定义
```

### 开发环境设置

```bash
# 克隆项目
git clone <repository-url>
cd binance-mcp-server

# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码格式化
npm run format

# 生产运行
npm start
```

### 测试套件

```bash
# 运行所有测试
npm run test:all

# 单独测试模块
node test-validation.js        # 参数验证测试
node test-output-format.js     # 输出格式化测试
node scripts/validate-tools.js # 工具完整性验证
node scripts/list-actual-tools.js # 工具清单
```

## 故障排除

### 常见问题

1. **MCP 服务器未加载**

   - 检查 Claude Desktop 配置文件路径是否正确
   - 确认 JSON 语法正确
   - 重启 Claude Desktop

2. **API 连接失败**

   - 检查 API 密钥是否正确
   - 确认 API 权限设置
   - 验证网络连接

3. **交易失败**
   - 检查账户余额是否充足
   - 确认交易对格式正确
   - 验证订单参数

### 调试

在配置文件中设置 `"LOG_LEVEL": "debug"` 可以查看详细日志。

## 许可证

MIT License

## 免责声明

本工具仅供学习和研究使用。使用者应自行承担使用本工具进行交易的所有风险。开发者不对任何交易损失负责。
