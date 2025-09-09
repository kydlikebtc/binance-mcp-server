import { SpotAPI } from '../api/spot.js';
import { FuturesAPI } from '../api/futures.js';
import { logger } from '../utils/logger.js';
export function createMarketTools(binanceClient) {
    return [
        {
            name: 'binance_spot_price',
            description: `【现货价格查询】获取现货市场的实时价格信息

📋 **功能说明**
- 查询单个或多个现货交易对的实时价格
- 提供精确的市场价格信息和价格变动
- 支持单个查询或批量查询
- 实时数据，无延迟

⚠️ **重要提醒**
- 价格数据实时更新，可能存在毫秒级波动
- 批量查询时限制返回前100个活跃交易对
- 价格仅供参考，交易时以实际成交价为准

🎯 **适用场景**
- 查看市场当前价格走势
- 交易决策前的价格参考
- 投资组合估值计算
- 市场监控和预警

📊 **输出示例**
查询成功后将返回：
\`\`\`
💰 现货价格查询结果

📈 实时价格
交易对：BTCUSDT (BTC/USDT 现货)
当前价格：45,250.50 USDT
更新时间：2022-01-01 10:30:15

📉 价格变动
24小时消息：暂无数据
价格精度：2 小数位
最小价格变动：0.01 USDT

✨ 数据状态
数据来源：Binance 官方 API
数据延迟：< 100ms
更新频率：实时推送

💡 交易提示
当前价格适合作为市价单参考。
限价单建议在此价格上下设置合理的价格区间。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '指定交易对，如"BTCUSDT"、"ETHUSDT"等。不填则返回所有现货交易对的价格（为性能考虑，限制返回前100个活跃交易对）。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD', 'ADAUSDT'],
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_futures_price',
            description: `【合约价格查询】获取合约市场的实时标记价格信息

📋 **功能说明**
- 查询永续合约的实时标记价格
- 标记价格是合约结算和强平的基准价格
- 通常比现货价格更稳定，受操纵风险较小
- 用于合约估值和风险计算

⚠️ **重要提醒**
- 标记价格与最新成交价可能存在小幅差异
- 强制平仓会按照标记价格计算
- 批量查询时限制返回前100个活跃合约

🎯 **适用场景**
- 合约交易的价格参考
- 风险管理和估值计算
- 强平价格监控和预警
- 套利机会分析

📊 **输出示例**
查询成功后将返回：
\`\`\`
🚀 合约价格查询结果

📈 标记价格
合约类型：BTCUSDT 永续合约
标记价格：45,280.75 USDT
更新时间：2022-01-01 10:30:20

📉 价格对比
与现货价差：+30.25 USDT (+0.067%)
价格状态：合约温和溜价
资金费率：+0.01% (正数收空头)

💪 市场状态
市场流动性：良好
价格稳定性：高
操纵风险：低

💡 交易提示
标记价格相对稳定，适合作为合约交易参考。
当前正数资金费率意味着多头持仓需要支付费用。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '指定合约，如"BTCUSDT"、"ETHUSDT"等USDT永续合约。不填则返回所有合约的价格（为性能考虑，限制返回前100个活跃合约）。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT'],
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_spot_orderbook',
            description: `【现货订单簿】获取现货市场的买卖盘深度信息

📋 **功能说明**
- 查询指定交易对的实时订单簿深度
- 显示买盘和卖盘的价格与数量分布
- 分析市场流动性和支撑阻力位
- 用于精确的交易时机判断

⚠️ **重要提醒**
- 订单簿数据实时变化，瞬息万变
- 大单可能不在订单簿中显示（冰山订单）
- 数据仅供参考，实际成交以市场为准

🎯 **适用场景**
- 分析市场流动性和深度
- 寻找支撑位和阻力位
- 优化限价单下单价格
- 评估大额交易的市场冲击

📊 **输出示例**
查询成功后将返回：
\`\`\`
📊 现货订单簿查询结果

📈 市场概况
交易对：BTCUSDT (BTC/USDT现货)
更新时间：2022-01-01 10:30:25
深度级别：10档 买卖盘

🔴 卖盘深度 (压力位)
卖5   45,350.50  →  0.125 BTC  (5,668.81 USDT)
卖4   45,325.25  →  0.250 BTC  (11,331.31 USDT)  
卖3   45,300.00  →  0.500 BTC  (22,650.00 USDT)
卖2   45,275.75  →  0.875 BTC  (39,616.28 USDT)
卖1   45,251.50  →  1.250 BTC  (56,564.38 USDT)

───── 中间价: 45,250.00 USDT ─────

🟢 买盘深度 (支撑位)
买1   45,248.50  →  1.125 BTC  (50,904.56 USDT)
买2   45,225.25  →  0.750 BTC  (33,918.94 USDT)
买3   45,200.00  →  0.625 BTC  (28,250.00 USDT)
买4   45,175.75  →  0.375 BTC  (16,940.91 USDT)
买5   45,150.50  →  0.200 BTC  (9,030.10 USDT)

📊 流动性分析
买盘总量：3.075 BTC (139,044.51 USDT)
卖盘总量：2.000 BTC (90,830.78 USDT)
买卖比例：60.6% : 39.4%
市场偏向：买盘较强，支撑充足

💡 交易建议
当前买盘深度较好，适合适量卖出。
45,200-45,250区间有较强支撑。
如需大额交易建议分批进行，避免冲击市场。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '必填。要查询的现货交易对，如"BTCUSDT"。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
                    },
                    limit: {
                        type: 'number',
                        description: '返回的买盘和卖盘档位数量。可选值：5, 10, 20, 50, 100, 500, 1000, 5000。默认100。数值越大响应越慢但信息越完整。',
                        enum: [5, 10, 20, 50, 100, 500, 1000, 5000],
                    },
                },
                required: ['symbol'],
            },
        },
        {
            name: 'binance_spot_klines',
            description: `📊 K线数据查询 - 现货市场技术分析利器

🔍 功能说明：
获取现货市场的K线（蜡烛图）历史数据，包含开盘价、最高价、最低价、收盘价和成交量等完整技术指标。每根K线代表特定时间段内的价格走势，是技术分析的基础数据。

⚠️ 重要提醒：
• 时间间隔支持：1分钟到1个月，建议短期分析用1m/5m，长期分析用1d/1w
• 数据限制：单次最多返回1500根K线，如需更多数据请分批获取
• 时间格式：使用毫秒级时间戳，建议使用最近30天内的数据以确保准确性
• 交易时间：现货市场24小时交易，但在系统维护时段可能数据延迟

🎯 适用场景：
• 技术分析师绘制价格图表，识别支撑位和阻力位
• 量化策略师获取历史数据进行回测和策略验证
• 交易员查看不同时间周期的价格走势制定交易计划
• 风险管理人员分析价格波动性和历史极值

📈 输出示例：
查询成功后将返回：
\`\`\`
📊 BTCUSDT K线数据（1小时线）

⏰ 数据时间范围：2024-01-15 10:00 ~ 2024-01-15 14:00
📈 共返回：5根K线
📉 时间间隔：1小时 (1h)

💰 最新K线详情：
开盘价：42,850 USDT
最高价：43,120 USDT (+0.63%)
最低价：42,720 USDT (-0.30%)
收盘价：43,050 USDT
涨跌幅：+200 USDT (+0.47%)

📊 成交数据：
成交量：156.8 BTC
成交额：673.2万 USDT
成交笔数：2,847笔
主动买入量：89.2 BTC (占比 56.9%)

⚡ 技术提示：
• 收盘价高于开盘价：阳线（上涨）
• 上影线较短：上方阻力不强
• 成交量适中：市场参与度正常
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '必填。要查询的现货交易对，如"BTCUSDT"。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
                    },
                    interval: {
                        type: 'string',
                        enum: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                        description: 'K线时间间隔：1m=1分钟, 5m=5分钟, 15m=15分钟, 1h=1小时, 4h=4小时, 1d=1天, 1w=1周, 1M=1月。短间隔适合短线分析，长间隔适合趋势分析。',
                    },
                    limit: {
                        type: 'number',
                        description: '返回K线数量。默认500，最大1000。建议根据分析需要选择合适数量：短线分析用100-300，长线分析用500-1000。',
                        minimum: 1,
                        maximum: 1000,
                    },
                    startTime: {
                        type: 'number',
                        description: '查询开始时间，13位时间戳（毫秒）。与endTime配合使用可查询特定时间段的数据。',
                        minimum: 1000000000000,
                    },
                    endTime: {
                        type: 'number',
                        description: '查询结束时间，13位时间戳（毫秒）。必须大于startTime。不填则默认到当前时间。',
                        minimum: 1000000000000,
                    },
                },
                required: ['symbol', 'interval'],
            },
        },
        {
            name: 'binance_futures_klines',
            description: `📊 合约K线数据查询 - 永续合约技术分析专用

🔍 功能说明：
获取合约市场的K线（蜡烛图）历史数据，基于标记价格生成。相比现货K线，合约K线反映永续合约的真实价格走势，去除异常波动，更适合合约交易分析和风险评估。

⚠️ 重要提醒：
• 价格基准：基于标记价格，比最新成交价更稳定，减少操纵风险
• 杠杆影响：合约价格波动会被杠杆放大，需要严格风控
• 资金费率：每8小时收取资金费率，影响持仓成本
• 强平风险：价格变动可能触发强制平仓，需要监控保证金比例

🎯 适用场景：
• 合约交易员制定开平仓策略和设置止盈止损
• 套利交易者分析现货-合约价差趋势
• 风险管理员监控价格波动和强平风险
• 量化策略师进行合约策略回测和优化

📈 输出示例：
查询成功后将返回：
\`\`\`
🚀 BTCUSDT合约K线数据（4小时线）

⏰ 数据时间范围：2024-01-15 08:00 ~ 2024-01-16 00:00
📈 共返回：4根K线
📉 时间间隔：4小时 (4h)

💰 最新K线详情（标记价格）：
开盘价：42,890 USDT
最高价：43,255 USDT (+0.85%)
最低价：42,750 USDT (-0.33%)
收盘价：43,180 USDT
涨跌幅：+290 USDT (+0.68%)

📊 成交数据：
成交量：2,847.5 BTC
成交额：12,234.7万 USDT
成交笔数：18,456笔
主动买入量：1,623.1 BTC (占比 57.0%)

⚡ 合约特征：
• 标记价格：相比现货略微溢价
• 价格稳定：无异常跳价或操纵
• 成交活跃：流动性充足
• 趋势状态：小幅上涨，多头占优

💡 交易提示：
当前合约呈现温和上涨趋势，适合顺势操作。
建议设置止损在42,700附近，止盈可考虑43,500。
注意关注资金费率变化，当前多头占优需支付费用。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '必填。要查询的合约，如"BTCUSDT"永续合约。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
                    },
                    interval: {
                        type: 'string',
                        enum: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                        description: 'K线时间间隔：1m=1分钟, 5m=5分钟, 15m=15分钟, 1h=1小时, 4h=4小时, 1d=1天。建议：高频交易用1m-15m，波段交易用1h-4h，趋势交易用1d-1w。',
                    },
                    limit: {
                        type: 'number',
                        description: '返回K线数量。默认500，最大1000。合约交易建议：日内交易用100-200，波段交易用300-500，趋势分析用500-1000。',
                        minimum: 1,
                        maximum: 1000,
                    },
                    startTime: {
                        type: 'number',
                        description: '查询开始时间，13位时间戳（毫秒）。用于查询历史特定时间段的合约价格走势。',
                        minimum: 1000000000000,
                    },
                    endTime: {
                        type: 'number',
                        description: '查询结束时间，13位时间戳（毫秒）。不填则默认到当前时间。时间范围不要过大以免超时。',
                        minimum: 1000000000000,
                    },
                },
                required: ['symbol', 'interval'],
            },
        },
        {
            name: 'binance_spot_24hr_ticker',
            description: `📈 24小时行情统计 - 现货市场全面监控

🔍 功能说明：
获取现货市场24小时内的价格变动统计，包括涨跌幅、成交量、最高最低价、加权平均价等关键指标。提供完整的市场表现概览，是判断市场热度和趋势的重要参考。

⚠️ 重要提醒：
• 统计周期：过去24小时的滚动统计，每秒更新
• 数据完整性：包含价格、成交量、交易次数等全维度数据
• 市场活跃度：通过成交量和交易次数判断流动性状况
• 价格区间：24小时最高最低价显示当日波动范围

🎯 适用场景：
• 投资者快速了解市场整体表现和热门币种
• 交易员识别异常波动和交易机会
• 分析师进行市场情绪和资金流向分析
• 风控人员监控价格异常和市场风险

📊 输出示例：
查询成功后将返回：
\`\`\`
📊 BTCUSDT 24小时行情统计

⏰ 统计时间：最近24小时滚动数据
📈 统计截止：2024-01-15 15:30:25

💰 价格表现：
当前价格：43,250.50 USDT
24h涨跌：+1,125.50 USDT (+2.67%)
开盘价格：42,125.00 USDT
最高价格：43,580.00 USDT (+3.45%)
最低价格：41,890.00 USDT (-0.56%)
加权均价：42,845.75 USDT

📊 成交情况：
成交量：12,847.25 BTC
成交额：5.506亿 USDT
交易笔数：892,456笔
平均每笔：0.0144 BTC

📈 买卖盘：
最佳买价：43,248.50 USDT
最佳卖价：43,252.50 USDT
买卖价差：4.00 USDT (0.009%)

⚡ 市场分析：
• 涨跌状态：上涨 +2.67%（表现优秀）
• 波动幅度：4.02%（波动适中）
• 交易活跃：成交频繁，流动性充足
• 价差状态：买卖价差较小，交易成本低

💡 交易参考：
当前市场情绪偏向乐观，价格持续上涨。
买卖盘深度良好，适合进行交易操作。
建议关注43,580附近的阻力位表现。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '指定交易对，如"BTCUSDT"。不填则返回所有现货交易对的24小时统计（为性能考虑，限制返回前50个活跃交易对）。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_futures_24hr_ticker',
            description: `🚀 合约24小时行情统计 - 永续合约市场全面监控

🔍 功能说明：
获取合约市场24小时内的价格变动统计，包括涨跌幅、成交量、资金费率、未平仓合约等合约特有指标。提供比现货更丰富的市场数据，是合约交易决策的重要依据。

⚠️ 重要提醒：
• 价格类型：标记价格统计，避免异常波动影响
• 资金费率：影响持仓成本，正数空头收取，负数多头收取
• 未平仓量：反映市场参与度和持仓情况
• 杠杆效应：价格波动对合约的影响会被杠杆放大

🎯 适用场景：
• 合约交易员分析市场热度和交易机会
• 套利交易者监控现货-合约价差变化
• 风险管理员评估市场波动和系统性风险
• 资金管理者分析资金费率趋势制定持仓策略

📊 输出示例：
查询成功后将返回：
\`\`\`
🚀 BTCUSDT合约 24小时行情统计

⏰ 统计时间：最近24小时滚动数据
📈 统计截止：2024-01-15 15:30:25

💰 价格表现（标记价格）：
当前价格：43,285.75 USDT
24h涨跌：+1,158.25 USDT (+2.75%)
开盘价格：42,127.50 USDT
最高价格：43,620.00 USDT (+3.54%)
最低价格：41,856.25 USDT (-0.64%)
加权均价：42,891.50 USDT

📊 成交情况：
成交量：89,247.5 BTC
成交额：38.26亿 USDT
交易笔数：3,247,891笔
平均每笔：0.0275 BTC

💸 资金费率：
当前费率：+0.0125%（正数）
收取时间：下次 00:00 UTC
费用方向：多头支付空头
预计8小时费用：每万U收1.25U

📈 市场深度：
未平仓合约：45,892.5 BTC
24h变化：+2,847.5 BTC (+6.6%)
持仓热度：高（资金大量流入）

⚡ 市场分析：
• 涨跌状态：强势上涨 +2.75%
• 波动幅度：4.18%（波动较大）
• 交易活跃：成交量是现货3.2倍
• 资金流向：多头占优，但需支付费用
• 市场情绪：乐观，风险偏好提升

💡 交易提示：
合约市场呈现强劲上涨势头，多头情绪浓厚。
当前正数资金费率意味着做多需要支付费用。
建议关注43,620阻力位和资金费率变化趋势。
高未平仓量需要注意潜在的集体平仓风险。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '指定合约，如"BTCUSDT"永续合约。不填则返回所有合约的24小时统计（为性能考虑，限制返回前50个活跃合约）。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_exchange_info',
            description: `⚙️ 交易所信息查询 - 交易规则和限制说明

🔍 功能说明：
获取Binance交易所的基本信息和交易规则，包括支持的交易对、最小下单量、价格数量精度、手续费规则、API限制等详细信息。是进行程序化交易和风控设置的基础参考。

⚠️ 重要提醒：
• 实时更新：交易规则可能随时调整，建议定期查询
• 精度要求：下单时必须严格遵守价格和数量精度规则
• 限制条件：包含最小下单量、最大下单量、单笔限额等
• API限速：注意请求频率限制，避免触发风控

🎯 适用场景：
• 程序化交易系统获取交易对配置信息
• 风控系统设置订单参数验证规则
• 交易员了解新交易对的交易限制
• 合规人员确认交易规则和监管要求

📋 输出示例：
查询成功后将返回：
\`\`\`
⚙️ Binance 交易所信息概览

🌐 基础信息：
服务器时区：UTC+0
服务器时间：2024-01-15 15:30:25
系统状态：正常运行
支持交易对：1,847 个

📊 交易对示例（BTCUSDT）：
交易状态：TRADING（正常交易）
基础资产：BTC（比特币）
计价资产：USDT（泰达币）
支持权限：现货交易、杠杆交易

💰 交易限制：
最小下单量：0.00001 BTC
最大下单量：9000.00000 BTC
价格精度：2 位小数（0.01）
数量精度：5 位小数（0.00001）
最小名义金额：10 USDT

📈 其他规则：
价格过滤器：±10% 价格保护
冰山订单：支持
止盈止损：支持
市价单：支持，最大滑点 5%

⚡ API限制：
请求频率：1200次/分钟（权重计算）
订单频率：50笔/10秒
WebSocket：每连接 5 个数据流

💡 重要说明：
所有订单必须满足上述精度和限制要求。
系统维护时段可能暂停交易，请关注官方公告。
新交易对可能有特殊规则，请以最新信息为准。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    market: {
                        type: 'string',
                        enum: ['spot', 'futures'],
                        description: 'spot=现货市场信息（默认），futures=合约市场信息。不同市场有不同的交易规则和限制。',
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_server_time',
            description: `🕐 服务器时间同步检查 - API调用时间校准

🔍 功能说明：
获取Binance服务器的当前时间，并与本地时间进行对比分析。用于检查时间同步状态，确保API调用的时间戳验证正确，避免因时间偏差导致的订单失败或API拒绝。

⚠️ 重要提醒：
• 时间偏差：超过1000毫秒可能导致API调用失败
• 系统时间：确保本地系统时间准确并自动同步
• 网络延迟：考虑网络传输延迟对时间差的影响
• 定期检查：建议程序化交易系统定期校准时间

🎯 适用场景：
• 程序化交易系统启动时检查时间同步状态
• API调用失败时排查时间偏差问题
• 系统监控和运维时间同步状态检查
• 高频交易系统的时间精度校准

⏰ 输出示例：
查询成功后将返回：
\`\`\`
🕐 Binance 服务器时间同步检查

⏰ 时间信息：
服务器时间：2024-01-15 15:30:25.847 UTC
本地时间：2024-01-15 15:30:25.923 UTC
时间偏差：-76 毫秒
网络延迟：约 38 毫秒

📊 同步状态分析：
同步状态：✅ 优秀（偏差 < 100ms）
API影响：✅ 无影响
交易影响：✅ 无影响
建议操作：无需调整

⚡ 时间精度评估：
延迟等级：极低延迟
偏差等级：优秀范围
系统状态：时间同步正常
网络状态：连接稳定

💡 同步建议：
当前时间同步状态良好，无需人工调整。
建议程序化交易系统每小时检查一次时间同步。
如偏差超过500毫秒，请检查本地时间设置。
高频交易建议使用NTP服务器保持精确同步。

🔧 故障排除：
• 偏差 > 1000ms：检查系统时间设置和网络连接
• 偏差不稳定：可能存在网络抖动，建议多次测试
• API调用频繁失败：优先检查时间同步状态
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    ];
}
export async function handleMarketTool(name, args, binanceClient) {
    const spotAPI = new SpotAPI(binanceClient);
    const futuresAPI = new FuturesAPI(binanceClient);
    try {
        switch (name) {
            case 'binance_spot_price':
                if (args.symbol) {
                    const price = await spotAPI.getPrice(args.symbol);
                    return {
                        success: true,
                        data: {
                            symbol: price.symbol,
                            price: parseFloat(price.price),
                        },
                    };
                }
                else {
                    const prices = await spotAPI.getAllPrices();
                    return {
                        success: true,
                        data: prices
                            .map((p) => ({
                            symbol: p.symbol,
                            price: parseFloat(p.price),
                        }))
                            .slice(0, 100), // 限制返回数量
                    };
                }
            case 'binance_futures_price':
                if (args.symbol) {
                    const price = await futuresAPI.getPrice(args.symbol);
                    return {
                        success: true,
                        data: {
                            symbol: price.symbol,
                            price: parseFloat(price.price),
                        },
                    };
                }
                else {
                    const prices = await futuresAPI.getAllPrices();
                    return {
                        success: true,
                        data: prices
                            .map((p) => ({
                            symbol: p.symbol,
                            price: parseFloat(p.price),
                        }))
                            .slice(0, 100), // 限制返回数量
                    };
                }
            case 'binance_spot_orderbook':
                const orderbook = await spotAPI.getOrderBook(args.symbol, args.limit || 100);
                return {
                    success: true,
                    data: {
                        symbol: args.symbol,
                        lastUpdateId: orderbook.lastUpdateId,
                        bids: orderbook.bids.map((bid) => ({
                            price: parseFloat(bid[0]),
                            quantity: parseFloat(bid[1]),
                        })),
                        asks: orderbook.asks.map((ask) => ({
                            price: parseFloat(ask[0]),
                            quantity: parseFloat(ask[1]),
                        })),
                    },
                };
            case 'binance_spot_klines':
                const spotKlines = await spotAPI.getKlines({
                    symbol: args.symbol,
                    interval: args.interval,
                    limit: args.limit,
                    startTime: args.startTime,
                    endTime: args.endTime,
                });
                return {
                    success: true,
                    data: spotKlines.map((kline) => ({
                        openTime: kline.openTime,
                        open: parseFloat(kline.open),
                        high: parseFloat(kline.high),
                        low: parseFloat(kline.low),
                        close: parseFloat(kline.close),
                        volume: parseFloat(kline.volume),
                        closeTime: kline.closeTime,
                        quoteAssetVolume: parseFloat(kline.quoteAssetVolume),
                        numberOfTrades: kline.numberOfTrades,
                        takerBuyBaseAssetVolume: parseFloat(kline.takerBuyBaseAssetVolume),
                        takerBuyQuoteAssetVolume: parseFloat(kline.takerBuyQuoteAssetVolume),
                    })),
                };
            case 'binance_futures_klines':
                const futuresKlines = await futuresAPI.getKlines({
                    symbol: args.symbol,
                    interval: args.interval,
                    limit: args.limit,
                    startTime: args.startTime,
                    endTime: args.endTime,
                });
                return {
                    success: true,
                    data: futuresKlines.map((kline) => ({
                        openTime: kline.openTime,
                        open: parseFloat(kline.open),
                        high: parseFloat(kline.high),
                        low: parseFloat(kline.low),
                        close: parseFloat(kline.close),
                        volume: parseFloat(kline.volume),
                        closeTime: kline.closeTime,
                        quoteAssetVolume: parseFloat(kline.quoteAssetVolume),
                        numberOfTrades: kline.numberOfTrades,
                        takerBuyBaseAssetVolume: parseFloat(kline.takerBuyBaseAssetVolume),
                        takerBuyQuoteAssetVolume: parseFloat(kline.takerBuyQuoteAssetVolume),
                    })),
                };
            case 'binance_spot_24hr_ticker':
                const binanceClient_spot = binanceClient.getClient();
                const spotTicker = args.symbol
                    ? await binanceClient_spot.dailyStats({ symbol: args.symbol })
                    : await binanceClient_spot.dailyStats();
                if (args.symbol) {
                    return {
                        success: true,
                        data: {
                            symbol: spotTicker.symbol,
                            priceChange: parseFloat(spotTicker.priceChange),
                            priceChangePercent: parseFloat(spotTicker.priceChangePercent),
                            weightedAvgPrice: parseFloat(spotTicker.weightedAvgPrice),
                            prevClosePrice: parseFloat(spotTicker.prevClosePrice),
                            lastPrice: parseFloat(spotTicker.lastPrice),
                            bidPrice: parseFloat(spotTicker.bidPrice),
                            askPrice: parseFloat(spotTicker.askPrice),
                            openPrice: parseFloat(spotTicker.openPrice),
                            highPrice: parseFloat(spotTicker.highPrice),
                            lowPrice: parseFloat(spotTicker.lowPrice),
                            volume: parseFloat(spotTicker.volume),
                            quoteVolume: parseFloat(spotTicker.quoteVolume),
                            openTime: spotTicker.openTime,
                            closeTime: spotTicker.closeTime,
                            count: spotTicker.count,
                        },
                    };
                }
                else {
                    return {
                        success: true,
                        data: Object.values(spotTicker)
                            .slice(0, 50)
                            .map((ticker) => ({
                            symbol: ticker.symbol,
                            priceChange: parseFloat(ticker.priceChange),
                            priceChangePercent: parseFloat(ticker.priceChangePercent),
                            lastPrice: parseFloat(ticker.lastPrice),
                            volume: parseFloat(ticker.volume),
                            quoteVolume: parseFloat(ticker.quoteVolume),
                        })),
                    };
                }
            case 'binance_futures_24hr_ticker':
                const binanceClient_futures = binanceClient.getClient();
                const futuresTicker = args.symbol
                    ? await binanceClient_futures.futuresDailyStats({ symbol: args.symbol })
                    : await binanceClient_futures.futuresDailyStats();
                if (args.symbol) {
                    return {
                        success: true,
                        data: {
                            symbol: futuresTicker.symbol,
                            priceChange: parseFloat(futuresTicker.priceChange),
                            priceChangePercent: parseFloat(futuresTicker.priceChangePercent),
                            weightedAvgPrice: parseFloat(futuresTicker.weightedAvgPrice),
                            lastPrice: parseFloat(futuresTicker.lastPrice),
                            openPrice: parseFloat(futuresTicker.openPrice),
                            highPrice: parseFloat(futuresTicker.highPrice),
                            lowPrice: parseFloat(futuresTicker.lowPrice),
                            volume: parseFloat(futuresTicker.volume),
                            quoteVolume: parseFloat(futuresTicker.quoteVolume),
                            openTime: futuresTicker.openTime,
                            closeTime: futuresTicker.closeTime,
                            count: futuresTicker.count,
                        },
                    };
                }
                else {
                    return {
                        success: true,
                        data: futuresTicker.slice(0, 50).map((ticker) => ({
                            symbol: ticker.symbol,
                            priceChange: parseFloat(ticker.priceChange),
                            priceChangePercent: parseFloat(ticker.priceChangePercent),
                            lastPrice: parseFloat(ticker.lastPrice),
                            volume: parseFloat(ticker.volume),
                            quoteVolume: parseFloat(ticker.quoteVolume),
                        })),
                    };
                }
            case 'binance_exchange_info':
                const exchangeInfo = await binanceClient.getExchangeInfo();
                const market = args.market || 'spot';
                return {
                    success: true,
                    data: {
                        timezone: exchangeInfo.timezone,
                        serverTime: exchangeInfo.serverTime,
                        rateLimits: exchangeInfo.rateLimits,
                        exchangeFilters: exchangeInfo.exchangeFilters,
                        symbolCount: exchangeInfo.symbols.length,
                        symbols: exchangeInfo.symbols.slice(0, 20).map((symbol) => ({
                            symbol: symbol.symbol,
                            status: symbol.status,
                            baseAsset: symbol.baseAsset,
                            quoteAsset: symbol.quoteAsset,
                            permissions: symbol.permissions,
                        })),
                    },
                };
            case 'binance_server_time':
                const serverTime = await binanceClient.getServerTime();
                return {
                    success: true,
                    data: {
                        serverTime: serverTime,
                        localTime: Date.now(),
                        timeDifference: Date.now() - serverTime,
                    },
                };
            default:
                throw new Error(`未知的市场数据工具: ${name}`);
        }
    }
    catch (error) {
        logger.error(`市场数据工具执行失败 ${name}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
        };
    }
}
//# sourceMappingURL=market.js.map