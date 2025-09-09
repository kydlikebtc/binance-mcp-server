import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BinanceClient } from '../api/client.js';
import { SpotAPI } from '../api/spot.js';
import { logger } from '../utils/logger.js';
import { ParameterValidator, ValidationResult } from '../utils/validation.js';
import { ResultFormatter } from '../utils/formatter.js';

export function createSpotTools(binanceClient: BinanceClient): Tool[] {
  return [
    {
      name: 'binance_spot_place_order',
      description: `【现货下单】在Binance现货市场提交交易订单

📋 **功能说明**
- 支持多种订单类型：市价单、限价单、止损单、止盈单
- 自动验证账户余额和交易对规则
- 实时返回订单执行状态和成交信息

⚠️ **重要提醒**
- 下单前请确保账户有足够余额
- 市价单会立即按市场价格成交
- 限价单需要指定价格，可能部分成交或挂单等待

🎯 **适用场景**
- 购买或出售数字货币
- 设置止盈止损策略
- 执行套利交易策略

📊 **输出示例**
成功下单后将返回：
\`\`\`
✅ 现货下单成功

📋 订单详情
订单编号：#12345678
交易对：BTCUSDT (BTC/USDT现货)
交易方向：买入 (开多仓)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
预计金额：45 USDT

📈 执行状态
当前状态：已提交，等待成交
已成交：0 BTC (0%)
剩余数量：0.001 BTC
下单时间：2022-01-01 08:00:00

💰 资金影响
冻结金额：45 USDT
可用余额：减少 45 USDT

⚠️ 重要提醒
订单已成功提交到交易所，请密切关注市场价格变化。
如需修改或撤销，请使用相应的撤单工具。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（必填）
            
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 常用交易对：BTCUSDT、ETHUSDT、BNBBUSD、ADAUSDT
• 区分大小写，必须完全匹配Binance支持的交易对
• 可通过binance_exchange_info工具查看完整列表`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD', 'ADAUSDT', 'DOTUSDT'],
          },
          side: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: `交易方向（必填）
            
• BUY：买入基础资产（用计价币购买基础币）
  例如：用USDT买入BTC
• SELL：卖出基础资产（卖出基础币获得计价币）
  例如：卖出BTC获得USDT`,
          },
          type: {
            type: 'string',
            enum: [
              'MARKET',
              'LIMIT',
              'STOP_LOSS',
              'STOP_LOSS_LIMIT',
              'TAKE_PROFIT',
              'TAKE_PROFIT_LIMIT',
              'LIMIT_MAKER',
            ],
            description: `订单类型（必填）
            
• MARKET：市价单，立即按当前市场价格成交
• LIMIT：限价单，指定价格挂单，等待成交
• STOP_LOSS：市价止损单，价格触发后按市价成交  
• STOP_LOSS_LIMIT：限价止损单，价格触发后按限价成交
• TAKE_PROFIT：市价止盈单，价格触发后按市价成交
• TAKE_PROFIT_LIMIT：限价止盈单，价格触发后按限价成交
• LIMIT_MAKER：只做挂单方限价单，保证不会立即成交

💡 新手建议：从MARKET（市价单）或LIMIT（限价单）开始`,
          },
          quantity: {
            type: 'number',
            description: `交易数量（必填）
            
• 单位：基础资产的数量
• 例如：BTCUSDT中quantity表示BTC的数量
• 必须大于交易对的最小下单量
• 必须符合交易对的精度要求（小数位数）
• 建议使用binance_check_order_precision工具预检查

💡 示例：
- BTCUSDT最小0.00001 BTC
- ETHUSDT最小0.0001 ETH`,
            minimum: 0.00000001,
          },
          price: {
            type: 'number',
            description: `委托价格（限价单必填，市价单无需填写）
            
• 单位：计价资产的价格
• 例如：BTCUSDT中price表示每个BTC的USDT价格  
• 必须符合交易对的价格精度要求
• 限价单：指定期望的成交价格
• 止损/止盈单：与stopPrice配合使用

💡 定价建议：
- 买单价格略高于当前价：更容易成交
- 卖单价格略低于当前价：更容易成交`,
            minimum: 0.00000001,
          },
          timeInForce: {
            type: 'string',
            enum: ['GTC', 'IOC', 'FOK'],
            description: `订单有效期（可选，默认GTC）
            
• GTC：Good Till Cancel，一直有效直到撤销或成交
• IOC：Immediate Or Cancel，立即成交可成交部分，其余撤销  
• FOK：Fill Or Kill，立即全部成交，否则整单撤销

💡 使用建议：
- 普通交易：使用GTC
- 快速成交：使用IOC
- 全部成交：使用FOK`,
          },
          stopPrice: {
            type: 'number',
            description: `触发价格（止损/止盈订单必填）
            
• 当市场价格达到此价格时触发订单
• 仅适用于：STOP_LOSS、STOP_LOSS_LIMIT、TAKE_PROFIT、TAKE_PROFIT_LIMIT
• 止损：触发价格应低于当前价格（卖单）或高于当前价格（买单）
• 止盈：触发价格应高于当前价格（卖单）或低于当前价格（买单）

💡 设置建议：
- 止损幅度：5-10%较为常见  
- 止盈幅度：根据风险偏好设定`,
            minimum: 0.00000001,
          },
        },
        required: ['symbol', 'side', 'type', 'quantity'],
      },
    },
    {
      name: 'binance_spot_cancel_order',
      description: `【现货撤单】取消现货市场的指定委托订单

📋 **功能说明**
- 撤销状态为NEW（新建）或PARTIALLY_FILLED（部分成交）的订单
- 立即生效，撤销后的订单无法恢复
- 返回被撤销订单的详细信息和执行状态

⚠️ **重要提醒**
- 只能撤销未完全成交的订单
- 已成交（FILLED）或已撤销（CANCELED）的订单无法再次撤销
- 撤销后冻结的余额会立即释放到可用余额

🎯 **适用场景**
- 市场价格变动时主动撤销不合适的挂单
- 策略调整时清理历史委托
- 风险管理中及时止损

📊 **输出示例**
成功撤销后将返回：
\`\`\`
✅ 订单撤销成功

📋 订单详情
订单编号：#12345678
交易对：BTCUSDT (BTC/USDT现货)
原始数量：0.001 BTC
委托价格：45,000 USDT
最终状态：已撤销

📈 成交情况
已成交：0 BTC (完全未成交)
撤销数量：0.001 BTC
撤销时间：2022-01-01 08:15:30

💰 资金释放
释放金额：45 USDT
手续费：0 USDT (未成交)
可用余额：增加 45 USDT

✨ 操作结果
订单已成功从交易所撤销，所有冻结资金已释放到可用余额。
可以重新下单或调整交易策略。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（必填）
            
• 必须与下单时的交易对完全一致
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 区分大小写，不能有任何拼写错误
• 可通过binance_spot_open_orders查看当前委托

💡 注意事项：
- 交易对拼写必须精确匹配
- 建议先查询委托订单确认交易对`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
          },
          orderId: {
            type: 'number',
            description: `订单ID（必填）
            
• Binance系统生成的唯一订单标识符
• 可从以下途径获取：
  - 下单时返回的orderId
  - binance_spot_open_orders查询结果
  - binance_spot_order_history历史记录
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
      name: 'binance_spot_open_orders',
      description: `【现货委托查询】查询现货市场当前所有未成交的委托订单

📋 **功能说明**
- 查询状态为NEW（新建）或PARTIALLY_FILLED（部分成交）的订单
- 支持按交易对筛选或查询全部交易对
- 实时返回订单价格、数量、成交情况等详细信息

⚠️ **重要提醒**
- 只显示未完全成交的订单
- 已成交或已撤销的订单不会显示
- 查询全部时可能返回大量数据，建议指定交易对

🎯 **适用场景**
- 检查当前挂单状态和价格
- 批量撤销前查看委托列表
- 监控订单执行进度
- 策略调整前了解现有持仓

📊 **输出示例**
查询成功后将返回：
\`\`\`
🔍 现货委托订单查询结果

📊 整体概况
查询范围：BTCUSDT 现货交易对
发现订单：2 个未成交委托
总委托价值：约 90 USDT
冻结资金：90 USDT

📋 委托详情

🟡 订单 #12345678
交易对：BTCUSDT (BTC/USDT现货)
交易方向：买入 (做多)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
成交进度：0 BTC (0%)
订单状态：等待成交
下单时间：2022-01-01 08:00:00
预计金额：45 USDT

🟡 订单 #12345679
交易对：BTCUSDT (BTC/USDT现货)
交易方向：卖出 (做空)
订单类型：限价单
委托数量：0.001 BTC
委托价格：46,000 USDT
成交进度：0 BTC (0%)
订单状态：等待成交
下单时间：2022-01-01 09:00:00
预计金额：46 USDT

💡 建议操作
- 可使用撤单功能取消不需要的订单
- 关注市场价格，适时调整委托价格
- 注意冻结资金对可用余额的影响
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（可选，默认查询全部）
            
• 指定交易对可提高查询效率和精确度
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 不填写则返回所有交易对的委托订单
• 建议优先指定具体交易对

💡 使用建议：
- 查看特定交易对：填写symbol参数
- 查看全部委托：不填写任何参数
- 数量较多时建议分交易对查询`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
          },
        },
        required: [],
      },
    },
    {
      name: 'binance_spot_order_history',
      description: `【现货历史订单】查询现货市场的历史订单记录

📋 **功能说明**
- 查询所有历史订单：已成交、已取消、被拒绝、已过期
- 支持时间范围筛选（最大24小时）
- 支持分页查询和数量限制
- 包含订单详细状态和成交信息

⚠️ **重要提醒**
- 每次查询只能指定一个交易对
- 时间范围不能超过24小时
- 默认按时间倒序返回（最新的在前）
- 数据量大时建议使用limit参数限制

🎯 **适用场景**
- 查看历史交易记录和成交情况
- 分析订单执行效果和策略表现
- 核对账户交易明细
- 导出交易数据进行分析

📊 **输出示例**
查询成功后将返回：
\`\`\`
📈 现货历史订单查询结果

📊 查询概况
查询期间：2022-01-01 至 2022-01-02 (24小时)
交易对：BTCUSDT (BTC/USDT现货)
找到订单：5 个历史记录

📈 执行统计
✅ 成交订单：3 个 (60%)
❌ 撤销订单：2 个 (40%)
📊 整体成功率：60%

📋 订单详情

✅ 订单 #12345678 [已完成]
交易方向：买入 (做多)
订单类型：限价单
委托数量：0.001 BTC
委托价格：45,000 USDT
实际成交：0.001 BTC (100%)
成交金额：45 USDT
下单时间：2022-01-01 08:00:00
完成时间：2022-01-01 08:05:30
执行时长：5分30秒

❌ 订单 #12345679 [已撤销]
交易方向：卖出 (做空)
订单类型：限价单
委托数量：0.001 BTC
委托价格：46,000 USDT
撤销原因：用户主动撤销
下单时间：2022-01-01 09:00:00
撤销时间：2022-01-01 10:30:00

💡 交易总结
本期间交易较为活跃，成交率适中。
建议关注市场波动，优化委托价格策略。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（必填）
            
• 每次查询只能指定一个交易对
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 区分大小写，必须完全匹配
• 可通过binance_exchange_info查看支持的交易对

💡 查询技巧：
- 优先查询近期活跃的交易对
- 不同交易对需要分别查询`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
          },
          orderId: {
            type: 'number',
            description: `起始订单ID（可选，用于分页）
            
• 返回该订单ID及之后的订单
• 用于分页查询大量历史数据
• 可从之前查询结果的最后一个订单获取
• 与时间参数可以组合使用

💡 分页使用：
- 首次查询不填写，获取最新订单
- 后续查询使用上次结果的最小orderId`,
            minimum: 1,
          },
          startTime: {
            type: 'number',
            description: `查询开始时间（可选，13位毫秒时间戳）
            
• 格式：1640995200000（对应2022-01-01 00:00:00 UTC）
• 必须与endTime配合使用
• 查询范围最大24小时
• 不填写默认查询最近的订单

💡 时间设置：
- 使用 Date.now() 获取当前时间戳
- 建议查询最近几小时的数据`,
            minimum: 1000000000000,
          },
          endTime: {
            type: 'number',
            description: `查询结束时间（可选，13位毫秒时间戳）
            
• 必须大于startTime
• 与startTime的差值不能超过24小时
• 格式：1640995200000
• 建议设置为当前时间

💡 注意事项：
- endTime - startTime ≤ 24小时
- 建议留出时间缓冲，避免刚好24小时`,
            minimum: 1000000000000,
          },
          limit: {
            type: 'number',
            description: `返回订单数量限制（可选，默认500）
            
• 取值范围：1-1000
• 默认值：500
• 较小值响应更快
• 较大值减少分页次数

💡 数量选择：
- 快速查询：使用100-200
- 批量获取：使用500-1000
- 网络较慢时建议使用小值`,
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'binance_spot_trade_history',
      description: `【现货成交记录】查询现货市场的实际成交明细

📋 **功能说明**
- 查询每笔实际成交的详细信息
- 包含成交价格、数量、手续费、时间等完整数据
- 支持时间范围和分页查询
- 可用于精确核对交易成本和收益

⚠️ **重要提醒**
- 只显示实际成交的交易，不包含未成交订单
- 每次查询限定一个交易对
- 时间范围不能超过24小时
- 包含买方和卖方手续费信息

🎯 **适用场景**
- 精确计算交易成本和净收益
- 核对账户资金变动明细
- 分析成交价格和市场时机
- 导出交易数据用于税务申报

📊 **输出示例**
查询成功后将返回：
\`\`\`
💰 现货成交记录查询结果

📊 成交概况
查询期间：最近24小时
交易对：BTCUSDT (BTC/USDT现货)
成交笔数：3 笔实际交易
总成交额：135 USDT
总手续费：0.135 USDT
平均价格：45,000 USDT

📋 成交明细

💵 成交 #987654321
关联订单：#12345678
成交时间：2022-01-01 08:05:30
交易角色：买方 (Taker)
成交价格：45,000 USDT
成交数量：0.001 BTC
成交金额：45 USDT
手续费：0.045 USDT (0.1%)
净成本：45.045 USDT
实际获得：0.001 BTC

💵 成交 #987654322
关联订单：#12345679
成交时间：2022-01-01 10:15:20
交易角色：卖方 (Maker)
成交价格：46,000 USDT
成交数量：0.001 BTC
成交金额：46 USDT
手续费：0.046 USDT (0.1%)
净收入：45.954 USDT
卖出资产：0.001 BTC

📈 收益分析
总买入：0.001 BTC (花费 45.045 USDT)
总卖出：0.001 BTC (收入 45.954 USDT)
净盈亏：+0.909 USDT
收益率：+2.0%

💡 交易提示
成交记录完整，盈亏计算准确。
建议定期核对成交数据与账户余额。
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（必填）
            
• 每次查询只能指定一个交易对
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 区分大小写，必须完全匹配
• 建议查询有成交记录的活跃交易对

💡 查询技巧：
- 先通过订单历史确认有成交记录
- 按交易对分别查询，便于分析`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
          },
          startTime: {
            type: 'number',
            description: `查询开始时间（可选，13位毫秒时间戳）
            
• 格式：1640995200000
• 必须与endTime配合使用
• 查询范围最大24小时
• 不填写默认查询最近成交记录

💡 时间设置：
- 建议查询最近几小时的数据
- 可使用 Date.now() 获取当前时间戳`,
            minimum: 1000000000000,
          },
          endTime: {
            type: 'number',
            description: `查询结束时间（可选，13位毫秒时间戳）
            
• 必须大于startTime
• 与startTime差值不超过24小时
• 建议设置为当前时间或稍早时间
• 格式：1640995200000

💡 注意事项：
- 时间跨度控制在24小时内
- 预留时间缓冲避免边界问题`,
            minimum: 1000000000000,
          },
          fromId: {
            type: 'number',
            description: `起始交易ID（可选，用于分页）
            
• 从指定交易ID开始返回记录
• 用于分页查询大量成交数据
• 可从之前查询结果的最后一笔成交获取
• 与时间参数可以组合使用

💡 分页使用：
- 首次查询不填写
- 后续查询使用上次结果的最小交易ID`,
            minimum: 1,
          },
          limit: {
            type: 'number',
            description: `返回记录数量限制（可选，默认500）
            
• 取值范围：1-1000
• 默认值：500
• 较小值响应更快，适合实时查询
• 较大值适合批量导出数据

💡 数量选择：
- 实时监控：50-100
- 常规查询：200-500  
- 批量导出：500-1000`,
            minimum: 1,
            maximum: 1000,
          },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'binance_spot_cancel_all_orders',
      description: `【现货批量撤单】一键取消指定交易对的所有委托订单

📋 **功能说明**
- 批量取消NEW（新建）和PARTIALLY_FILLED（部分成交）状态的订单
- 一次性清除指定交易对的所有未成交委托
- 返回每个订单的撤销结果和统计信息
- 操作不可逆转，请谨慎使用

⚠️ **危险操作警告**
- 这是一个危险操作，会撤销该交易对的所有挂单
- 撤销后订单无法恢复，可能影响交易策略
- 建议在市场波动剧烈时或紧急情况下使用
- 操作前请确认交易对和当前委托情况

🎯 **适用场景**
- 市场急剧变化需要快速清仓
- 策略失效需要重新布局
- 系统维护前清理挂单
- 避免不必要的成交风险

📊 **输出示例**
批量撤销后将返回：
\`\`\`
🚨 批量撤单操作完成

📊 执行概况
交易对：BTCUSDT (BTC/USDT现货)
发现订单：5 个委托订单
成功撤销：4 个订单 ✅
撤销失败：1 个订单 ❌
操作成功率：80%

📋 详细执行结果

✅ 订单 #12345678 [撤销成功]
释放资金：45 USDT
处理时间：2022-01-01 10:30:01

✅ 订单 #12345679 [撤销成功]
释放资金：46 USDT
处理时间：2022-01-01 10:30:01

✅ 订单 #12345680 [撤销成功]
释放资金：47 USDT
处理时间：2022-01-01 10:30:02

✅ 订单 #12345681 [撤销成功]
释放资金：42 USDT
处理时间：2022-01-01 10:30:02

❌ 订单 #12345682 [撤销失败]
失败原因：订单已完全成交，无法撤销
处理时间：2022-01-01 10:30:02

💰 资金变动汇总
总释放金额：180 USDT
可用余额增加：+180 USDT
冻结资金清零：-180 USDT

⚠️ 重要提醒
所有未成交的委托订单已成功清理！
冻结资金已全部释放到可用余额。
现在可以重新制定交易策略或下新单。

🎯 后续建议
- 重新评估市场情况
- 调整委托价格策略
- 考虑分批建仓方式
\`\`\``,
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: `交易对符号（必填）
            
• 将取消该交易对的所有未成交订单
• 格式：基础资产+计价资产，如BTCUSDT、ETHUSDT
• 区分大小写，必须精确匹配
• 建议先查询委托列表确认要撤销的订单

⚠️ **危险操作提醒**：
- 操作不可逆，请三思后行
- 建议先使用binance_spot_open_orders查看委托
- 确认交易对无误后再执行

💡 安全建议：
- 紧急情况下使用
- 操作前备份重要订单信息`,
            examples: ['BTCUSDT', 'ETHUSDT', 'BNBBUSD'],
          },
        },
        required: ['symbol'],
      },
    },
  ];
}

export async function handleSpotTool(name: string, args: any, binanceClient: BinanceClient): Promise<any> {
  const spotAPI = new SpotAPI(binanceClient);

  try {
    switch (name) {
      case 'binance_spot_place_order':
        // 参数验证
        const orderValidation = ParameterValidator.validateParameters(args, {
          symbol: { required: true, type: 'symbol' },
          side: { required: true, type: 'side' },
          type: { required: true, type: 'orderType' },
          quantity: { required: true, type: 'quantity' },
          price: { required: args.type !== 'MARKET', type: 'price' },
        });

        if (!orderValidation.valid) {
          return {
            success: false,
            error: ParameterValidator.formatValidationError(orderValidation),
          };
        }

        const validatedArgs = orderValidation.data;
        const warnings = orderValidation.warnings;

        try {
          const order = await spotAPI.placeOrder({
            symbol: validatedArgs.symbol,
            side: validatedArgs.side,
            type: validatedArgs.type,
            quantity: validatedArgs.quantity,
            price: validatedArgs.price,
            timeInForce: args.timeInForce || 'GTC',
            stopPrice: args.stopPrice,
          });

          let result = ResultFormatter.formatSpotOrderSuccess({
            orderId: order.orderId,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            origQty: order.origQty,
            executedQty: order.executedQty,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            price: order.price,
            status: order.status,
            transactTime: (order as any).updateTime || (order as any).transactTime || Date.now(),
          });

          // 添加警告信息
          if (warnings && warnings.length > 0) {
            result = ParameterValidator.formatValidationWarnings(warnings) + '\n\n' + result;
          }

          return {
            success: true,
            data: result,
          };
        } catch (apiError) {
          return {
            success: false,
            error: `下单失败: ${
              apiError instanceof Error ? apiError.message : '未知错误'
            }\n\n💡 常见解决方案:\n• 检查账户余额是否充足\n• 验证价格和数量精度是否正确\n• 确认交易对是否存在且可交易\n• 检查网络连接和API权限`,
          };
        }

      case 'binance_spot_cancel_order':
        const cancelledOrder = await spotAPI.cancelOrder(args.symbol, args.orderId);
        return {
          success: true,
          data: {
            orderId: cancelledOrder.orderId,
            clientOrderId: cancelledOrder.clientOrderId,
            symbol: cancelledOrder.symbol,
            status: cancelledOrder.status,
            origQty: parseFloat(cancelledOrder.origQty),
            executedQty: parseFloat(cancelledOrder.executedQty),
            price: cancelledOrder.price ? parseFloat(cancelledOrder.price) : null,
          },
        };

      case 'binance_spot_open_orders':
        const openOrders = await spotAPI.getOpenOrders(args.symbol);
        return {
          success: true,
          data: openOrders.map((order) => ({
            orderId: order.orderId,
            clientOrderId: order.clientOrderId,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            quantity: parseFloat(order.origQty),
            price: order.price ? parseFloat(order.price) : null,
            executedQty: parseFloat(order.executedQty),
            status: order.status,
            timeInForce: order.timeInForce,
            workingTime: order.workingTime,
          })),
        };

      case 'binance_spot_order_history':
        const orderHistory = await spotAPI.getOrderHistory({
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
            type: order.type,
            quantity: parseFloat(order.origQty),
            price: order.price ? parseFloat(order.price) : null,
            executedQty: parseFloat(order.executedQty),
            cummulativeQuoteQty: parseFloat(order.cummulativeQuoteQty),
            status: order.status,
            timeInForce: order.timeInForce,
            workingTime: order.workingTime,
          })),
        };

      case 'binance_spot_trade_history':
        const trades = await spotAPI.getTrades({
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
            price: parseFloat(trade.price),
            qty: parseFloat(trade.qty),
            quoteQty: parseFloat(trade.quoteQty),
            commission: parseFloat(trade.commission),
            commissionAsset: trade.commissionAsset,
            time: trade.time,
            isBuyer: trade.isBuyer,
            isMaker: trade.isMaker,
          })),
        };

      case 'binance_spot_cancel_all_orders':
        const openOrdersToCancel = await spotAPI.getOpenOrders(args.symbol);
        const cancelResults = [];

        for (const order of openOrdersToCancel) {
          try {
            const cancelled = await spotAPI.cancelOrder(args.symbol, order.orderId);
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

      default:
        throw new Error(`未知的现货交易工具: ${name}`);
    }
  } catch (error) {
    logger.error(`现货交易工具执行失败 ${name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
