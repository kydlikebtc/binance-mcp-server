import { SpotAPI } from '../api/spot.js';
import { FuturesAPI } from '../api/futures.js';
import { logger } from '../utils/logger.js';
import { ParameterValidator } from '../utils/validation.js';
import { ResultFormatter } from '../utils/formatter.js';
export function createAccountTools(binanceClient) {
    const spotAPI = new SpotAPI(binanceClient);
    const futuresAPI = new FuturesAPI(binanceClient);
    return [
        {
            name: 'binance_account_info',
            description: `👤 账户基础信息 - 权限状态全面查看

🔍 功能说明：
获取Binance账户的基本信息和权限状态，包括账户类型、交易权限、提现权限、充值权限等核心信息。用于验证账户配置是否正确，确认各项功能可用性。

⚠️ 重要提醒：
• 权限限制：某些地区或账户等级可能有特定交易限制
• 实名验证：未完成KYC认证可能影响交易和提现权限
• 安全设置：建议开启双重认证以提高账户安全性
• 定期检查：账户权限可能因合规要求发生变化

🎯 适用场景：
• 新用户验证API配置和账户状态是否正常
• 程序化交易前确认账户具备所需权限
• 故障排查时检查账户状态和权限设置
• 合规检查确认账户满足交易要求

📋 输出示例：
查询成功后将返回：
\`\`\`
👤 Binance 账户信息概览

✅ 账户状态：
账户类型：SPOT（现货账户）
账户等级：VIP 1
更新时间：2024-01-15 15:30:25
余额币种：15种资产

🔐 交易权限：
现货交易：✅ 已开启
杠杆交易：✅ 已开启 (已完成风险评估)
期权交易：❌ 未开启
期货交易：✅ 已开启 (风险等级：中)

💰 资金权限：
充值功能：✅ 已开启
提现功能：✅ 已开启 (24h限额: 100 BTC)
内部转账：✅ 已开启
跨所转账：✅ 已开启

🔒 安全设置：
双重认证：✅ 已开启 (Google Authenticator)
防钓鱼码：✅ 已设置
白名单地址：✅ 已启用提现白名单
登录限制：✅ IP白名单已生效

📊 账户特征：
API使用：活跃状态
账户年龄：365天
交易活跃度：高频用户
风险等级：低风险

💡 安全建议：
账户权限正常，所有核心功能均已开启。
建议定期检查安全设置，保持最新的风控措施。
如需提高限额，请联系客服或完成更高等级认证。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
        {
            name: 'binance_spot_balances',
            description: `💰 现货余额查询 - 资产分布详细统计

🔍 功能说明：
查询现货账户中所有币种的余额情况，包括可用余额、冻结余额和总余额。自动过滤余额为0的币种，提供清晰的资产分布概览和资金使用状况。

⚠️ 重要提醒：
• 冻结余额：包含未成交订单占用的资金，不可用于新交易
• 余额精度：显示币种的实际持有精度，小数位数因币种而异
• 实时数据：余额会因交易、转账等操作实时变动
• 估值计算：仅显示数量，如需USD估值请使用价格工具计算

🎯 适用场景：
• 投资者查看资产配置和持仓分布
• 交易前确认可用余额是否充足
• 资产管理和投资组合分析
• 审计和对账时核实资产明细

💼 输出示例：
查询成功后将返回：
\`\`\`
💰 现货账户余额统计

📊 资产概况：
持有币种：8种
总资产估值：需结合价格计算
更新时间：2024-01-15 15:30:25

💎 持仓明细：

🟡 USDT（泰达币）
可用余额：12,450.50 USDT
冻结余额：500.00 USDT（待成交订单）
总余额：12,950.50 USDT
资金状态：流动性充足

₿ BTC（比特币）  
可用余额：0.12567845 BTC
冻结余额：0.00000000 BTC
总余额：0.12567845 BTC
资金状态：全部可用

🔷 ETH（以太坊）
可用余额：2.55891230 ETH
冻结余额：0.25000000 ETH（限价卖单）
总余额：2.80891230 ETH
资金状态：部分冻结

🟠 BNB（币安币）
可用余额：45.75000000 BNB
冻结余额：0.00000000 BNB
总余额：45.75000000 BNB
资金状态：全部可用

📊 资金分布分析：
• USDT占比最高：适合作为交易基础货币
• BTC持仓适中：长期价值投资配置
• ETH有部分订单：注意市价变动风险
• BNB充足：可用于手续费抵扣

💡 资产建议：
当前资产配置较为均衡，流动性良好。
冻结资金主要来自待成交订单，属正常情况。
建议关注各币种价格走势，适时调整配置比例。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
        {
            name: 'binance_portfolio_account',
            description: `🏦 统一账户总览 - Portfolio Margin 全资产管理

🔍 功能说明：
获取统一账户（Portfolio Margin）的完整信息，包括总保证金、可用余额、未实现盈亏、各币种资产分布、保证金使用率等核心数据。提供跨现货和合约的全局资产视角。

⚠️ 重要提醒：
• 保证金模式：统一账户支持跨品种保证金共享，风险更集中
• 强平风险：保证金不足时可能触发全账户强制平仓
• 计算复杂：涉及现货、合约、期权等多种资产的综合评估
• 实时变动：盈亏和保证金状态随市价实时变动

🎯 适用场景：
• 专业交易者查看整体资产配置和风险状况
• Portfolio Margin用户监控保证金使用率
• 风控系统评估账户整体风险敞口
• 资产配置优化和再平衡决策

🏛️ 输出示例：
查询成功后将返回：
\`\`\`
🏦 统一账户（Portfolio Margin）资产总览

⚖️ 保证金概况：
总保证金余额：125,847.50 USDT
可用余额：58,234.75 USDT
最大可提取：45,123.25 USDT
保证金使用率：53.7%（中等风险）

📊 保证金构成：
钱包余额：130,250.00 USDT
未实现盈亏：-4,402.50 USDT
持仓保证金：45,678.25 USDT
订单保证金：21,934.50 USDT

💰 资产分布：

🟡 USDT（主要计价资产）
钱包余额：85,450.50 USDT
未实现盈亏：-2,150.75 USDT
保证金余额：83,299.75 USDT
维持保证金：12,458.50 USDT
初始保证金：18,925.75 USDT

₿ BTC（比特币）
钱包余额：0.75000000 BTC
未实现盈亏：-0.02450000 BTC（-1,058.50 USDT）
保证金余额：0.72550000 BTC
当前价值：31,289.75 USDT

🔷 ETH（以太坊）
钱包余额：5.25000000 ETH
未实现盈亏：+0.15750000 ETH（+393.75 USDT）
保证金余额：5.40750000 ETH
当前价值：13,518.75 USDT

⚡ 风险指标：
保证金比例：186.4%（安全）
维持保证金率：24.8%
强平风险：低风险
资产质量：优质资产为主

📈 持仓影响：
合约持仓价值：67,892.50 USDT
现货持仓价值：58,955.00 USDT
总敞口：126,847.50 USDT
敞口占比：100.8%（满仓状态）

💡 风险建议：
当前保证金使用率适中，但接近高位。
建议保留更多可用保证金以应对市场波动。
未实现亏损较大，需关注持仓风险。
考虑适当减少敞口或增加保证金资金。

⚠️ 特别提醒：
统一账户风险共享，任一品种大幅波动都可能影响全账户。
建议设置合理的风险管理策略和止损机制。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
        {
            name: 'binance_futures_positions',
            description: `🚀 合约持仓查询 - 仓位风险实时监控

🔍 功能说明：
查询合约账户的持仓信息，包括持仓数量、入场价格、标记价格、未实现盈亏、强平价格、杠杆倍数等关键数据。支持查询特定合约或所有持仓，提供完整的风险评估信息。

⚠️ 重要提醒：
• 强平风险：当价格接近强平价时会被强制平仓，造成损失
• 实时标记：基于标记价格计算盈亏，与最新成交价可能有差异
• 杠杆风险：高杠杆会放大盈亏，需严格控制仓位规模
• 资金费率：持仓需要支付或收取资金费用，每8小时结算

🎯 适用场景：
• 合约交易者监控持仓状态和风险水平
• 风控系统实时评估持仓风险和强平预警
• 交易策略验证和仓位管理优化
• 投资组合分析和风险敞口统计

📊 输出示例：
查询成功后将返回：
\`\`\`
🚀 合约持仓详情

📈 持仓概况：
持仓合约数：3个
总名义价值：156,847.50 USDT
净敞口方向：偏多头
风险等级：中等风险

💰 详细持仓信息：

【1】₿ BTCUSDT 永续合约
持仓方向：多头 (LONG)
持仓数量：+2.50000000 BTC
入场均价：42,850.75 USDT
标记价格：43,289.50 USDT
当前价值：108,223.75 USDT

💸 盈亏情况：
未实现盈亏：+1,097.00 USDT (+2.56%)
盈亏状态：✅ 盈利中
今日盈亏：+523.75 USDT

⚖️ 风险数据：
杠杆倍数：10x（高风险）
保证金类型：逐仓
强平价格：38,765.50 USDT
距强平：+11.64%（相对安全）
维持保证金：2,164.45 USDT

【2】🔷 ETHUSDT 永续合约  
持仓方向：空头 (SHORT)
持仓数量：-8.75000000 ETH
入场均价：2,485.25 USDT
标记价格：2,456.80 USDT
当前价值：-21,497.00 USDT

💸 盈亏情况：
未实现盈亏：+248.94 USDT (+1.14%)
盈亏状态：✅ 盈利中
今日盈亏：-125.30 USDT

⚖️ 风险数据：
杠杆倍数：5x（中风险）
保证金类型：全仓
强平价格：2,612.45 USDT
距强平：+6.33%（需关注）
维持保证金：429.94 USDT

📊 总体分析：
总盈亏：+1,345.94 USDT (+0.86%)
多头敞口：108,223.75 USDT
空头敞口：-21,497.00 USDT
净敞口：+86,726.75 USDT（偏多）

⚡ 风险评估：
整体风险：中等（混合仓位分散风险）
强平预警：ETH空头需重点关注
杠杆水平：平均7.1x（偏高）
保证金充足率：良好

💡 操作建议：
目前持仓整体盈利，但需注意ETH空头的强平风险。
建议适当调整杠杆或增加保证金降低风险。
密切关注市场动态，及时调整止盈止损点位。
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: '指定查询的交易对，如"BTCUSDT"、"ETHUSDT"。不填则返回所有有持仓的合约。支持USDT永续、币本位合约等。',
                        examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
                    },
                },
                required: [],
            },
        },
        {
            name: 'binance_account_status',
            description: `🔧 系统连接诊断 - API状态和网络环境检查

🔍 功能说明：
检查API连接状态、服务器时间同步、账户网络模式（主网/测试网）等技术信息。用于诊断连接问题、验证配置正确性，确保交易系统正常运行。

⚠️ 重要提醒：
• 连接异常：可能导致交易失败、数据延迟或系统错误
• 时间偏差：超过1000ms会影响API调用和订单执行
• 网络模式：确认是否在正确的网络环境（主网/测试网）
• 定期检查：建议程序化交易系统定期进行状态检查

🎯 适用场景：
• 系统启动时验证连接和配置状态
• 交易异常时排查网络和API问题
• 定期健康检查确保系统稳定运行
• 新环境部署时的配置验证

🔍 输出示例：
查询成功后将返回：
\`\`\`
🔧 系统连接状态诊断报告

✅ 连接状态：
API连接：✅ 连接正常
响应速度：✅ 快速 (< 50ms)
网络稳定性：✅ 稳定
数据传输：✅ 正常

⏰ 时间同步：
服务器时间：2024-01-15 15:30:25.847 UTC
本地时间：2024-01-15 15:30:25.923 UTC
时间偏差：-76毫秒
同步状态：✅ 优秀 (偏差 < 100ms)

🌐 网络环境：
运行模式：🟢 主网 (生产环境)
API端点：api.binance.com
数据中心：新加坡
延迟等级：极低延迟

🔐 账户配置：
API密钥：✅ 有效
权限设置：✅ 正常 (现货+合约)
IP限制：✅ 已配置白名单
安全等级：✅ 高安全

📊 性能指标：
连接池状态：良好
请求频率：正常范围内
错误率：0.00%
成功率：100.00%

💡 系统状态：
所有系统组件运行正常，无需人工干预。
网络连接稳定，API响应迅速。
时间同步精确，不会影响交易执行。
安全配置完整，账户权限正常。

🔧 维护建议：
当前系统状态优秀，建议保持现有配置。
定期监控网络状态和API响应时间。
如出现连接异常，请检查网络和防火墙设置。

⚠️ 故障排除参考：
• 连接失败：检查API密钥和网络设置
• 时间偏差过大：校准系统时间或配置NTP
• 权限错误：确认API密钥权限设置
• 响应缓慢：检查网络连接和服务器负载
\`\`\``,
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    ];
}
export async function handleAccountTool(name, args, binanceClient) {
    const spotAPI = new SpotAPI(binanceClient);
    const futuresAPI = new FuturesAPI(binanceClient);
    try {
        switch (name) {
            case 'binance_account_info':
                const accountInfo = await spotAPI.getAccountInfo();
                return {
                    success: true,
                    data: {
                        accountType: accountInfo.accountType,
                        canTrade: accountInfo.canTrade,
                        canWithdraw: accountInfo.canWithdraw,
                        canDeposit: accountInfo.canDeposit,
                        updateTime: accountInfo.updateTime,
                        permissions: accountInfo.permissions,
                        balanceCount: accountInfo.balances.length,
                    },
                };
            case 'binance_spot_balances':
                const balances = await spotAPI.getBalances();
                const formattedBalances = balances
                    .map((balance) => ({
                    asset: balance.asset,
                    free: parseFloat(balance.free),
                    locked: parseFloat(balance.locked),
                    total: parseFloat(balance.free) + parseFloat(balance.locked),
                }))
                    .filter((balance) => balance.total > 0);
                return {
                    success: true,
                    data: ResultFormatter.formatSpotBalances(formattedBalances),
                };
            case 'binance_portfolio_account':
                const portfolioAccount = await futuresAPI.getPortfolioAccount();
                return {
                    success: true,
                    data: {
                        totalMarginBalance: parseFloat(portfolioAccount.totalMarginBalance),
                        totalPositionInitialMargin: parseFloat(portfolioAccount.totalPositionInitialMargin),
                        totalOpenOrderInitialMargin: parseFloat(portfolioAccount.totalOpenOrderInitialMargin),
                        totalCrossWalletBalance: parseFloat(portfolioAccount.totalCrossWalletBalance),
                        totalCrossUnPnl: parseFloat(portfolioAccount.totalCrossUnPnl),
                        availableBalance: parseFloat(portfolioAccount.availableBalance),
                        maxWithdrawAmount: parseFloat(portfolioAccount.maxWithdrawAmount),
                        assets: portfolioAccount.assets
                            ?.map((asset) => ({
                            asset: asset.asset,
                            walletBalance: parseFloat(asset.walletBalance),
                            unrealizedProfit: parseFloat(asset.unrealizedProfit),
                            marginBalance: parseFloat(asset.marginBalance),
                            maintMargin: parseFloat(asset.maintMargin),
                            initialMargin: parseFloat(asset.initialMargin),
                            positionInitialMargin: parseFloat(asset.positionInitialMargin),
                            openOrderInitialMargin: parseFloat(asset.openOrderInitialMargin),
                            maxWithdrawAmount: parseFloat(asset.maxWithdrawAmount),
                        }))
                            .filter((asset) => asset.walletBalance > 0) || [],
                    },
                };
            case 'binance_futures_positions':
                // 验证symbol参数（如果提供）
                let validatedSymbol = args.symbol;
                if (args.symbol) {
                    const symbolValidation = ParameterValidator.validateSymbol(args.symbol, false);
                    if (!symbolValidation.valid) {
                        return {
                            success: false,
                            error: ParameterValidator.formatValidationError(symbolValidation),
                        };
                    }
                    validatedSymbol = symbolValidation.data;
                }
                const positions = await futuresAPI.getPositions(validatedSymbol);
                const formattedPositions = positions.map((position) => ({
                    symbol: position.symbol,
                    positionAmt: parseFloat(position.positionAmt),
                    entryPrice: parseFloat(position.entryPrice),
                    markPrice: parseFloat(position.markPrice),
                    unRealizedProfit: parseFloat(position.unRealizedProfit),
                    liquidationPrice: parseFloat(position.liquidationPrice),
                    leverage: parseFloat(position.leverage),
                    marginType: position.marginType,
                    positionSide: position.positionSide,
                    notional: parseFloat(position.positionAmt) * parseFloat(position.markPrice),
                }));
                return {
                    success: true,
                    data: ResultFormatter.formatFuturesPositions(formattedPositions),
                };
            case 'binance_account_status':
                const [connectivity, serverTime] = await Promise.all([
                    binanceClient.testConnectivity(),
                    binanceClient.getServerTime(),
                ]);
                return {
                    success: true,
                    data: {
                        connectivity: connectivity,
                        serverTime: serverTime,
                        localTime: Date.now(),
                        timeDifference: Date.now() - serverTime,
                        testnet: binanceClient.isTestnet(),
                    },
                };
            default:
                throw new Error(`未知的账户工具: ${name}`);
        }
    }
    catch (error) {
        logger.error(`账户工具执行失败 ${name}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
        };
    }
}
//# sourceMappingURL=account.js.map