/* ===========================================================
   非遗·造物 — 宣纸金框 · 文物正典
   heritage-craft · 单页应用逻辑（零依赖 · 全内存态）
   数据与交互流程沿用 OPC 原型，视觉层全新
   =========================================================== */
const $ = s => document.querySelector(s);
const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- 图标（描边风格，与宣纸金框一致） ---------- */
const ico = {
  map:'<path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16"/>',
  spark:'<path d="m12 3 2.4 6.1L21 11.5l-6.6 2.4L12 20l-2.4-6.1L3 11.5l6.6-2.4z"/>',
  cube:'<path d="M12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  pin:'<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  brush:'<path d="M4 20c3-1 5-3 6-6M14 4l6 6-8 8-6-6z"/>',
  bag:'<path d="M4 8h16l-1 13H5z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  doc:'<path d="M5 4h14v17H5z"/><path d="M9 4V2h6v2M8 10h8M8 14h8M8 18h5"/>',
  seal:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8v8H8z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
};
const I = (k, cls) => `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[k]||ico.doc}</svg>`;

/* ---------- 数据（与原型一致） ---------- */
const STYLES = [
  {k:'jade', name:'青绿新潮', desc:'青绿山水 × 未来城市', img:'style-a-jade.jpg',
   params:{模型:'HeritageDiT v2.4', 采样步数:'36 step', 引导强度:'7.5', 画面比例:'1:1', 精修:'人脸/纹样×2'}},
  {k:'crimson', name:'撞色国潮', desc:'高饱和撞色 × 几何张力', img:'style-b-crimson.jpg',
   params:{模型:'HeritageDiT v2.4', 采样步数:'42 step', 引导强度:'8.5', 画面比例:'1:1', 精修:'笔触/边缘×3'}}
];
const getStyle = k => STYLES.find(s => s.k === k) || STYLES[0];
const GEN_STAGES = ['解析文化元素与灵感','构建画面构图','执行风格迁移','细节精修与锐化'];

const MODULES = {
  ar:{name:'非遗寻宝', tag:'AR 探索', lead:'沿着手艺，重新发现一座城。', desc:'探访非遗点位，完成模拟识别与打卡，集齐数字印章。', action:'开启寻宝', number:'壹', key:'map'},
  ai:{name:'国潮共创', tag:'AI 灵感', lead:'让传统灵感，长出新的表达。', desc:'选择文化主题，创作国潮文案，并体验作品审核与发布。', action:'开始共创', number:'贰', key:'spark'},
  crowd:{name:'好物预售', tag:'文创支持', lead:'把喜欢的文化，带进日常。', desc:'了解文创计划，选择支持档位，完成模拟预售订单。', action:'发现好物', number:'叁', key:'bag'}
};

const PROJECTS = [
  {name:'江南非遗文化季', sub:'JIANGNAN / HERITAGE REIMAGINED', theme:'jade',
   intro:'从一枚木版印记到一段丝线纹样，让老手艺与新生活相遇。',
   route:'寻纹江南 · 非遗漫游线', points:['木版年画工坊','苏绣灵感馆','蓝印花布小院'],
   crafts:['木版年画','苏绣','蓝印花布'],
   product:'「青出于蓝」非遗织纹随行包', productDesc:'从蓝印花布提取纹样，以现代版型重新演绎。把传统工艺，装进年轻人的日常。',
   base:[12860,3248,856,68420], goal:100000, backers:428, enabled:{ar:true,ai:true,crowd:true}},
  {name:'东方新潮创意园', sub:'NEW WAVE / CULTURE IN MOTION', theme:'red',
   intro:'把非遗灵感带进城市现场，在创作、体验与日常之间建立连接。',
   route:'新潮造物 · 园区发现线', points:['剪纸造物空间','漆艺实验室','竹编设计社'],
   crafts:['剪纸','漆艺','竹编'],
   product:'「经纬之间」竹编桌面收纳', productDesc:'以竹编经纬为设计语言，探索传统手作与当代办公空间的相遇。',
   base:[8620,1860,412,32680], goal:80000, backers:206, enabled:{ar:true,ai:true,crowd:false}}
];

const TIERS = [
  {name:'一份心意', price:88, desc:'电子感谢卡 + 项目进展推送'},
  {name:'限定价好物', price:268, desc:'非遗织纹随行包 × 1 + 数字藏品优先购'},
  {name:'共创支持者', price:688, desc:'随行包 × 2 + 署名共创 + 线下体验名额'}
];

/* ---------- 存证工具（与原型一致） ---------- */
const HEX = '0123456789abcdef';
function fakeHash(len, seed){
  let x = (seed || 1) >>> 0 || 1, s = '0x';
  for (let i = 0; i < len; i++){
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    s += HEX[x % 16];
    if (i % 4 === 3){ x ^= (x >>> 3) ^ (i * 2654435761 >>> 0); x >>>= 0; }
  }
  return s;
}
function chainIco(k){
  const P = {
    id:['M4 6h16v14H4z','M9 6V3h6v3','M9 11h6','M9 15h4'],
    hash:['M10 13a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1','M14 11a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1'],
    time:['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z','M12 7.5v5l3.5 2'],
    block:['M12 3 20 8v9l-8 5-8-5V8z','M4 8l8 5 8-5','M12 13v9'],
    link:['M4 7h16v11H4z','M9 7V4h6v3','M8 12h8','M8 15h5'],
    fp:['M12 3v9','M12 3a9 9 0 0 1 9 9v3','M12 3a9 9 0 0 0-9 9v3','M7 21h10']
  };
  return (P[k]||P.id).map(d => '<path d="' + d + '"/>').join('');
}
function makeCert(w, p){
  const rawId = w.id.replace(/\D/g,'') || String(Date.now()).slice(-9);
  let hs = 0; for (let i = 0; i < w.title.length; i++) hs = (hs * 131 + w.title.charCodeAt(i) * (i + 7)) >>> 0;
  let ts = 0; for (let i = 0; i < w.text.length; i++) ts = (ts * 37 + w.text.charCodeAt(i)) >>> 0;
  const n = (Number(rawId || '170368') * 7919 + hs + p * 104729 + ts * 13) >>> 0;
  let fh = 2166136261 >>> 0;
  const sig = String(rawId) + '|' + w.title + '|' + p;
  for (let i = 0; i < sig.length; i++){ fh ^= sig.charCodeAt(i); fh = Math.imul(fh, 16777619) >>> 0; }
  const serial = String(fh % 1000000).padStart(6,'0');
  const d = new Date(), pad = x => String(x).padStart(2,'0');
  const tz = d.getFullYear() + '年' + pad(d.getMonth()+1) + '月' + pad(d.getDate()) + '日 ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  return {
    no:'NO. ' + d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + serial,
    hash:fakeHash(64, n*31+7), time:tz,
    block:'#' + String(87200000 + (n % 90000)),
    chain:'BSN-Chain · 静安文化节点',
    cid:'# ' + String(1000000000 + (n % 99999999)),
    fp:fakeHash(16, n*17+3).toUpperCase().replace('0X','0x'),
    tx:fakeHash(48, n*53+11)
  };
}
function chainRows(c){
  const rows = [
    ['id','唯一认证编号',c.no,false],
    ['hash','链上哈希值',c.hash,true],
    ['time','存证时间',c.time,false],
    ['block','区块高度',c.block,false],
    ['link','所属链',c.chain,false],
    ['fp','数字指纹',c.fp,true],
    ['fp','藏品 ID',c.cid,false]
  ];
  return rows.map(r => '<div class="chain-row"><span class="chain-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + chainIco(r[0]) + '</svg></span><span class="chain-label">' + r[1] + '</span><span class="chain-value' + (r[3]?' mono':'') + '">' + r[2] + '</span></div>').join('');
}
function chainBlock(c){
  if (!c) return '';
  return '<div class="chain-block"><div class="chain-head"><span class="chain-seal">' + I('check') + '</span><div><b>链上存证信息</b><br><small>ON-CHAIN CERTIFICATION</small></div></div><div class="chain-grid">' + chainRows(c) + '</div><div class="chain-foot"><span class="ok">已上链存证</span><span>区块永久保存 · 不可篡改 · 可追溯</span></div></div>';
}

/* ---------- 状态 ---------- */
let project = 0, route = 'overview', pointIndex = 0, template = '城市漫游',
    busy = false, selectedTier = 1, role = 'operator', activeRecord = null,
    activeCert = 0, currentStyle = 'jade', filter = '全部', toastTimer = null;

let states = PROJECTS.map((p, i) => ({
  checks:[], reward:false, draft:null, orders:[], logs:[],
  works:[
    {id:`W${i+1}001`, title:i?'让竹编走进今天':'一针一线，绣进江南',
     text:i?'经纬之间，藏着手艺的温度。让传统竹编成为桌面上的日常风景。':'一针一线，绣进江南。\n把细腻的丝线与轻盈的日常相连，在街巷里寻找属于自己的东方色彩。',
     status:'待审核', template:'国潮宣言', craft:i?'竹编':'苏绣', tone:'东方诗意',
     style:i?'crimson':'jade', seed:'0x7A3F19C2', cost:'2.6'},
    {id:`W${i+1}002`, title:i?'剪纸的光，落在窗上':'木版年画，印进今天',
     text:i?'一把剪刀，一段红纸，把节气的形状留在窗棂上。\n让剪纸的光影，成为日常里的一点暖意。':'从一块木版开始，把年画里的吉祥纹样，印进今天的纸上。\n老手艺的线条，也可以很当代。',
     status:'已发布', template:i?'好物推荐':'城市漫游', craft:i?'剪纸':'木版年画',
     tone:i?'潮流宣言':'年轻松弛', style:i?'jade':'crimson', seed:'0x2C8E4D71', cost:'3.1', cert:null}
  ]
}));
const S = () => states[project];
const P = () => PROJECTS[project];

/* ---------- 基础工具 ---------- */
function logAct(type, text){
  const s = S(); if (!s.logs) s.logs = [];
  const d = new Date(), pad = x => String(x).padStart(2,'0');
  s.logs.unshift({ type, text, time: pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) });
  if (s.logs.length > 40) s.logs.length = 40;
}
function toast(text){
  const el = $('#toast');
  el.textContent = text; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.hidden = true, 3200);
}
function go(to){
  if (location.hash === '#' + to) render();
  else location.hash = to;
}
function setProject(v){
  project = Number(v); activeRecord = null; pointIndex = 0; activeCert = 0; filter = '全部';
  render(); toast('已切换项目，数据与模块组合独立展示');
}
function modal(title, body){
  $('#modal').innerHTML =
    '<div class="modal-head"><h2>' + title + '</h2><button class="close" onclick="closeModal()" aria-label="关闭">×</button></div>' +
    '<div class="modal-body">' + body + '</div>';
  $('#modal').showModal();
}
function closeModal(){ $('#modal').close(); }
function stepBar(labels, cur){
  return '<div class="steps">' + labels.map((l, i) =>
    '<div class="step ' + (i <= cur ? 'active' : '') + '"><i>' + (i < cur ? '✓' : i + 1) + '</i>' + l + '</div>').join('') + '</div>';
}
const pill = (txt, kind) => '<span class="tag ' + (kind || '') + '">' + txt + '</span>';
const statusTag = s => pill(s, s === '待审核' ? '' : s === '已发布' ? 'jade' : 'gray');

/* ---------- 页面：总览 ---------- */
function viewOverview(){
  const p = P(), s = S();
  const amount = p.base[3] + s.orders.reduce((a, b) => a + b.amount, 0);
  const enabledKeys = Object.keys(MODULES).filter(k => p.enabled[k]);

  const stats = [
    ['累计参与人次', (p.base[0] + s.checks.length).toLocaleString('zh-CN'), '人次', '参与触达', '+18.2%'],
    ['完成打卡', (p.base[1] + s.checks.length).toLocaleString('zh-CN'), '次', '线下互动', '+12.6%'],
    ['共创作品', (p.base[2] + s.works.length - 1).toLocaleString('zh-CN'), '件', '内容参与', '+34.6%'],
    ['文创预售额', '¥ ' + amount.toLocaleString('zh-CN'), '', '消费转化', '+22.8%']
  ];

  return `
  <div class="wrap">
    <section class="frame hero">
      <svg class="corner tl" viewBox="0 0 22 22"><path d="M1 8V1h7M1 4h4v4"/></svg>
      <svg class="corner tr" viewBox="0 0 22 22"><path d="M1 8V1h7M1 4h4v4"/></svg>
      <svg class="corner bl" viewBox="0 0 22 22"><path d="M1 8V1h7M1 4h4v4"/></svg>
      <svg class="corner br" viewBox="0 0 22 22"><path d="M1 8V1h7M1 4h4v4"/></svg>
      <div class="hero-l">
        <div class="kick">${p.name}</div>
        <h1>让老手艺<br>与<em>新生活</em>相遇</h1>
        <div class="en2">${p.sub}</div>
        <p>${p.intro}</p>
        <div class="hero-steps">
          <div class="hs"><div class="n">壹</div><b>非遗漫游</b><small>${p.route}</small></div>
          <div class="hs"><div class="n">贰</div><b>AI 共创</b><small>传统纹样 · 当代演绎</small></div>
          <div class="hs"><div class="n">叁</div><b>数字存证</b><small>链上唯一 · 永久留存</small></div>
        </div>
        <div class="buttons" style="margin-top:26px">
          <a class="btn solid" href="#experience">进入体验中心</a>
          <a class="btn ghost" href="#operations">运营工作台</a>
        </div>
      </div>
      <div class="hero-r">
        <div class="hero-seal"><div class="seal md">非遗<br>再造</div></div>
        ${heroArt()}
      </div>
    </section>

    <section class="stats">
      ${stats.map(([lb, v, unit, note, dlt]) => `
        <div class="stat">
          <div class="lb">${lb}</div>
          <div class="num${unit ? '' : ' money'}">${v}${unit ? '<i>' + unit + '</i>' : ''}</div>
          ${spark()}
          <div class="dlt">较上季 ${dlt} · ${note}</div>
        </div>`).join('')}
    </section>

    <div class="sec-h"><h2>三种方式，走近传统文化</h2><span class="en">${enabledKeys.length} Modules</span><i class="line"></i></div>
    <div class="grid-3">${moduleCards()}</div>

    ${p.crafts ? `<div class="crafts"><div class="ct">本季工艺</div><div class="list">${p.crafts.concat(['剪纸','竹编']).slice(0,5).map(c => '<span>' + c + '</span>').join('')}</div></div>` : ''}
  </div>`;
}

function spark(){
  const pts = [[0,20],[15,17],[30,18],[45,12],[60,14],[75,8],[90,10],[105,4],[120,6]];
  return '<svg class="spark" viewBox="0 0 120 26" preserveAspectRatio="none">' +
    '<polyline points="' + pts.map(p => p.join(',')).join(' ') + '" fill="none" stroke="' +
    'var(--jade)' + '" stroke-width="1.3"/></svg>';
}

function heroArt(){
  return `<svg viewBox="0 0 620 460" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f4ec"/><stop offset="1" stop-color="#e0e6da"/></linearGradient>
      <radialGradient id="hsun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e8c07a" stop-opacity=".85"/><stop offset="1" stop-color="#e8c07a" stop-opacity="0"/></radialGradient>
      <linearGradient id="hm1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa79b"/><stop offset="1" stop-color="#b7c6b8"/></linearGradient>
      <linearGradient id="hm2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d6f66"/><stop offset="1" stop-color="#7d9a90"/></linearGradient>
      <linearGradient id="hm3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4a44"/><stop offset="1" stop-color="#43625a"/></linearGradient>
      <linearGradient id="hcl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfbf4"/><stop offset="1" stop-color="#eae2cf"/></linearGradient>
      <filter id="hb"><feGaussianBlur stdDeviation="2.6"/></filter>
    </defs>
    <rect width="620" height="460" fill="url(#hsky)"/>
    <circle cx="430" cy="118" r="118" fill="url(#hsun)"/>
    <circle cx="430" cy="118" r="25" fill="#d98f6a" opacity=".5" filter="url(#hb)"/>
    <circle cx="430" cy="118" r="18" fill="#cf8260" opacity=".72"/>
    <g opacity=".38" filter="url(#hb)">
      <path d="M0 256 C36 256 50 196 84 184 C118 172 132 216 164 220 C196 224 210 168 244 158 C278 148 292 198 324 202 C356 206 370 164 404 156 C438 148 452 200 484 206 C516 212 530 176 564 168 C592 161 606 196 620 202 L620 350 L0 350Z" fill="url(#hm1)"/>
    </g>
    <path d="M0 322 C40 318 60 268 112 212 C150 171 172 268 214 300 C246 324 268 262 306 240 C344 218 366 284 402 292 C438 300 458 248 500 232 C534 219 556 278 590 288 L620 292 L620 416 L0 416Z" fill="url(#hm2)"/>
    <g stroke="#28403a" stroke-width=".85" opacity=".24" fill="none">
      <path d="M112 212 L104 288 M124 226 L136 296 M72 296 L66 346 M214 300 L208 358 M306 240 L300 302 M402 292 L396 350 M500 232 L494 292 M590 288 L584 342"/>
    </g>
    <g opacity=".95">
      <path d="M-20 366 q38 -23 76 -6 q30 -25 70 -8 q34 -19 64 6 q34 -15 60 9 q-28 23 -74 13 q-38 23 -80 6 q-44 21 -86 -2 q-24 -11 -30 -18Z" fill="url(#hcl)"/>
    </g>
    <g stroke="#c9a862" stroke-width="1" fill="none" opacity=".5">
      <path d="M52 214 q25 -17 50 -4 M160 174 q23 -11 44 4 M320 240 q23 -11 44 4 M456 266 q21 -9 40 4"/>
    </g>
    <path d="M0 420 L76 408 L142 420 L216 406 L620 406 L620 460 L0 460Z" fill="url(#hm3)" opacity=".92"/>
    <g stroke="#8fa79b" stroke-width=".8" fill="none" opacity=".45">
      <path d="M70 440 q17 5 34 0 M200 450 q17 5 34 0 M350 444 q17 5 34 0 M480 456 q17 5 34 0"/>
    </g>
  </svg>`;
}

function moduleCards(){
  return Object.keys(MODULES).filter(k => P().enabled[k]).map(k => {
    const d = MODULES[k];
    const meta = k === 'ar' ? '3 个探索点位' : k === 'ai' ? '3 种创作主题' : '3 个支持档位';
    return `<article class="biz-card">
      <div class="no">${d.number}</div>
      <div class="biz-ico">${I(d.key)}</div>
      <h3>${d.name}</h3>
      <div class="tg">${d.tag}</div>
      <p>${d.desc}</p>
      <div class="meta" style="margin-top:14px">${meta}</div>
      <a class="go" href="#${k}">${d.action}</a>
    </article>`;
  }).join('') || '<div class="frame panel empty"><h3>暂无启用的业务模块</h3><p>请在项目配置中启用模块。</p></div>';
}

/* ---------- 页面：体验中心 ---------- */
function viewExperience(){
  const s = S();
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><span>体验中心</span></div>
    <div class="page-head">
      <div class="kick">体验中心</div>
      <h1>把文化体验，交给年轻人</h1>
      <div class="desc">从寻宝到共创，再到文创好物。选择任意入口，逐级体验完整流程。</div>
    </div>

    <div class="crafts" style="margin-top:0">
      <div class="ct">体验路径</div>
      <div class="list"><span>壹 · 探索手艺</span><span>贰 · 表达灵感</span><span>叁 · 支持好物</span></div>
    </div>

    <div class="grid-3" style="margin-top:22px">${moduleCards()}</div>

    <section class="frame panel" style="margin-top:22px">
      <div class="panel-head"><h3>我的参与记录</h3>${pill('当前项目')}</div>
      <div class="mini-metrics">
        <div><b>${s.checks.length}/3</b><small>已集齐印章</small></div>
        <div><b>${s.works.length - 1}</b><small>本次共创作品</small></div>
        <div><b>${s.orders.length}</b><small>模拟预售订单</small></div>
      </div>
      <p class="meta" style="margin-top:16px">演示内容保留在当前页面会话中，可随时重置。切换项目后，将展示另一组独立记录。</p>
    </section>
  </div>`;
}

/* ---------- 页面：AR 寻宝 ---------- */
function viewAr(){
  const p = P(), s = S();
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><span>非遗寻宝</span></div>
    <div class="page-head">
      <div class="kick">非遗寻宝 · 非遗漫游线</div>
      <h1>寻一门手艺，集一枚印章</h1>
      <div class="desc">用一条城市漫游路线，连接分散的非遗体验。</div>
    </div>

    <div class="grid-side">
      <section class="frame panel">
        <div class="panel-head">
          <h3>${p.route}</h3>
          ${pill('城市漫游', 'jade')}
        </div>
        ${routeMap()}
        <div class="mini-metrics" style="margin-top:20px">
          <div><b>3</b><small>文化点位</small></div>
          <div><b>45′</b><small>建议时长</small></div>
          <div><b>1</b><small>限定徽章</small></div>
        </div>
        <div class="buttons" style="margin-top:20px">
          <a class="btn" href="#ar-route">查看路线与点位</a>
        </div>

        <div style="margin-top:26px;padding-top:20px;border-top:1px solid var(--gold-line-soft)">
          <div class="meta" style="letter-spacing:.14em;margin-bottom:16px">漫游须知</div>
          <div class="summary-line"><span>体验方式</span><b>到店扫码 · 模拟 AR 识别</b></div>
          <div class="summary-line"><span>建议时段</span><b>10:00 – 17:00</b></div>
          <div class="summary-line"><span>点位顺序</span><b>可自由选择</b></div>
          <div class="summary-line"><span>纪念徽章</span><b>集齐 3 枚解锁</b></div>
          <p class="meta" style="margin-top:14px">路线、距离与场馆均为演示设定，正式版本可对接真实位置服务。</p>
        </div>
      </section>

      <aside class="frame panel">
        <div class="panel-head"><h3>我的非遗印章册</h3>${pill(s.checks.length + ' / 3', s.checks.length === 3 ? 'jade' : '')}</div>
        <div class="stamp-book">
          ${p.crafts.map((n, i) => `<div class="stamp ${s.checks.includes(i) ? 'collected' : ''}"><b>${n}</b><small>${s.checks.includes(i) ? '已点亮' : '待探索'}</small></div>`).join('')}
        </div>
        <div class="progress"><i style="width:${s.checks.length / 3 * 100}%"></i></div>
        <p class="meta" style="margin-top:14px">集齐全部印章后可领取纪念徽章。</p>

        <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--gold-line-soft)">
          <div class="meta" style="letter-spacing:.14em;margin-bottom:14px">点位打卡进度</div>
          ${p.points.map((n2, i) => `<div class="summary-line"><span>${'零壹贰叁'[i+1]} · ${n2}</span><b style="font-size:12px;color:${s.checks.includes(i) ? 'var(--jade)' : 'var(--muted)'}">${s.checks.includes(i) ? '已点亮' : '待探索'}</b></div>`).join('')}
        </div>

        <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--gold-line-soft);display:flex;gap:16px;align-items:center">
          <div class="${s.reward ? 'achievement' : ''}" style="${s.reward ? '' : 'width:74px;height:74px;background:rgba(184,152,90,.08);border:1px dashed var(--gold-line);display:grid;place-items:center;text-align:center;font-family:var(--serif);font-size:12px;color:var(--muted);line-height:1.4'}">${s.reward ? '非遗<br>新潮<br>体验官' : '纪念<br>徽章'}</div>
          <div style="flex:1">
            <b style="font-size:13px;letter-spacing:.08em;display:block">${s.reward ? '已解锁漫游徽章' : '漫游纪念徽章'}</b>
            <span class="meta" style="display:block;margin-top:6px;line-height:1.7">${s.reward ? '你已完成全部点位探索。' : '集齐 3 枚数字印章后解锁。'}</span>
          </div>
        </div>

        <button class="btn ${s.reward ? 'ghost' : ''}" style="width:100%;margin-top:20px" onclick="claimReward()" ${s.checks.length < 3 || s.reward ? 'disabled' : ''}>${s.reward ? '已领取纪念徽章' : '领取纪念徽章'}</button>
      </aside>
    </div>
  </div>`;
}

function routeMap(){
  const p = P(), s = S();
  const nodes = [[146,268],[300,168],[462,208]];
  return `<div class="map-stage">${routeSvg()}
    ${nodes.map(([x, y], i) => `<button class="map-node ${s.checks.includes(i) ? 'selected' : ''}" style="left:calc(${(x/720*100).toFixed(2)}% - 22px);top:calc(${(y/420*100).toFixed(2)}% - 22px)" onclick="openPoint(${i})" aria-label="查看${p.points[i]}">${s.checks.includes(i) ? '✓' : '壹贰叁'[i]}${!s.checks.includes(i) ? '<span class="pulse"></span>' : ''}</button>`).join('')}
    <span class="map-label">路线示意 · 不提供真实导航</span>
  </div>`;
}

function routeSvg(){
  return `<svg viewBox="0 0 720 420">
    <defs>
      <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f2e6"/><stop offset="1" stop-color="#efe7d5"/></linearGradient>
      <pattern id="fret" width="34" height="34" patternUnits="userSpaceOnUse">
        <path d="M5 5h12v12H10v-7h5" fill="none" stroke="#b8985a" stroke-width=".6" opacity=".13"/>
      </pattern>
      <filter id="ms"><feGaussianBlur stdDeviation="2.4"/></filter>
    </defs>
    <rect width="720" height="420" fill="url(#mbg)"/>
    <rect width="720" height="420" fill="url(#fret)"/>
    <g opacity=".24" filter="url(#ms)">
      <path d="M-10 122 C30 122 44 78 76 66 C108 54 122 92 152 96 C182 100 194 56 226 46 C258 36 272 84 302 88 C332 92 344 62 376 54 C408 46 420 88 452 94 C484 100 496 68 528 60 C560 52 574 90 606 96 C638 102 660 74 690 70 C712 67 722 88 730 94 L730 154 L-10 154Z" fill="#8fa79b"/>
    </g>
    <path d="M-10 296 C140 282 220 322 340 310 C460 298 560 334 730 318 L730 420 L-10 420Z" fill="#dbe5e0" opacity=".7"/>
    <path d="M-10 296 C140 282 220 322 340 310 C460 298 560 334 730 318" fill="none" stroke="#8fa79b" stroke-width="1" opacity=".45"/>
    <g opacity=".75"><path d="M472 168 q20 -13 40 -3 q16 -15 36 -5 q18 -10 32 7 q-15 11 -38 7 q-20 11 -43 2 q-22 7 -36 -2 q7 -4 9 -6Z" fill="#fdfbf4"/></g>
    <path d="M146 268 C200 236 246 190 300 168 C364 153 396 212 462 208 C520 203 560 168 606 138" fill="none" stroke="#b8985a" stroke-width="1.5" opacity=".55"/>
    <path d="M146 268 C200 236 246 190 300 168 C364 153 396 212 462 208 C520 203 560 168 606 138" fill="none" stroke="#8f743c" stroke-width="2" stroke-dasharray="1 11" stroke-linecap="round" opacity=".85">
      <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.6s" repeatCount="indefinite"/>
    </path>
    <g transform="translate(268,352)">
      <path d="M0 0 q18 9 36 0 q-7 11 -18 11 q-11 0 -18 -11Z" fill="#3a2e24" opacity=".42"/>
      <path d="M16 -14 l0 -14 M5 -20 q11 -13 22 0" stroke="#3a2e24" stroke-width="1.2" fill="none" opacity=".42"/>
    </g>
    <g transform="translate(662,364)">
      <rect width="38" height="38" rx="2" fill="#a8322d" opacity=".88"/>
      <text x="19" y="16" text-anchor="middle" font-family="Songti SC,serif" font-size="11" fill="#fdf6ea">江</text>
      <text x="19" y="30" text-anchor="middle" font-family="Songti SC,serif" font-size="11" fill="#fdf6ea">南</text>
    </g>
  </svg>`;
}

function viewArRoute(){
  const p = P(), s = S();
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><a href="#ar">非遗寻宝</a><span>/</span><span>漫游路线</span></div>
    <div class="page-head">
      <div class="kick">漫游路线</div>
      <h1>${p.route}</h1>
      <div class="desc">点击地图点位或右侧列表，进入点位详情。</div>
    </div>
    ${stepBar(['选择路线','探索点位','模拟打卡','领取徽章'], 1)}
    <div class="grid-side">
      <section class="frame panel">
        <div class="panel-head"><h3>探索路线</h3>${pill('城市漫游', 'jade')}</div>
        ${routeMap()}
        <p class="meta" style="margin-top:16px">点位按故事线组织，可自由选择探索顺序。</p>
      </section>
      <aside class="frame panel">
        <div class="panel-head"><h3>文化点位</h3><span class="meta">已探索 ${s.checks.length} / 3</span></div>
        ${p.points.map((name, i) => {
          const done = s.checks.includes(i);
          return `<div class="point ${done ? 'done' : ''}">
            <span class="point-num">${'零壹贰叁'[i+1]}</span>
            <div><b>${name}</b><p>${p.crafts[i]} · ${['一印一色的东方想象','把细节留在指尖','纹样里的生活美学'][i]}</p></div>
            <button class="btn small ${done ? 'ghost' : ''}" onclick="openPoint(${i})">${done ? '已打卡' : '探索'}</button>
          </div>`;
        }).join('')}
        <div class="progress"><i style="width:${s.checks.length / 3 * 100}%"></i></div>
        <p class="meta" style="margin-top:14px">每完成一个点位，即可点亮对应数字印章。</p>
      </aside>
    </div>
  </div>`;
}

function openPoint(i){ pointIndex = i; go('ar-point'); }

function viewArPoint(){
  const p = P(), s = S(), done = s.checks.includes(pointIndex);
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><a href="#ar">非遗寻宝</a><span>/</span><a href="#ar-route">漫游路线</a><span>/</span><span>${p.points[pointIndex]}</span></div>
    <div class="page-head">
      <div class="kick">点位 ${'零壹贰叁'[pointIndex+1]}</div>
      <h1>${p.points[pointIndex]}</h1>
      <div class="desc">${p.crafts[pointIndex]} · 非遗文化体验点</div>
    </div>
    ${stepBar(['选择路线','探索点位','模拟打卡','领取徽章'], done ? 3 : 2)}
    <div class="grid-side">
      <section class="frame panel">
        <h2 style="font-size:21px;letter-spacing:.1em">${['一印一色，留下东方想象。','把时间，藏进手作细节。','让传统纹样，回到生活。'][pointIndex]}</h2>
        <p class="muted" style="margin:18px 0;line-height:2">在${p.points[pointIndex]}，从${p.crafts[pointIndex]}的工艺与纹样出发，发现传统文化与当代设计的连接。完成本点位的模拟识别，即可收集一枚数字印章。</p>
        <div class="summary-line"><span>本次体验</span><b>文化故事 + 模拟 AR 打卡</b></div>
        <div class="summary-line"><span>体验奖励</span><b>${p.crafts[pointIndex]}数字印章 × 1</b></div>
        <p class="meta" style="margin-top:18px">本页故事为原型策划示例，正式内容可由场馆或非遗传承人提供。</p>
      </section>
      <aside class="frame panel">
        <div class="gen-stage" style="text-align:center">
          <div style="width:74px;height:74px;margin:0 auto 16px;border:1px solid var(--gold-line);border-radius:50%;display:grid;place-items:center;color:var(--gold-dk)">
            <div style="width:32px;height:32px">${I('pin')}</div>
          </div>
          <h3 style="font-size:16px;letter-spacing:.1em">${done ? '本点位已完成打卡' : '发现藏在手艺里的印记'}</h3>
          <p class="meta" style="margin-top:10px">演示识别流程，无需摄像头和定位授权</p>
        </div>
        <button class="btn ${done ? 'ghost' : 'jade'}" style="width:100%;margin-top:16px" onclick="scanPoint()" ${done ? 'disabled' : ''}>${done ? '已获得数字印章' : '开始模拟识别'}</button>
        <a class="btn ghost" style="width:100%;margin-top:11px" href="#ar-route">返回探索路线</a>
      </aside>
    </div>
  </div>`;
}

function scanPoint(){
  const idx = pointIndex;
  if (S().checks.includes(idx)) return;
  modal('模拟 AR 识别', `
    <div class="gen-stage" style="text-align:center;margin-bottom:20px">
      <div style="width:74px;height:74px;margin:0 auto 16px;border:1px solid var(--gold-line);border-radius:50%;display:grid;place-items:center;color:var(--gold-dk)">
        <div style="width:32px;height:32px">${I('pin')}</div>
      </div>
      <h3 style="font-size:16px">已定位示例文化标识</h3>
      <p class="meta" style="margin-top:8px">${P().points[idx]} · ${P().crafts[idx]}</p>
    </div>
    <p class="muted" style="font-size:13.5px;margin-bottom:20px">点击下方按钮演示识别成功，并点亮对应数字印章。</p>
    <button class="btn solid" style="width:100%" onclick="completeScan(${idx})">模拟识别成功并打卡</button>`);
}

function completeScan(i){
  if (S().checks.includes(i)) return;
  S().checks.push(i);
  logAct('点位打卡', '完成「' + P().crafts[i] + '」点位打卡，已集 ' + S().checks.length + '/3 枚印章');
  closeModal(); render();
  modal('印章已点亮', `
    <div class="success-mark">✓</div>
    <h3 style="text-align:center;font-size:17px">获得「${P().crafts[i]}」数字印章</h3>
    <p class="muted" style="text-align:center;margin:12px 0 24px">已收集 ${S().checks.length}/3 枚，继续发现下一门手艺。</p>
    <div class="buttons" style="justify-content:center">
      <button class="btn solid" onclick="closeModal();go('ar-route')">继续探索</button>
      <button class="btn ghost" onclick="closeModal();go('ar')">查看印章册</button>
    </div>`);
}

function claimReward(){
  const s = S();
  if (s.checks.length !== 3 || s.reward) return;
  s.reward = true;
  logAct('成就解锁', '集齐 3 枚数字印章，领取「非遗新潮体验官」漫游纪念徽章');
  render();
  modal('漫游成就已解锁', `
    <div class="achievement">非遗<br>新潮<br>体验官</div>
    <p style="text-align:center;margin:22px 0;line-height:1.9">你已完成全部点位探索，<br>获得本项目数字纪念徽章。</p>
    <button class="btn solid" style="width:100%" onclick="closeModal();go('ai')">带着灵感去共创</button>`);
}

/* ---------- 页面：AI 共创 ---------- */
function viewAi(){
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><span>国潮共创</span></div>
    <div class="page-head">
      <div class="kick">国潮共创</div>
      <h1>让传统灵感，有你的表达</h1>
      <div class="desc">选择一个创作主题，体验从灵感输入到作品审核的完整流程。</div>
    </div>
    <div class="grid-3">
      ${['城市漫游','国潮宣言','好物推荐'].map((t, i) => `
        <article class="biz-card">
          <div class="no">${'壹贰叁'[i]}</div>
          <div class="biz-ico">${I('brush')}</div>
          <h3>${t}</h3>
          <div class="tg">文案共创</div>
          <p>${['把今天走过的街巷与见过的手艺，写成一段值得分享的城市故事。','用年轻的语言，重新诠释非遗的色彩、纹样与生活态度。','把工艺的细节和日常的用处，写成一份有温度的文创推荐。'][i]}</p>
          <a class="go" href="javascript:void(0)" onclick="startCreate('${t}')">选择主题</a>
        </article>`).join('')}
    </div>
    <section class="frame panel" style="margin-top:22px">
      <div class="panel-head"><h3>我的共创作品</h3><span class="meta">当前项目</span></div>
      ${worksTable(false)}
    </section>
  </div>`;
}

function worksTable(ops){
  const list = S().works.filter(w => !ops || filter === '全部' || w.status === filter);
  return `<div class="table-wrap"><table>
    <thead><tr><th>作品名称</th><th>创作主题</th><th>当前状态</th><th>操作</th></tr></thead>
    <tbody>${list.map(w => `<tr>
      <td>${esc(w.title)}</td><td>${w.template}</td><td>${statusTag(w.status)}</td>
      <td><button class="btn ghost small" onclick="openWork('${w.id}')">${ops && w.status === '待审核' ? '查看并审核' : '查看详情'}</button></td>
    </tr>`).join('') || '<tr><td colspan="4" class="empty-row">该状态下暂无作品</td></tr>'}</tbody>
  </table></div>`;
}

function startCreate(t){ template = t; S().draft = null; go('ai-editor'); }

function viewAiEditor(){
  const d = S().draft, st = getStyle(d ? d.style : currentStyle), p = P();
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><a href="#ai">国潮共创</a><span>/</span><span>创作工作室</span></div>
    <div class="page-head">
      <div class="kick">国潮灵感工作室</div>
      <h1>创作台</h1>
      <div class="desc">当前主题：${template} · 生成图为演示素材，出图流程为模拟效果</div>
    </div>
    ${stepBar(['选择主题','输入灵感','生成作品','提交审核'], d ? 2 : 1)}
    <div class="grid-side-l">
      <form class="frame panel" onsubmit="generateWork(event)">
        <div class="panel-head"><h3>你想表达什么</h3>${pill(template, 'jade')}</div>

        <div class="field"><span>文化元素</span>
          <div class="craft-grid" id="craft-grid">
            ${p.crafts.map(c => `<div class="cg ${(d ? d.craft === c : false) ? 'on' : ''}" onclick="pickCraft('${c}')">${I('seal')}<span>${c}</span></div>`).join('')}
          </div>
          <input type="hidden" id="craft" value="${d ? d.craft : p.crafts[0]}">
        </div>

        <div class="field"><span>出图风格</span>
          <div class="style-picker">
            ${STYLES.map(s => `<button type="button" class="style-card ${s.k === st.k ? 'active' : ''}" onclick="pickStyle('${s.k}')"><span class="style-check">✓</span><span class="style-thumb" style="background-image:url('${s.img}')"></span><span class="style-meta"><b>${s.name}</b><small>${s.desc}</small></span></button>`).join('')}
          </div>
        </div>

        <div class="field"><span>表达风格</span>
          <div class="tags" id="tone-tags">
            ${['年轻松弛','东方诗意','潮流宣言'].map(t => `<span class="chip ${(d ? d.tone === t : t === '东方诗意') ? 'on' : ''}" onclick="pickTone('${t}')">${t}</span>`).join('')}
          </div>
          <input type="hidden" id="tone" value="${d ? d.tone : '东方诗意'}">
        </div>

        <label class="field"><span>你的灵感</span>
          <textarea id="prompt" maxlength="180" placeholder="例如：周末和朋友一起寻找老街里的传统手艺，想写一段有年轻感的分享文案。">${esc(d ? d.prompt : '把传统纹样穿进日常，和朋友一起发现城市里的非遗新潮。')}</textarea>
          <small>最多 180 字；请勿输入真实个人信息。</small>
        </label>
        <button class="btn solid" type="submit" id="generate-btn" style="width:100%">${d ? '重新生成作品' : '开始生成作品'}</button>
      </form>

      <section class="frame panel">
        <div class="panel-head"><h3>作品预览</h3><span class="meta">模拟 AI 生成</span></div>
        ${d ? artResult(d) : genPanel()}
      </section>
    </div>
  </div>`;
}

function genPanel(){
  return `<div class="gen-panel-host"><div class="gen-stage">
    <div class="gen-head"><b>出图流程预览</b><span class="meta" style="margin-left:auto">模拟效果</span></div>
    <div class="gen-steps">${GEN_STAGES.map(s => `<div class="gen-step"><span class="dot">✓</span>${s}</div>`).join('')}</div>
    <div class="gen-bar"><i style="width:0%"></i></div>
  </div><p class="meta" style="margin-top:16px">填写灵感并选择风格后，点击「开始生成作品」，将依次执行以上四个阶段并输出预览图与创作参数。</p></div>`;
}
function genProgress(idx, pct){
  return `<div class="gen-stage">
    <div class="gen-head"><span class="gen-spinner"></span><b>正在生成作品…</b><span class="meta" style="margin-left:auto">${pct}%</span></div>
    <div class="gen-steps">${GEN_STAGES.map((s, i) => `<div class="gen-step ${i < idx ? 'done' : i === idx ? 'doing' : ''}"><span class="dot">✓</span>${s}</div>`).join('')}</div>
    <div class="gen-bar"><i style="width:${pct}%"></i></div>
  </div>`;
}

function pickCraft(c){
  $('#craft').value = c;
  $$('#craft-grid .cg').forEach((el, i) => el.classList.toggle('on', P().crafts[i] === c));
}
function pickTone(t){
  $('#tone').value = t;
  $$('#tone-tags .chip').forEach(el => el.classList.toggle('on', el.textContent === t));
}
function pickStyle(k){
  currentStyle = k;
  const d = S().draft;
  if (d){ d.style = k; render(); return; }
  $$('.style-card').forEach((el, i) => el.classList.toggle('active', STYLES[i].k === k));
}

function artResult(d){
  const st = getStyle(d.style);
  const pr = Object.assign({}, st.params, {随机种子:d.seed || '—', 风格:st.name});
  const rows = Object.keys(pr).map(k => `<div class="prow"><dt>${k}</dt><dd>${pr[k]}</dd></div>`).join('');
  return `
    <div class="art-result">
      <div class="art-frame">
        <span class="art-badge">${st.name}</span>
        <img src="${st.img}" alt="AI 生成示意图">
        <span class="art-num">AI GENERATED / DEMO</span>
      </div>
      <div class="art-params">
        <div class="param-head">创作参数<span>生成耗时 ${d.cost || '2.4'}s</span></div>
        <dl>${rows}</dl>
      </div>
    </div>
    <div class="result">
      <div class="eyebrow">${d.tone}</div>
      <h3>${esc(d.title)}</h3>
      <p>${esc(d.text)}</p>
    </div>
    <div class="buttons" style="margin-top:22px">
      <button class="btn solid" onclick="saveWork(true)">提交审核</button>
      <button class="btn ghost" onclick="saveWork(false)">保存草稿</button>
    </div>
    <p class="meta" style="margin-top:14px">提交并通过审核后，作品会自动生成链上存证并进入作品墙。</p>`;
}

function generateWork(e){
  e.preventDefault();
  if (busy) return;
  const prompt = $('#prompt').value.trim();
  if (!prompt){ toast('请先输入创作灵感'); return; }
  const craft = $('#craft').value, tone = $('#tone').value, p = project;
  const style = (S().draft && S().draft.style) || currentStyle;
  busy = true;
  const btn = $('#generate-btn');
  if (btn){ btn.disabled = true; btn.textContent = '正在生成…'; }
  const seed = Math.floor(Math.random() * 4294967295).toString(16).toUpperCase().padStart(8, '0');
  const host = $('.gen-panel-host');
  const t0 = Date.now();
  let idx = 0;
  const tick = () => {
    idx++;
    const pct = Math.min(100, Math.round(idx / GEN_STAGES.length * 100));
    if (idx < GEN_STAGES.length){ if (host) host.innerHTML = genProgress(idx, pct); setTimeout(tick, 540); return; }
    if (host) host.innerHTML = genProgress(GEN_STAGES.length - 1, 100);
    const cost = ((Date.now() - t0) / 1000).toFixed(1);
    const headlines = {'年轻松弛': craft + '，也可以很日常。', '东方诗意': '借一缕' + craft + '，写一页新章。', '潮流宣言': craft + '新主张，由我来表达。'};
    const bodies = {'年轻松弛': '今天的灵感来自' + craft + '。和朋友一起慢慢逛，把喜欢的纹样、色彩与手作记忆，收进自己的日常。',
      '东方诗意': '在' + craft + '的细节里，看见时间留下的温度。让旧时的匠心，与此刻的生活轻轻相逢。',
      '潮流宣言': craft + '不止属于过去，也属于此刻。把文化灵感穿进生活，让东方表达成为自己的风格。'};
    const leads = {'城市漫游':'走进街巷，让每一次发现都成为新故事。','国潮宣言':'传统从来不止一种打开方式。','好物推荐':'让一件好物，成为手艺与生活的连接。'};
    states[p].draft = {prompt, craft, tone, style, seed:'0x' + seed, cost,
      title: headlines[tone], text: leads[template] + '\n\n' + prompt + '\n\n' + bodies[tone] + '\n\n#非遗新潮 #' + craft + ' #' + template};
    busy = false;
    if (project === p && route === 'ai-editor') render();
  };
  if (host) host.innerHTML = genProgress(0, 25);
  setTimeout(tick, 600);
}

function saveWork(submit){
  const d = S().draft; if (!d) return;
  const w = {id:'W' + Date.now().toString().slice(-7), title:d.title, text:d.text,
    status: submit ? '待审核' : '草稿', template, craft:d.craft, tone:d.tone, style:d.style, seed:d.seed, cost:d.cost};
  S().works.unshift(w); S().draft = null; activeRecord = w.id;
  go('work-detail');
  toast(submit ? '作品已提交，等待运营审核' : '草稿已保存');
}

function openWork(id){ activeRecord = id; go('work-detail'); }

const TRANSITIONS = {'草稿':['待审核'], '待审核':['已批准','已退回'], '已退回':['草稿'], '已批准':['已发布'], '已发布':[]};

function viewWorkDetail(){
  let w = S().works.find(x => x.id === activeRecord) || S().works[0];
  activeRecord = w.id;
  if (w.status === '已发布' && !w.cert) w.cert = makeCert(w, project);
  const roleLock = role === 'viewer';
  const actions = w.status === '草稿' ? `<button class="btn solid" onclick="transitionWork('待审核')">提交审核</button>`
    : w.status === '待审核' ? `<button class="btn solid" onclick="transitionWork('已批准')" ${roleLock ? 'disabled' : ''}>批准作品</button><button class="btn ghost" onclick="rejectWork()" ${roleLock ? 'disabled' : ''}>退回修改</button>`
    : w.status === '已批准' ? `<button class="btn solid" onclick="transitionWork('已发布')" ${roleLock ? 'disabled' : ''}>发布到作品墙</button>`
    : w.status === '已退回' ? `<button class="btn solid" onclick="transitionWork('草稿')">修改并保存草稿</button>`
    : `<a class="btn" href="#gallery">查看作品墙</a>`;

  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#ai">国潮共创</a><span>/</span><span>作品详情</span></div>
    <div class="page-head">
      <div class="kick">作品编号 ${w.id}</div>
      <h1>${esc(w.title)}</h1>
      <div class="desc">${P().name} · ${w.template}</div>
    </div>
    <div class="grid-side">
      <section class="frame panel">
        <div class="panel-head"><h3>作品内容</h3>${statusTag(w.status)}</div>
        ${w.style ? `<div class="art-frame" style="aspect-ratio:16/10;margin-bottom:20px"><span class="art-badge">${getStyle(w.style).name}</span><img src="${getStyle(w.style).img}" alt="生成作品示意图"></div>` : ''}
        <div class="result" style="margin-top:0"><p>${esc(w.text)}</p></div>
        ${w.status === '已退回' ? `<div style="margin-top:20px"><b style="font-size:13px;letter-spacing:.08em">退回原因</b><p class="meta" style="margin:8px 0 14px">${esc(w.reason || '')}</p><label class="field"><span>修改文案</span><textarea id="edit-work" maxlength="2000">${esc(w.text)}</textarea></label></div>` : ''}
        <p class="meta" style="margin-top:18px">示例共创内容，未调用真实 AI 服务。</p>
        ${w.cert ? chainBlock(w.cert) : w.status === '已发布' ? '' : `<div class="chain-pending"><b>链上存证</b><p class="meta">作品通过审核并发布后，系统将自动生成唯一认证编号与链上存证信息。</p></div>`}
      </section>
      <aside class="frame panel">
        <div class="panel-head"><h3>审核与发布流程</h3>${pill(role === 'viewer' ? '访客视角' : '运营视角', 'gray')}</div>
        <div class="timeline">
          ${[['草稿','保存创作内容'],['待审核','运营核对文化表达'],['已批准','确认内容可对外展示'],['已发布','进入项目作品墙']].map(([st, ds]) => `<div><b>${st}</b> ${w.status === st ? pill('当前状态', 'jade') : ''}<p class="meta" style="margin-top:5px">${ds}</p></div>`).join('')}
        </div>
        <div class="buttons" style="margin-top:20px">${actions}</div>
        ${roleLock && ['待审核','已批准'].includes(w.status) ? '<p class="meta" style="margin-top:14px">访客视角下不可执行审核操作，可在运营工作台切换角色。</p>' : ''}
        <div style="margin-top:22px">${chainMini(w)}</div>
      </aside>
    </div>
  </div>`;
}

function chainMini(w){
  if (!w.cert) return '';
  const c = w.cert;
  return `<div style="border-top:1px solid var(--gold-line-soft);padding-top:18px">
    <div class="meta" style="letter-spacing:.14em;margin-bottom:12px">存证摘要</div>
    <div class="summary-line"><span>认证编号</span><b class="mono" style="font-size:11.5px;color:var(--gold-dk)">${c.no}</b></div>
    <div class="summary-line"><span>区块高度</span><b class="mono" style="font-size:11.5px">${c.block}</b></div>
    <div class="summary-line"><span>所属链</span><b style="font-size:12px">${c.chain}</b></div>
  </div>`;
}

function rejectWork(){
  modal('退回作品', `<form onsubmit="event.preventDefault();transitionWork('已退回',document.getElementById('reason').value)">
    <label class="field"><span>修改建议</span><textarea id="reason" required maxlength="200" placeholder="例如：请补充工艺特色，并调整文案表达。"></textarea></label>
    <button class="btn solid" type="submit" style="width:100%">确认退回</button></form>`);
}

function transitionWork(next, reason){
  const w = S().works.find(x => x.id === activeRecord);
  if (!w || !TRANSITIONS[w.status].includes(next)){ toast('当前状态不允许执行此操作'); return; }
  if (['已批准','已退回','已发布'].includes(next) && role !== 'operator'){ toast('访客没有审核或发布权限'); return; }
  if (next === '已退回' && !String(reason || '').trim()){ toast('请填写修改建议'); return; }
  if (w.status === '已退回' && next === '草稿'){
    const el = $('#edit-work'), text = el ? el.value.trim() : '';
    if (!text){ toast('作品内容不能为空'); return; }
    w.text = text;
  }
  const prevStatus = w.status;
  w.status = next;
  if (reason) w.reason = reason;
  if (next === '已发布' && !w.cert) w.cert = makeCert(w, project);
  logAct('审核流转', '《' + w.title + '》' + prevStatus + ' → ' + next + (reason ? '（' + reason + '）' : ''));
  closeModal(); render();
  toast(next === '已发布' ? '作品已发布，并完成链上存证' : '作品已更新为' + next);
}

/* ---------- 页面：作品墙 ---------- */
function viewGallery(){
  const list = [];
  states.forEach((s, pi) => s.works.forEach(w => { if (w.status === '已发布') list.push({w, pi}); }));
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#ai">国潮共创</a><span>/</span><span>作品墙</span></div>
    <div class="page-head">
      <div class="kick">共创有回响</div>
      <h1>项目作品墙</h1>
      <div class="desc">已通过审核并发布到作品墙的共创内容，每件作品都已生成链上存证。</div>
    </div>
    ${list.length ? `<div class="wall">${list.map(({w, pi}) => {
      const st = w.style ? getStyle(w.style) : null;
      return `<article class="wall-card">
        <div class="wall-pic">
          ${st ? `<span class="art-badge">${st.name}</span><img src="${st.img}" alt="作品示意图">` : ''}
        </div>
        <div class="wall-bd">
          <div class="tt">${esc(w.title)}</div>
          <div class="mt"><span>${PROJECTS[pi].name}</span><span>${w.template}</span></div>
          <button class="btn ghost small" onclick="openWork('${w.id}')">查看详情</button>
        </div>
      </article>`;
    }).join('')}</div>` : `<div class="frame panel wall-empty"><h3>作品墙还没有内容</h3><p>在运营工作台批准并发布一件共创作品，它就会出现在这里。</p><a class="btn" href="#operations">进入运营工作台</a></div>`}
  </div>`;
}

/* ---------- 页面：运营工作台 ---------- */
const OPS_TABS = [['works','作品审核'], ['collectibles','数字藏品'], ['orders','预售订单'], ['logs','操作记录']];

function viewOperations(){
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><span>运营工作台</span></div>
    <div class="page-head">
      <div class="kick">运营工作台</div>
      <h1>看见参与，也看见转化</h1>
      <div class="desc">管理当前项目的共创作品、预售订单和操作记录。</div>
    </div>
    <div class="stepbar" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
      ${OPS_TABS.map(([k, n]) => `<button class="tag ${opsTab === k ? 'jade' : 'gray'}" style="padding:9px 16px;cursor:pointer" onclick="setOpsTab('${k}')">${n}</button>`).join('')}
      <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
        <span class="meta">演示角色</span>
        <select onchange="setRole(this.value)" style="border:1px solid var(--gold-line-soft);background:rgba(255,253,248,.7);padding:8px 12px;font-size:12.5px;outline:none">
          <option value="operator" ${role === 'operator' ? 'selected' : ''}>运营</option>
          <option value="viewer" ${role === 'viewer' ? 'selected' : ''}>访客</option>
        </select>
      </div>
    </div>
    <section class="frame panel">${opsPanel()}</section>
  </div>`;
}

let opsTab = 'works';
function setOpsTab(k){ opsTab = k; render(); }
function setRole(v){ role = v; render(); toast('已切换为' + (v === 'operator' ? '运营' : '访客') + '视角'); }

function opsPanel(){
  const s = S();
  if (opsTab === 'collectibles') return collectiblesPanel();
  if (opsTab === 'orders'){
    return `<div class="panel-head"><h3>预售订单</h3><span class="meta">${s.orders.length} 笔</span></div>` +
      (s.orders.length ? `<div class="table-wrap"><table><thead><tr><th>订单号</th><th>档位</th><th>金额</th><th>时间</th></tr></thead><tbody>${s.orders.map(o => `<tr><td class="mono" style="font-size:11.5px">${o.no}</td><td>${o.tier}</td><td>¥ ${o.amount.toLocaleString('zh-CN')}</td><td class="meta">${o.time}</td></tr>`).join('')}</tbody></table></div>`
        : '<div class="empty"><h3>暂无预售订单</h3><p>在好物预售中完成一笔模拟订单，即可在此查看。</p><a class="btn" href="#crowd">前往好物预售</a></div>');
  }
  if (opsTab === 'logs'){
    const logs = s.logs || [];
    return `<div class="panel-head"><h3>操作记录</h3><span class="meta">当前会话 · ${logs.length} 条</span></div>` +
      (logs.length
        ? `<div class="timeline">${logs.map(l => `<div><b>${esc(l.text)}</b><p class="meta" style="margin-top:5px">${esc(l.type)} · ${esc(l.time)}</p></div>`).join('')}</div>`
        : '<div class="empty" style="padding:40px 16px"><h3>暂无操作记录</h3><p>审核流转、点位打卡、支持下单等操作会实时记录在这里。</p></div>');
  }
  return `<div class="panel-head"><h3>作品审核</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${['全部','待审核','已批准','已发布','草稿','已退回'].map(f => `<button class="tag ${filter === f ? 'jade' : 'gray'}" style="cursor:pointer" onclick="setFilter('${f}')">${f}</button>`).join('')}</div>
    </div>` + worksTable(true);
}
function setFilter(f){ filter = f; render(); }

function collectiblesPanel(){
  const list = [];
  states.forEach((s, pi) => s.works.forEach(w => {
    if (w.status === '已发布'){ if (!w.cert) w.cert = makeCert(w, pi); list.push({w, cert:w.cert, proj:PROJECTS[pi].name, own:pi === project}); }
  }));
  if (!list.length){
    return `<div class="panel-head"><h3>数字藏品</h3></div>
      <div class="empty"><h3>还没有已上链的藏品</h3><p>在运营工作台批准并发布一件共创作品，它就会自动完成链上存证并出现在这里。</p><a class="btn" href="#operations">进入运营工作台</a></div>`;
  }
  if (activeCert >= list.length) activeCert = 0;
  const cur = list[activeCert], c = cur.cert, st = cur.w.style ? getStyle(cur.w.style) : null;
  return `
  <div class="panel-head"><h3>数字藏品</h3><span class="meta">共 ${list.length} 件 · 链上存证</span></div>
  <div class="collectible">
    <div>
      <div class="coll-frame">
        ${st ? `<img src="${st.img}" alt="数字藏品示意图">` : ''}
        <div class="coll-seal"><div class="seal md">已<br>存证</div></div>
      </div>
      <div class="coll-meta" style="margin-top:20px">
        <div class="result" style="margin:0 0 18px"><div class="eyebrow">${cur.proj}</div><h3 style="font-size:16px;margin:9px 0 0">${esc(cur.w.title)}</h3></div>
        <dl>
          <dt>认证编号</dt><dd class="mono">${c.no}</dd>
          <dt>区块高度</dt><dd class="mono">${c.block}</dd>
          <dt>数字指纹</dt><dd class="mono">${c.fp}</dd>
          <dt>存证时间</dt><dd class="mono">${c.time}</dd>
        </dl>
      </div>
    </div>
    <div>
      <div class="meta" style="letter-spacing:.14em;margin-bottom:14px">藏品列表</div>
      <div class="coll-list">
        ${list.map((it, i) => `<button class="coll-item ${i === activeCert ? 'active' : ''}" onclick="selectCert(${i})">
          ${it.w.style ? `<img src="${getStyle(it.w.style).img}" alt="">` : ''}
          <span><b>${esc(it.w.title)}</b><small>${it.cert.no}</small></span>
        </button>`).join('')}
      </div>
      <div style="margin-top:22px">${chainBlock(c)}</div>
    </div>
  </div>`;
}
function selectCert(i){ activeCert = i; render(); }

/* ---------- 页面：好物预售 ---------- */
let crowdView = 'list';
function viewCrowd(){
  const p = P(), s = S();
  const amount = p.base[3] + s.orders.reduce((a, b) => a + b.amount, 0);
  const pct = Math.min(100, amount / p.goal * 100);
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><a href="#experience">体验中心</a><span>/</span><span>好物预售</span></div>
    <div class="page-head">
      <div class="kick">好物预售</div>
      <h1>让手艺，走进你的日常</h1>
      <div class="desc">了解文创计划，选择支持档位，完成模拟预售订单。</div>
    </div>
    <div class="grid-side">
      <section class="frame panel">
        <span class="badge"></span>
        <div class="panel-head"><h3>${p.product}</h3>${pill('文创预售', 'jade')}</div>
        <p class="muted" style="line-height:2">${p.productDesc}</p>
        <div class="mini-metrics" style="margin-top:20px">
          <div><b>${(p.backers + s.orders.length)}</b><small>支持人数</small></div>
          <div><b>${Math.round(pct)}%</b><small>达成进度</small></div>
          <div><b>${Math.max(0, Math.ceil((p.goal - amount) / 268))}</b><small>剩余份额</small></div>
        </div>
        <div class="progress" style="margin-top:20px"><i style="width:${pct}%"></i></div>
        <div class="summary-line" style="margin-top:18px;border:0"><span>已获支持金额</span><b style="font-family:var(--serif);font-size:22px">¥ ${amount.toLocaleString('zh-CN')}</b></div>
        <p class="meta">目标金额 ¥ ${p.goal.toLocaleString('zh-CN')} · 演示数据</p>

        <div class="sec-h" style="margin:30px 0 16px"><h2 style="font-size:17px">选择支持档位</h2><i class="line"></i></div>
        ${TIERS.map((t, i) => `<div class="coll-item ${i === selectedTier ? 'active' : ''}" style="grid-template-columns:1fr;cursor:pointer" onclick="pickTier(${i})">
          <span><b style="display:flex;justify-content:space-between;align-items:baseline"><span>${t.name}</span><em style="font-style:normal;font-family:var(--serif);font-size:19px;color:var(--gold-dk)">¥ ${t.price}</em></b><small style="font-family:var(--sans);font-size:11.5px;color:var(--muted);letter-spacing:0">${t.desc}</small></span>
        </div>`).join('')}

        <div class="summary-line" style="margin-top:20px"><span>应付金额（演示）</span><b style="font-family:var(--serif);font-size:22px">¥ ${TIERS[selectedTier].price}</b></div>
        <button class="btn solid" style="width:100%;margin-top:18px" onclick="placeOrder()">确认支持 · 模拟下单</button>
        <p class="meta" style="margin-top:14px">仅演示下单流程，不进行扣款或真实发货。</p>
      </section>
      <aside class="frame panel">
        <div class="panel-head"><h3>预售说明</h3></div>
        <div class="timeline">
          <div><b>非遗灵感</b><p class="meta" style="margin-top:5px">从传统工艺中提取纹样与色彩语言</p></div>
          <div><b>当代设计</b><p class="meta" style="margin-top:5px">以现代版型重新演绎传统纹样</p></div>
          <div><b>限量发售</b><p class="meta" style="margin-top:5px">预售达到目标后进入正式生产</p></div>
          <div><b>链上存证</b><p class="meta" style="margin-top:5px">每件文创对应一份数字存证</p></div>
        </div>
      </aside>
    </div>
  </div>`;
}
function pickTier(i){ selectedTier = i; render(); }
function placeOrder(){
  const t = TIERS[selectedTier], s = S();
  const no = 'OPC' + Date.now().toString().slice(-9);
  s.orders.unshift({no, tier:t.name, amount:t.price, time:new Date().toLocaleString('zh-CN', {hour12:false})});
  logAct('文创支持', '支持「' + t.name + '」¥' + t.price.toLocaleString('zh-CN') + '，订单 ' + no);
  render();
  modal('支持成功', `<div class="success-mark">✓</div>
    <h3 style="text-align:center;font-size:17px">已支持「${t.name}」</h3>
    <p class="muted" style="text-align:center;margin:12px 0 24px">这是模拟订单，不会产生真实扣款。<br>订单已记录到运营工作台。</p>
    <div class="buttons" style="justify-content:center">
      <button class="btn solid" onclick="closeModal();go('operations')">查看运营工作台</button>
      <button class="btn ghost" onclick="closeModal()">继续浏览</button>
    </div>`);
}

/* ---------- 页面：项目配置 ---------- */
function viewConfig(){
  const p = P();
  return `
  <div class="wrap">
    <div class="crumb"><a href="#overview">项目总览</a><span>/</span><span>项目配置</span></div>
    <div class="page-head">
      <div class="kick">项目配置</div>
      <h1>同一套平台，不同的文化现场</h1>
      <div class="desc">切换项目、组合业务模块、并即时查看体验端变化。</div>
    </div>
    <div class="grid-2">
      <section class="frame panel">
        <div class="panel-head"><h3>业务模块组合</h3>${pill('即时生效 · 演示', 'jade')}</div>
        ${Object.keys(MODULES).map(k => {
          const d = MODULES[k];
          return `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed var(--gold-line-soft)">
            <div class="biz-ico" style="width:40px;height:40px">${I(d.key)}</div>
            <div style="flex:1"><b style="font-size:13.5px;display:block">${d.name}</b><span class="meta">${d.tag} · ${d.desc}</span></div>
            ${pill(p.enabled[k] ? '已启用' : '未启用', p.enabled[k] ? 'jade' : 'gray')}
          </div>`;
        }).join('')}
        <p class="meta" style="margin-top:16px">模块组合在正式版本中可由运营后台配置，此处为演示展示。</p>
      </section>
      <section class="frame panel">
        <div class="panel-head"><h3>项目切换</h3><span class="meta">共 ${PROJECTS.length} 个</span></div>
        ${PROJECTS.map((pr, i) => `<div class="coll-item ${i === project ? 'active' : ''}" style="grid-template-columns:1fr;cursor:pointer" onclick="setProject(${i})">
          <span><b>${pr.name}</b><small style="font-family:var(--sans);font-size:11.5px;color:var(--muted);letter-spacing:0;margin-top:6px;line-height:1.7">${pr.intro}</small></span>
        </div>`).join('')}
        <p class="meta" style="margin-top:16px">切换项目后，体验端数据、印章册与作品记录将独立展示。</p>
        <div style="margin-top:22px;border-top:1px solid var(--gold-line-soft);padding-top:18px">
          <div class="meta" style="letter-spacing:.14em;margin-bottom:12px">技术选型（待确认）</div>
          <div class="summary-line"><span>后端</span><b>Node.js + TypeScript</b></div>
          <div class="summary-line"><span>数据库</span><b>SQLite (Prisma)</b></div>
          <div class="summary-line"><span>前端</span><b>Vue 3</b></div>
          <p class="meta" style="margin-top:12px">当前为纯静态原型，零构建、零依赖、全内存态。</p>
        </div>
      </section>
    </div>
  </div>`;
}

/* ---------- 路由 ---------- */
const ROUTES = {
  overview: viewOverview,
  experience: viewExperience,
  ar: viewAr,
  'ar-route': viewArRoute,
  'ar-point': viewArPoint,
  ai: viewAi,
  'ai-editor': viewAiEditor,
  'work-detail': viewWorkDetail,
  gallery: viewGallery,
  operations: viewOperations,
  crowd: viewCrowd,
  config: viewConfig
};
const NAV = [['overview','总览'],['experience','体验中心'],['gallery','作品墙'],['operations','运营工作台'],['config','项目配置']];
const NAV_ROUTE = to => {
  if (['ar','ar-route','ar-point'].includes(to)) return 'experience';
  if (['ai','ai-editor','work-detail'].includes(to)) return 'experience';
  if (to === 'crowd') return 'experience';
  return to;
};

function render(){
  route = location.hash.slice(1) || 'overview';
  const fn = ROUTES[route] || viewOverview;
  document.title = '非遗·造物 · ' + P().name + ' · 交互演示';
  $('#app').innerHTML = '<div class="view">' + fn() + '</div>';
  $('#navlinks').innerHTML = NAV.map(([to, label]) =>
    `<a href="#${to}" class="${NAV_ROUTE(route) === to ? 'on' : ''}">${label}</a>`).join('');
  const sel = $('#proj-select');
  if (sel) sel.value = String(project);
  window.scrollTo({top:0, behavior:'smooth'});
  $$('.navlinks a').forEach(a => a.addEventListener('click', () => $('#navlinks').classList.remove('open')));
}

/* ---------- 初始化 ---------- */
window.addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', () => {
  $('#menu-btn').addEventListener('click', () => $('#navlinks').classList.toggle('open'));
  $('#proj-select').addEventListener('change', e => setProject(e.target.value));
  const dlg = $('#modal');
  dlg.addEventListener('click', e => {
    if (e.target === dlg){
      const r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal();
    }
  });
  render();
});
/* 供内联 onclick 调用 */
window.go = go; window.setProject = setProject; window.toast = toast;
window.openPoint = openPoint; window.scanPoint = scanPoint; window.completeScan = completeScan;
window.claimReward = claimReward; window.startCreate = startCreate; window.pickCraft = pickCraft;
window.pickTone = pickTone; window.pickStyle = pickStyle; window.generateWork = generateWork;
window.saveWork = saveWork; window.openWork = openWork; window.transitionWork = transitionWork;
window.rejectWork = rejectWork; window.selectCert = selectCert; window.setOpsTab = setOpsTab;
window.setRole = setRole; window.setFilter = setFilter; window.pickTier = pickTier;
window.placeOrder = placeOrder; window.closeModal = closeModal;
window.opsTabSet = () => {};
Object.defineProperty(window, 'opsTab', {get:()=>opsTab, set:v=>opsTab=v});
Object.defineProperty(window, 'filter', {get:()=>filter, set:v=>filter=v});
