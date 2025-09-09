#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'node:http';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { BinanceClient } from './api/client.js';
import { logger } from './utils/logger.js';
import { AuthTokenHandler } from './utils/auth.js';
import { createAccountTools, handleAccountTool } from './tools/account.js';
import { createSpotTools, handleSpotTool } from './tools/spot.js';
import { createFuturesTools, handleFuturesTool } from './tools/futures.js';
import { createMarketTools, handleMarketTool } from './tools/market.js';
import { createAdvancedTools, handleAdvancedTool } from './tools/advanced.js';
// 加载环境变量
dotenv.config();
// HTTP模式下，API配置来自客户端连接；stdio模式下来自环境变量
const serverMode = process.env.SERVER_MODE || 'stdio';
let binanceClient = null;
// HTTP模式下存储从authorization token解析的凭据
let httpModeCredentials = null;
// 从环境变量获取服务器端配置
const serverTestnet = process.env.BINANCE_TESTNET === 'true';
if (serverMode === 'stdio') {
    // stdio模式：验证必要的环境变量
    const requiredEnvVars = ['BINANCE_API_KEY', 'BINANCE_SECRET_KEY'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            logger.error(`缺少必要的环境变量: ${envVar}`);
            logger.error('请在Claude Desktop配置文件中设置API密钥');
            process.exit(1);
        }
    }
    // 初始化Binance客户端
    const binanceConfig = {
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_SECRET_KEY,
        testnet: process.env.BINANCE_TESTNET === 'true',
    };
    try {
        binanceClient = new BinanceClient(binanceConfig);
    }
    catch (error) {
        logger.error('初始化Binance客户端失败:', error);
        process.exit(1);
    }
}
else {
    // HTTP模式：客户端将在连接时提供API配置
    logger.info('HTTP模式：等待客户端连接并提供API配置');
}
// 动态初始化Binance客户端的函数
function initializeBinanceClient(apiKey, apiSecret, testnet = false) {
    const binanceConfig = {
        apiKey,
        apiSecret,
        testnet,
    };
    try {
        binanceClient = new BinanceClient(binanceConfig);
        logger.info('Binance客户端初始化成功');
        return true;
    }
    catch (error) {
        logger.error('初始化Binance客户端失败:', error);
        return false;
    }
}
// 创建MCP服务器
const server = new Server({
    name: 'binance-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// 获取所有工具
const getAllTools = () => {
    if (!binanceClient) {
        // HTTP模式下客户端未初始化时返回空工具列表
        return [];
    }
    return [
        ...createAccountTools(binanceClient),
        ...createSpotTools(binanceClient),
        ...createFuturesTools(binanceClient),
        ...createMarketTools(binanceClient),
        ...createAdvancedTools(binanceClient),
    ];
};
// 处理工具调用
const handleTool = async (name, args) => {
    // 在HTTP模式下，检查是否需要从authorization token中初始化Binance客户端
    if (!binanceClient && serverMode === 'http') {
        if (httpModeCredentials) {
            const success = initializeBinanceClient(httpModeCredentials.apiKey, httpModeCredentials.apiSecret, serverTestnet);
            if (!success) {
                return {
                    success: false,
                    error: '❌ Binance客户端初始化失败，请检查API密钥配置',
                };
            }
        }
        else {
            return {
                success: false,
                error: '❌ 缺少Binance API配置，请在Claude Desktop的MCP配置中设置正确的authorization_token (格式: apiKey.secretKey)',
            };
        }
    }
    if (!binanceClient) {
        return {
            success: false,
            error: '❌ Binance客户端未初始化，请检查配置',
        };
    }
    // 账户管理工具
    if (name.startsWith('binance_account') ||
        name === 'binance_spot_balances' ||
        name === 'binance_portfolio_account' ||
        name === 'binance_futures_positions') {
        return await handleAccountTool(name, args, binanceClient);
    }
    // 现货交易工具
    if (name.startsWith('binance_spot_') &&
        !name.includes('price') &&
        !name.includes('orderbook') &&
        !name.includes('klines') &&
        !name.includes('24hr_ticker')) {
        return await handleSpotTool(name, args, binanceClient);
    }
    // 合约交易工具
    if (name.startsWith('binance_futures_') &&
        !name.includes('price') &&
        !name.includes('klines') &&
        !name.includes('24hr_ticker')) {
        return await handleFuturesTool(name, args, binanceClient);
    }
    // 市场数据工具
    if (name.includes('price') ||
        name.includes('orderbook') ||
        name.includes('klines') ||
        name.includes('24hr_ticker') ||
        name.includes('exchange_info') ||
        name.includes('server_time')) {
        return await handleMarketTool(name, args, binanceClient);
    }
    // 高级分析工具
    if (name.startsWith('binance_calculate_') ||
        name.startsWith('binance_analyze_') ||
        name.startsWith('binance_compare_') ||
        name.startsWith('binance_check_') ||
        name.startsWith('binance_get_')) {
        return await handleAdvancedTool(name, args, binanceClient);
    }
    throw new Error(`未知的工具: ${name}`);
};
// 注册工具列表处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
        const tools = getAllTools();
        logger.info(`返回 ${tools.length} 个可用工具`);
        return { tools };
    }
    catch (error) {
        logger.error('获取工具列表失败:', error);
        throw new McpError(ErrorCode.InternalError, '获取工具列表失败');
    }
});
// 注册工具调用处理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        logger.info(`执行工具: ${name}`, args ? JSON.stringify(args, null, 2) : '');
        const result = await handleTool(name, args || {});
        if (!result.success) {
            logger.warn(`工具执行失败: ${name} - ${result.error}`);
            // 格式化错误消息为用户友好格式
            let errorMessage = result.error;
            if (typeof errorMessage === 'string' && !errorMessage.includes('❌') && !errorMessage.includes('💡')) {
                errorMessage = `❌ 操作失败\n\n${errorMessage}\n\n💡 如需帮助，请检查参数是否正确或联系技术支持。`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: errorMessage,
                    },
                ],
            };
        }
        logger.info(`工具执行成功: ${name}`);
        return {
            content: [
                {
                    type: 'text',
                    text: typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        logger.error(`工具执行异常: ${name} - ${errorMessage}`);
        // 格式化异常消息为用户友好格式
        const formattedError = `❌ 系统异常\n\n工具执行过程中发生异常：${errorMessage}\n\n🔧 建议解决方案：\n• 检查网络连接是否正常\n• 确认API密钥配置是否正确\n• 稍后重试或联系技术支持\n• 查看系统日志获取更多信息`;
        return {
            content: [
                {
                    type: 'text',
                    text: formattedError,
                },
            ],
        };
    }
});
// 启动服务器
async function main() {
    try {
        // 根据启动模式选择不同的初始化策略
        if (serverMode === 'stdio') {
            // stdio模式：立即测试连接
            if (binanceClient) {
                const isConnected = await binanceClient.testConnectivity();
                if (!isConnected) {
                    logger.error('无法连接到Binance API');
                    process.exit(1);
                }
                logger.info('Binance MCP 服务器启动成功');
                logger.info(`连接模式: ${binanceClient.isTestnet() ? '测试网' : '主网'}`);
            }
            const tools = getAllTools();
            logger.info(`可用工具数量: ${tools.length}`);
            logger.info('工具类别分布:');
            logger.info(`  - 账户管理: 5个工具`);
            logger.info(`  - 现货交易: 6个工具`);
            logger.info(`  - 合约交易: 9个工具`);
            logger.info(`  - 市场数据: 9个工具`);
            logger.info(`  - 高级分析: 6个工具`);
            // 标准 stdio 传输模式
            const transport = new StdioServerTransport();
            await server.connect(transport);
            logger.info('MCP 服务器已连接 (stdio模式)，等待请求...');
        }
        else {
            // HTTP模式：延迟初始化，等待客户端连接时提供API配置
            logger.info('Binance MCP HTTP 服务器启动');
            logger.info('等待Claude Desktop客户端连接并提供API配置...');
            // HTTP SSE 传输模式
            const port = parseInt(process.env.PORT || '3000');
            const host = process.env.HOST || '0.0.0.0';
            // 创建HTTP服务器
            // const httpServer = http.createServer((req, res) => {
            //   if (req.method === 'GET' && req.url === '/message') {
            //     // 处理authorization token
            //     const authHeader = req.headers.authorization;
            //     logger.warn('authHeader=======', authHeader);
            //     if (authHeader) {
            //       const credentials = AuthTokenHandler.parseCredentials(authHeader);
            //       logger.warn('credentials-------', credentials);
            //       if (credentials) {
            //         httpModeCredentials = credentials;
            //         logger.info(`Authorization token已解析，测试网模式: ${serverTestnet ? '是' : '否'}`);
            //       } else {
            //         logger.warn(
            //           `无效的authorization token格式，期望格式: apiKey.secretKey---${authHeader}===${JSON.stringify(
            //             credentials,
            //           )}`,
            //         );
            //         res.writeHead(401);
            //         res.end('Unauthorized: Invalid authorization token format. Expected: apiKey.secretKey');
            //         return;
            //       }
            //     } else {
            //       logger.warn('缺少authorization token');
            //       res.writeHead(401);
            //       res.end('Unauthorized: Missing authorization token');
            //       return;
            //     }
            //     // SSE连接处理
            //     const transport = new SSEServerTransport('/message', res);
            //     server.connect(transport).catch((error) => {
            //       logger.error('SSE连接失败:', error);
            //       res.writeHead(500);
            //       res.end('Internal Server Error');
            //     });
            //   } else if (req.method === 'POST' && req.url === '/message') {
            //     // POST消息处理 - 需要根据sessionId路由
            //     res.writeHead(405);
            //     res.end('Method Not Allowed - Use SSE for message transport');
            //   } else {
            //     res.writeHead(404);
            //     res.end('Not Found');
            //   }
            // });
            const httpServer = http.createServer(async (req, res) => {
                if (req.method === 'GET' && req.url === '/message') {
                    // 设置CORS和SSE响应头
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization');
                    res.setHeader('Access-Control-Expose-Headers', 'Content-Length,Content-Range');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Connection', 'keep-alive');
                    res.setHeader('Content-Type', 'text/event-stream');
                    // 处理authorization token
                    const authHeader = req.headers.authorization;
                    logger.warn('authHeader=======', req.headers);
                    logger.warn('authHeader=======', authHeader);
                    if (authHeader) {
                        const credentials = AuthTokenHandler.parseCredentials(authHeader);
                        logger.warn('credentials-------', credentials);
                        if (credentials) {
                            httpModeCredentials = credentials;
                            logger.info(`Authorization token已解析，测试网模式: ${serverTestnet ? '是' : '否'}`);
                        }
                        else {
                            logger.warn(`无效的authorization token格式，期望格式: apiKey.secretKey---${authHeader}===${JSON.stringify(credentials)}`);
                            res.writeHead(401);
                            res.end('Unauthorized: Invalid authorization token format. Expected: apiKey.secretKey');
                            return;
                        }
                    }
                    else {
                        logger.warn('缺少authorization token');
                        res.writeHead(401);
                        res.end('Unauthorized: Missing authorization token');
                        return;
                    }
                    // SSE连接处理
                    logger.info('开始建立SSE连接...');
                    const transport = new SSEServerTransport('/message', res);
                    logger.info('transport sessionId...', transport.sessionId);
                    try {
                        await server.connect(transport);
                        logger.info('SSE连接建立成功');
                        // 连接成功后，初始化Binance客户端
                        if (httpModeCredentials) {
                            const success = initializeBinanceClient(httpModeCredentials.apiKey, httpModeCredentials.apiSecret, serverTestnet);
                            if (success) {
                                const tools = getAllTools();
                                logger.info(`HTTP模式初始化完成，可用工具数量: ${tools.length}`);
                                logger.info('工具类别分布:');
                                logger.info(`  - 账户管理: 5个工具`);
                                logger.info(`  - 现货交易: 6个工具`);
                                logger.info(`  - 合约交易: 9个工具`);
                                logger.info(`  - 市场数据: 9个工具`);
                                logger.info(`  - 高级分析: 6个工具`);
                            }
                            else {
                                logger.error('HTTP模式下Binance客户端初始化失败');
                            }
                        }
                        else {
                            logger.warn('HTTP模式下缺少API凭据，无法初始化Binance客户端');
                        }
                    }
                    catch (error) {
                        logger.error('SSE连接失败:', error);
                        res.writeHead(500);
                        res.end('Internal Server Error');
                    }
                }
                else if (req.method === 'OPTIONS' && req.url === '/message') {
                    // 处理预检请求
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization');
                    res.setHeader('Access-Control-Max-Age', '1728000');
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.setHeader('Content-Length', '0');
                    res.writeHead(204);
                    res.end();
                }
                else if (req.method === 'POST' && req.url === '/message') {
                    // POST消息处理 - 需要根据sessionId路由
                    res.writeHead(405);
                    res.end('Method Not Allowed - Use SSE for message transport');
                }
                else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            });
            // await server.connect(new SSEServerTransport('/message', httpServer as unknown as ServerResponse));
            // 启动HTTP服务器
            httpServer.listen(port, host, () => {
                logger.info(`HTTP SSE 服务器启动在端口 ${port}，访问路径: http://${host}:${port}/message`);
                logger.info('💡 提示：请在Claude Desktop的MCP配置中使用以下配置：');
                logger.info(`   "command": "sse",`);
                logger.info(`   "args": ["http://${host}:${port}/message"]`);
            });
        }
    }
    catch (error) {
        logger.error('启动服务器失败:', error);
        process.exit(1);
    }
}
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝:', reason);
    process.exit(1);
});
// 优雅关闭
process.on('SIGINT', () => {
    logger.info('收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger.info('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        logger.error('主程序执行失败:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map