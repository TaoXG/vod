/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const store = {
};
const configUrl =
  "https://raw.githubusercontent.com/TaoXG/catvod/refs/heads/main/redirects.json";

export default {
  async fetch(request, env, ctx) {
    try {
      const res = await fetch(configUrl);
      if (!res.ok) {
        throw new Error("获取地址配置失败");
      }
      const ret = await res.json();
      Object.assign(store, ret);
    } catch (e) {
      return new Response(e.message, { status: 400 });
    }

    const url = new URL(request.url);
    const { pathname, search } = url;

    const temps = pathname.split("/").filter(Boolean);
    if (temps.length < 1) {
      //路径不包含site
      return new Response("Not Found", { status: 404 });
    }
    //如果不是中文可以不需要解码
    const siteKey = decodeURIComponent(temps.shift());

    const baseUrl = store[siteKey];
    if (!baseUrl) {
      //找不到站点
      return new Response(`Not Found [${siteKey}]`, { status: 404 });
    }
    return Response.redirect(`${baseUrl}/${temps.join("/")}${search}`, 301);
  },
};
