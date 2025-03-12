import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 配置允许的来源，默认为所有
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['*'];

export function middleware(request: NextRequest) {
  // 获取请求的来源
  const origin = request.headers.get('origin') || '';
  
  // 检查是否为API请求
  const isApiRequest = request.nextUrl.pathname.startsWith('/api/');
  
  // 如果不是API请求，直接放行
  if (!isApiRequest) {
    return NextResponse.next();
  }
  
  // 创建响应对象
  const response = NextResponse.next();
  
  // 设置CORS头
  if (allowedOrigins.includes('*')) {
    // 允许所有来源
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    // 允许特定来源
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // 设置其他CORS头
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }
  
  return response;
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    // 应用于所有API路由
    '/api/:path*',
  ],
}; 