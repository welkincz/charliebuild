// NaNail 门店展示页的 Worker。
//
// 绝大多数请求（页面、图片、sw.js）由 Workers Static Assets 直接命中静态资源返回，
// 根本不会进到这里。这个脚本只负责两条静态资源里没有的路径：
//
//   /ig     门口那块屏上 Instagram 二维码指向的地址：记一次扫码，然后 302 跳到 IG 主页。
//   /scans  回头看「这块屏到底有没有人扫」的小接口。
//
// 微信二维码刻意没有走这里：微信扫码识别的是 u.wechat.com 这个域，
// 换成自有域名再跳转会改变微信客户端里的加好友流程，风险大于拿到的数据。
const INSTAGRAM = 'https://www.instagram.com/nanail_studio_a/';

// 日计数按这个时区切分「一天」。门店不在多伦多的话改掉这里，
// 否则日计数会在当地的某个中间时刻换日，对不上营业日。
const TIMEZONE = 'America/Toronto';

// 每条扫码记录保留多久。400 天够覆盖「去年同期什么样」，
// 又不会让 key 无限堆积把 /scans 拖慢。
const SCAN_TTL = 60 * 60 * 24 * 400;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/ig' || url.pathname === '/ig/') {
      // waitUntil：先把人送走，计数在后台补，扫码的人感觉不到这一跳。
      ctx.waitUntil(recordScan(env, 'ig'));
      return new Response(null, {
        status: 302,
        headers: { Location: INSTAGRAM, 'Cache-Control': 'no-store' },
      });
    }

    if (url.pathname === '/scans') {
      return scanSummary(env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function recordScan(env, source) {
  // 没绑 KV 时静默跳过：二维码照常跳转，只是没有计数。
  if (!env.SCANS) return;

  // 每次扫码写一个独立的 key，而不是「读出来加一再写回去」。
  // KV 的读是最终一致的、边缘最多缓存 60 秒，用计数器写法会把
  // 一分钟内的多次扫码合并成一次——门口连着来几个人正好命中这个坑。
  // 独立 key 没有竞争，代价只是读的时候要 list 一遍。
  const key = `scan:${source}:${today()}:${crypto.randomUUID().slice(0, 8)}`;
  await env.SCANS.put(key, new Date().toISOString(), { expirationTtl: SCAN_TTL });
}

async function scanSummary(env) {
  if (!env.SCANS) {
    return json({ counting: false, hint: '还没绑定 KV，扫码跳转正常但没有计数' });
  }

  const byDay = new Map();
  let cursor;
  let total = 0;
  let pages = 0;

  do {
    const page = await env.SCANS.list({ prefix: 'scan:ig:', cursor, limit: 1000 });
    for (const entry of page.keys) {
      const day = entry.name.split(':')[2];
      byDay.set(day, (byDay.get(day) || 0) + 1);
      total += 1;
    }
    cursor = page.list_complete ? null : page.cursor;
    pages += 1;
  } while (cursor && pages < 20); // 给极端情况兜个底，别把一次查询拖成几十个 list

  const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return json({
    counting: true,
    timezone: TIMEZONE,
    instagram: {
      合计: total,
      说明: `最近 ${SCAN_TTL / 86400} 天内的扫码数，更早的已过期`,
      今天: byDay.get(today()) || 0,
      最近30天: Object.fromEntries(days.slice(0, 30)),
    },
  });
}

function today() {
  // en-CA 的日期格式就是 YYYY-MM-DD。
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

function json(body) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
