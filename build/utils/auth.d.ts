/**
 * Authorization Token 处理工具
 * 用于在HTTP MCP模式下解析Binance API配置
 * 格式: {apiKey}:{apiSecret}
 */
export interface BinanceCredentials {
    apiKey: string;
    apiSecret: string;
}
export declare class AuthTokenHandler {
    /**
     * 从authorization token解析Binance凭据
     * 格式: {apiKey}:{apiSecret}
     */
    static parseCredentials(token: string): BinanceCredentials | null;
    /**
     * 生成token格式示例
     */
    static generateToken(apiKey: string, apiSecret: string): string;
    /**
     * 验证token格式
     */
    static validateToken(token: string): boolean;
}
/**
 * 生成配置示例
 */
export declare function generateClaudeDesktopConfig(apiKey: string, apiSecret: string): object;
//# sourceMappingURL=auth.d.ts.map