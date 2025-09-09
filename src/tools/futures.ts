import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BinanceClient } from '../api/client.js';
import { FuturesAPI } from '../api/futures.js';
import { logger } from '../utils/logger.js';
import { ParameterValidator } from '../utils/validation.js';
import { ResultFormatter } from '../utils/formatter.js';

export function createFuturesTools(binanceClient: BinanceClient): Tool[] {
  return [
    {
      name: 'binance_futures_place_order',
      description: `【合约下单】在Binance永续合约市场提交交易订单

📋 **功能说明**
- 支持USDT永续合约和币本位合约交易
- 包括开仓、平仓、加仓、减仓等操作
- 支持多种订单类型：市价、限价、止损、止盈
- 自动计算保证金需求和风险参数

⚠️ **重要提醒**
- 合约交易具有高风险，可能导致全部本金亏损
- 下单前请确保账户有足够保证金
- 建议设置合理的止损止盈策略
- 注意杠杆倍数对风险的放大效应

🎯 **适用场景**
- 看多看空某个资产的价格走势
- 利用杠杆放大投资收益
- 对冲现货持仓风险
- 执行量化交易策略

📊 **输出示例**
成功下单后将返回：
\`\`\`
🚀 合约下单成功

📋 订单详情
订单编号：#123456789
合约类型：BTCUSDT 永续合约
交易方向：买入开多仓 (看涨)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
下单时间：2022-01-01 08:00:00

📈 执行状态
当前状态：已提交，等待成交
已成交：0 BTC (0%)
剩余数量：0.001 BTC
预计成交金额：45 USDT

💰 保证金情况
使用杠杆：10倍 (高风险)
所需保证金：4.5 USDT
账户余额：1,000 USDT
可用余额：995.5 USDT
保证金率：0.45%

📊 盈亏预测
盈亏平衡点：45,000 USDT
上涨10%盈利：+45 USDT (1000%收益)
下跌10%亏损：-45 USDT (-1000%亏损)

⚠️ 风险提醒
合约交易具有极高风险，10倍杠杆可能导致快速爆仓！
强烈建议设置止损价格，控制风险敞口。
密切关注市场变化，及时调整策略。

🎯 建议操作
- 立即设置止损订单
- 关注强制平仓价格
- 准备应急平仓方案
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `合约交易对（必填）
            
• USDT永续合约：如BTCUSDT、ETHUSDT
• 币本位合约：如BTCUSD_PERP、ETHUSD_PERP
• 区分大小写，必须完全匹配Binance支持的合约
• 可通过binance_exchange_info查看完整列表

💡 合约选择：
- 新手推荐：USDT永续合约（如BTCUSDT）
- 高级用户：币本位合约（如BTCUSD_PERP）`,
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BTCUSD_PERP', 'ETHUSD_PERP'],
          },
          side: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: `交易方向（必填）
            
• BUY：买入方向
  - 单向持仓：开多仓或平空仓
  - 双向持仓：增加多头持仓
• SELL：卖出方向  
  - 单向持仓：开空仓或平多仓
  - 双向持仓：增加空头持仓

💡 方向选择：
- 看涨：选择BUY开多仓
- 看跌：选择SELL开空仓`,
          },
          positionSide: {
            type: 'string',
            enum: ['BOTH', 'LONG', 'SHORT'],
            description: `持仓方向（可选，默认BOTH）
            
• BOTH：单向持仓模式（推荐新手）
  - 同一合约只能持有一个方向
  - 操作简单，风险控制清晰
• LONG：多头方向（双向持仓模式）
  - 专门用于多头操作
• SHORT：空头方向（双向持仓模式）
  - 专门用于空头操作

💡 模式建议：
- 新手：使用BOTH模式
- 对冲需求：使用LONG/SHORT模式`,
          },
          type: {
            type: 'string',
            enum: ['MARKET', 'LIMIT', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET'],
            description: `订单类型（必填）
            
• MARKET：市价单，立即按当前价格成交
• LIMIT：限价单，指定价格挂单等待成交
• STOP：限价止损单，触发后按限价成交
• TAKE_PROFIT：限价止盈单，触发后按限价成交
• STOP_MARKET：市价止损单，触发后按市价成交
• TAKE_PROFIT_MARKET：市价止盈单，触发后按市价成交

💡 类型选择：
- 快速成交：MARKET
- 精确价格：LIMIT
- 风险管理：STOP/TAKE_PROFIT`,
          },
          quantity: {
            type: 'number',
            description: `交易数量（必填）
            
• 基础资产的数量，如BTCUSDT中表示BTC数量
• 必须符合合约的最小下单量要求
• 必须符合精度要求（小数位数）
• 建议使用binance_check_order_precision预检查

💡 数量计算：
- BTCUSDT最小：0.001 BTC
- ETHUSDT最小：0.001 ETH
- 注意区分张数和价值`,
            minimum: 0.001,
          },
          price: {
            type: 'number',
            description: `委托价格（限价单必填）
            
• 仅限价单（LIMIT、STOP、TAKE_PROFIT）需要
• 市价单无需填写此参数
• 必须符合价格精度要求
• 建议参考当前标记价格设定

💡 价格策略：
- 开多：价格略高于当前价更易成交
- 开空：价格略低于当前价更易成交
- 止损：设置合理的风险承受范围`,
            minimum: 0.01,
          },
          timeInForce: {
            type: 'string',
            enum: ['GTC', 'IOC', 'FOK', 'GTX'],
            description: `订单有效期（可选，默认GTC）
            
• GTC：Good Till Cancel，一直有效直到撤销
• IOC：Immediate Or Cancel，立即成交可成交部分
• FOK：Fill Or Kill，立即全部成交，否则撤销
• GTX：Good Till Crossing，只挂单不成交

💡 选择建议：
- 普通交易：GTC
- 快速成交：IOC
- 全部成交：FOK`,
          },
          reduceOnly: {
            type: 'boolean',
            description: `只减仓模式（可选，默认false）
            
• true：只减仓单，只能减少持仓，不能增加
• false：普通单，可开仓或平仓
• 平仓时建议设为true避免过度开仓
• 用于风险控制和精确平仓

💡 使用场景：
- 平仓操作：设为true
- 开仓操作：设为false`,
          },
          stopPrice: {
            type: 'number',
            description: `触发价格（止损止盈单必填）
            
• 当标记价格达到此价格时触发订单
• 仅用于STOP和TAKE_PROFIT类订单
• 止损：触发价格应低于入场价（多头）
• 止盈：触发价格应高于入场价（多头）

💡 设置建议：
- 止损：3-5%的价格回撤
- 止盈：根据风险收益比设定`,
            minimum: 0.01,
          },
          closePosition: {
            type: 'boolean',
            description: `全仓平仓（可选，默认false）
            
• true：市价全平该方向的所有持仓
• false：按指定数量下单
• 设为true时会忽略quantity参数
• 适用于紧急平仓或一键清仓

💡 使用场景：
- 紧急平仓：设为true
- 部分平仓：设为false并指定quantity`,
          },
        },
        required: ['symbol', 'side', 'type', 'quantity'],
      },
    },
    {
      name: 'binance_futures_cancel_order',
      description: `【合约撤单】取消合约市场的指定委托订单

📋 **功能说明**
- 撤销状态为NEW（新建）或PARTIALLY_FILLED（部分成交）的合约订单
- 立即释放占用的保证金到可用余额
- 返回被撤销订单的详细信息和保证金变动

⚠️ **重要提醒**
- 只能撤销未完全成交的订单
- 已成交或已撤销的订单无法再次撤销
- 撤销后保证金立即释放，可用于新的交易

🎯 **适用场景**
- 市场走势与预期不符时及时撤单
- 调整交易策略清理旧委托
- 紧急风险控制撤销危险订单

📊 **输出示例**
成功撤销后将返回：
\`\`\`
✅ 合约订单撤销成功

📋 订单详情
订单编号：#123456789
合约类型：BTCUSDT 永续合约
原始数量：0.001 BTC
委托价格：45,000 USDT
最终状态：已撤销

📈 成交情况
已成交：0 BTC (完全未成交)
撤销数量：0.001 BTC
撤销时间：2022-01-01 08:15:30

💰 保证金释放
释放保证金：4.5 USDT
可用余额：增加 4.5 USDT
持仓保证金：无变化

✨ 操作结果
合约订单已成功从交易所撤销，占用的保证金已释放。
现在可以重新制定交易策略或调整订单价格。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `合约交易对（必填）
            
• 必须与下单时的合约完全一致
• 支持USDT永续合约和币本位合约
• 区分大小写，不能有任何拼写错误
• 可通过binance_futures_open_orders查看当前委托

💡 注意事项：
- 合约名称必须精确匹配
- 建议先查询委托订单确认合约名称`,
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          orderId: {
            type: 'number',
            description: `订单ID（必填）
            
• Binance系统生成的唯一订单标识符
• 可从以下途径获取：
  - 合约下单时返回的orderId
  - binance_futures_open_orders查询结果
  - binance_futures_order_history历史记录
• 这是一个长整数，范围很大

💡 获取方式：
- 优先使用下单返回的orderId
- 批量撤销可先查询委托订单列表`,
            minimum: 1,
          },
        },
        required: ['symbol', 'orderId'],
      },
    },
    {
      name: 'binance_futures_open_orders',
      description: `【合约委托查询】查询合约市场当前所有未成交的委托订单

📋 **功能说明**
- 查询状态为NEW（新建）或PARTIALLY_FILLED（部分成交）的合约订单
- 支持按合约筛选或查询全部合约
- 实时返回订单价格、数量、保证金占用等详细信息

⚠️ **重要提醒**
- 只显示未完全成交的订单
- 显示每个订单占用的保证金情况
- 查询全部时可能返回大量数据，建议指定合约

🎯 **适用场景**
- 检查当前持仓和委托状态
- 批量撤销前查看委托列表
- 监控杠杆使用和保证金占用
- 风险管理和持仓分析

📊 **输出示例**
查询成功后将返回：
\`\`\`
🔍 合约委托订单查询结果

📊 整体概况
查询范围：BTCUSDT 永续合约
发现订单：3 个未成交委托
总委托价值：约 135 USDT
占用保证金：13.5 USDT (10倍杠杆)

📋 委托详情

🟡 订单 #123456789 [等待成交]
合约类型：BTCUSDT 永续合约
交易方向：买入开多仓 (看涨)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
成交进度：0 BTC (0%)
占用保证金：4.5 USDT
下单时间：2022-01-01 08:00:00

🟡 订单 #123456790 [部分成交]
合约类型：BTCUSDT 永续合约
交易方向：卖出开空仓 (看跌)
订单类型：限价单
委托数量：0.002 BTC
委托价格：46,000 USDT
成交进度：0.001 BTC (50%)
占用保证金：4.6 USDT
下单时间：2022-01-01 09:00:00

💰 保证金分析
总占用保证金：13.5 USDT
可用余额：986.5 USDT
保证金使用率：1.35%
风险等级：低风险

💡 建议操作
- 关注市场价格，适时调整委托价格
- 注意保证金使用率，避免过度杠杆
- 可使用撤单功能管理不需要的订单
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `合约交易对（可选，默认查询全部）
            
• 指定合约可提高查询效率和精确度
• 支持USDT永续合约和币本位合约
• 不填写则返回所有合约的委托订单
• 建议优先指定具体合约

💡 使用建议：
- 查看特定合约：填写symbol参数
- 查看全部委托：不填写任何参数
- 数量较多时建议分合约查询`,
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
        },
        required: [],
      },
    },
    {
      name: 'binance_futures_order_history',
      description: `【合约历史订单】查询合约市场的历史订单记录

📋 **功能说明**
- 查询所有历史订单：已成交、已取消、被拒绝、已过期
- 支持时间范围筛选（最大7天）
- 支持分页查询和数量限制
- 包含订单详细状态、成交信息和实现盈亏

⚠️ **重要提醒**
- 每次查询只能指定一个合约
- 时间范围不能超过7天
- 默认按时间倒序返回（最新的在前）
- 数据量大时建议使用limit参数限制

🎯 **适用场景**
- 查看历史交易记录和盈亏情况
- 分析交易策略效果和成功率
- 核对账户盈亏和手续费
- 导出合约交易数据进行分析

📊 **输出示例**
查询成功后将返回：
\`\`\`
📈 合约历史订单查询结果

📊 查询概况
查询期间：2022-01-01 至 2022-01-07 (7天)
合约类型：BTCUSDT 永续合约
找到订单：8 个历史记录

📈 执行统计
✅ 成交订单：5 个 (62.5%)
❌ 撤销订单：3 个 (37.5%)
📊 整体成功率：62.5%

📋 订单详情

✅ 订单 #123456789 [已完成]
交易方向：买入开多仓 (看涨)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
实际成交：0.001 BTC (100%)
成交金额：45 USDT
实现盈亏：+2.5 USDT
下单时间：2022-01-01 08:00:00
完成时间：2022-01-01 08:05:30
执行时长：5分30秒

💡 交易总结
本期间合约交易较为活跃，成交率良好。
建议继续关注市场趋势，优化入场时机。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '必填。要查询的合约，如"BTCUSDT"。每次查询只能指定一个合约。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          orderId: {
            type: 'number',
            description: '指定订单ID，返回该订单ID及之后的订单。可用于分页查询。',
            minimum: 1,
          },
          startTime: {
            type: 'number',
            description: '查询开始时间，13位时间戳（毫秒）。与endTime配合使用，最大查询范围7天。',
            minimum: 1000000000000,
          },
          endTime: {
            type: 'number',
            description: '查询结束时间，13位时间戳（毫秒）。必须大于startTime，最大查询范围7天。',
            minimum: 1000000000000,
          },
          limit: {
            type: 'number',
            description: '返回订单数量限制。默认500，最大1000。',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'binance_futures_change_leverage',
      description: `【合约杠杆调整】修改指定合约的杠杆倍数

📋 **功能说明**
- 调整指定合约的杠杆倍数（1-125倍）
- 影响该合约的保证金需求和风险水平
- 立即生效，影响后续所有交易
- 不影响当前持仓，只影响新订单

⚠️ **重要提醒**
- 高杠杆意味着高风险和高收益
- 建议在无持仓时调整杠杆
- 杠杆越高，强制平仓风险越大
- 新手建议使用低杠杆（1-5倍）

🎯 **适用场景**
- 根据市场波动调整风险敞口
- 优化资金使用效率
- 适应不同的交易策略
- 风险管理和资金配置

📊 **输出示例**
杠杆调整后将返回：
\`\`\`
⚙️ 合约杠杆调整成功

📋 调整详情
合约类型：BTCUSDT 永续合约
原杠杆：5倍
新杠杆：10倍
调整时间：2022-01-01 08:30:00

💰 保证金影响
原保证金需求：20% (5倍杠杆)
新保证金需求：10% (10倍杠杆)
保证金效率：提升 100%

📊 风险分析
风险等级：由 中等 提升至 高等
价格敏感度：提升 100%
潜在收益：放大 100%
潜在亏损：放大 100%

⚠️ 风险提醒
杠杆已调整为10倍，风险显著增加！
建议设置更严格的止损策略。
密切关注持仓状况，避免强制平仓。

💡 建议操作
- 立即检查当前持仓风险
- 调整止损止盈策略
- 考虑降低仓位大小
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '要修改杠杆的合约，如"BTCUSDT"。每个合约的杠杆设置独立。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          leverage: {
            type: 'number',
            description: '杠杆倍数，范围1-125。具体最大值取决于合约和账户等级。高杠杆意味着高风险。',
            minimum: 1,
            maximum: 125,
          },
        },
        required: ['symbol', 'leverage'],
      },
    },
    {
      name: 'binance_futures_set_margin_type',
      description: `【合约保证金模式】设置指定合约的保证金模式

📋 **功能说明**
- 设置合约保证金模式：逐仓或全仓
- 影响该合约的风险管理和资金利用效率
- 立即生效，不影响当前持仓
- 每个合约可以独立设置不同的模式

⚠️ **重要提醒**
- 逐仓：风险隔离，但资金利用率低
- 全仓：资金利用率高，但风险集中
- 建议在无持仓时调整保证金模式
- 新手建议使用逐仓模式

🎯 **适用场景**
- 根据风险偏好选择保证金模式
- 优化资金配置和使用效率
- 适应不同的交易策略和风险管理

📊 **输出示例**
模式设置后将返回：
\`\`\`
⚙️ 合约保证金模式设置成功

📋 设置详情
合约类型：BTCUSDT 永续合约
原模式：全仓模式 (CROSSED)
新模式：逐仓模式 (ISOLATED)
设置时间：2022-01-01 08:30:00

💰 保证金影响
资金管理：由 全局共享 变为 独立隔离
风险控制：由 集中风险 变为 风险隔离
资金利用：由 高效率 变为 低效率

📊 模式对比
逐仓模式 (ISOLATED)：
✅ 风险隔离，各合约独立
✅ 不会影响其他合约
❌ 资金利用率相对较低
❌ 需要单独管理每个合约的保证金

💡 建议操作
- 检查当前持仓和保证金状况
- 考虑调整其他合约的保证金模式
- 制定相应的风险管理策略
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '要设置保证金模式的合约，如"BTCUSDT"。每个合约的保证金模式独立设置。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          marginType: {
            type: 'string',
            enum: ['ISOLATED', 'CROSSED'],
            description:
              'ISOLATED=逐仓模式（风险隔离，只用该合约的保证金），CROSSED=全仓模式（使用账户全部可用余额作为保证金）',
          },
        },
        required: ['symbol', 'marginType'],
      },
    },
    {
      name: 'binance_futures_trade_history',
      description: `【合约成交记录】查询合约市场的实际成交明细

📋 **功能说明**
- 查询每笔实际成交的详细信息
- 包含成交价格、数量、手续费、实现盈亏
- 支持时间范围和分页查询
- 可用于精确核对交易成本和实际收益

⚠️ **重要提醒**
- 只显示实际成交的交易，不包含未成交订单
- 每次查询限定一个合约
- 时间范围不能超过7天
- 包含正负盈亏和资金费用信息

🎯 **适用场景**
- 精确计算合约交易成本和净收益
- 核对账户盈亏变动明细
- 分析成交价格和市场时机
- 导出合约交易数据用于税务申报

📊 **输出示例**
查询成功后将返回：
\`\`\`
💰 合约成交记录查询结果

📊 成交概况
查询期间：最近7天
合约类型：BTCUSDT 永续合约
成交笔数：5 笔实际交易
总成交额：225 USDT
总手续费：0.45 USDT
实现盈亏：+12.3 USDT
平均价格：45,000 USDT

📋 成交明细

💵 成交 #987654321
关联订单：#123456789
成交时间：2022-01-01 08:05:30
交易角色：买方 (Taker)
成交价格：45,000 USDT
成交数量：0.001 BTC
成交金额：45 USDT
手续费：0.09 USDT (0.2%)
实现盈亏：+2.5 USDT
持仓变化：+0.001 BTC (多头)

💵 成交 #987654322
关联订单：#123456790
成交时间：2022-01-01 10:15:20
交易角色：卖方 (Maker)
成交价格：46,000 USDT
成交数量：0.001 BTC
成交金额：46 USDT
手续费：0.046 USDT (0.1%)
实现盈亏：+3.8 USDT
持仓变化：-0.001 BTC (平多)

📈 盈亏分析
总买入：0.003 BTC (花费 135.27 USDT)
总卖出：0.002 BTC (收入 91.95 USDT)
当前持仓：0.001 BTC (多头)
实现盈亏：+12.3 USDT
未实现盈亏：+1.0 USDT
总盈亏：+13.3 USDT
收益率：+9.8%

💡 交易提示
合约成交记录完整，盈亏计算准确。
建议定期核对成交数据与账户余额。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '必填。要查询的合约，如"BTCUSDT"。每次查询只能指定一个合约。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          startTime: {
            type: 'number',
            description: '查询开始时间，13位时间戳（毫秒）。与endTime配合使用，最大查询范围7天。',
            minimum: 1000000000000,
          },
          endTime: {
            type: 'number',
            description: '查询结束时间，13位时间戳（毫秒）。必须大于startTime，最大查询范围7天。',
            minimum: 1000000000000,
          },
          fromId: {
            type: 'number',
            description: '从指定交易ID开始返回记录。可用于分页查询，获取该ID之后的交易记录。',
            minimum: 1,
          },
          limit: {
            type: 'number',
            description: '返回交易记录数量限制。默认500，最大1000。',
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'binance_futures_cancel_all_orders',
      description: `【合约批量撤单】一键取消指定合约的所有委托订单

📋 **功能说明**
- 批量取消NEW（新建）和PARTIALLY_FILLED（部分成交）状态的订单
- 一次性清除指定合约的所有未成交委托
- 返回每个订单的撤销结果和保证金释放信息
- 操作不可逆转，请谨慎使用

⚠️ **危险操作警告**
- 这是一个危险操作，会撤销该合约的所有挂单
- 撤销后订单无法恢复，可能影响交易策略
- 建议在市场波动剧烈时或紧急情况下使用
- 操作前请确认合约名称和当前委托情况

🎯 **适用场景**
- 市场急剧变化需要快速清仓
- 策略失效需要重新布局
- 系统维护前清理挂单
- 避免不必要的成交风险

📊 **输出示例**
批量撤销后将返回：
\`\`\`
🚨 合约批量撤单操作完成

📊 执行概况
合约类型：BTCUSDT 永续合约
发现订单：6 个委托订单
成功撤销：5 个订单 ✅
撤销失败：1 个订单 ❌
操作成功率：83.3%

📋 详细执行结果

✅ 订单 #123456789 [撤销成功]
释放保证金：4.5 USDT
处理时间：2022-01-01 10:30:01

✅ 订单 #123456790 [撤销成功]
释放保证金：5.2 USDT
处理时间：2022-01-01 10:30:01

❌ 订单 #123456791 [撤销失败]
失败原因：订单已完全成交，无法撤销
处理时间：2022-01-01 10:30:02

💰 保证金变动汇总
总释放金额：24.7 USDT
可用余额增加：+24.7 USDT
占用保证金清零：-24.7 USDT

⚠️ 重要提醒
所有未成交的合约委托订单已成功清理！
占用的保证金已全部释放到可用余额。
现在可以重新制定交易策略或下新单。

🎯 后续建议
- 重新评估市场情况和持仓风险
- 调整委托价格策略和杠杆设置
- 考虑分批建仓或逐步建仓方式
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '必填。要取消订单的合约，如"BTCUSDT"。将取消该合约的所有委托订单。请谨慎操作。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'binance_futures_close_position',
      description: `【合约平仓】市价一键平仓指定合约的所有持仓

📋 **功能说明**
- 市价立即平仓指定合约的持仓
- 自动计算平仓方向和数量，无需手动计算
- 支持单向和双向持仓模式
- 立即释放所有占用的保证金

⚠️ **重要提醒**
- 这是一个不可逆转的操作，请确认后操作
- 平仓前请确认当前持仓信息和盈亏情况
- 市价平仓可能存在滑点，影响最终成交价格
- 建议在流动性好的时间段操作

🎯 **适用场景**
- 紧急情况下快速清仓止损
- 市场反转时及时退出持仓
- 策略调整时清理现有持仓
- 风险管理和资金重新配置

📊 **输出示例**
平仓成功后将返回：
\`\`\`
✅ 合约平仓操作成功

📋 平仓详情
合约类型：BTCUSDT 永续合约
平仓方式：市价平仓
平仓方向：平多头持仓
平仓数量：0.005 BTC
平仓时间：2022-01-01 10:45:15

📈 成交情况
平均成交价：45,800 USDT
成交金额：229 USDT
手续费：0.458 USDT (0.2%)
滑点成本：-2 USDT (-0.44%)

💰 持仓盈亏
入场平均价：44,500 USDT
平仓平均价：45,800 USDT
价差盈亏：+6.5 USDT (+2.92%)
实现盈亏：+6.042 USDT (减去手续费)
持仓时间：2天 3小时

💳 保证金变化
释放保证金：22.9 USDT
可用余额增加：+28.942 USDT
账户总余额：1,028.942 USDT

✨ 操作结果
合约持仓已成功平仓，盈亏已实现！
所有保证金已释放，资金可用于新的交易。

💡 后续建议
- 总结本次交易经验和盈亏情况
- 评估市场环境和下一步策略
- 考虑资金管理和风险控制
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: '必填。要平仓的合约，如"BTCUSDT"。将平掉该合约的持仓。',
            examples: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
          },
          positionSide: {
            type: 'string',
            enum: ['BOTH', 'LONG', 'SHORT'],
            description:
              '指定平仓的方向：BOTH=所有持仓（默认），LONG=只平多头持仓，SHORT=只平空头持仓。用于双向持仓模式的精确控制。',
          },
        },
        required: ['symbol'],
      },
    },
  ];
}

export async function handleFuturesTool(name: string, args: any, binanceClient: BinanceClient): Promise<any> {
  const futuresAPI = new FuturesAPI(binanceClient);

  try {
    switch (name) {
      case 'binance_futures_place_order':
        const order = await futuresAPI.placeOrder({
          symbol: args.symbol,
          side: args.side,
          positionSide: args.positionSide || 'BOTH',
          type: args.type,
          quantity: args.quantity,
          price: args.price,
          timeInForce: args.timeInForce || 'GTC',
          reduceOnly: args.reduceOnly,
          stopPrice: args.stopPrice,
          closePosition: args.closePosition,
        });

        return {
          success: true,
          data: {
            orderId: order.orderId,
            clientOrderId: order.clientOrderId,
            symbol: order.symbol,
            side: order.side,
            positionSide: order.positionSide,
            type: order.type,
            quantity: parseFloat(order.origQty),
            price: order.price ? parseFloat(order.price) : null,
            avgPrice: order.avgPrice ? parseFloat(order.avgPrice) : null,
            executedQty: parseFloat(order.executedQty),
            status: order.status,
            timeInForce: order.timeInForce,
            reduceOnly: order.reduceOnly,
            stopPrice: order.stopPrice ? parseFloat(order.stopPrice) : null,
            time: order.time,
            updateTime: order.updateTime,
          },
        };

      case 'binance_futures_cancel_order':
        const cancelledOrder = await futuresAPI.cancelOrder(args.symbol, args.orderId);
        return {
          success: true,
          data: {
            orderId: cancelledOrder.orderId,
            clientOrderId: cancelledOrder.clientOrderId,
            symbol: cancelledOrder.symbol,
            side: cancelledOrder.side,
            type: cancelledOrder.type,
            origQty: parseFloat(cancelledOrder.origQty),
            price: cancelledOrder.price ? parseFloat(cancelledOrder.price) : null,
            executedQty: parseFloat(cancelledOrder.executedQty),
            status: cancelledOrder.status,
          },
        };

      case 'binance_futures_open_orders':
        const openOrders = await futuresAPI.getOpenOrders(args.symbol);
        return {
          success: true,
          data: openOrders.map((order) => ({
            orderId: order.orderId,
            clientOrderId: order.clientOrderId,
            symbol: order.symbol,
            side: order.side,
            positionSide: order.positionSide,
            type: order.type,
            quantity: parseFloat(order.origQty),
            price: order.price ? parseFloat(order.price) : null,
            executedQty: parseFloat(order.executedQty),
            status: order.status,
            timeInForce: order.timeInForce,
            reduceOnly: order.reduceOnly,
            stopPrice: order.stopPrice ? parseFloat(order.stopPrice) : null,
            time: order.time,
            updateTime: order.updateTime,
          })),
        };

      case 'binance_futures_order_history':
        const orderHistory = await futuresAPI.getOrderHistory({
          symbol: args.symbol,
          orderId: args.orderId,
          startTime: args.startTime,
          endTime: args.endTime,
          limit: args.limit,
        });

        return {
          success: true,
          data: orderHistory.map((order) => ({
            orderId: order.orderId,
            clientOrderId: order.clientOrderId,
            symbol: order.symbol,
            side: order.side,
            positionSide: order.positionSide,
            type: order.type,
            origType: order.origType,
            quantity: parseFloat(order.origQty),
            price: order.price ? parseFloat(order.price) : null,
            avgPrice: order.avgPrice ? parseFloat(order.avgPrice) : null,
            executedQty: parseFloat(order.executedQty),
            cumQuote: parseFloat(order.cumQuote),
            status: order.status,
            timeInForce: order.timeInForce,
            reduceOnly: order.reduceOnly,
            closePosition: order.closePosition,
            stopPrice: order.stopPrice ? parseFloat(order.stopPrice) : null,
            time: order.time,
            updateTime: order.updateTime,
          })),
        };

      case 'binance_futures_change_leverage':
        const leverageResult = await futuresAPI.changeLeverage(args.symbol, args.leverage);
        return {
          success: true,
          data: {
            symbol: leverageResult.symbol,
            leverage: leverageResult.leverage,
            maxNotionalValue: leverageResult.maxNotionalValue,
          },
        };

      case 'binance_futures_set_margin_type':
        await futuresAPI.setMarginType(args.symbol, args.marginType);
        return {
          success: true,
          data: {
            symbol: args.symbol,
            marginType: args.marginType,
          },
        };

      case 'binance_futures_trade_history':
        const trades = await futuresAPI.getUserTrades({
          symbol: args.symbol,
          startTime: args.startTime,
          endTime: args.endTime,
          fromId: args.fromId,
          limit: args.limit,
        });

        return {
          success: true,
          data: trades.map((trade) => ({
            id: trade.id,
            orderId: trade.orderId,
            symbol: trade.symbol,
            side: trade.side,
            price: parseFloat(trade.price),
            qty: parseFloat(trade.qty),
            realizedPnl: parseFloat(trade.realizedPnl),
            marginAsset: trade.marginAsset,
            quoteQty: parseFloat(trade.quoteQty),
            commission: parseFloat(trade.commission),
            commissionAsset: trade.commissionAsset,
            time: trade.time,
            positionSide: trade.positionSide,
            buyer: trade.buyer,
            maker: trade.maker,
          })),
        };

      case 'binance_futures_cancel_all_orders':
        const openOrdersToCancel = await futuresAPI.getOpenOrders(args.symbol);
        const cancelResults = [];

        for (const order of openOrdersToCancel) {
          try {
            const cancelled = await futuresAPI.cancelOrder(args.symbol, order.orderId);
            cancelResults.push({
              orderId: cancelled.orderId,
              status: 'CANCELLED',
              success: true,
            });
          } catch (error) {
            cancelResults.push({
              orderId: order.orderId,
              status: 'FAILED',
              success: false,
              error: error instanceof Error ? error.message : '取消失败',
            });
          }
        }

        return {
          success: true,
          data: {
            totalOrders: openOrdersToCancel.length,
            cancelled: cancelResults.filter((r) => r.success).length,
            failed: cancelResults.filter((r) => !r.success).length,
            results: cancelResults,
          },
        };

      case 'binance_futures_close_position':
        const positions = await futuresAPI.getPositions(args.symbol);
        const closeResults = [];

        for (const position of positions) {
          if (parseFloat(position.positionAmt) === 0) continue;

          const positionAmt = Math.abs(parseFloat(position.positionAmt));
          const side = parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY';

          if (args.positionSide && args.positionSide !== 'BOTH' && position.positionSide !== args.positionSide) {
            continue;
          }

          try {
            const closeOrder = await futuresAPI.placeOrder({
              symbol: args.symbol,
              side,
              positionSide: position.positionSide as any,
              type: 'MARKET',
              quantity: positionAmt,
              reduceOnly: true,
            });

            closeResults.push({
              symbol: position.symbol,
              positionSide: position.positionSide,
              orderId: closeOrder.orderId,
              status: 'CLOSED',
              success: true,
              closedAmount: positionAmt,
            });
          } catch (error) {
            closeResults.push({
              symbol: position.symbol,
              positionSide: position.positionSide,
              status: 'FAILED',
              success: false,
              error: error instanceof Error ? error.message : '平仓失败',
            });
          }
        }

        return {
          success: true,
          data: {
            totalPositions: positions.length,
            closed: closeResults.filter((r) => r.success).length,
            failed: closeResults.filter((r) => !r.success).length,
            results: closeResults,
          },
        };

      default:
        throw new Error(`未知的合约交易工具: ${name}`);
    }
  } catch (error) {
    logger.error(`合约交易工具执行失败 ${name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
