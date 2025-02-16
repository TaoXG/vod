//实现访问xiaomi.xxxx.xxxxx，重定向至小米最新网站。
//最新网站托管github，json格式，内部文件格式"xiaomi": "http://milvdou.fun",   ”xiaomi“与域名前面部分一致，自定义
//github action 自动更新redirects.json  自己ai下
//cfwork添加自定义路由对应域名*.xxxx.xxxxx/*    cf对应域名加dns  cname  *   xxxx.xxxx  开小黄云

const CONFIG_URL = "https://raw.githubusercontent.com/TaoXG/vod/refs/heads/main/redirects.json";   //托管github文件地址
const DOMAIN = "taoxg.top";    //自己托管cf的域名

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 阻止常见攻击
    if (url.searchParams.has("../") || url.pathname.includes("..")) {
      return new Response("检测到非法访问尝试", { status: 403 });
    }

    // 解析子域名，
    const subdomain = hostname.replace(`.${DOMAIN}`, "");

    try {
      // 获取 GitHub 上的 JSON 配置
      const response = await fetch(CONFIG_URL);
      if (!response.ok) {
        return new Response("加载配置失败", { status: 500 });
      }

      const redirects = await response.json();

      // 检查子域名是否有对应的重定向目标
      if (redirects[subdomain]) {
        // 保留原始路径
        const targetUrl = new URL(redirects[subdomain]);
        targetUrl.pathname = url.pathname;
        targetUrl.search = url.search;

        return Response.redirect(targetUrl.toString(), 301);
      }

      return new Response("未找到对应的子域名", { status: 404 });
    } catch (error) {
      return new Response("获取重定向信息时出错", { status: 500 });
    }
  }
};
