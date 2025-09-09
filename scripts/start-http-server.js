#!/usr/bin/env node

/**
 * Binance MCP HTTP服务器启动脚本
 * 用于在HTTP SSE模式下启动MCP服务器，支持远程URL访问
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 获取脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 加载环境变量
dotenv.config({ path: join(projectRoot, '.env') });

// 验证必要的环境变量
const requiredEnvVars = ['BINANCE_API_KEY', 'BINANCE_SECRET_KEY'];
const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error('\n❌ 缺少必要的环境变量:');
  missingVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n请在 .env 文件中设置这些环境变量，或通过命令行参数传递。');
  console.error('\n示例 .env 文件内容:');
  console.error('BINANCE_API_KEY=your_api_key_here');
  console.error('BINANCE_SECRET_KEY=your_secret_key_here');
  console.error('BINANCE_TESTNET=false');
  console.error('PORT=3000');
  process.exit(1);
}

// 配置服务器参数
const serverConfig = {
  mode: 'http',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  testnet: process.env.BINANCE_TESTNET === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
};

console.log('\n🚀 启动 Binance MCP HTTP 服务器');
console.log('=====================================');
console.log(`📊 交易环境: ${serverConfig.testnet ? '测试网' : '主网'}`);
console.log(`🌐 监听地址: ${serverConfig.host}:${serverConfig.port}`);
console.log(`📝 日志级别: ${serverConfig.logLevel}`);
console.log(
  `🔗 访问地址: http://${serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host}:${
    serverConfig.port
  }/message`,
);
console.log('=====================================\n');

// 设置子进程环境变量
const childEnv = {
  ...process.env,
  SERVER_MODE: 'http',
  PORT: serverConfig.port.toString(),
  HOST: serverConfig.host,
  LOG_LEVEL: serverConfig.logLevel,
};

// 启动MCP服务器进程
const mcpServerPath = join(projectRoot, 'build', 'index.js');
const childProcess = spawn('node', [mcpServerPath], {
  env: childEnv,
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: projectRoot,
});

// 处理子进程输出
childProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    console.log(output);
  }
});

childProcess.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    console.error(output);
  }
});

// 处理子进程退出
childProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ MCP 服务器正常关闭');
  } else {
    console.error(`\n❌ MCP 服务器异常退出，退出代码: ${code}`);
  }
  process.exit(code);
});

childProcess.on('error', (error) => {
  console.error('\n❌ 启动 MCP 服务器失败:', error.message);
  process.exit(1);
});

// 优雅关闭处理
const shutdown = (signal) => {
  console.log(`\n📥 收到 ${signal} 信号，正在关闭服务器...`);

  // 向子进程发送关闭信号
  if (childProcess && !childProcess.killed) {
    childProcess.kill(signal);

    // 等待子进程关闭，超时后强制终止
    setTimeout(() => {
      if (!childProcess.killed) {
        console.log('⏰ 强制终止子进程...');
        childProcess.kill('SIGKILL');
      }
    }, 5000);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Binance MCP HTTP 服务器启动脚本

用法:
  node scripts/start-http-server.js [选项]

环境变量:
  BINANCE_API_KEY      Binance API 密钥 (必需)
  BINANCE_SECRET_KEY   Binance API 私钥 (必需)
  BINANCE_TESTNET      是否使用测试网 (默认: false)
  PORT                 HTTP 服务器端口 (默认: 3000)
  HOST                 HTTP 服务器主机 (默认: 0.0.0.0)
  LOG_LEVEL           日志级别 (默认: info)

示例:
  # 使用默认配置启动
  node scripts/start-http-server.js
  
  # 使用自定义端口启动
  PORT=8080 node scripts/start-http-server.js
  
  # 在测试网模式下启动
  BINANCE_TESTNET=true node scripts/start-http-server.js

访问方式:
  HTTP SSE 端点: http://localhost:3000/message
  健康检查: http://localhost:3000/health (如果实现)

注意事项:
  - 确保已安装所有依赖包 (npm install)
  - 确保已构建项目 (npm run build)
  - 在生产环境中建议使用进程管理工具如 PM2
  - 建议配置防火墙规则限制访问
`);
  process.exit(0);
}

console.log('💡 提示: 使用 Ctrl+C 可以优雅地关闭服务器');
console.log('📖 使用 --help 查看帮助信息\n');
