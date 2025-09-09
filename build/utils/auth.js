/**
 * Authorization Token 处理工具
 * 用于在HTTP MCP模式下解析Binance API配置
 * 格式: {apiKey}:{apiSecret}
 */
export class AuthTokenHandler {
    /**
     * 从authorization token解析Binance凭据
     * 格式: {apiKey}:{apiSecret}
     */
    static parseCredentials(token) {
        try {
            // 移除可能的Bearer前缀
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            // 解析格式: apiKey:apiSecret
            const parts = cleanToken.split(':');
            if (parts.length !== 2) {
                return null;
            }
            const [apiKey, apiSecret] = parts;
            // 验证必要字段
            if (!apiKey || !apiSecret || apiKey.length < 10 || apiSecret.length < 10) {
                return null;
            }
            return {
                apiKey: apiKey.trim(),
                apiSecret: apiSecret.trim(),
            };
        }
        catch (error) {
            return null;
        }
    }
    /**
     * 生成token格式示例
     */
    static generateToken(apiKey, apiSecret) {
        return `${apiKey}:${apiSecret}`;
    }
    /**
     * 验证token格式
     */
    static validateToken(token) {
        return this.parseCredentials(token) !== null;
    }
}
/**
 * 生成配置示例
 */
export function generateClaudeDesktopConfig(apiKey, apiSecret) {
    const token = AuthTokenHandler.generateToken(apiKey, apiSecret);
    return {
        mcpServers: {
            'binance-mcp-server': {
                command: 'sse',
                args: ['http://your-server:3000/message'],
                authorization_token: token,
            },
        },
    };
}
//# sourceMappingURL=auth.js.map