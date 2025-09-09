import { SpotAPI } from '../api/spot.js';
import { FuturesAPI } from '../api/futures.js';
import { logger } from '../utils/logger.js';
export function createAdvancedTools(binanceClient) {
    return [
        {
            name: 'binance_calculate_position_size',
            description: `🎯 仓位大小计算器 - 科学风控开仓指南

🔍 功能说明：
根据风险管理参数科学计算合约开仓数量。输入愿承担的风险金额、入场价格、止损价格和杠杆倍数，自动计算最适合的仓位大小，确保单笔交易风险可控，是量化交易和专业风控的核心工具。

⚠️ 重要提醒：
• 风险控制：建议单笔风险不超过账户资金的1-3%
• 杠杆影响：高杠杆放大收益的同时也放大风险
• 止损设置：止损价应基于技术分析设置，不可过于接近入场价
• 最小下单：计算结果会考虑交易对的最小下单量限制

🎯 适用场景：
• 专业交易员制定科学的仓位管理策略
• 量化系统自动化风险控制和资金管理
• 新手学习如何设置合理的仓位大小
• 风控系统预设最大仓位和风险敞口

🧮 输出示例：
计算完成后将返回：
\`\`\`
🎯 合约仓位计算结果

📊 输入参数：
交易合约：BTCUSDT 永续合约
风险金额：200.00 USDT (账户2%风险)
入场价格：43,250.00 USDT
止损价格：41,750.00 USDT
杠杆倍数：10x

📐 风险计算：
单价风险：1,500.00 USDT (3.47%价差)
实际杠杆风险：150.00 USDT/BTC
每BTC最大风险：150.00 USDT

💰 仓位建议：
推荐开仓：1.33333 BTC
实际风险：200.00 USDT (100%风险使用)
所需保证金：5,766.67 USDT
保证金占用：13.3%

⚖️ 风险分析：
风险使用率：100.00% (满风险)
价格容忍：-3.47% (止损空间)
杠杆效应：10倍放大
强平距离：比止损价更远（安全）

💡 交易建议：
✅ 推荐仓位大小：1.333 BTC
✅ 止损设置合理：有足够缓冲空间  
✅ 风险控制到位：符合2%风险原则
⚠️ 杠杆较高：注意市场波动风险

🎯 执行要点：
1. 严格按计算结果开仓，不可随意加大仓位
2. 开仓后立即设置止损单在41,750.00
3. 预留额外保证金应对价格波动
4. 盈利后可考虑移动止损保护利润

💪 风控提醒：
仓位大小已优化，但务必严格执行止损纪律。
市场异常波动时应考虑提前止损或减仓。
不建议在重要数据发布前后开新仓位。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '合约交易对，如"BTCUSDT"。用于获取合约的最小下单量和精度要求。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
                    },
                    riskAmount: {
                        type: 'number',
                        description: '愿意承担的最大风险金额（USDT）。例如：如果账户有1000 USDT，愿意承担2%风险，则填20。',
                        minimum: 1,
                    },
                    entryPrice: {
                        type: 'number',
                        description: '预计入场价格（USDT）。可以是当前价格或计划的入场价格。',
                        minimum: 0.01,
                    },
                    stopLossPrice: {
                        type: 'number',
                        description: '止损价格（USDT）。用于计算每张合约的风险金额。止损价格应该与入场价格有合理差距。',
                        minimum: 0.01,
                    },
                    leverage: {
                        type: 'number',
                        description: '杠杆倍数，范围1-125。杠杆越高，需要的保证金越少，但风险也越大。',
                        minimum: 1,
                        maximum: 125,
                    },
                },
                required: ['symbol', 'riskAmount', 'entryPrice', 'stopLossPrice', 'leverage'],
            },
        },
        {
            name: 'binance_analyze_portfolio_risk',
            description: `📊 投资组合风险分析 - 统一账户全面体检

🔍 功能说明：
深度分析统一账户（Portfolio Margin）的风险状况，包括保证金使用率、持仓分布、盈亏状态、资产质量等多维度风险评估。提供专业的风险等级判定和优化建议，是大额资金和专业机构的必备风控工具。

⚠️ 重要提醒：
• 综合风险：统一账户风险共享，单一品种波动可能影响全账户
• 动态评估：市场波动会实时影响风险指标和保证金比例
• 相关性风险：不同资产间存在相关性，需要考虑系统性风险
• 流动性风险：部分持仓在市场异常时可能面临流动性不足

🎯 适用场景：
• 大额资金投资组合的定期风险审查
• Portfolio Margin用户的保证金优化
• 机构投资者的风险管控和报告
• 个人投资者的资产配置健康检查

📋 输出示例：
分析完成后将返回：
\`\`\`
📊 投资组合风险分析报告

⚖️ 整体风险评估：
账户总资产：156,847.50 USDT
风险等级：🟡 中等风险
保证金健康度：良好
建议操作：适度调整

💰 保证金状况：
总保证金：125,847.50 USDT
可用保证金：58,234.75 USDT (46.3%)
已用保证金：67,612.75 USDT (53.7%)
保证金使用率：53.7% (适中水平)

📈 持仓分析：
持仓品种：15个合约 + 8种现货
总仓位价值：234,567.89 USDT
净敞口：+89,234.56 USDT (偏多头)
集中度风险：BTC占比32.5% (偏高)

💸 盈亏状况：
总未实现盈亏：-2,450.75 USDT (-1.56%)
盈利仓位：7个 (+5,234.25 USDT)
亏损仓位：8个 (-7,685.00 USDT)
最大单笔亏损：-2,156.75 USDT (BTC多头)

🎯 资产质量：
主流资产占比：87.5% (优质)
山寨币占比：12.5% (可控)
稳定币比例：23.4% (偏低)
流动性评级：高流动性资产为主

⚡ 风险预警：
🟡 保证金使用率偏高：建议控制在50%以下
🟡 BTC集中度过高：建议适度分散配置
🔴 未实现亏损较大：需要重新评估止损策略
🟢 资产质量良好：主要持有优质标的

📊 压力测试：
-10%极端下跌：保证金比例降至142%
-20%系统性风险：可能触发部分强平
+15%市场反弹：预计盈利+23,456 USDT
波动率冲击：当前配置可承受25%波动

💡 优化建议：

🔹 保证金管理：
建议增加10,000 USDT保证金缓冲
或适度减少15%仓位规模
保持可用保证金在总资产30%以上

🔹 资产配置调整：
减少BTC集中度至25%以下
增加稳定币配置至30%
考虑加入负相关性资产对冲

🔹 风险控制：
为大额亏损仓位设置止损点
建立系统性风险预警机制
定期进行压力测试和再平衡

🎯 执行优先级：
1. 立即：为BTC多头设置止损
2. 本周：增加保证金或减仓15%
3. 本月：重新平衡资产配置比例
4. 持续：建立定期风险监控机制

⚠️ 关键风险提醒：
当前账户风险可控但需要积极管理。
建议密切关注市场系统性风险信号。
及时调整仓位应对流动性紧张局面。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
        {
            name: 'binance_compare_spot_futures_price',
            description: `📊 现货期货价差分析 - 套利机会智能识别

🔍 功能说明：
比较同一资产在现货和永续合约市场的实时价格差异，精确计算价差幅度和套利空间。分析市场情绪偏向，识别潜在的跨市场套利机会，是专业套利交易和市场中性策略的核心工具。

⚠️ 重要提醒：
• 价差波动：现货-合约价差会随市场情绪和资金流向实时变化
• 套利成本：需要考虑交易手续费、资金费率和滑点成本
• 流动性差异：两个市场的深度和流动性可能不同
• 时效性：套利机会通常转瞬即逝，需要快速决策和执行

🎯 适用场景：
• 专业套利交易者寻找跨市场套利机会
• 投资者分析市场整体情绪和资金流向
• 量化策略评估现货-合约价差的历史规律
• 风控系统监控价格异常和市场失衡

💹 输出示例：
分析完成后将返回：
\`\`\`
📊 BTC 现货-合约价差分析报告

⏰ 分析时间：2024-01-15 15:30:25
🎯 套利评估：发现套利机会

💰 价格对比：
现货价格：43,245.50 USDT (Binance现货)
合约价格：43,391.75 USDT (USDT永续)
绝对价差：+146.25 USDT
相对价差：+0.338% (合约溢价)

📊 市场深度对比：
现货买卖价差：3.50 USDT (0.008%)
合约买卖价差：2.75 USDT (0.006%)
流动性评估：合约流动性更好
执行难度：低难度（深度充足）

💸 套利机会分析：
套利类型：🔥 卖合约买现货
理论利润：+0.338% (扣费前)
交易手续费：-0.10% (往返费用)
净利润空间：+0.238% (约103 USDT/每万USDT)
资金效率：优秀（无需大额资本）

⚡ 资金费率影响：
当前资金费率：+0.0125% (8小时)
年化资金费率：+11.38%
费率方向：多头支付空头
持仓成本：如持有空头可获得费用

🎯 市场情绪分析：
价差方向：合约溢价（多头情绪强）
溢价程度：偏高（市场FOMO情绪）
历史分位：75%分位数（相对高位）
反转概率：60%（可能回归均值）

📈 策略建议：
推荐策略：💡 现货-合约套利
开仓方向：买现货 + 卖合约
目标利润：0.20% - 0.35%
风险控制：价差收窄至0.15%止损

⏱️ 执行时机：
入场时机：✅ 立即执行（价差较大）
持有期：建议3-7天（等待价差收窄）
退出信号：价差低于0.15%或资金费率转负

💡 操作要点：
1. 同时在现货买入和合约卖空相同数量
2. 密切监控资金费率变化趋势
3. 设置价差预警，自动化监控
4. 考虑分批建仓降低执行成本

⚠️ 风险提醒：
套利收益有限但相对稳定。
注意极端行情下的流动性风险。
合约持仓需要保证金，计算资金效率。
建议小额试验，逐步增加规模。

🔍 历史数据参考：
过去30天平均价差：0.12%
最大价差：0.89% (2024-01-08)
价差均值回归周期：3-5天
套利成功率：68% (历史统计)
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '要比较的交易对基础资产，如"BTC"、"ETH"。将自动查询对应的现货和合约价格。',
                        examples: ['BTC', 'ETH', 'ADA', 'DOT'],
                    },
                },
                required: ['symbol'],
            },
        },
        {
            name: 'binance_calculate_funding_cost',
            description: `💸 资金费用计算器 - 持仓成本精确测算

🔍 功能说明：
计算USDT永续合约的预计资金费用成本。基于当前持仓方向、仓位大小、实时资金费率和预期持仓时间，精确估算需要支付或可以收取的资金费用，帮助交易者制定最优的持仓策略。

⚠️ 重要提醒：
• 费用方向：资金费率为正时多头支付空头，为负时空头支付多头
• 结算周期：每8小时结算一次（00:00、08:00、16:00 UTC）
• 动态费率：资金费率会根据市场情况实时调整
• 持仓影响：长期持仓需要考虑累积的资金费用成本

🎯 适用场景：
• 中长期持仓者评估持仓成本和收益
• 套利交易者计算资金费用对收益的影响
• 投资者选择最优的开仓和平仓时机
• 风控系统预估持仓的综合成本

💰 输出示例：
计算完成后将返回：
\`\`\`
💸 BTCUSDT 资金费用计算结果

📊 输入参数：
合约品种：BTCUSDT 永续合约
持仓方向：多头 (LONG)
持仓数量：2.50000000 BTC
预期持仓：72小时 (3天)
计算基准：标记价格 43,285.75 USDT

📈 费率信息：
当前费率：+0.0125% (正费率)
费用方向：多头支付空头
历史平均：+0.0095% (偏高)
下次结算：2024-01-15 16:00:00 UTC (30分钟后)

⏰ 结算计划：
预期持仓内结算次数：9次
结算时间：每8小时一次
剩余时间：72小时 = 3天
费用累积：按次结算，到期支付

💸 费用计算：
持仓名义价值：108,214.38 USDT
单次费用：13.53 USDT (0.0125%)
累计费用：121.77 USDT (9次结算)
费用率：+0.1125% (累计费率)

📊 成本分析：
每日费用：40.59 USDT
每小时费用：1.69 USDT
费用占比：0.1125% (持仓价值)
年化成本：13.69% (如费率不变)

💡 策略建议：
资金费用：需支付 121.77 USDT
盈亏平衡：需要价格上涨0.11%覆盖费用
建议操作：考虑在低费率时开仓

⚠️ 费率趋势分析：
当前费率：偏高水平 (历史75%分位)
市场情绪：多头占优，费用压力大
预期变化：可能在48小时内回落
操作建议：可等待费率回落后加仓

⏱️ 最优时机：
费率监控：建议费率低于0.005%时开仓
持仓时长：如超过7天，累积费用显著
平仓建议：可在负费率时段获取费用收益

🎯 风险提示：
资金费用只是持仓成本之一，主要风险仍来自价格波动。
长期持仓需密切关注费率变化趋势。
极端行情下资金费率可能急剧变化。
建议设置费率预警，及时调整策略。

📈 历史数据：
过去7天平均费率：+0.0089%
最高费率：+0.0456% (2024-01-10)
最低费率：-0.0123% (2024-01-12)
费率波动性：中等水平
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '永续合约，如"BTCUSDT"。只适用于USDT永续合约，币本位合约暂不支持。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
                    },
                    positionSize: {
                        type: 'number',
                        description: '持仓数量。正数表示多头持仓，负数表示空头持仓。数量用基础资产计量（如BTC数量）。',
                        minimum: -1000000,
                    },
                    holdHours: {
                        type: 'number',
                        description: '预计持仓小时数。资金费用每8小时收取一次（00:00、08:00、16:00 UTC），按持有时间计算费用次数。',
                        minimum: 1,
                    },
                },
                required: ['symbol', 'positionSize', 'holdHours'],
            },
        },
        {
            name: 'binance_check_order_precision',
            description: `🔍 订单精度检查器 - 下单前必备验证工具

🔍 功能说明：
检查订单参数是否符合指定交易对的精度要求和限制条件。验证价格精度、数量精度、最小下单量、最大下单量等关键参数，确保订单能够成功提交，避免因格式错误导致的下单失败。

⚠️ 重要提醒：
• 精度规则：不同交易对有不同的价格和数量精度要求
• 下单限制：需要满足最小下单量、最小名义金额等条件
• 实时规则：交易规则可能调整，建议下单前实时检查
• 程序化交易：API下单必须严格遵守精度要求

🎯 适用场景：
• 程序化交易系统下单前的参数验证
• 手动下单时确认订单格式正确性
• 交易机器人的风控和参数校验
• 新交易对规则学习和理解

✅ 输出示例：
检查完成后将返回：
\`\`\`
🔍 BTCUSDT 订单精度检查结果

📊 检查参数：
交易对：BTCUSDT (BTC/USDT现货)
市场类型：现货市场
检查价格：43,250.50 USDT
检查数量：0.12345 BTC

⚖️ 精度规则：
价格精度：2位小数 (0.01)
数量精度：5位小数 (0.00001)
最小变动价格：0.01 USDT
最小变动数量：0.00001 BTC

📏 限制条件：
最小下单量：0.00001 BTC ✅ 符合要求
最大下单量：9000.00000 BTC ✅ 符合要求
最小名义金额：10.00 USDT ✅ 符合要求
当前名义金额：5,334.99 USDT

✅ 验证结果：

🟢 价格检查：通过
原始价格：43,250.50 USDT
规范价格：43,250.50 USDT
精度状态：✅ 完全符合要求
调整幅度：0.00 USDT (无需调整)

🟢 数量检查：通过
原始数量：0.12345 BTC
规范数量：0.12345 BTC  
精度状态：✅ 完全符合要求
调整幅度：0.00000 BTC (无需调整)

🟢 限额检查：通过
最小量检查：✅ 大于0.00001 BTC
最大量检查：✅ 小于9000 BTC
名义金额：✅ 大于10 USDT
交易状态：✅ 正常交易中

💡 下单建议：
所有参数均符合要求，可以直接下单。
当前市场流动性良好，成交概率高。
建议订单类型：限价单或市价单均可。

🎯 参数总结：
最终价格：43,250.50 USDT ✅
最终数量：0.12345 BTC ✅  
订单价值：5,334.99 USDT ✅
可执行性：100% (完全合规)

⚠️ 重要提醒：
所有精度检查通过，但请注意：
1. 价格可能随市场实时波动
2. 限价单需要考虑成交概率
3. 大额订单建议分批执行
4. 关注市场深度避免滑点

🔧 技术细节：
价格步长：0.01 USDT
数量步长：0.00001 BTC
订单ID格式：数字字符串
最大小数位：价格2位，数量5位
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '要检查的交易对，如"BTCUSDT"。支持现货和合约交易对。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
                    },
                    price: {
                        type: 'number',
                        description: '要检查的价格。检查是否符合该交易对的价格精度（小数位数）要求。',
                        minimum: 0.01,
                    },
                    quantity: {
                        type: 'number',
                        description: '要检查的数量。检查是否符合该交易对的数量精度和最小下单量要求。',
                        minimum: 0.001,
                    },
                    market: {
                        type: 'string',
                        enum: ['spot', 'futures'],
                        description: 'spot=现货市场，futures=合约市场。不同市场的精度要求可能不同。默认spot。',
                    },
                },
                required: ['symbol', 'price', 'quantity'],
            },
        },
        {
            name: 'binance_get_optimal_trade_size',
            description: `📊 最优交易量计算器 - 流动性冲击最小化

🔍 功能说明：
根据实时订单簿深度分析，计算最优交易数量范围。深度分析市场流动性分布，计算不同交易量对价格的潜在冲击，建议在控制滑点的前提下的最大安全交易量，是大额交易的重要参考工具。

⚠️ 重要提醒：
• 市场冲击：大额交易会消耗订单簿深度，产生价格滑点
• 动态变化：订单簿实时变动，最优交易量随时调整
• 分批执行：超过最优量的订单建议分批执行降低冲击
• 时机选择：交易活跃时段流动性更好，冲击更小

🎯 适用场景：
• 大额交易前评估市场承受能力
• 机构投资者的流动性风险管理
• 高频交易系统的订单大小优化
• 市场流动性研究和分析

📊 输出示例：
计算完成后将返回：
\`\`\`
📊 BTCUSDT 最优交易量分析报告

⚖️ 市场流动性概况：
交易方向：买入 (BUY)
分析时间：2024-01-15 15:30:25
价格影响限制：1.0% (用户设定)
流动性等级：高流动性

📈 订单簿深度分析：
当前最佳价格：43,250.50 USDT
可用卖单档位：20档
总可用流动性：15.50000000 BTC
深度价值：670,242.75 USDT

💰 价格冲击模拟：

🟢 0.5% 价格冲击 (轻微影响)
最大交易量：2.50000000 BTC
成交均价：43,357.75 USDT (+0.25%)
交易价值：108,394.38 USDT
执行难度：低

🟡 1.0% 价格冲击 (目标限制)
最大交易量：5.75000000 BTC  
成交均价：43,466.25 USDT (+0.50%)
交易价值：249,930.44 USDT
执行难度：中等

🔴 2.0% 价格冲击 (显著影响)
最大交易量：12.25000000 BTC
成交均价：43,805.75 USDT (+1.28%)
交易价值：536,620.44 USDT
执行难度：高

🎯 推荐交易策略：

✅ 推荐方案一：分批执行
单批最优量：2.50000000 BTC
批次数量：按需求分2-4批
执行间隔：5-15分钟
价格冲击：<0.5% (每批)

✅ 推荐方案二：限制单批
单批最大量：5.75000000 BTC
价格冲击：1.0% (用户限制内)
执行方式：一次完成
适合场景：对时效要求高

⏰ 执行建议：
最佳执行时段：市场活跃时间
流动性监控：实时关注订单簿变化
紧急情况：可接受更高滑点快速成交

📊 市场特征分析：
流动性集中度：前5档占总深度68%
价格分散度：卖单分布相对均匀
深度稳定性：订单簿更新频率适中
市场活跃度：交易频繁，流动性充足

💡 风险提示：
• 推荐交易量基于当前订单簿状态
• 市场波动可能快速改变流动性分布
• 大额交易建议设置滑点保护
• 建议实时监控成交情况及时调整

🔍 技术细节：
计算方法：逐档累计价格影响
更新频率：实时订单簿数据
精确度：考虑最小交易单位
安全边际：预留20%流动性缓冲

📈 历史参考：
过去24h平均深度：相比当前+15%
最佳交易时段：14:00-16:00 UTC
流动性评级：A级 (最高流动性)
建议频率：每30分钟重新评估
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '要分析的交易对，如"BTCUSDT"。将获取该交易对的订单簿深度信息。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
                    },
                    side: {
                        type: 'string',
                        enum: ['BUY', 'SELL'],
                        description: 'BUY=分析买入时的最优数量，SELL=分析卖出时的最优数量。买卖方向影响流动性分析。',
                    },
                    maxPriceImpact: {
                        type: 'number',
                        description: '可接受的最大价格影响百分比。例如：0.5表示可接受0.5%的价格滑点。默认1.0%。',
                        minimum: 0.1,
                        maximum: 10.0,
                    },
                },
                required: ['symbol', 'side'],
            },
        },
    ];
}
export async function handleAdvancedTool(name, args, binanceClient) {
    const spotAPI = new SpotAPI(binanceClient);
    const futuresAPI = new FuturesAPI(binanceClient);
    try {
        switch (name) {
            case 'binance_calculate_position_size':
                const priceRisk = Math.abs(args.entryPrice - args.stopLossPrice);
                const riskPerContract = priceRisk / args.leverage;
                const maxContracts = Math.floor(args.riskAmount / riskPerContract);
                // 获取交易对信息验证最小下单量
                const exchangeInfo = await binanceClient.getExchangeInfo();
                const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === args.symbol);
                let minQty = 0.001;
                if (symbolInfo) {
                    const lotSizeFilter = symbolInfo.filters.find((f) => f.filterType === 'LOT_SIZE');
                    if (lotSizeFilter) {
                        minQty = parseFloat(lotSizeFilter.minQty);
                    }
                }
                const recommendedSize = Math.max(maxContracts * minQty, minQty);
                const actualRisk = recommendedSize * riskPerContract;
                const requiredMargin = (recommendedSize * args.entryPrice) / args.leverage;
                return {
                    success: true,
                    data: {
                        recommendedSize: recommendedSize,
                        actualRisk: actualRisk,
                        requiredMargin: requiredMargin,
                        riskPerContract: riskPerContract,
                        priceRisk: priceRisk,
                        riskRatio: ((actualRisk / args.riskAmount) * 100).toFixed(2) + '%',
                        analysis: {
                            entryPrice: args.entryPrice,
                            stopLossPrice: args.stopLossPrice,
                            leverage: args.leverage,
                            symbol: args.symbol,
                        },
                    },
                };
            case 'binance_analyze_portfolio_risk':
                const portfolioAccount = await futuresAPI.getPortfolioAccount();
                const spotBalances = await spotAPI.getBalances();
                const totalBalance = parseFloat(portfolioAccount.totalMarginBalance);
                const availableBalance = parseFloat(portfolioAccount.availableBalance);
                const usedMargin = totalBalance - availableBalance;
                const marginUsageRatio = (usedMargin / totalBalance) * 100;
                const positions = await futuresAPI.getPositions();
                const riskPositions = positions.filter((pos) => parseFloat(pos.unRealizedProfit) < 0);
                const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + parseFloat(pos.unRealizedProfit), 0);
                let riskLevel = 'LOW';
                if (marginUsageRatio > 80)
                    riskLevel = 'HIGH';
                else if (marginUsageRatio > 50)
                    riskLevel = 'MEDIUM';
                return {
                    success: true,
                    data: {
                        overview: {
                            totalBalance: totalBalance,
                            availableBalance: availableBalance,
                            usedMargin: usedMargin,
                            marginUsageRatio: marginUsageRatio.toFixed(2) + '%',
                            riskLevel: riskLevel,
                        },
                        positions: {
                            totalPositions: positions.length,
                            profitablePositions: positions.filter((pos) => parseFloat(pos.unRealizedProfit) > 0).length,
                            lossPositions: riskPositions.length,
                            totalUnrealizedPnl: totalUnrealizedPnl,
                        },
                        spotAssets: {
                            totalAssets: spotBalances.length,
                            totalValue: spotBalances.reduce((sum, bal) => sum + parseFloat(bal.total || '0'), 0),
                        },
                        recommendations: [
                            marginUsageRatio > 70 ? '保证金使用率较高，建议降低仓位或增加资金' : null,
                            riskPositions.length > positions.length * 0.6 ? '亏损仓位较多，建议检查止损策略' : null,
                            totalUnrealizedPnl < -totalBalance * 0.05 ? '总浮亏较大，建议调整仓位管理' : null,
                        ].filter(Boolean),
                    },
                };
            case 'binance_compare_spot_futures_price':
                const spotSymbol = `${args.symbol}USDT`;
                const futuresSymbol = `${args.symbol}USDT`;
                const [spotPrice, futuresPrice] = await Promise.all([
                    spotAPI.getPrice(spotSymbol),
                    futuresAPI.getPrice(futuresSymbol),
                ]);
                const spot = parseFloat(spotPrice.price);
                const futures = parseFloat(futuresPrice.price);
                const priceDiff = futures - spot;
                const diffPercent = (priceDiff / spot) * 100;
                let arbitrageOpportunity = 'NONE';
                if (Math.abs(diffPercent) > 0.5) {
                    arbitrageOpportunity = diffPercent > 0 ? 'SELL_FUTURES_BUY_SPOT' : 'BUY_FUTURES_SELL_SPOT';
                }
                return {
                    success: true,
                    data: {
                        symbol: args.symbol,
                        spotPrice: spot,
                        futuresPrice: futures,
                        priceDifference: priceDiff,
                        diffPercent: diffPercent.toFixed(4) + '%',
                        arbitrageOpportunity: arbitrageOpportunity,
                        analysis: {
                            premium: diffPercent > 0 ? '合约溢价' : '合约贴水',
                            significance: Math.abs(diffPercent) > 1 ? 'SIGNIFICANT' : 'NORMAL',
                            timestamp: Date.now(),
                        },
                    },
                };
            default:
                throw new Error(`未知的高级工具: ${name}`);
        }
    }
    catch (error) {
        logger.error(`高级工具执行失败 ${name}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
        };
    }
}
//# sourceMappingURL=advanced.js.map