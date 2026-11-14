/* 總部工作台・節日特效
   依「今天日期」自動開關，過了日期自動消失，不用手動改。
   節日：情人節、萬聖節、聖誕節、跨年、春節（春節依農曆，日期表在 CNY，已排到 2040 年）
   不放聲音；動畫只用 transform／opacity，不擋點擊；手機數量減半；系統「減少動態」時只留靜態小裝飾。
   右上角小開關可關閉飄落動畫（記在這台裝置）。
   預覽：網址加 ?fest=valentine / halloween / xmas / ny / cny / none 可強制看某個節日。 */
(function () {
  "use strict";

  // 春節：大年初一（國曆）。範圍＝除夕前 3 天 ～ 初五。
  var CNY = {2027:"02-06",2028:"01-26",2029:"02-13",2030:"02-03",2031:"01-23",2032:"02-11",2033:"01-31",2034:"02-19",2035:"02-08",2036:"01-28",2037:"02-15",2038:"02-04",2039:"01-24",2040:"02-12"};
  var ZODIAC = "鼠牛虎兔龍蛇馬羊猴雞狗豬";

  function d0(y, m, d) { return new Date(y, m - 1, d); }
  function addDays(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }

  function pick(now) {
    var y = now.getFullYear(), t = d0(y, now.getMonth() + 1, now.getDate());
    function inR(a, b) { return t >= a && t <= b; }
    if (inR(d0(y, 10, 24), d0(y, 10, 31))) return { key: "halloween", year: y };
    if (inR(d0(y, 12, 15), d0(y, 12, 26))) return { key: "xmas", year: y };
    if (inR(d0(y, 12, 30), d0(y, 12, 31))) return { key: "ny", year: y + 1 };
    if (inR(d0(y, 1, 1), d0(y, 1, 1))) return { key: "ny", year: y };
    if (now.getMonth() === 1 && now.getDate() === 14) return { key: "valentine", year: y }; // 2/14 當天情人節優先（有幾年會碰到春節）
    if (CNY[y]) {
      var p = CNY[y].split("-"), day1 = d0(y, +p[0], +p[1]);
      if (inR(addDays(day1, -4), addDays(day1, 4))) return { key: "cny", year: y };
    }
    if (inR(d0(y, 2, 12), d0(y, 2, 14))) return { key: "valentine", year: y };
    return null;
  }

  var qs = (location.search.match(/[?&]fest=([a-z]+)/) || [])[1];
  var now = new Date(), F;
  if (qs === "none") F = null;
  else if (qs && /^(valentine|halloween|xmas|ny|cny)$/.test(qs)) F = { key: qs, year: qs === "ny" ? now.getFullYear() + 1 : qs === "cny" ? now.getFullYear() + 1 : now.getFullYear(), preview: true };
  else F = pick(now);
  if (!F) return;

  var zod = ZODIAC[((F.year - 4) % 12 + 12) % 12];
  var QUOTES = {
    valentine: ["情人節快樂！愛一家店，也是一種很長情的浪漫。", "今天店裡多了很多兩人桌，每一桌都是你撐起來的風景。", "把客人放在心上，客人也會把我們放在心上。", "謝謝你對這個團隊的用心，比玫瑰還實在。", "忙完記得留一點時間，給最重要的人。"],
    halloween: ["不給糖就搗蛋？今天客人只會說：再來一盤。", "最可怕的不是鬼，是月底的成本率。還好有你盯著。", "南瓜燈亮起來，店裡的笑聲也亮起來。", "萬聖節快樂！今天也把每一桌都照顧得剛剛好。", "面具會換，用心不會。謝謝你一直都在。"],
    xmas: ["聖誕快樂！今年的每一份努力，都是送給團隊最好的禮物。", "冬天最暖的，是一鍋熱湯，和一起撐過來的夥伴。", "謝謝你這一年，讓兩家店都有家的溫度。", "鈴聲響起的時候，也別忘了犒賞一下自己。", "今年辛苦了，願你和家人都有個溫暖的聖誕。"],
    ny: ["謝謝這一年的每一天，" + F.year + " 一起走得更遠。", "舊的一年交出好成績，新的一年繼續一起拚。", F.year + " 年，願兩家店天天客滿、人人平安。", "倒數的不只是時間，是我們一起累積的成果。", "新年快樂！新的一年，繼續當大家最安心的後盾。"],
    cny: [zod + "年行大運，兩店生意興隆、天天客滿！", "新春快樂！謝謝你一整年把大家照顧得好好的。", "年夜飯有一鍋熱湯，就有團圓的味道。", "過年再忙，也記得陪陪家人，好好休息。", "恭喜發財，紅包拿來！今年也一起賺好賺滿。", "新的一年，願團隊同心、店務順利、人人平安。"]
  };
  window.XH_FEST = { key: F.key, quotes: QUOTES[F.key] };

  var NAME = { valentine: "情人節", halloween: "萬聖節", xmas: "聖誕節", ny: "跨年", cny: "春節" }[F.key];
  var OFFKEY = "xhfx-off-" + F.key + "-" + F.year;
  function getOff() { try { return localStorage.getItem(OFFKEY) === "1"; } catch (e) { return false; } }
  function setOff(v) { try { v ? localStorage.setItem(OFFKEY, "1") : localStorage.removeItem(OFFKEY); } catch (e) {} }

  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SMALL = window.matchMedia && matchMedia("(max-width: 900px)").matches;

  /* ---------- 圖案（細線、低彩度） ---------- */
  var SVG = {
    heart: '<svg viewBox="0 0 24 22"><path d="M12 20.5S2 14.4 2 7.6C2 4.5 4.4 2 7.3 2c2 0 3.7 1.1 4.7 2.8C13 3.1 14.7 2 16.7 2 19.6 2 22 4.5 22 7.6c0 6.8-10 12.9-10 12.9z" fill="currentColor"/></svg>',
    heartline: '<svg viewBox="0 0 24 22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20S2.6 14.2 2.6 7.7C2.6 4.8 4.8 2.6 7.4 2.6c1.9 0 3.6 1.1 4.6 2.8 1-1.7 2.7-2.8 4.6-2.8 2.6 0 4.8 2.2 4.8 5.1C21.4 14.2 12 20 12 20z"/></svg>',
    hearts2: '<svg viewBox="0 0 120 40" fill="none"><path d="M4 30C30 34 40 12 60 20S96 34 116 10" stroke="#C99AA1" stroke-width="1.1" stroke-dasharray="2 3"/><path d="M60 27s-7-4.3-7-9c0-2.1 1.6-3.8 3.6-3.8 1.4 0 2.6.8 3.4 2 .8-1.2 2-2 3.4-2 2 0 3.6 1.7 3.6 3.8 0 4.7-7 9-7 9z" fill="#B85A6A"/><path d="M98 19s-4.4-2.7-4.4-5.7c0-1.3 1-2.4 2.3-2.4.9 0 1.6.5 2.1 1.3.5-.8 1.2-1.3 2.1-1.3 1.3 0 2.3 1.1 2.3 2.4 0 3-4.4 5.7-4.4 5.7z" fill="none" stroke="#B85A6A" stroke-width="1.1"/><circle cx="24" cy="30" r="1.6" fill="#D8A7AE"/></svg>',
    hat_valentine: '<svg viewBox="0 0 24 22"><path d="M12 20.5S2 14.4 2 7.6C2 4.5 4.4 2 7.3 2c2 0 3.7 1.1 4.7 2.8C13 3.1 14.7 2 16.7 2 19.6 2 22 4.5 22 7.6c0 6.8-10 12.9-10 12.9z" fill="#C25B6C" stroke="#fff" stroke-width="1.5"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M4 10.2l3.1-.4L6 6.9M20 13.8l-3.1.4 1.1 2.9M4 13.8l3.1.4L6 17.1M20 10.2l-3.1-.4L18 6.9"/></svg>',
    dot: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>',
    bat: '<svg viewBox="0 0 64 28" fill="currentColor"><path d="M32 9c1.6 0 2.6-1.8 3-4 .8 1.6 1.5 2.4 2.4 2.6C41 4 49 1 63 6c-5 1-8 4-8.5 8.5C51 12 46.5 12 44 15c-3-2.5-7-2-9.5 2-1-1.3-1.8-2-2.5-2s-1.5.7-2.5 2c-2.5-4-6.5-4.5-9.5-2-2.5-3-7-3-10.5-.5C9 10 6 7 1 6c14-5 22-2 25.6 1.6.9-.2 1.6-1 2.4-2.6.4 2.2 1.4 4 3 4z"/></svg>',
    hongbao: '<svg viewBox="0 0 20 28"><rect x="1" y="1" width="18" height="26" rx="2.5" fill="#B83A33"/><path d="M1 8.5Q10 14 19 8.5" fill="none" stroke="#8E2A25" stroke-width="1"/><circle cx="10" cy="11" r="3.2" fill="#E3C27A"/><path d="M8.6 11h2.8M10 9.6v2.8" stroke="#B83A33" stroke-width=".9"/></svg>',
    coin: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#E3C27A" stroke="#C49A45"/><rect x="7.5" y="7.5" width="5" height="5" fill="none" stroke="#B58A3A" stroke-width="1.2"/></svg>',
    wreath: '<svg viewBox="0 0 120 34" fill="none"><path d="M4 4Q30 30 60 14Q90 30 116 4" stroke="#5E7A5A" stroke-width="2.2" stroke-linecap="round"/><path d="M4 4Q30 30 60 14Q90 30 116 4" stroke="#87A27F" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="1 4.5" opacity=".75"/><circle cx="22" cy="18" r="2.6" fill="#A7343E"/><circle cx="41" cy="21.5" r="2.6" fill="#C9A24A"/><circle cx="60" cy="14" r="3.4" fill="#A7343E"/><circle cx="79" cy="21.5" r="2.6" fill="#C9A24A"/><circle cx="98" cy="18" r="2.6" fill="#A7343E"/><path d="M57 10.5q3-4 6 0" stroke="#C9A24A" stroke-width="1.2"/></svg>',
    pumpkin: '<svg viewBox="0 0 48 44"><path d="M24 9c-1-4 1-7 4-8" fill="none" stroke="#5E6B4A" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="14" cy="26" rx="11" ry="14" fill="#D9853B"/><ellipse cx="34" cy="26" rx="11" ry="14" fill="#D9853B"/><ellipse cx="24" cy="26" rx="10" ry="15.5" fill="#E8964A"/><path d="M17 23l3.5-3.5L24 23zM27 23l3.5-3.5L34 23z" fill="#5A3B2A"/><path d="M16 31q8 6 16 0l-2.5 1.2-1.5-1.8-2 2-2-2-2 2-2-2-1.5 1.8z" fill="#5A3B2A"/></svg>',
    web: '<svg viewBox="0 0 60 60" fill="none" stroke="#7D7584" stroke-width=".8" opacity=".55"><path d="M0 0l60 60M0 0l60 22M0 0l22 60M0 0l60 0M0 0l0 60"/><path d="M16 0q2 8 0 16q-8 1-16 0M30 0q3 13 0 30q-13 2-30 0M46 0q4 20 0 46q-20 3-46 0"/></svg>',
    chunlian: '<svg viewBox="0 0 60 60"><rect x="12" y="12" width="36" height="36" rx="2" transform="rotate(45 30 30)" fill="#B83A33"/><rect x="15.5" y="15.5" width="29" height="29" rx="1" transform="rotate(45 30 30)" fill="none" stroke="#E3C27A" stroke-width=".9" opacity=".8"/><text x="30" y="38.5" text-anchor="middle" font-size="22" font-family="LXGW WenKai TC,Kaiti TC,BiauKai,serif" font-weight="700" fill="#F1D38E">春</text></svg>',
    stars: '<svg viewBox="0 0 140 34" fill="none"><path d="M2 3Q36 26 70 12T138 3" stroke="#C9A24A" stroke-width=".9" opacity=".7"/><g fill="#C9A24A"><path d="M24 17.5l1.4 3 3.2.4-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.4z"/><path d="M70 10.5l1.8 3.8 4.1.5-3 2.8.8 4.1-3.7-2-3.7 2 .8-4.1-3-2.8 4.1-.5z"/><path d="M114 13l1.4 3 3.2.4-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.4z"/></g><circle cx="47" cy="19" r="1.5" fill="#A65663"/><circle cx="93" cy="16" r="1.5" fill="#94AFD2"/></svg>',
    hat_xmas: '<svg viewBox="0 0 32 28"><path d="M4 22Q9 6 20 4q6-1 9 6l-3 1q-2-3-5-2-6 3-8 13z" fill="#B23A3F"/><rect x="2" y="20" width="22" height="6" rx="3" fill="#FBF7F2" stroke="#E6DED4" stroke-width=".6"/><circle cx="28" cy="11" r="3.2" fill="#FBF7F2" stroke="#E6DED4" stroke-width=".6"/></svg>',
    hat_witch: '<svg viewBox="0 0 32 30"><path d="M8 23L17 2q1.5-1.6 2.5.4L23 23z" fill="#3F3550"/><path d="M9.6 19.5h12" stroke="#C9A24A" stroke-width="2.2"/><ellipse cx="16" cy="24" rx="15" ry="3.6" fill="#4A3F5E"/></svg>',
    hat_party: '<svg viewBox="0 0 28 30"><path d="M5 27L14 2l9 25z" fill="#C9A24A"/><path d="M8 19l12-4M7 24l15-5M10.5 12l7-3" stroke="#7A2E3A" stroke-width="1.6" opacity=".7"/><circle cx="14" cy="3" r="2.6" fill="#7A2E3A"/></svg>',
    hat_cny: '<svg viewBox="0 0 30 26"><path d="M3 20q12-22 24 0z" fill="#B83A33"/><rect x="2" y="18" width="26" height="5" rx="2.5" fill="#E3C27A"/><circle cx="15" cy="4.5" r="2.6" fill="#E3C27A"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15v4M17 17h4"/></svg>'
  };

  /* ---------- 樣式 ---------- */
  var css = [
    "#fx{position:fixed;inset:0;pointer-events:none;z-index:4;overflow:hidden;contain:strict}",
    "#fx.off .fx-p,#fx.off .fx-bat{display:none}",
    ".fx-p{position:absolute;top:-40px;left:var(--x);width:var(--s);height:var(--s);color:var(--c);opacity:0;will-change:transform,opacity;animation:fxfall var(--d) linear var(--dl) infinite}",
    ".fx-p>i{display:block;width:100%;height:100%;animation:fxsway var(--sw) ease-in-out var(--dl) infinite alternate}",
    ".fx-p svg{display:block;width:100%;height:100%}",
    "@keyframes fxfall{0%{transform:translate3d(0,0,0);opacity:0}8%{opacity:var(--o)}88%{opacity:var(--o)}100%{transform:translate3d(0,calc(100vh + 80px),0);opacity:0}}",
    "@keyframes fxsway{from{transform:translateX(calc(var(--dx)*-1)) rotate(calc(var(--r)*-1))}to{transform:translateX(var(--dx)) rotate(var(--r))}}",
    ".fx-bat{position:absolute;left:0;top:var(--y);width:var(--s);color:#4A4058;opacity:0;will-change:transform,opacity;animation:fxfly var(--d) linear var(--dl) infinite}",
    ".fx-bat>i{display:block;animation:fxflap .32s ease-in-out infinite alternate;transform-origin:50% 40%}.fx-bat svg{display:block;width:100%}",
    "@keyframes fxfly{0%{transform:translate3d(-80px,0,0);opacity:0}6%{opacity:.5}50%{transform:translate3d(50vw,-26px,0)}94%{opacity:.6}100%{transform:translate3d(calc(100vw + 80px),8px,0);opacity:0}}",
    "@keyframes fxflap{from{transform:scaleY(1)}to{transform:scaleY(.62)}}",
    /* 頁首裝飾 */
    ".fx-deco{position:absolute;pointer-events:none;z-index:1}",
    ".fx-deco svg{display:block;width:100%;height:auto}",
    ".fx-wreath{top:-1px;right:330px;width:150px}",
    ".fx-pumpkin{right:322px;bottom:14px;width:44px;transform-origin:50% 100%;animation:fxbob 3.6s ease-in-out infinite alternate}",
    ".fx-web{top:0;left:0;width:64px}",
    ".fx-chun{top:8px;right:326px;width:58px;transform-origin:50% 0;animation:fxswing 4s ease-in-out infinite alternate}",
    "@keyframes fxbob{from{transform:rotate(-3deg)}to{transform:rotate(3deg) translateY(-2px)}}",
    "@keyframes fxswing{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}",
    /* 煙火（只在頁首框內） */
    ".fx-fw{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}",
    ".fx-burst{position:absolute;width:0;height:0}",
    ".fx-burst i{position:absolute;left:-1px;top:-18px;width:2px;height:18px;border-radius:2px;background:linear-gradient(var(--c),transparent);transform-origin:1px 18px;opacity:0;animation:fxray 1.9s cubic-bezier(.15,.7,.3,1) forwards}",
    "@keyframes fxray{0%{opacity:0;transform:rotate(var(--a)) translateY(0) scaleY(.3)}10%{opacity:.95}60%{opacity:.75}100%{opacity:0;transform:rotate(var(--a)) translateY(calc(var(--len)*-1)) scaleY(1)}}",
    /* 倒數小標籤 */
    ".fx-tag{display:inline-flex;align-items:center;gap:6px;margin-left:10px;padding:2px 10px;border-radius:999px;border:1px solid var(--fxl,#E2C3C8);color:var(--fxc,#7A2E3A);font-size:12px;background:rgba(255,255,255,.6);font-variant-numeric:tabular-nums;letter-spacing:.02em;white-space:nowrap}",
    /* 輝哥戴帽子 */
    ".fx-hw{position:relative;display:inline-block;line-height:0}",
    ".fx-hat{position:absolute;pointer-events:none;width:21px;left:4px;top:-11px;transform:rotate(-14deg)}",
    ".fx-valentine .fx-hat{width:13px;left:auto;right:2px;top:-3px;transform:rotate(12deg)}",
    ".fx-hat svg{display:block;width:100%;height:auto}",
    /* 右上開關 */
    ".fx-tg{display:inline-flex;align-items:center;gap:6px;margin-right:8px;height:28px;padding:0 11px 0 9px;border-radius:999px;border:1px solid var(--line,#E8E5E0);background:var(--panel,#fff);color:var(--fxc,#7A2E3A);font:500 12px var(--fb,sans-serif);cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.03);transition:background .2s,color .2s}",
    ".fx-tg:hover{background:#FAF9F7}.fx-tg svg{width:14px;height:14px}.fx-tg.is-off{color:var(--faint,#ABA49C)}",
    ".fx-tg .fx-tl{white-space:nowrap}",
    ".top>.fx-right{display:flex;align-items:center}",
    "@media (max-width:900px){.fx-wreath,.fx-chun,.fx-pumpkin{right:14px}.fx-wreath{width:110px}.fx-chun{top:6px;width:44px}.fx-pumpkin{top:12px;bottom:auto;width:34px}.fx-tg .fx-tl{display:none}.fx-tg{padding:0 8px}.eyebrow{flex-wrap:wrap}.fx-tagw{flex-basis:100%;margin-top:6px}.fx-tag{margin:0}}",
    "@media (prefers-reduced-motion:reduce){.fx-p,.fx-bat,.fx-burst{display:none}.fx-pumpkin,.fx-chun{animation:none}}"
  ].join("");

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build() {
    var st = el("style"); st.id = "fx-css"; st.textContent = css; document.head.appendChild(st);
    var root = document.documentElement;
    root.classList.add("fx-" + F.key);
    root.style.setProperty("--fxc", F.key === "valentine" ? "#A3485A" : F.key === "halloween" ? "#6B4E2E" : F.key === "xmas" ? "#5E7A5A" : F.key === "cny" ? "#A3322C" : "#7A2E3A");
    root.style.setProperty("--fxl", F.key === "valentine" ? "#EBCDD2" : F.key === "halloween" ? "#E6D2BE" : F.key === "xmas" ? "#CFDCCB" : F.key === "cny" ? "#EBC9C4" : "#E2C3C8");

    var hero = document.querySelector(".hero");
    var layer = el("div"); layer.id = "fx"; layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    /* 飄落／飛行 */
    function fall(n, list, opt) {
      for (var i = 0; i < n; i++) {
        var p = el("span", "fx-p", "<i>" + list[i % list.length] + "</i>");
        var s = rnd(opt.s[0], opt.s[1]);
        p.style.cssText = "--x:" + rnd(0, 100).toFixed(1) + "%;--s:" + s.toFixed(0) + "px;--d:" + rnd(opt.d[0], opt.d[1]).toFixed(1) + "s;--dl:" + (-rnd(0, opt.d[1])).toFixed(1) + "s;--sw:" + rnd(2.4, 4.2).toFixed(1) + "s;--dx:" + rnd(8, 26).toFixed(0) + "px;--r:" + rnd(opt.r[0], opt.r[1]).toFixed(0) + "deg;--o:" + rnd(opt.o[0], opt.o[1]).toFixed(2) + ";--c:" + opt.c[i % opt.c.length];
        layer.appendChild(p);
      }
    }
    var k = SMALL ? 0.5 : 1;
    if (F.key === "xmas") fall(Math.round(22 * k), [SVG.snow, SVG.dot, SVG.snow], { s: [7, 16], d: [11, 19], r: [20, 120], o: [.35, .7], c: ["#8FA6BE", "#A9BBCD", "#B7C6D4"] });
    if (F.key === "valentine") fall(Math.round(16 * k), [SVG.heart, SVG.heartline, SVG.heart], { s: [8, 15], d: [13, 21], r: [6, 18], o: [.3, .6], c: ["#C98A93", "#D8A7AE", "#A65663"] });
    if (F.key === "cny") fall(Math.round(12 * k), [SVG.hongbao, SVG.coin, SVG.hongbao], { s: [13, 20], d: [12, 19], r: [8, 22], o: [.75, .95], c: ["#B83A33"] });
    if (F.key === "halloween") {
      for (var b = 0; b < (SMALL ? 2 : 4); b++) {
        var bat = el("span", "fx-bat", "<i>" + SVG.bat + "</i>");
        bat.style.cssText = "--y:" + rnd(70, 360).toFixed(0) + "px;--s:" + rnd(30, 44).toFixed(0) + "px;--d:" + rnd(16, 24).toFixed(1) + "s;--dl:" + (-rnd(0, 20) + b * 3).toFixed(1) + "s";
        layer.appendChild(bat);
      }
    }

    /* 頁首裝飾 */
    if (hero) {
      if (F.key === "xmas") hero.appendChild(el("div", "fx-deco fx-wreath", SVG.wreath));
      if (F.key === "valentine") hero.appendChild(el("div", "fx-deco fx-wreath fx-hearts", SVG.hearts2));
      if (F.key === "halloween") { hero.appendChild(el("div", "fx-deco fx-pumpkin", SVG.pumpkin)); hero.appendChild(el("div", "fx-deco fx-web", SVG.web)); }
      if (F.key === "cny") hero.appendChild(el("div", "fx-deco fx-chun", SVG.chunlian));
      if (F.key === "ny") {
        hero.appendChild(el("div", "fx-deco fx-wreath", SVG.stars));
        var fw = el("div", "fx-fw"); hero.insertBefore(fw, hero.firstChild);
        var COL = ["#C9A24A", "#A65663", "#94AFD2", "#E8A45E"];
        var fwT = 0;
        var boom = function () {
          if (document.hidden || layer.classList.contains("off") || RM) return;
          var w = hero.clientWidth, h = hero.clientHeight;
          var bx = el("span", "fx-burst"); bx.style.left = rnd(w * .3, w * .68).toFixed(0) + "px"; bx.style.top = rnd(h * .2, h * .6).toFixed(0) + "px";
          var c = COL[Math.floor(Math.random() * COL.length)], len = rnd(40, 66).toFixed(0), rays = 16, off = rnd(0, 25);
          for (var j = 0; j < rays; j++) { var r = el("i"); r.style.cssText = "--a:" + (off + j * 360 / rays).toFixed(0) + "deg;--len:" + len + "px;--c:" + c; bx.appendChild(r); }
          fw.appendChild(bx); setTimeout(function () { bx.remove(); }, 2000);
        };
        setTimeout(boom, 500); fwT = setInterval(boom, 2300);
      }
    }

    /* 頁首小標籤：跨年倒數／春節生肖 */
    var eb = document.querySelector(".eyebrow");
    if (eb) {
      var tag = el("span", "fx-tag");
      if (F.key === "ny") {
        var target = new Date(F.year, 0, 1).getTime();
        var tickTag = function () {
          var ms = target - Date.now();
          if (ms <= 0) { tag.textContent = "✦ " + F.year + " 新年快樂"; return; }
          var hh = Math.floor(ms / 3600000), mm = Math.floor(ms % 3600000 / 60000);
          tag.textContent = hh >= 24 ? "距離 " + F.year + " 還有 " + Math.ceil(ms / 86400000) + " 天" : "距離 " + F.year + " 還有 " + hh + " 小時 " + mm + " 分";
        };
        tickTag(); setInterval(tickTag, 30000);
      } else if (F.key === "cny") tag.textContent = "✦ " + zod + "年快樂";
      else if (F.key === "valentine") tag.textContent = "✦ Happy Valentine’s Day";
      else if (F.key === "xmas") tag.textContent = "✦ Merry Christmas";
      else tag.textContent = "✦ Happy Halloween";
      var tw = el("span", "fx-tagw"); tw.appendChild(tag); eb.appendChild(tw);
    }

    /* 輝哥戴帽子 */
    var hat = { valentine: SVG.hat_valentine, xmas: SVG.hat_xmas, halloween: SVG.hat_witch, ny: SVG.hat_party, cny: SVG.hat_cny }[F.key];
    document.querySelectorAll("img.huige").forEach(function (img) {
      var w = el("span", "fx-hw"); img.parentNode.insertBefore(w, img); w.appendChild(img);
      w.appendChild(el("span", "fx-hat", hat));
    });

    /* 右上角開關 */
    var top = document.querySelector(".top"), date = document.getElementById("date");
    if (top && date) {
      var wrap = el("div", "fx-right"); top.insertBefore(wrap, date); wrap.appendChild(date);
      var tg = el("button", "fx-tg", SVG.spark + '<span class="fx-tl"></span>'); tg.type = "button";
      wrap.insertBefore(tg, date);
      var apply = function (off) {
        layer.classList.toggle("off", off); tg.classList.toggle("is-off", off);
        tg.querySelector(".fx-tl").textContent = NAME + (off ? "特效 關" : "特效");
        tg.setAttribute("aria-pressed", String(!off));
        tg.title = off ? "打開" + NAME + "動畫" : "關閉" + NAME + "動畫（小裝飾會保留）";
        var fwl = document.querySelector(".fx-fw"); if (fwl) fwl.style.display = off ? "none" : "";
      };
      apply(getOff());
      tg.addEventListener("click", function () { var off = !layer.classList.contains("off"); setOff(off); apply(off); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
