(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const d=e=>document.querySelector(e);window.$=d;const J=(e=180,t=50)=>`
  <svg width="${e}" height="${t}" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
    <!-- Light Blue Ribbon/Swoosh flourishes around the text -->
    <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
    <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
    
    <!-- Subtle glow on the outer swoosh -->
    <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>

    <!-- Book icon matching the user logo -->
    <g transform="translate(68, 2)">
      <!-- Left half -->
      <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
      <!-- Right half -->
      <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
      <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
      <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
    </g>

    <!-- Main Title: Studia -->
    <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
    <!-- Subtitle: GRADE ESCOLAR DIGITAL -->
    <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
  </svg>
`,B=e=>{const t=d("#app");t&&(t.innerHTML=e,typeof lucide<"u"&&lucide.createIcons())},m=(e,{confirm:t=!1,title:a="Studia"}={})=>new Promise(r=>{var l;const s=document.createElement("div");s.style.cssText="position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.55);backdrop-filter:blur(5px);font-family:system-ui,sans-serif;",s.innerHTML=`
    <div style="width:min(100%,440px);background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,.25);padding:28px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;color:#2563eb;">
        <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;">S</div>
        <h3 style="margin:0;color:#0f172a;font-size:18px;font-weight:800;">${a}</h3>
      </div>
      <p data-dialog-message style="margin:0;color:#475569;font-size:14px;line-height:1.6;white-space:pre-line;"></p>
      <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">
        ${t?'<button data-dialog-cancel type="button" style="border:1px solid #e2e8f0;background:#fff;color:#475569;border-radius:10px;padding:11px 20px;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:14px;">Cancelar</button>':""}
        <button data-dialog-ok type="button" style="border:0;background:#2563eb;color:#fff;border-radius:10px;padding:11px 22px;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:14px;box-shadow:0 4px 12px rgba(37,99,235,0.25);">${t?"Confirmar":"Entendi"}</button>
      </div>
    </div>`,s.querySelector("[data-dialog-message]").textContent=e;const o=n=>{s.remove(),r(n)};s.querySelector("[data-dialog-ok]").addEventListener("click",()=>o(!0)),(l=s.querySelector("[data-dialog-cancel]"))==null||l.addEventListener("click",()=>o(!1)),s.addEventListener("click",n=>{n.target===s&&o(!1)}),document.body.appendChild(s),s.querySelector("[data-dialog-ok]").focus()});let i=null;try{const e=localStorage.getItem("user");e&&e!=="undefined"&&e!=="null"&&(i=JSON.parse(e))}catch(e){console.error("Error parsing user from localStorage:",e)}let $=[],z=[],N=[],V=[],j={total:0,confirmed:0,absent:0,pending:0},b="horarios",A="closed",G=[],O=[],T="all",y="matutino",U="all",W="COLÉGIO ESTADUAL PROF. JÚLIO SZYMANSKI - MATUTINO",Z="urania",P="prof_turma",v=localStorage.getItem("reportCardSize")||"medium",le="grid",ie=!1,se=!1,E=(localStorage.getItem("api_base_url")||"").trim();(E==="undefined"||E==="null"||E==="/")&&(E="");const Me=["localhost","127.0.0.1","::1"].includes(window.location.hostname),Ee=window.location.hostname.endsWith(".onrender.com");Me&&(E="http://localhost:3000",localStorage.removeItem("api_base_url"));Ee&&(E="",localStorage.removeItem("api_base_url"));const Re=!Me&&!Ee;Re&&(E="https://studia-8st9.onrender.com",localStorage.setItem("api_base_url",E));const ye=e=>{if(e.startsWith("http://")||e.startsWith("https://"))return e;const t=e.startsWith("/")?e:"/"+e;return E?`${E.endsWith("/")?E.slice(0,-1):E}${t}`:t},h={async request(e,t={}){let a=ye(e),r;try{const l={"Content-Type":"application/json",...t.headers};i!=null&&i.accessToken&&(l.Authorization=`Bearer ${i.accessToken}`),r=await fetch(a,{...t,headers:l})}catch(l){console.error("Fetch error on primary URL:",l);let n=null;if(a.includes("ais-pre-")?n=a.replace("ais-pre-","ais-dev-"):a.includes("ais-dev-")&&(n=a.replace("ais-dev-","ais-pre-")),n){console.log("Trying fallback API URL:",n);try{r=await fetch(n,{...t,headers:{"Content-Type":"application/json",...t.headers,...i!=null&&i.accessToken?{Authorization:`Bearer ${i.accessToken}`}:{}}});const c=new URL(n).origin;E=c,localStorage.setItem("api_base_url",c),a=n}catch(p){throw console.error("Fetch error on fallback URL:",p),new Error(`Erro de conexão com o servidor de API.

Tentamos:
1. ${a}
2. ${n}

Verifique se o seu servidor Cloud Run está ativo.`)}}else throw new Error(`Erro de conexão com o servidor de API (${a}).`)}if(r.status===401&&(i!=null&&i.refreshToken)&&!e.startsWith("/api/auth/"))try{const l=await fetch(ye("/api/auth/refresh"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:i.refreshToken})}),n=await l.json();if(l.ok){i={...i,accessToken:n.accessToken,refreshToken:n.refreshToken},localStorage.setItem("user",JSON.stringify(i));const p={"Content-Type":"application/json",...t.headers,Authorization:`Bearer ${i.accessToken}`};r=await fetch(a,{...t,headers:p})}}catch(l){console.error("Session refresh failed:",l)}const s=await r.text();let o;try{o=JSON.parse(s)}catch(l){throw console.error("Parse error:",l),new Error(`Resposta inválida do servidor de API (${a}).`)}if(!r.ok)throw new Error(o.error||`Erro ${r.status}`);return o},async post(e,t){return this.request(e,{method:"POST",body:JSON.stringify(t)})},async get(e){return this.request(e,{method:"GET"})},async patch(e,t){return this.request(e,{method:"PATCH",body:JSON.stringify(t)})},async delete(e){return this.request(e,{method:"DELETE"})}},K=e=>{const t=e.split("-");return t.length===3?new Date(parseInt(t[0],10),parseInt(t[1],10)-1,parseInt(t[2],10)):new Date(e)},ce=e=>{const t=K(e),a=t.getDay(),r=t.getDate()-a+(a===0?-6:1),s=new Date(t);s.setDate(r);const o=s.getFullYear(),l=String(s.getMonth()+1).padStart(2,"0"),n=String(s.getDate()).padStart(2,"0");return`${o}-${l}-${n}`},ne=e=>{const t=K(e),a=new Date(t);a.setDate(t.getDate()+4);const r=s=>{const o=String(s.getDate()).padStart(2,"0"),l=String(s.getMonth()+1).padStart(2,"0");return`${o}/${l}`};return`Semana de ${r(t)} a ${r(a)}`},Be=()=>{const e=new Set;return $.forEach(t=>{if(t.date)try{e.add(ce(t.date))}catch(a){console.error("Error formatting week:",a)}}),Array.from(e).sort().reverse()},pe=()=>{const e=new Set;return $.forEach(t=>{t.startTime&&e.add(t.startTime)}),Array.from(e).sort()},Ne=e=>{const t=new Set;return e.forEach(a=>{a.classGroup&&t.add(a.classGroup)}),Array.from(t).sort()},je=e=>{const t=e.getDay();return t===0?7:t},Ge=(e,t)=>t==="matutino"?e>="07:00"&&e<"12:00":t==="vespertino"?e>="12:00"&&e<"18:00":t==="noturno"?e>="18:00"&&e<"23:00":!0,ue=(e,t,a,r="prof_turma")=>{const s=["Seg","Ter","Qua","Qui","Sex"],o={};a.forEach(u=>{o[u]={},s.forEach(S=>{o[u][S]="------"})}),t.forEach(u=>{var M,R,D;const S=K(u.date),k=je(S),x=k>=1&&k<=5?s[k-1]:null,C=((M=u.startTime)==null?void 0:M.substring(0,5))||u.startTime;if(x&&o[C]){if(u.status!=="confirmed"&&u.status!=="pending"&&u.status!=="vaga"&&((R=u.subject)==null?void 0:R.toUpperCase())!=="HAF")return;const H=((D=u.subject)==null?void 0:D.toUpperCase())==="HAF",F=u.status==="vaga";let L="------";if(F)L="VAGA";else if(H)L="HAF";else if(r==="prof_turma")L=u.classGroup||"------";else if(r==="prof_subject")L=u.subject||"------";else{const _=u.subject&&e.subject&&u.subject.trim().toLowerCase()!==e.subject.trim().toLowerCase();L=u.classGroup&&_?`${u.classGroup} - ${u.subject}`:u.classGroup||u.subject||"------"}o[C][x]==="------"?o[C][x]=L:o[C][x].split("/").includes(L)||(o[C][x]+="/"+L)}});let l="font-size: 11px; padding: 0.75rem;",n="text-[12px]",p="text-[9.5px]",c="text-[9px]",w="text-[10px]",g="h-8";v==="small"?(l="font-size: 8.5px; padding: 0.5rem;",n="text-[9px]",p="text-[7.5px]",c="text-[7px]",w="text-[7.5px]",g="h-5"):v==="large"?(l="font-size: 13.5px; padding: 1rem;",n="text-[14px]",p="text-[11px]",c="text-[11px]",w="text-[12.5px]",g="h-11"):v==="esticado"?(l="font-size: 15px; padding: 1.25rem;",n="text-[16px]",p="text-[12px]",c="text-[12px]",w="text-[13.5px]",g="h-12"):v==="super_esticado"&&(l="font-size: 18px; padding: 1.75rem;",n="text-[20px]",p="text-[14px]",c="text-[14px]",w="text-[16.5px]",g="h-16");const f=[...new Set(t.map(u=>u.classGroup).filter(Boolean))],I=f.length?` (${f.join(", ")})`:"";return`
    <div class="bg-white border border-slate-300 rounded-lg text-slate-800 shadow-sm flex flex-col justify-between break-inside-avoid text-xs w-full" style="${l}">
      <div class="border-b border-slate-300 pb-1 mb-1.5 flex justify-between items-center bg-slate-100 px-2 py-1 rounded">
        <span class="font-extrabold uppercase text-slate-900 ${n}">${e.displayName}${I}</span>
        <span class="${p} text-[#5B99C2] font-extrabold uppercase tracking-tight">${e.subject||"Professor"}</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="font-semibold text-slate-400 ${c} py-0.5 text-left w-[40px]">Hor</th>
            ${s.map(u=>`<th class="font-bold text-slate-700 ${c} py-0.5">${u}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${a.map(u=>`
            <tr class="${g}">
              <td class="font-extrabold text-[#2E5077] ${c} text-left py-0.5">${u}</td>
              ${s.map(S=>{const k=o[u][S];return`<td class="${w} py-0.5 truncate ${k==="VAGA"?"text-rose-600 font-black":k==="HAF"?"text-[#5B99C2] font-black":k!=="------"?"text-slate-900 font-black":"text-slate-400"}">${k}</td>`}).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `},Ae=(e,t,a)=>{console.log(`[DEBUG TurmaScheduleCard] turmaName="${e}", weekSchedules count=${t.length}, slots=${a.join(", ")}`);const r=["Seg","Ter","Qua","Qui","Sex"],s={};a.forEach(f=>{s[f]={},r.forEach(I=>{s[f][I]=null})}),t.forEach(f=>{var x,C;const I=K(f.date),u=je(I),S=r[u-1],k=((x=f.startTime)==null?void 0:x.substring(0,5))||f.startTime;if(S&&s[k]){if(f.status!=="confirmed"&&f.status!=="pending"&&f.status!=="vaga"&&((C=f.subject)==null?void 0:C.toUpperCase())!=="HAF")return;s[k][S]={teacherName:f.teacherName||"------",subject:f.subject||"------",status:f.status}}});let o="font-size: 11px; padding: 0.75rem;",l="text-[12px]",n="text-[9.5px]",p="text-[9px]",c="text-[10px]",w="text-[8.5px]",g="h-11";return v==="small"?(o="font-size: 8.5px; padding: 0.5rem;",l="text-[9px]",n="text-[7.5px]",p="text-[7px]",c="text-[8.5px]",w="text-[7.5px]",g="h-8"):v==="large"?(o="font-size: 13.5px; padding: 1rem;",l="text-[14px]",n="text-[11px]",p="text-[11px]",c="text-[12.5px]",w="text-[11px]",g="h-16"):v==="esticado"?(o="font-size: 15px; padding: 1.25rem;",l="text-[16px]",n="text-[12px]",p="text-[12px]",c="text-[14px]",w="text-[12px]",g="h-14"):v==="super_esticado"&&(o="font-size: 18px; padding: 1.75rem;",l="text-[20px]",n="text-[14px]",p="text-[14px]",c="text-[17px]",w="text-[14px]",g="h-20"),`
    <div class="bg-white border border-slate-300 rounded-lg text-slate-800 shadow-sm flex flex-col justify-between break-inside-avoid text-xs w-full" style="${o}">
      <div class="border-b border-slate-300 pb-1 mb-1.5 flex justify-between items-center bg-slate-100 px-2 py-1 rounded">
        <span class="font-extrabold uppercase text-slate-900 truncate ${l}">Turma: ${e}</span>
        <span class="${n} text-[#5B99C2] font-extrabold uppercase tracking-tight">GRADE HORÁRIA</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="font-semibold text-slate-400 ${p} py-0.5 text-left w-[40px]">Hor</th>
            ${r.map(f=>`<th class="font-bold text-slate-700 ${p} py-0.5">${f}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${a.map(f=>`
            <tr class="${g}">
              <td class="font-extrabold text-[#2E5077] ${p} text-left py-0.5 align-middle">${f}</td>
              ${r.map(I=>{var k;const u=s[f][I];return u?u.status==="vaga"?`
                    <td class="py-0.5 align-middle leading-tight truncate">
                      <div class="font-black text-rose-600 ${c} truncate font-black">VAGA</div>
                    </td>
                  `:((k=u.subject)==null?void 0:k.toUpperCase())==="HAF"?`
                    <td class="py-0.5 align-middle leading-tight truncate">
                      <div class="font-black text-[#5B99C2] ${c} truncate">HAF</div>
                    </td>
                  `:`
                  <td class="py-0.5 align-middle leading-tight truncate">
                    <div class="font-black text-slate-900 ${c} truncate">${u.teacherName}</div>
                    <div class="text-slate-400 font-extrabold truncate uppercase mt-0.5 ${w}">${u.subject}</div>
                  </td>
                `:`<td class="text-slate-300 ${c} py-0.5 align-middle">------</td>`}).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `},ke=()=>`
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%); min-height: 100vh; color: #fff; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden;">
    <style>
      @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeInUp { from { opacity: 0; } to { opacity: 1; } }
      details summary:hover { color: #2563eb !important; }
      @media (max-width: 768px) {
        h1 { font-size: 1.75rem !important; }
        nav > div:nth-child(2) { display: none; }
      }
    </style>

    <!-- Navbar -->
    <nav style="position: fixed; top: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(37, 99, 235, 0.1); padding: 1.5rem 2rem; z-index: 40; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        ${J(140,40)}
      </div>
      <div style="display: flex; gap: 2rem; align-items: center;">
        <a onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">Como Funciona</a>
        <a onclick="document.getElementById('resources').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">Recursos</a>
        <a onclick="document.getElementById('faq').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">FAQ</a>
        <button onclick="actions.showLoginModal('login')" style="background: #2563eb; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">Acessar Portal</button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section style="padding-top: 8rem; padding-bottom: 4rem; text-align: center; animation: slideInDown 0.8s ease-out;">
      <div style="max-width: 900px; margin: 0 auto; padding: 0 1rem;">
        <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 2rem; padding: 0.5rem 1.5rem; display: inline-block; margin-bottom: 2rem;">
          <span style="color: #06b6d4; font-weight: 600; font-size: 0.85rem;">🚀 Gestão Escolar Inteligente com Zero Aulas Vagas • v2.4 Pro</span>
        </div>
        <h1 style="font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;">A grade escolar que<br><span style="background: linear-gradient(135deg, #2563eb, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">elimina aulas vagas</span><br>em segundos.</h1>
        <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">Substituição automática de professores ausentes, gestão de laboratórios em tempo real e controle absoluto para a coordenação pedagógica.</p>
        <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="actions.showLoginModal('login')" style="background: #2563eb; color: white; border: none; padding: 1.2rem 2.5rem; border-radius: 0.7rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 30px rgba(37, 99, 235, 0.3);">🎓 Entrar no Portal da Escola</button>
          <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="background: transparent; color: white; border: 2px solid rgba(255, 255, 255, 0.2); padding: 1.2rem 2.5rem; border-radius: 0.7rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s;">Ver Demonstração Interativa</button>
        </div>
        <div style="display: flex; gap: 3rem; justify-content: center; margin-top: 3rem; flex-wrap: wrap; font-weight: 600; font-size: 0.9rem;">
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> Pronto para uso imediato</div>
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> Armazenamento Seguro e Criptografado</div>
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> 1 Toque no Celular do Professor</div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section style="background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(37, 99, 235, 0.1); border-bottom: 1px solid rgba(37, 99, 235, 0.1); padding: 4rem 2rem; animation: fadeInUp 1s ease-out 0.3s both;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center;">
        <div>
          <div style="font-size: 2.5rem; font-weight: 900; color: #2563eb;">+120 mil</div>
          <div style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Aulas Vagas Evitadas</div>
        </div>
        <div>
          <div style="font-size: 2.5rem; font-weight: 900; color: #06b6d4;">99.4%</div>
          <div style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Taxa de Presença Coberta</div>
        </div>
        <div>
          <div style="font-size: 2.5rem; font-weight: 900; color: #2563eb;">-85%</div>
          <div style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Tempo da Coordenação</div>
        </div>
        <div>
          <div style="font-size: 2.5rem; font-weight: 900; color: #06b6d4;">42 seg</div>
          <div style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem;">Tempo Médio de Substituição</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" style="padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">FLUXO INTELIGENTE DE PONTA A PONTA</div>
        <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem;">Como o Studia transforma a rotina da sua escola</h2>
        <p style="color: #cbd5e1; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">Do cadastro da grade horária até a gestão de imprevistos e emissão de relatórios oficiais em tempo real.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.4s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">⚡</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Zero Alunos Ociosos</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Quando ocorre uma falta, o algoritmo Studia cruza os horários livres no mesmo turno e sugere substitutos compatíveis. A coordenação designa com apenas 1 clique.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(37, 99, 235, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Substituição em 42 seg</div>
        </div>

        <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.5s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">🛡️</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Espaços Otimizados</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Controle de agendamentos para salas de informática, laboratórios de ciências e quadras esportivas sem sobreposição de turmas.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(6, 182, 212, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Fim dos conflitos de espaço</div>
        </div>

        <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.6s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #a855f7, #9333ea); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">📊</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Visão 360° da Escola</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Um dashboard dinâmico com o mapa de todas as salas ativas simultaneamente, identificando quais professores estão em aula, quais salas estão vazias e as posições ativas.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(168, 85, 247, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Controle visual total</div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.7s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">📄</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Relatórios Executivos & Impressão A4 Paisagem</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Gere gráficos de assiduidade por docente, taxas de cobertura e exportação em formato padrão A4 Paisagem para quadro de avisos ou arquivo da secretaria.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(239, 68, 68, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ PDF pronto para impressão</div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section style="padding: 6rem 2rem; max-width: 1200px; margin: 0 auto; border-top: 1px solid rgba(37, 99, 235, 0.1);">
      <div style="text-align: center; margin-bottom: 4rem;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">CASOS DE SUCESSO</div>
        <h2 style="font-size: 2.5rem; font-weight: 900;">O que dizem os diretores e coordenadores</h2>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem;">
          <div style="color: #fbbf24; margin-bottom: 1rem;">★★★★★</div>
          <p style="color: #cbd5e1; margin-bottom: 1.5rem; font-style: italic;">"O Studia acabou com o pesadelo das 07h da manhã quando um professor passava mal. Em 30 segundos achamos um substituto e a escola funciona sem tumulto."</p>
          <p style="color: #fff; font-weight: 600;">Profª Helena Vasconcelos</p>
          <p style="color: #94a3b8; font-size: 0.9rem;">Diretora Pedagógica • Colégio Santa Cruz</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem;">
          <div style="color: #fbbf24; margin-bottom: 1rem;">★★★★★</div>
          <p style="color: #cbd5e1; margin-bottom: 1.5rem; font-style: italic;">"Os professores adoraram a facilidade de confirmar a presença no celular. A gestão de laboratórios também economizou incontáveis discussões."</p>
          <p style="color: #fff; font-weight: 600;">Marcos Drummond</p>
          <p style="color: #94a3b8; font-size: 0.9rem;">Coordenador Geral • Instituto Drummond</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem;">
          <div style="color: #fbbf24; margin-bottom: 1rem;">★★★★★</div>
          <p style="color: #cbd5e1; margin-bottom: 1.5rem; font-style: italic;">"A exportação em formato A4 e os relatórios em PDF nos deram total conformidade nas reuniões com os pais e auditórios de ensino."</p>
          <p style="color: #fff; font-weight: 600;">Cláudia Fontes</p>
          <p style="color: #94a3b8; font-size: 0.9rem;">Gestora Escolar • Rede Prisma de Ensino</p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" style="padding: 6rem 2rem; max-width: 900px; margin: 0 auto; border-top: 1px solid rgba(37, 99, 235, 0.1);">
      <div style="text-align: center; margin-bottom: 4rem;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">PERGUNTAS FREQUENTES</div>
        <h2 style="font-size: 2.5rem; font-weight: 900;">Tire suas dúvidas sobre o Studia</h2>
      </div>
      <div style="space-y: 2rem;">
        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Como o Studia resolve as aulas vagas tão rápido?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">O algoritmo analisa em tempo real os horários livres dos professores no mesmo turno e apresenta as melhores opções de compatibilidade. A coordenação clica uma vez e pronto — a informação é enviada ao professor via push notification.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Os dados da minha escola são seguros e privados?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">Sim. Todos os dados são criptografados com segurança de nível institucional e sincronizados em tempo real. O Studia não compartilha informações com terceiros e opera sob rigoroso compliance de privacidade.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Os professores precisam instalar algum aplicativo pesado?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">Não. O Studia é acessível 100% via navegador web. Os professores recebem notificações push no celular, mas a plataforma roda perfeitamente em qualquer smartphone moderno sem necessidade de app nativo.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Como funciona a ativação com PIX e Cartão de Crédito?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">O Studia oferece planos por escola com pagamento recorrente via PIX ou cartão. Depois da ativação, todo o sistema funciona normalmente com suporte integral da equipe Studia COP.</p>
        </details>
      </div>
    </section>

    <!-- Footer -->
    <footer style="background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(37, 99, 235, 0.1); padding: 3rem 2rem; text-align: center; color: #94a3b8;">
      <p>© 2026 Studia SaaS — Todos os direitos reservados.</p>
      <p style="margin-top: 1rem; font-size: 0.9rem;">Criptografia de nível institucional com sincronização em tempo real.</p>
    </footer>

    <!-- Login/Register Modal -->
    <div id="login-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 ${A==="closed"?"hidden":""}">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideLoginModal()"></div>
      <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
        <div class="flex justify-center mb-6">
          ${J(160,44)}
        </div>
        <div class="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
            <button onclick="actions.toggleAuthMode('login')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-all ${A==="login"?"bg-white text-blue-600 shadow-sm":"text-slate-500"}">Entrar</button>
            <button onclick="actions.toggleAuthMode('register')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-all ${A==="register"?"bg-white text-blue-600 shadow-sm":"text-slate-500"}">Criar Conta</button>
        </div>

        <h3 class="text-2xl font-bold mb-2">${A==="login"?"Bem-vindo de volta":"Nova conta Studia"}</h3>
        <p class="text-slate-500 text-sm mb-6 font-medium">${A==="login"?"Acesse seu painel administrativo.":"Crie sua conta de professor."}</p>

        <div class="space-y-4">
          ${A==="register"?`
            <input type="text" id="auth-name" placeholder="Seu nome completo" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">
            <input type="text" id="auth-subject" placeholder="Matérias (separe por vírgula)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">
          `:""}
          <input type="email" id="auth-email" placeholder="nome@escola.pr.gov.br" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">
          <input type="password" id="auth-password" placeholder="Sua senha" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">

          <button onclick="${A==="login"?"actions.login()":"actions.register()"}" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md shadow-blue-500/15 mt-2 transition-all">
            ${A==="login"?"Entrar":"Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  </div>
`,oe=()=>{const e=pe();let t=[];y==="matutino"?t=["07:30","08:20","09:10","10:15","11:00","11:45"]:y==="vespertino"?t=["13:00","13:50","14:40","15:45","16:30","17:15"]:y==="noturno"?t=["18:45","19:30","20:30","21:15","22:00"]:t=e.length>0?e:["07:30","08:20","09:10","10:15","11:00","11:45"];const a=[{id:"horarios",icon:"calendar",label:"Meus Horários"},{id:"labs",icon:"test-tube",label:"Laboratórios"},{id:"materias",icon:"book",label:"Minhas Matérias"},{id:"atestados",icon:"file-text",label:"Meus Atestados"}],r={initials:i.displayName?i.displayName.slice(0,2).toUpperCase():"PR",name:i.displayName,subtitle:i.subject||"Professor"};return`
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${ee({theme:"light",sectionLabel:"Principal",navItems:a,profile:r})}
    ${te({theme:"light",sectionLabel:"Principal",navItems:a,profile:r,drawerId:"mobile-sidebar-drawer"})}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-toggle-mobile-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <h2 class="font-bold text-base md:text-lg capitalize">${b==="horarios"?"Meus Horários":b==="labs"?"Laboratórios":b==="materias"?"Minhas Matérias":"Meus Atestados"}</h2>
        </div>
        <div class="flex gap-2">
          ${b==="atestados"?`
            <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md transition-all" id="btn-new-cert">
                <i data-lucide="file-plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo <span class="hidden sm:inline">Atestado</span></span>
            </button>
          `:""}
          ${b==="labs"?`
            <button onclick="actions.showLabModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md transition-all" id="btn-teacher-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          `:""}
          <button onclick="actions.refreshSchedules()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm transition-all" id="btn-refresh-teacher-schedules">
            <i data-lucide="refresh-cw" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Atualizar</span>
          </button>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${b==="horarios"?`
          <!-- Switch between sub-tabs with counts -->
          <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-6 print:hidden overflow-x-auto scrollbar-none select-none shrink-0">
            <button onclick="actions.setTeacherSchedulesTab('grid')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${le==="grid"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-800"}">
              <i data-lucide="grid-3x3" class="w-4 h-4 text-slate-500"></i> Grade de Horários Completa
            </button>
          </div>

          ${le==="grid"?`
            <!-- Grid Control Box -->
            <div class="bg-white p-6 rounded-3xl border shadow-sm space-y-4 print:hidden">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Turno / Períodos</label>
                  <select onchange="actions.setReportTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="matutino" ${y==="matutino"?"selected":""}>Manhã (07:30 - 11:45)</option>
                    <option value="vespertino" ${y==="vespertino"?"selected":""}>Tarde (13:00 - 17:15)</option>
                    <option value="noturno" ${y==="noturno"?"selected":""}>Noite (18:45 - 22:45)</option>
                    <option value="auto" ${y==="auto"?"selected":""}>Auto-detecção</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tamanho da Grade</label>
                  <select onchange="actions.setReportCardSize(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="small" ${v==="small"?"selected":""}>Pequeno (Compacto)</option>
                    <option value="medium" ${v==="medium"?"selected":""}>Médio (Recomendado)</option>
                    <option value="large" ${v==="large"?"selected":""}>Grande</option>
                    <option value="esticado" ${v==="esticado"?"selected":""}>Descrição Larga</option>
                    <option value="super_esticado" ${v==="super_esticado"?"selected":""}>Página Inteira</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Opções Rápidas</label>
                  <button id="btn-download-pdf-teacher" onclick="actions.downloadTeacherPDF()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all">
                    <i data-lucide="download" class="w-4 h-4"></i> Baixar PDF
                  </button>
                </div>
              </div>
            </div>

            <!-- Beautiful Grid Sheet Preview -->
            <div class="printable-sheet bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div class="flex flex-col md:flex-row justify-between items-center border-b border-blue-100 pb-6 mb-8 gap-4">
                <div class="flex items-center gap-4">
                  <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                    <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
                    <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
                    <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>
                    <g transform="translate(68, 2)">
                      <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                      <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                      <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                      <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                    </g>
                    <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
                    <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
                  </svg>
                </div>
                
                <div class="text-center md:text-right">
                  <h4 class="text-sm font-black text-slate-800 uppercase tracking-wide">${W}</h4>
                  <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                    Grade de Horários Individual do Professor
                  </p>
                </div>
              </div>

              <!-- Center wrapper -->
              <div class="flex justify-center">
                <div class="w-full max-w-2xl overflow-x-auto pb-4 scrollbar-none">
                  <div class="min-w-[550px]">
                    ${ue(i,$.filter(s=>s.teacherId===i.uid),t)}
                  </div>
                </div>
              </div>

              <div class="border-t border-slate-100 mt-12 pt-4 flex justify-end text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
                <span>Data de emissão: ${new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          `:`
            <!-- Sched List -->
            <div class="grid gap-6">
              ${$.map(s=>`
                <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 print:shadow-none print:border-slate-300">
                  <div class="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                    <div class="w-16 text-center border-r pr-4 md:pr-6 shrink-0">
                        <p class="text-lg font-black text-slate-800">${s.startTime}</p>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-base md:text-xl font-black text-slate-900 truncate flex items-center gap-2">
                        ${s.subject}
                        ${s.classGroup?`<span class="bg-blue-100 text-[#2E5077] text-[10px] uppercase font-black px-2 py-0.5 rounded">${s.classGroup}</span>`:""}
                      </h3>
                      <div class="flex flex-wrap items-center gap-3 md:gap-4 mt-1">
                        <span class="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${s.room}</span>
                        <span class="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${s.date}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[200px] shrink-0 print:hidden">
                    <div class="text-center py-2 bg-slate-50 rounded-xl border text-[10px] font-black uppercase tracking-widest ${s.status==="confirmed"?"text-blue-600":s.status==="absent"?"text-rose-500":s.status==="vaga"?"text-rose-600 font-black":"text-amber-500"}">
                      ${s.status==="vaga"?"AULA VAGA":s.status==="confirmed"?"Confirmado":s.status==="absent"?"Ausente":"Pendente"}
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        `:""}
        ${b==="atestados"?`
          <div class="space-y-8 animate-fade-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 class="text-xl md:text-2xl font-black text-slate-900">Seus Atestados Médicos</h3>
                <p class="text-xs text-slate-500 font-bold">Acompanhe seus atestados enviados e o status de homologação.</p>
              </div>
              <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
                <i data-lucide="plus" class="w-4 h-4"></i> Enviar Novo Atestado
              </button>
            </div>
            
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="overflow-x-auto pr-2">
                <table class="w-full text-left min-w-[700px]">
                  <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                    <tr>
                      <th class="px-8 py-5">Data da Falta</th>
                      <th class="px-8 py-4">Motivo</th>
                      <th class="px-8 py-4">Imagem do Atestado</th>
                      <th class="px-8 py-4">Status de Aprovação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    ${(()=>{const s=O.filter(o=>o.teacherId===i.uid);return s.length===0?`
                          <tr>
                            <td colspan="4" class="px-8 py-16 text-center text-slate-400 font-bold text-sm">
                              Você ainda não enviou nenhum atestado médico.
                            </td>
                          </tr>
                        `:s.map(o=>`
                        <tr class="hover:bg-slate-50/50 transition-all">
                          <td class="px-8 py-5 font-bold text-slate-800">${o.date}</td>
                          <td class="px-8 py-5 text-sm text-slate-600 font-medium">${o.reason}</td>
                          <td class="px-8 py-5">
                            ${o.id?`
                              <button onclick="actions.viewImageById(${o.id})" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 transition-all cursor-pointer">
                                <i data-lucide="eye" class="w-4 h-4"></i> Visualizar Foto
                              </button>
                            `:`
                              <span class="text-slate-400 font-bold text-[10px] uppercase">Sem imagem</span>
                            `}
                          </td>
                          <td class="px-8 py-5">
                            <span class="text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${o.status==="approved"?"bg-emerald-50 text-emerald-700 border border-emerald-100":"bg-amber-50 text-amber-700 border border-amber-100"}">
                              ${o.status==="approved"?"Aprovado":"Aguardando Aprovação"}
                            </span>
                          </td>
                        </tr>
                      `).join("")})()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `:""}
        ${b==="materias"?Ve():""}
        ${b==="labs"?ae():""}
      </div>
    </main>
    
    ${X()}
  </div>
  `},me=()=>`
  <!-- Same Create Modal logic but with current state -->
  <div id="create-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Novo Agendamento</h3>
      <form onsubmit="actions.createSchedule(event)" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" id="form-subject" placeholder="Matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          <input type="text" id="form-class-group" placeholder="Turma (ex: 9A, 3BI)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <input type="date" id="form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          <input type="text" id="form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <input type="time" id="form-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" value="18:45" required>
          <input type="time" id="form-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" value="22:45" required>
        </div>
        <select id="form-teacher" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          <option value="">Selecione o Professor</option>
          ${z.map(e=>`<option value="${e.uid}">${e.displayName}</option>`).join("")}
        </select>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar Horário</button>
        </div>
      </form>
    </div>
  </div>
`,be=()=>`
  <div id="edit-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideEditModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
      <h3 class="text-2xl font-bold mb-6 text-slate-800">Editar Horário</h3>
      <form onsubmit="actions.updateSchedule(event)" class="space-y-4">
        <input type="hidden" id="edit-form-id">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Matéria</label>
            <input type="text" id="edit-form-subject" placeholder="Matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Turma</label>
            <input type="text" id="edit-form-class-group" placeholder="Turma (ex: 9A, 3BI)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data</label>
            <input type="date" id="edit-form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sala / Local</label>
            <input type="text" id="edit-form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Início</label>
            <input type="time" id="edit-form-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Término</label>
            <input type="time" id="edit-form-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Professor</label>
          <select id="edit-form-teacher" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <option value="">Selecione o Professor</option>
            ${z.map(e=>`<option value="${e.uid}">${e.displayName}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
          <select id="edit-form-status" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="absent">Falta / Ausente</option>
            <option value="vaga">Aula Vaga</option>
          </select>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideEditModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Salvar</button>
        </div>
      </form>
    </div>
  </div>
`,fe=()=>`
  <div id="delete-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideDeleteModal()"></div>
    <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl border border-slate-100">
      <div class="flex items-center gap-3 mb-4 text-rose-600">
        <div class="bg-rose-50 p-2.5 rounded-2xl">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 class="text-lg font-black text-slate-800">Confirmar Exclusão</h3>
      </div>
      <p class="text-xs text-slate-500 mb-6 leading-relaxed">Você tem certeza de que deseja excluir este horário? Esta ação não poderá ser desfeita.</p>
      <input type="hidden" id="delete-schedule-id">
      <div class="flex gap-3">
        <button onclick="actions.hideDeleteModal()" class="flex-1 py-3 text-xs font-bold text-slate-600 border rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        <button onclick="actions.confirmDeleteSchedule()" class="flex-1 py-3 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/10 transition-all">Excluir</button>
      </div>
    </div>
  </div>
`,qe=()=>`
  <div id="lab-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideLabModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Reservar Laboratório</h3>
      <form onsubmit="actions.createLabBooking(event)" class="space-y-4">
        <select id="lab-type" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          <option value="info">Informática</option>
          <option value="chem">Química</option>
        </select>
        <input type="date" id="lab-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        <div class="grid grid-cols-2 gap-4">
          <input type="time" id="lab-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          <input type="time" id="lab-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideLabModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Reservar</button>
        </div>
      </form>
    </div>
  </div>
`,X=()=>`
  <div id="cert-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCertModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Incluir Atestado Médico</h3>
      <form onsubmit="actions.submitCert(event)" class="space-y-4">
        <p class="text-xs text-slate-500 font-bold uppercase mb-2">Atenção: Ao aprovar este atestado, as aulas do dia serão marcadas automaticamente como "Aulas Vagas".</p>
        <input type="date" id="cert-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        <textarea id="cert-reason" placeholder="Motivo da ausência" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-slate-900" required></textarea>

        <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase">Anexar Foto do Atestado</label>
            <div class="relative group">
                <input type="file" id="cert-image" accept="image/*" capture="environment" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onchange="actions.previewCertImage(event)">
                <div id="cert-upload-placeholder" class="w-full border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 group-hover:border-blue-400 transition-all">
                    <i data-lucide="camera" class="text-slate-400 group-hover:text-blue-600 transition-all"></i>
                    <p class="text-sm font-bold text-slate-500">Toque para tirar foto ou selecionar</p>
                </div>
            </div>
            <div id="cert-preview-container" class="hidden relative mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2">
                <img id="cert-preview-img" class="w-full max-h-64 object-contain rounded-lg mx-auto" />
                <button type="button" onclick="actions.clearCertImage()" class="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg shadow-lg transition-all flex items-center justify-center" title="Remover Imagem">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCertModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Enviar</button>
        </div>
      </form>
    </div>
  </div>
`,Te=()=>`
  <div id="create-escola-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateEscolaModal()"></div>
    <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
      <h3 class="text-2xl font-bold mb-6">Criar Nova Escola</h3>
      <form onsubmit="actions.createSchool(event)" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Nome da Escola</label>
          <input type="text" id="escola-name" placeholder="Ex: Colégio Estadual..." class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateEscolaModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar</button>
        </div>
      </form>
    </div>
  </div>
`,ge=({viewerRole:e="admin"}={})=>`
  <div id="create-user-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateUserModal()"></div>
    <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
      <h3 class="text-2xl font-bold mb-6">Criar Novo Usuário</h3>
      <form onsubmit="actions.createUser(event)" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Nome</label>
          <input type="text" id="user-displayname" placeholder="Ex: João Silva" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">E-mail</label>
          <input type="email" id="user-email" placeholder="Ex: joao@example.com" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Senha</label>
          <input type="password" id="user-password" placeholder="Mínimo 8 caracteres" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required minlength="8">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Matérias</label>
          <input type="text" id="user-subject" placeholder="Ex: Matemática, Física, Química" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Cargo</label>
          <select id="user-role" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            ${e==="admin"||e==="dev"?`
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor</option>
                <option value="admin">Administrador</option>
                <option value="dev">Desenvolvedor</option>
              `:`
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor</option>
              `}
          </select>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateUserModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar</button>
        </div>
      </form>
    </div>
  </div>
`,Le=()=>{const e=!!E,t=$.length,a=N.length,r=G.length,s=O.length;return`
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Visão geral da plataforma</h3>
          <p class="text-sm text-slate-500 font-medium">Monitoramento da API, usuários e dados operacionais do site.</p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full ${e?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"} px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
          <i data-lucide="database" class="w-3.5 h-3.5"></i> ${e?"Supabase online":"Modo local"}
        </div>
      </div>

      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
            <span class="w-2.5 h-2.5 rounded-full ${e?"bg-emerald-500":"bg-amber-400"}"></span>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${e?"OK":"Local"}</p>
          <p class="mt-2 text-sm text-slate-500">Conexão com a API express</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Usuários</p>
            <i data-lucide="users" class="w-4 h-4 text-blue-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${a}</p>
          <p class="mt-2 text-sm text-slate-500">Contas cadastradas</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Horários</p>
            <i data-lucide="calendar" class="w-4 h-4 text-violet-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${t}</p>
          <p class="mt-2 text-sm text-slate-500">Registros no banco</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Labs</p>
            <i data-lucide="beaker" class="w-4 h-4 text-emerald-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${r}</p>
          <p class="mt-2 text-sm text-slate-500">Reservas ativas</p>
        </div>
      </div>

      <div class="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h4 class="text-lg font-black text-slate-900">Infraestrutura do projeto</h4>
          <div class="mt-5 space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">Banco de dados</span>
              <span class="text-sm font-black text-slate-900">Supabase Postgres</span>
            </div>
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">Autenticação</span>
              <span class="text-sm font-black text-slate-900">Auth + RLS</span>
            </div>
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">API</span>
              <span class="text-sm font-black text-slate-900">Express + Vite</span>
            </div>
            <div class="flex justify-between items-center pb-1">
              <span class="text-sm font-semibold text-slate-500">Atestados</span>
              <span class="text-sm font-black text-slate-900">${s}</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-3xl p-6 shadow-lg text-white">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-black">Environment</h4>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-200">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Seguro
            </span>
          </div>
          <div class="mt-5 space-y-4 text-sm text-slate-300">
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">API base</p>
              <p class="mt-1 font-semibold break-all">${E||"http://localhost:3000"}</p>
            </div>
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">Proteção</p>
              <p class="mt-1 font-semibold">Service role no backend apenas</p>
            </div>
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">Armazenamento</p>
              <p class="mt-1 font-semibold">Usuários, horários, laboratórios e certificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `},Ue=(e,t,a)=>`
  <button onclick="actions.switchTab('${e}')"
    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${b===e?"bg-white/10 text-white font-bold":"text-slate-400 hover:bg-white/5 hover:text-white"}">
    <i data-lucide="${t}"></i> ${a}
  </button>
`,Fe=(e,t,a)=>`
  <button onclick="actions.switchTab('${e}')"
    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${b===e?"bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600":"text-slate-500 hover:bg-slate-50 hover:text-slate-800"}">
    <i data-lucide="${t}"></i> ${a}
  </button>
`,ee=({theme:e="light",sectionLabel:t,navItems:a,profile:r})=>{const s=e==="dark",o=s?Ue:Fe;return`
    <aside class="w-64 border-r ${s?"bg-slate-900 border-slate-800 text-slate-300":"bg-white border-slate-200 text-slate-500"} hidden md:flex flex-col p-6 print:hidden shrink-0">
      <div class="flex items-center mb-10 px-2 shrink-0">${J(170,46)}</div>
      <p class="text-[10px] font-bold ${s?"text-slate-500":"text-slate-400"} uppercase tracking-widest mb-4 px-4">${t}</p>
      <nav class="space-y-1 flex-1">
        ${a.map(l=>o(l.id,l.icon,l.label)).join("")}
      </nav>
      ${r?`
      <div class="mt-auto pt-6 border-t ${s?"border-slate-800":"border-slate-200"} mb-6 px-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${s?"bg-white/10 text-white":"bg-slate-100 border border-slate-200 text-slate-600"} shadow-sm flex items-center justify-center font-bold uppercase shrink-0">
            ${r.initials}
          </div>
          <div class="overflow-hidden">
            <p class="${s?"text-white":"text-slate-800"} text-sm font-semibold truncate">${r.name}</p>
            <p class="text-[10px] text-slate-400 font-medium">${r.subtitle}</p>
          </div>
        </div>
      </div>
      `:""}
      <button onclick="actions.logout()" class="flex items-center gap-3 px-4 py-3 rounded-xl ${s?"hover:bg-slate-800 text-slate-300":"hover:bg-slate-50 text-slate-500 hover:text-slate-900"} transition-all font-semibold">
        <i data-lucide="log-out"></i> Sair
      </button>
    </aside>
  `},te=({theme:e="light",sectionLabel:t,navItems:a,profile:r,drawerId:s})=>{if(!ie)return"";const o=e==="dark";return`
    <div class="fixed inset-0 z-50 flex md:hidden" id="${s}">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm shadow-sm" onclick="actions.toggleMobileMenu(false)"></div>
      <div class="relative flex flex-col w-72 max-w-[80vw] h-full ${o?"bg-slate-900 text-slate-300":"bg-white"} p-6 shadow-2xl transition-all duration-300 ease-in-out">
        <div class="flex items-center justify-between mb-8 px-2">
          <div class="flex items-center">${J(140,38)}</div>
          <button onclick="actions.toggleMobileMenu(false)" class="p-2 -mr-2 rounded-lg ${o?"text-slate-400 hover:text-white hover:bg-white/5":"text-slate-400 hover:text-slate-600 hover:bg-slate-50"}">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-[10px] font-black ${o?"text-slate-500":"text-slate-400"} uppercase tracking-widest mb-4 px-2">${t}</p>
        <nav class="space-y-1.5 flex-1">
          ${a.map(l=>`
            <button onclick="actions.switchTabMobile('${l.id}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${b===l.id?o?"bg-white/10 text-white font-bold":"bg-blue-50 text-blue-700 font-bold":o?"text-slate-400 hover:bg-white/5 hover:text-white":"text-slate-500 hover:bg-slate-50"}">
              <i data-lucide="${l.icon}"></i> ${l.label}
            </button>
          `).join("")}
        </nav>

        <div class="mt-auto pt-6 border-t ${o?"border-slate-800":"border-slate-200"} px-2 flex flex-col gap-4">
          ${r?`
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full ${o?"bg-white/10 text-white":"bg-slate-100 border border-slate-200 text-slate-600"} shadow-sm flex items-center justify-center font-bold uppercase shrink-0">
              ${r.initials}
            </div>
            <div class="overflow-hidden">
              <p class="${o?"text-white":"text-slate-800"} text-sm font-semibold truncate">${r.name}</p>
              <p class="text-[10px] text-slate-400 font-medium">${r.subtitle}</p>
            </div>
          </div>
          `:""}
          <button onclick="actions.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-all font-semibold justify-center border border-rose-100 bg-rose-50/30">
            <i data-lucide="log-out"></i> Sair
          </button>
        </div>
      </div>
    </div>
  `},Y=[{id:"overview",icon:"activity",label:"Visão geral"},{id:"escolas",icon:"building",label:"Escolas"},{id:"horarios",icon:"calendar",label:"Horários"},{id:"labs",icon:"test-tube",label:"Laboratórios"},{id:"atestados",icon:"file-text",label:"Atestados"},{id:"usuarios",icon:"users",label:"Usuários"},{id:"relatorios",icon:"bar-chart",label:"Relatórios"}],$e=Y.filter(e=>e.id!=="overview"&&e.id!=="escolas"),Se=Y,Oe=()=>`
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${ee({theme:"dark",sectionLabel:"Administrador",navItems:Y})}
    ${te({theme:"dark",sectionLabel:"Administrador",navItems:Y,drawerId:"admin-mobile-sidebar-drawer"})}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-admin-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Área administrativa</p>
            <h2 class="font-black text-base md:text-lg text-slate-900">Console Studia</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${b==="horarios"?`
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all" id="btn-admin-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          `:""}
          ${b==="labs"?`
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all" id="btn-admin-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          `:""}
          <span class="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Administrador</span>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${b==="overview"?Le():""}
        ${b==="escolas"?De():""}
        ${b==="horarios"?xe():""}
        ${b==="labs"?ae():""}
        ${b==="atestados"?ve():""}
        ${b==="usuarios"?he({viewerRole:"admin"}):""}
        ${b==="relatorios"?we():""}
      </div>
    </main>

    ${me()}
    ${X()}
    ${be()}
    ${fe()}
    ${Te()}
    ${ge({viewerRole:"admin"})}
  </div>
`,He=()=>`
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${ee({theme:"dark",sectionLabel:"Desenvolvedor",navItems:Se})}
    ${te({theme:"dark",sectionLabel:"Desenvolvedor",navItems:Se,drawerId:"dev-mobile-sidebar-drawer"})}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-dev-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Área do desenvolvedor</p>
            <h2 class="font-black text-base md:text-lg text-slate-900">Console Studia</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${b==="horarios"?`
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          `:""}
          ${b==="labs"?`
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          `:""}
          <span class="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"><i data-lucide="code-2" class="w-3.5 h-3.5"></i> Desenvolvedor</span>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${b==="overview"?Le():""}
        ${b==="escolas"?De():""}
        ${b==="horarios"?xe():""}
        ${b==="labs"?ae():""}
        ${b==="atestados"?ve():""}
        ${b==="usuarios"?he({viewerRole:"dev"}):""}
        ${b==="relatorios"?we():""}
      </div>
    </main>

    ${me()}
    ${X()}
    ${be()}
    ${fe()}
    ${Te()}
    ${ge({viewerRole:"dev"})}
  </div>
`,_e=()=>`
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${ee({theme:"light",sectionLabel:"Diretor",navItems:$e})}
    ${te({theme:"light",sectionLabel:"Diretor",navItems:$e,drawerId:"diretor-mobile-sidebar-drawer"})}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-diretor-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Direção</p>
            <h2 class="font-black text-base md:text-lg text-slate-900">Console Studia</h2>
          </div>
        </div>
        <div class="flex gap-2">
          ${b==="horarios"?`
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all" id="btn-admin-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          `:""}
          ${b==="labs"?`
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all" id="btn-admin-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          `:""}
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${b==="horarios"?xe():""}
        ${b==="labs"?ae():""}
        ${b==="atestados"?ve():""}
        ${b==="usuarios"?he({viewerRole:"diretor"}):""}
        ${b==="relatorios"?we():""}
      </div>
    </main>

    ${me()}
    ${X()}
    ${be()}
    ${fe()}
    ${ge({viewerRole:"diretor"})}
  </div>
`,q={dev:{badge:"bg-emerald-100 text-emerald-700",label:"Desenvolvedor"},admin:{badge:"bg-violet-100 text-violet-700",label:"Administrador"},diretor:{badge:"bg-amber-100 text-amber-700",label:"Diretor"},teacher:{badge:"bg-blue-100 text-blue-700",label:"Professor"}},he=({viewerRole:e="diretor"}={})=>{const t=e==="admin"||e==="dev",a=[...N].filter(s=>t||!["admin","dev"].includes(s.role)).sort((s,o)=>(s.displayName||"").localeCompare(o.displayName||"")),r=t?["teacher","diretor","admin","dev"]:["teacher","diretor"];return`
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Gestão de usuários</h3>
          <p class="text-sm text-slate-500 font-medium">${t?"Todas as contas cadastradas no sistema.":"Diretores e professores cadastrados na sua escola."}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          ${t||e==="diretor"?`
            <button onclick="actions.showCreateUserModal('${e}')" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
              <i data-lucide="plus" class="w-4 h-4"></i> Criar Usuário
            </button>
          `:""}
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
            <i data-lucide="users" class="w-3.5 h-3.5"></i> ${a.length} usuários
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[820px] text-left">
            <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Nome</th>
                <th class="px-6 py-4">E-mail</th>
                <th class="px-6 py-4">Perfil</th>
                <th class="px-6 py-4">Matéria</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${a.length===0?`
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500 font-medium">Nenhum usuário encontrado.</td>
                </tr>
              `:a.map(s=>`
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center uppercase">
                        ${(s.displayName||"U").slice(0,2)}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">${s.displayName||"Usuário sem nome"}</div>
                        <div class="text-[10px] uppercase tracking-[0.18em] text-slate-400">${s.uid===(i==null?void 0:i.uid)?"Você":"Conta ativa"}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">${s.email||"—"}</td>
                  <td class="px-6 py-4">
                    ${s.uid===(i==null?void 0:i.uid)?`
                      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${(q[s.role]||q.teacher).badge}">
                        ${(q[s.role]||q.teacher).label}
                      </span>
                    `:`
                      <select
                        onchange="actions.changeUserRole('${s.uid}', this.value)"
                        class="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${(q[s.role]||q.teacher).badge} cursor-pointer"
                      >
                        ${r.map(o=>`<option value="${o}" ${s.role===o?"selected":""}>${q[o].label}</option>`).join("")}
                      </select>
                    `}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">${s.subject||"—"}</td>
                  <td class="px-6 py-4 text-right">
                    <button
                      onclick="actions.deleteUser('${s.uid}', '${(s.displayName||"Usuário").replace(/'/g,"\\'")}', '${s.email||"usuário"}')"
                      class="inline-flex items-center gap-2 rounded-xl border ${s.uid===(i==null?void 0:i.uid)?"border-slate-200 text-slate-400 cursor-not-allowed":"border-rose-200 text-rose-600 hover:bg-rose-50"} px-3 py-2 text-xs font-bold disabled:opacity-60"
                      ${s.uid===(i==null?void 0:i.uid)?"disabled":""}
                    >
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      ${s.uid===(i==null?void 0:i.uid)?"Você":"Excluir"}
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `},De=()=>`
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-xl md:text-2xl font-black text-slate-900">Gerenciar Escolas</h3>
        <p class="text-xs md:text-sm text-slate-500 font-bold">Crie escolas e associe diretores</p>
      </div>
      <button onclick="actions.showCreateEscolaModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Nova Escola
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto pr-2">
        <table class="w-full text-left min-w-[500px]">
          <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
            <tr>
              <th class="px-8 py-5">Nome da Escola</th>
              <th class="px-8 py-5">Criado por</th>
              <th class="px-8 py-5">Data</th>
              <th class="px-8 py-5">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${V&&V.length>0?V.map(e=>{var t;return`
              <tr class="hover:bg-slate-50 transition-all">
                <td class="px-8 py-5 font-bold">${e.name}</td>
                <td class="px-8 py-5 text-sm">
                  ${((t=N.find(a=>a.uid===e.createdBy))==null?void 0:t.displayName)||"—"}
                </td>
                <td class="px-8 py-5 text-sm text-slate-500">
                  ${new Date(e.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td class="px-8 py-5 text-right">
                  <button onclick="actions.deleteSchool('${e.id}')" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer" title="Deletar">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </td>
              </tr>
            `}).join(""):'<tr><td colspan="4" class="px-8 py-8 text-center text-slate-400 text-sm">Nenhuma escola criada ainda</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`,xe=()=>`
  <h3 class="text-2xl font-black text-slate-900 print:mb-4">Grade de Horários</h3>
  <div class="bg-white rounded-3xl border overflow-hidden shadow-sm print:border-none print:shadow-none">
    <div class="overflow-x-auto pr-2">
      <table class="w-full text-left min-w-[700px]">
      <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
        <tr>
          <th class="px-8 py-5">Matéria</th>
          <th class="px-8 py-5">Horário / Data</th>
          <th class="px-8 py-5">Professor</th>
          <th class="px-8 py-5 text-center">Status</th>
          <th class="px-8 py-5 print:hidden"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        ${$.map(e=>`
          <tr class="${e.status==="vaga"?"bg-rose-50":"hover:bg-slate-50"} transition-all">
            <td class="px-8 py-5 font-bold">${e.subject}</td>
            <td class="px-8 py-5">
              <div class="text-sm font-bold">${e.startTime}</div>
              <div class="text-[10px] text-slate-400 uppercase font-bold">${e.date}</div>
            </td>
            <td class="px-8 py-5 text-sm">
              <span class="font-bold text-slate-800">${e.teacherName}</span>
              ${e.classGroup?`<span class="block text-xs font-semibold text-blue-600 mt-0.5">${e.classGroup}</span>`:""}
            </td>
            <td class="px-8 py-5">
              <div class="flex justify-center">
                <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full ${e.status==="confirmed"?"bg-blue-100 text-blue-700":e.status==="vaga"?"bg-rose-600 text-white":e.status==="absent"?"bg-rose-100 text-rose-700":"bg-slate-100 text-slate-500"}">${e.status==="vaga"?"AULA VAGA":e.status}</span>
              </div>
            </td>
            <td class="px-8 py-5 text-right print:hidden">
              <div class="flex items-center justify-end gap-3">
                <button onclick="actions.showEditModalById(${e.id})" class="text-slate-300 hover:text-blue-600 transition-all cursor-pointer" title="Editar">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="actions.showDeleteModal(${e.id})" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer" title="Excluir">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
   </div>
  </div>
`,Ve=()=>`
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-xl md:text-2xl font-black text-slate-900">Minhas Matérias</h3>
        <p class="text-xs md:text-sm text-slate-500 font-bold">Gerencie as matérias que você leciona.</p>
      </div>
      <button onclick="actions.showAddMatériaModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Adicionar Matéria
      </button>
    </div>

    <div class="grid gap-4">
      ${(()=>{const e=window.teacherSubjects||[];return e.length===0?`
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <i data-lucide="book" class="w-12 h-12 text-slate-300 mx-auto mb-4"></i>
              <p class="text-slate-400 font-bold">Você ainda não adicionou nenhuma matéria.</p>
            </div>
          `:e.map(t=>`
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-all">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <i data-lucide="book-open" class="w-6 h-6 text-blue-600"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-900">${t.subject}</h4>
                <p class="text-xs text-slate-400">Matéria</p>
              </div>
            </div>
            <button onclick="actions.deleteMatéria('${t.subject}')" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all">
              <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
          </div>
        `).join("")})()}
    </div>
  </div>
`,ae=()=>`
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-xl md:text-2xl font-black text-slate-900">Agendamento de Laboratórios</h3>
        <p class="text-xs md:text-sm text-slate-500 font-bold font-sans">Consulte a disponibilidade e reserve os laboratórios do colégio para as suas aulas.</p>
      </div>
      <button onclick="actions.showLabModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Reservar Laboratório
      </button>
    </div>

    <!-- Quick view of active labs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      ${["info","chem"].map(e=>{const t=G.filter(a=>a.labId===e);return`
          <div class="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
            <h4 class="text-lg font-black mb-6 flex items-center gap-2 text-blue-600 uppercase tracking-tighter">
              <i data-lucide="${e==="info"?"monitor":"beaker"}"></i>
              ${e==="info"?"Informática":"Química"}
            </h4>
            <div class="space-y-4">
              ${t.slice(0,3).map(a=>`
                <div class="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <div>
                    <p class="font-bold text-sm text-slate-800">${a.teacherName}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">${a.date} • ${a.startTime}${a.endTime?` - ${a.endTime}`:""}</p>
                  </div>
                </div>
              `).join("")||'<p class="text-center text-slate-400 font-bold py-8 text-xs">Nenhuma reserva recente</p>'}
            </div>
          </div>
        `}).join("")}
    </div>

    <!-- Detailed reservation schema table -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 class="text-lg font-black text-slate-800">Tabela Geral do Cronograma das Reservas</h4>
          <p class="text-xs text-slate-500 font-bold">Acompanhe todos os agendamentos cadastrados no sistema.</p>
        </div>
        ${G.length>0&&["admin","dev"].includes(i.role)?`
          <button onclick="actions.clearAllLabBookings()" class="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all shadow-sm">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Limpar Tabela
          </button>
        `:""}
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto pr-2">
          <table class="w-full text-left min-w-[700px]">
            <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
              <tr>
                <th class="px-8 py-5">Laboratório</th>
                <th class="px-8 py-5">Professor Responsável</th>
                <th class="px-8 py-5">Data da Reserva</th>
                <th class="px-8 py-5">Horário (Início - Fim)</th>
                <th class="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${G.map(e=>`
                <tr class="hover:bg-slate-50/50 transition-all">
                  <td class="px-8 py-5">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${e.labId==="info"?"bg-indigo-50 text-indigo-700":"bg-teal-50 text-teal-700"}">
                      <i data-lucide="${e.labId==="info"?"monitor":"beaker"}" class="w-3 h-3"></i>
                      ${e.labId==="info"?"Informática":"Química"}
                    </span>
                  </td>
                  <td class="px-8 py-5 font-bold text-slate-800">${e.teacherName}</td>
                  <td class="px-8 py-5 font-medium text-slate-600">${e.date}</td>
                  <td class="px-8 py-5">
                    <span class="bg-slate-100 font-mono text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg">
                      ${e.startTime} - ${e.endTime||"---"}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-center">
                    ${i.role==="admin"||i.role==="dev"||i.role==="diretor"||e.teacherId===i.uid?`
                      <button onclick="actions.deleteLabBooking(${e.id})" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer inline-flex items-center" title="Cancelar Reserva">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    `:'<span class="text-slate-300 text-xs">-</span>'}
                  </td>
                </tr>
              `).join("")}
              ${G.length===0?`
                <tr>
                  <td colspan="5" class="px-8 py-10 text-center text-slate-400 font-bold text-sm">Nenhum agendamento de laboratório cadastrado até o momento</td>
                </tr>
              `:""}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`,ve=()=>`
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h3 class="text-xl md:text-2xl font-black text-slate-900">Atestados Médicos</h3>
      <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Incluir Atestado Médico
      </button>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto pr-2">
        <table class="w-full text-left min-w-[700px]">
          <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
            <tr>
              <th class="px-8 py-5">Professor</th>
              <th class="px-8 py-4">Data da Falta</th>
              <th class="px-8 py-4">Motivo</th>
              <th class="px-8 py-4">Imagem</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${O.map(e=>`
              <tr class="hover:bg-slate-50/50 transition-all">
                <td class="px-8 py-5 font-bold">${e.teacherName}</td>
                <td class="px-8 py-5 font-bold">${e.date}</td>
                <td class="px-8 py-5 text-sm">${e.reason}</td>
                <td class="px-8 py-5">
                  ${e.id?`<button onclick="actions.viewImageById(${e.id})" class="bg-blue-50 text-blue-600 p-2 rounded-lg"><i data-lucide="eye" size="16"></i></button>`:'<span class="text-slate-300 text-[10px]">SEM IMAGEM</span>'}
                </td>
                <td class="px-8 py-5">
                  <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full ${e.status==="approved"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}">${e.status==="approved"?"Aprovado":"Pendente"}</span>
                </td>
                <td class="px-8 py-5 text-right">
                  ${e.status==="pending"?`<button onclick="actions.approveCert(${e.id})" class="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Aprovar e Gerar Aula Vaga</button>`:""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`,we=()=>{console.log("[DEBUG RELATÓRIO]",{reportTurno:y,reportWeek:T,schedulesCount:$.length,teachersCount:z.length});const e=Be(),t=pe();let a=[];y==="matutino"?a=["07:30","08:20","09:10","10:15","11:00","11:45"]:y==="vespertino"?a=["13:00","13:50","14:40","15:45","16:30","17:15"]:y==="noturno"?a=["18:45","19:30","20:30","21:15","22:00"]:a=t.length>0?t:["07:30","08:20","09:10","10:15","11:00","11:45"];let r=$;T!=="all"&&(r=$.filter(n=>{try{return ce(n.date)===T}catch{return!1}}));let s=z;if(U!=="all"&&(s=z.filter(n=>n.uid===U)),s.length===0&&r.length>0){const n=new Set,p=[];r.forEach(c=>{c.teacherId&&!n.has(c.teacherId)&&(n.add(c.teacherId),p.push({uid:c.teacherId,displayName:c.teacherName,subject:c.subject}))}),s=p}let o="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 justify-center";v==="small"?o="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 print:grid-cols-5 print:gap-1 justify-center":v==="medium"?o="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 justify-center":v==="large"?o="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 print:grid-cols-3 print:gap-3 justify-center":v==="esticado"?o="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 justify-center":v==="super_esticado"&&(o="grid grid-cols-1 gap-8 print:grid-cols-1 print:gap-6 justify-center");const l=`
    <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-8 print:hidden overflow-x-auto scrollbar-none select-none shrink-0">
      <button onclick="actions.setRelatorioSubTab('urania')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${Z==="urania"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-800"}">
        <i data-lucide="grid-3x3" class="w-4 h-4 text-slate-500"></i> Grade de Professores (Individual)
      </button>
      <button onclick="actions.setRelatorioSubTab('frequent')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${Z==="frequent"?"bg-white text-blue-600 shadow-sm":"text-slate-500 hover:text-slate-800"}">
        <i data-lucide="bar-chart-3" class="w-4 h-4 text-slate-500"></i> Gráfico de Frequência
      </button>
    </div>
  `;return Z==="frequent"?`
      <div class="space-y-4">
        <h3 class="text-2xl font-black text-slate-900 print:hidden">Relatório de Frequência</h3>
        ${l}
        <div class="bg-white p-10 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
          <div class="flex items-end gap-6 h-64 mb-10">
            <div class="w-20 bg-blue-500 rounded-t-2xl" style="height: ${j.total>0?j.confirmed/j.total*100:0}%"></div>
            <div class="w-20 bg-rose-500 rounded-t-2xl" style="height: ${j.total>0?j.absent/j.total*100:0}%"></div>
            <div class="w-20 bg-amber-400 rounded-t-2xl" style="height: ${j.total>0?j.pending/j.total*100:0}%"></div>
          </div>
          <div class="grid grid-cols-3 gap-10 text-center uppercase font-black text-xs">
            <div class="text-blue-600">Presentes: ${j.confirmed}</div>
            <div class="text-rose-500">Ausentes: ${j.absent}</div>
            <div class="text-amber-500">Pendentes: ${j.pending}</div>
          </div>
        </div>
      </div>
    `:`
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Grades Escolares</h3>
          <p class="text-xs text-slate-400 mt-1">Baixe a grade escolar em PDF ou visualize instantaneamente para impressão.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Button 1: Download Direct PDF with html2pdf -->
          <button id="btn-download-pdf" onclick="actions.downloadPDF()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all">
            <i data-lucide="download"></i> Baixar Arquivo PDF
          </button>
        </div>
      </div>

      ${l}

      <!-- Modelo Selector Tab -->
      <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-2 print:hidden overflow-x-auto scrollbar-none select-none shrink-0" id="report-model-tabs">
        <button onclick="actions.setReportModel('prof_turma')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${P==="prof_turma"?"bg-white text-[#2E5077] shadow-sm":"text-slate-500 hover:text-slate-800"}">
          <i data-lucide="user" class="w-3.5 h-3.5 text-slate-500"></i> Professor (por Turma)
        </button>
        <button onclick="actions.setReportModel('prof_subject')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${P==="prof_subject"?"bg-white text-[#2E5077] shadow-sm":"text-slate-500 hover:text-slate-800"}">
          <i data-lucide="book" class="w-3.5 h-3.5 text-slate-500"></i> Professor (por Matéria)
        </button>
        <button onclick="actions.setReportModel('turma_grid')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${P==="turma_grid"?"bg-white text-[#2E5077] shadow-sm":"text-slate-500 hover:text-slate-800"}">
          <i data-lucide="users" class="w-3.5 h-3.5 text-slate-500"></i> Todas as Turmas
        </button>
      </div>

      <!-- Control Box -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nome do Colégio</label>
            <input type="text" value="${W}" oninput="actions.setSchoolName(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Selecione a Semana</label>
            <select onchange="actions.setReportWeek(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all" ${T==="all"?"selected":""}>Todas as semanas (Geral Acumulada)</option>
              ${e.map(n=>`<option value="${n}" ${T===n?"selected":""}>${ne(n)}</option>`).join("")}
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turno / Períodos</label>
            <select onchange="actions.setReportTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="matutino" ${y==="matutino"?"selected":""}>Manhã (07:30 - 11:45)</option>
              <option value="vespertino" ${y==="vespertino"?"selected":""}>Tarde (13:00 - 17:15)</option>
              <option value="noturno" ${y==="noturno"?"selected":""}>Noite (18:45 - 22:45)</option>
              <option value="auto" ${y==="auto"?"selected":""}>Auto-detecção de horários</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filtro de Professor</label>
            <select onchange="actions.setReportTeacher(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all" ${U==="all"?"selected":""}>Todos os professores (${s.length})</option>
              ${z.map(n=>`<option value="${n.uid}" ${U===n.uid?"selected":""}>${n.displayName}</option>`).join("")}
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tamanho dos Cards</label>
            <select onchange="actions.setReportCardSize(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="small" ${v==="small"?"selected":""}>Pequeno (Compacto)</option>
              <option value="medium" ${v==="medium"?"selected":""}>Médio (Recomendado)</option>
              <option value="large" ${v==="large"?"selected":""}>Grande (Mais Legível)</option>
              <option value="esticado" ${v==="esticado"?"selected":""}>Esticado (Largo - 2 por linha)</option>
              <option value="super_esticado" ${v==="super_esticado"?"selected":""}>Super Esticado (Página Inteira - 1 por linha)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Live Printable Preview (Mimicking A4 Sheet) -->
      <div class="w-full overflow-x-auto pb-4 scrollbar-none">
        <div class="printable-sheet bg-white border border-slate-200 rounded-[2rem] p-6 md:p-12 shadow-xl relative overflow-hidden min-w-[750px] md:min-w-0">
        <!-- Sheet Header -->
        <div class="flex flex-col md:flex-row justify-between items-center border-b border-blue-100 pb-6 mb-8 gap-4">
          <div class="flex items-center gap-4">
            <!-- Studia Logo matching user image with book and orbital swoosh -->
            <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <!-- Light Blue Ribbon/Swoosh flourishes around the text -->
              <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
              <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
              
              <!-- Subtle glow on the outer swoosh -->
              <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>

              <!-- Open Book icon centered above "Stu" -->
              <g transform="translate(68, 2)">
                <!-- Left half -->
                <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                <!-- Right half -->
                <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
              </g>

              <!-- Main Title: Studia -->
              <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
              <!-- Subtitle: GRADE ESCOLAR DIGITAL -->
              <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
            </svg>
          </div>
          
          <div class="text-center md:text-right">
            <h4 class="text-sm font-black text-slate-800 uppercase tracking-wide">${W}</h4>
            <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
              ${P==="turma_grid"?"Relatório de Turmas (Individual)":"Relatório de Professores (Individual)"} - ${T==="all"?"Grade Geral Acumulada":ne(T)}
            </p>
          </div>
        </div>

        ${P==="turma_grid"?`
          <!-- Turmas Cards Grid -->
          ${(()=>{const n=[...new Set(r.filter(c=>c.classGroup&&c.classGroup.trim()!=="").map(c=>c.classGroup))].sort();console.log("=== DEBUG RELATÓRIO TURMAS ==="),console.log("schedules total:",$.length),console.log("filteredSchedules:",r.length),console.log("reportWeek:",T),console.log("reportTurno:",y),r.length>0&&(console.log("Sample schedule:",r[0]),console.log("classGroup values:",r.map(c=>c.classGroup).filter(Boolean))),console.log("[DEBUG TURMAS GRID]",{filteredSchedulesCount:r.length,allTurmasCount:n.length,allTurmas:n,reportTurno:y,sampleSchedules:r.slice(0,2).map(c=>({classGroup:c.classGroup,startTime:c.startTime,status:c.status}))});const p=y!=="auto"?n.filter(c=>{const w=r.filter(f=>f.classGroup===c),g=w.some(f=>Ge(f.startTime,y));return console.log(`[DEBUG] Turma "${c}": ${w.length} schedules, matches=${g}`),g}):n;return p.length===0?`
                <div class="text-center py-20 text-slate-400 font-bold space-y-2 col-span-full">
                  <i data-lucide="info" class="w-12 h-12 mx-auto text-slate-300 col-span-full"></i>
                  <p>Nenhuma turma cadastrada ou detectada nos horários selecionados para o turno "${y==="matutino"?"Manhã":y==="vespertino"?"Tarde":"Noite"}". Certifique-se de preencher o campo 'Turma' ao criar novos horários.</p>
                </div>
              `:`
              <div class="${o}">
                ${p.map(c=>{const w=r.filter(g=>g.classGroup===c);return Ae(c,w,a)}).join("")}
              </div>
            `})()}
        `:`
          <!-- Teachers Cards Grid -->
          ${s.length===0?`
            <div class="text-center py-20 text-slate-400 font-bold space-y-2 col-span-full">
              <i data-lucide="info" class="w-12 h-12 mx-auto text-slate-300"></i>
              <p>Nenhum horário cadastrado para exibição na grade individual</p>
            </div>
          `:`
            <div class="${o}">
              ${s.map(n=>{const p=r.filter(c=>c.teacherId===n.uid);return ue(n,p,a,P)}).join("")}
            </div>
          `}
        `}

        <div class="border-t border-slate-100 mt-12 pt-4 flex justify-end text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
          <span>Data de emissão: ${new Date().toLocaleDateString("pt-BR")}</span>
        </div>
        </div>
      </div>
    </div>
  `};let Q=0;const We=[{title:"Studia",subtitle:"Gestão Escolar Inteligente",content:"Uma plataforma completa para controle de horários, laboratórios e frequência docente.",icon:"book-open"},{title:"O Problema",subtitle:"Desafios na Gestão de Horários",content:"Aulas vagas imprevistas, dificuldade no controle de laboratórios e burocracia no envio de atestados médicos.",icon:"alert-circle"},{title:"Nossa Solução",subtitle:"Automatização e Transparência",content:"Sistema centralizado onde professores confirmam presença e diretores gerenciam a grade em tempo real.",icon:"check-circle"},{title:"Funcionalidades",subtitle:"O que o Studia faz?",content:`• Grade de horários dinâmica
• Reserva de laboratórios
• Envio digital de atestados
• Relatórios automáticos de frequência`,icon:"layers"},{title:"Tecnologia",subtitle:"Stack Robusta",content:"Backend robusto para persistência sólida e Frontend moderno com Tailwind CSS.",icon:"cpu"}],re={admin:["overview","escolas","horarios","labs","atestados","usuarios","relatorios"],dev:["overview","escolas","horarios","labs","atestados","usuarios","relatorios"],diretor:["horarios","labs","atestados","usuarios","relatorios"],teacher:["horarios","labs","materias","atestados"]},ze={toggleMobileMenu(e){ie=e;const t=d("#mobile-drawer");t&&t.classList.toggle("hidden",!e)},switchTabMobile(e){var t;(t=re[i==null?void 0:i.role])!=null&&t.includes(e)&&(b=e,ie=!1,this.init())},renderCurrentView(){try{i&&!i.accessToken&&(localStorage.removeItem("user"),i=null),i?i.role==="dev"?B(He()):i.role==="admin"?B(Oe()):i.role==="diretor"?B(_e()):B(oe()):B(ke()),typeof lucide<"u"&&lucide.createIcons()}catch(e){console.error("Render error:",e)}},async init(){var e;try{i?((e=re[i.role])!=null&&e.includes(b)||(b="horarios"),await this.refreshData(),this.renderCurrentView()):B(ke()),typeof lucide<"u"&&lucide.createIcons()}catch(t){console.error("Init error:",t)}},showLoginModal(e="login"){A=e,this.init()},hideLoginModal(){A="closed",this.init()},toggleAuthMode(e){A=e,this.init()},submitContact(e){var s,o,l;e.preventDefault();const t=(s=document.getElementById("landing-name"))==null?void 0:s.value,a=(o=document.getElementById("landing-contact"))==null?void 0:o.value,r=(l=document.getElementById("landing-message"))==null?void 0:l.value;t&&a&&r&&(m(`Obrigado ${t}! Recebemos sua mensagem. Entraremos em contato em breve!`),e.target.reset())},showCreateModal(){const e=d("#create-modal");e&&(e.classList.remove("hidden"),typeof lucide<"u"&&lucide.createIcons())},hideCreateModal(){const e=d("#create-modal");e&&e.classList.add("hidden")},showEditModalById(e){const t=$.find(r=>r.id===e);if(!t)return;const a=d("#edit-modal");a&&(d("#edit-form-id").value=t.id||"",d("#edit-form-subject").value=t.subject||"",d("#edit-form-class-group").value=t.classGroup||"",d("#edit-form-date").value=t.date||"",d("#edit-form-room").value=t.room||"",d("#edit-form-start").value=t.startTime||"18:45",d("#edit-form-end").value=t.endTime||"22:45",d("#edit-form-teacher").value=t.teacherId||"",d("#edit-form-status").value=t.status||"pending",a.classList.remove("hidden"),typeof lucide<"u"&&lucide.createIcons())},hideEditModal(){const e=d("#edit-modal");e&&e.classList.add("hidden")},showDeleteModal(e){const t=d("#delete-modal");t&&(d("#delete-schedule-id").value=e,t.classList.remove("hidden"),typeof lucide<"u"&&lucide.createIcons())},hideDeleteModal(){const e=d("#delete-modal");e&&e.classList.add("hidden")},async confirmDeleteSchedule(){const e=d("#delete-schedule-id").value;try{await h.delete(`/api/schedules/${e}`),this.hideDeleteModal(),this.init()}catch{m("Erro ao excluir.")}},showLabModal(){document.body.insertAdjacentHTML("beforeend",qe());const e=d("#lab-modal");e&&(e.classList.remove("hidden"),typeof lucide<"u"&&lucide.createIcons())},hideLabModal(){const e=d("#lab-modal");e&&e.remove()},showCertModal(){const e=d("#cert-modal");e&&e.classList.remove("hidden")},hideCertModal(){const e=d("#cert-modal");if(e){e.classList.add("hidden"),this.clearCertImage();const t=d("#cert-date");t&&(t.value="");const a=d("#cert-reason");a&&(a.value="")}},previewCertImage(e){const t=e.target.files[0];if(t){const a=new FileReader;a.onload=r=>{const s=d("#cert-preview-img"),o=d("#cert-preview-container"),l=d("#cert-upload-placeholder");s&&o&&l&&(s.src=r.target.result,o.classList.remove("hidden"),l.classList.add("hidden"))},a.readAsDataURL(t)}},clearCertImage(){const e=d("#cert-image");e&&(e.value="");const t=d("#cert-preview-img"),a=d("#cert-preview-container"),r=d("#cert-upload-placeholder");t&&a&&r&&(t.src="",a.classList.add("hidden"),r.classList.remove("hidden"))},switchTab(e){var t;(t=re[i==null?void 0:i.role])!=null&&t.includes(e)&&(b=e,this.init())},async login(){const e=d("#auth-email"),t=d("#auth-password");if(!e||!t)return;const a=e.value,r=t.value;if(!a||!r)return m("Por favor, preencha todos os campos.");try{i=await h.post("/api/auth/login",{email:a,password:r}),localStorage.setItem("user",JSON.stringify(i)),A="closed",this.init()}catch(s){m(s.message)}},async register(){const e=d("#auth-email"),t=d("#auth-password"),a=d("#auth-name"),r=d("#auth-subject");if(!e||!t||!a)return;const s=e.value,o=t.value,l=a.value,n=r?r.value:null;if(!s||!o||!l)return m("Por favor, preencha todos os campos.");if(!n)return m("Por favor, informe sua matéria.");try{i=await h.post("/api/auth/register",{email:s,password:o,displayName:l,subject:n}),localStorage.setItem("user",JSON.stringify(i)),A="closed",this.init()}catch(p){m(p.message)}},logout(){localStorage.removeItem("user"),i=null,b="horarios",A="closed",this.init()},showAddMatériaModal(){const e=prompt("Informe a matéria que você leciona:");e&&this.addMatéria(e)},async addMatéria(e){if(!(!i||!i.uid))try{const t=await h.post(`/api/teachers/${i.uid}/subjects`,{subject:e});window.teacherSubjects||(window.teacherSubjects=[]),window.teacherSubjects.push(t),B(oe()),lucide.createIcons()}catch(t){m(t.message)}},async deleteMatéria(e){if(!(!i||!i.uid)&&confirm(`Deseja remover a matéria "${e}"?`))try{await h.delete(`/api/teachers/${i.uid}/subjects/${encodeURIComponent(e)}`),window.teacherSubjects=(window.teacherSubjects||[]).filter(t=>t.subject!==e),B(oe()),lucide.createIcons()}catch(t){m(t.message)}},normalizeSchedules(e){return e.map(t=>{const a=t.classgroup||t.classGroup||"SEM_TURMA";return(!a||a.trim()==="")&&console.warn("[WARN] Schedule sem classGroup:",t),{id:t.id,date:t.date,startTime:t.starttime||t.startTime,endTime:t.endtime||t.endTime,subject:t.subject,room:t.room,teacherId:t.teacherid||t.teacherId,teacherName:t.teachername||t.teacherName,classGroup:a,status:t.status,school_id:t.school_id,createdAt:t.createdat||t.createdAt}})},async refreshData(){if(!(!i||se)){se=!0;try{if(i.role==="admin"||i.role==="dev"){const e=await Promise.allSettled([h.get(`/api/schedules?schoolId=${i.school_id}`),h.get("/api/teachers"),h.get("/api/users"),h.get("/api/labs/bookings"),h.get("/api/certificates"),h.get("/api/schools")]),[t,a,r,s,o,l]=e.map((n,p)=>n.status==="fulfilled"?n.value:(console.error(`Data fetch #${p} failed:`,n.reason),[]));$=this.normalizeSchedules(t||[]),z=a||[],N=r||[],V=l||[],j={total:$.length,confirmed:$.filter(n=>n.status==="confirmed").length,absent:$.filter(n=>n.status==="absent").length,pending:$.filter(n=>n.status==="pending").length},G=s||[],O=o||[]}else if(i.role==="diretor"){const e=await Promise.allSettled([h.get(`/api/schedules?schoolId=${i.school_id}`),h.get("/api/teachers"),h.get(`/api/users?schoolId=${i.school_id}`),h.get("/api/labs/bookings"),h.get("/api/certificates")]),[t,a,r,s,o]=e.map((l,n)=>l.status==="fulfilled"?l.value:(console.error(`Data fetch #${n} failed:`,l.reason),[]));$=this.normalizeSchedules(t||[]),z=a||[],N=r||[],j={total:$.length,confirmed:$.filter(l=>l.status==="confirmed").length,absent:$.filter(l=>l.status==="absent").length,pending:$.filter(l=>l.status==="pending").length},G=s||[],O=o||[]}else{const e=await Promise.allSettled([h.get(`/api/schedules?teacherId=${i.uid}`),h.get("/api/labs/bookings"),h.get("/api/certificates"),h.get(`/api/teachers/${i.uid}/subjects`)]),[t,a,r,s]=e.map((o,l)=>o.status==="fulfilled"?o.value:(console.error(`Data fetch #${l} failed:`,o.reason),[]));$=this.normalizeSchedules(t||[]),N=[],G=a||[],O=r||[],window.teacherSubjects=s||[]}}catch(e){console.error("Data refresh error:",e)}finally{se=!1}}},async refreshSchedules(){await this.refreshData(),this.init()},async deleteUser(e,t,a){if(!(!e||!await m(`Deseja excluir ${t} (${a}) do sistema? Essa ação remove o acesso do usuário e sua conta de autenticação.`,{confirm:!0,title:"Excluir usuário"})))try{await h.delete(`/api/users/${e}`),await this.refreshData(),this.init(),m("Usuário excluído com sucesso.")}catch(s){m(s.message||"Erro ao excluir usuário.")}},async changeUserRole(e,t){if(!(!e||e===(i==null?void 0:i.uid)))try{await h.patch(`/api/users/${e}/role`,{role:t}),N=N.map(a=>a.uid===e?{...a,role:t}:a),this.init()}catch(a){m(a.message||"Erro ao atualizar perfil do usuário."),this.init()}},async updateStatus(e,t){try{await h.patch(`/api/schedules/${e}`,{status:t}),this.init()}catch{m("Erro ao atualizar status.")}},async createSchedule(e){e.preventDefault();const t=d("#form-teacher"),a={subject:d("#form-subject").value,classGroup:d("#form-class-group").value,date:d("#form-date").value,room:d("#form-room").value,startTime:d("#form-start").value,endTime:d("#form-end").value,teacherId:t.value,teacherName:t.options[t.selectedIndex].text,school_id:i.school_id};try{await h.post("/api/schedules",a),this.hideCreateModal(),this.init()}catch{m("Erro ao criar horário.")}},async updateSchedule(e){e.preventDefault();const t=d("#edit-form-id").value,a=d("#edit-form-teacher"),r={subject:d("#edit-form-subject").value,classGroup:d("#edit-form-class-group").value,date:d("#edit-form-date").value,room:d("#edit-form-room").value,startTime:d("#edit-form-start").value,endTime:d("#edit-form-end").value,teacherId:a.value,teacherName:a.options[a.selectedIndex].text,status:d("#edit-form-status").value};try{await h.patch(`/api/schedules/${t}`,r),this.hideEditModal(),this.init()}catch{m("Erro ao editar horário.")}},async deleteSchedule(e){if(await m("Deseja excluir este horário?",{confirm:!0,title:"Excluir horário"}))try{await h.delete(`/api/schedules/${e}`),this.init()}catch{m("Erro ao excluir.")}},async createLabBooking(e){e.preventDefault();const t={labId:d("#lab-type").value,teacherId:i.uid,teacherName:i.displayName,date:d("#lab-date").value,startTime:d("#lab-start").value,endTime:d("#lab-end").value};try{await h.post("/api/labs/bookings",t),this.hideLabModal(),this.init()}catch{m("Erro ao reservar.")}},async deleteLabBooking(e){if(await m("Deseja realmente cancelar esta reserva de laboratório?",{confirm:!0,title:"Cancelar reserva"}))try{await h.delete(`/api/labs/bookings/${e}`),await this.refreshData(),this.init()}catch{m("Erro ao excluir reserva.")}},async clearAllLabBookings(){if(await m("Deseja realmente apagar todos os agendamentos de laboratórios? Esta ação limpará a tabela por completo.",{confirm:!0,title:"Limpar reservas"}))try{await h.delete("/api/labs/bookings-clear-all"),await this.refreshData(),this.init()}catch{m("Erro ao apagar agendamentos da tabela.")}},async submitCert(e){e.preventDefault();const t=d("#cert-image");let a=null;if(t&&t.files[0])try{a=await new Promise((s,o)=>{const l=new FileReader;l.onloadend=()=>s(l.result),l.onerror=o,l.readAsDataURL(t.files[0])})}catch(s){console.error("File upload error:",s)}const r={teacherId:i.uid,teacherName:i.displayName,date:d("#cert-date").value,reason:d("#cert-reason").value,imageUrl:a};try{await h.post("/api/certificates",r),this.hideCertModal(),m("Atestado enviado com sucesso."),this.init()}catch{m("Erro ao enviar atestado.")}},viewImage(e){const t="image-viewer-modal";let a=d(`#${t}`);a||(document.body.insertAdjacentHTML("beforeend",`
            <div id="${t}" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onclick="this.classList.add('hidden')">
                <div class="relative bg-white p-2 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
                    <img id="viewer-img" src="" class="w-full h-auto rounded-xl">
                    <button class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md" onclick="document.getElementById('${t}').classList.add('hidden')">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            </div>
        `),a=d(`#${t}`),typeof lucide<"u"&&lucide.createIcons());const r=a.querySelector("#viewer-img");r.src=e,a.classList.remove("hidden")},async viewImageById(e){try{const t=await h.get(`/api/certificates/${e}/image`);this.viewImage(t.imageUrl)}catch{m("Este certificado não possui uma imagem disponível.")}},nextSlide(){Q<We.length-1&&(Q++,this.init())},prevSlide(){Q>0&&(Q--,this.init())},async approveCert(e){if(await m("Deseja aprovar este atestado? Isso converterá automaticamente os horários deste dia em AULA VAGA.",{confirm:!0,title:"Aprovar atestado"}))try{await h.patch(`/api/certificates/${e}/approve`,{}),this.init()}catch{m("Erro ao aprovar atestado.")}},setReportWeek(e){T=e,this.renderCurrentView()},setReportTurno(e){y=e,this.renderCurrentView()},setReportTeacher(e){U=e,this.renderCurrentView()},setReportCardSize(e){v=e,localStorage.setItem("reportCardSize",e),this.renderCurrentView()},setSchoolName(e){W=e;const t=d(".printable-sheet h4");t&&(t.textContent=e)},setRelatorioSubTab(e){Z=e,this.renderCurrentView()},setReportModel(e){P=e,this.renderCurrentView()},setTeacherSchedulesTab(e){e==="grid"&&(le="grid",this.renderCurrentView())},async downloadTeacherPDF(){const e=document.querySelector(".printable-sheet");if(!e)return;const t=document.querySelector("#btn-download-pdf-teacher"),a=t?t.innerHTML:"";t&&(t.innerHTML='<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Gerando PDF...',t.disabled=!0);const r=e.cloneNode(!0);r.id="temp-pdf-teacher-container",r.className="printable-sheet bg-white",r.style.width="1020px",r.style.boxSizing="border-box",r.style.backgroundColor="#ffffff",r.style.padding="30px",document.body.appendChild(r),typeof lucide<"u"&&lucide.createIcons({node:r});const s={margin:[.3,.3,.3,.3],filename:`Grade_Professor_${i?i.displayName.replace(/\s+/g,"_"):"Individual"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,backgroundColor:"#ffffff"},jsPDF:{unit:"in",format:"a4",orientation:"landscape"}},o=Ie(r);let l=()=>{};try{l=await Ce()}catch(n){console.warn("Could not clean stylesheets:",n)}html2pdf().set(s).from(r).save().then(()=>{o(),l(),document.body.removeChild(r),t&&(t.innerHTML=a,t.disabled=!1,typeof lucide<"u"&&lucide.createIcons())}).catch(n=>{o(),l(),document.getElementById("temp-pdf-teacher-container")&&document.body.removeChild(r),console.error("Error generating PDF:",n),t&&(t.innerHTML=a,t.disabled=!1,typeof lucide<"u"&&lucide.createIcons()),m("Houve um erro ao gerar o PDF.")})},async downloadPDF(){if(!document.querySelector(".printable-sheet"))return;const t=document.querySelector("#btn-download-pdf"),a=t?t.innerHTML:"";t&&(t.innerHTML='<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Gerando PDF...',t.disabled=!0);let r=$;T!=="all"&&(r=$.filter(x=>{try{return ce(x.date)===T}catch{return!1}}));let s=z;if(U!=="all"&&(s=z.filter(x=>x.uid===U)),s.length===0&&r.length>0){const x=new Set,C=[];r.forEach(M=>{M.teacherId&&!x.has(M.teacherId)&&(x.add(M.teacherId),C.push({uid:M.teacherId,displayName:M.teacherName,subject:M.subject}))}),s=C}let o=[];if(y==="matutino")o=["07:30","08:20","09:10","10:15","11:00","11:45"];else if(y==="vespertino")o=["13:00","13:50","14:40","15:45","16:30","17:15"];else if(y==="noturno")o=["18:45","19:30","20:30","21:15","22:00"];else{const x=pe();o=x.length>0?x:["07:30","08:20","09:10","10:15","11:00","11:45"]}let l=[];const n=P==="turma_grid";n?l=Ne(r):l=s;const c={small:8,medium:4,large:3,esticado:2,super_esticado:1}[v]||4,w=[];for(let x=0;x<l.length;x+=c)w.push(l.slice(x,x+c));const g=document.createElement("div");g.id="temp-pdf-container",g.className="printable-sheet bg-white",g.style.width="1020px",g.style.padding="10px",g.style.boxSizing="border-box",g.style.backgroundColor="#ffffff";let f="grid grid-cols-2 gap-4 justify-center w-full";v==="small"?f="grid grid-cols-4 gap-2 justify-center w-full":v==="medium"?f="grid grid-cols-2 gap-4 justify-center w-full":v==="large"?f="grid grid-cols-3 gap-4 justify-center w-full":v==="esticado"?f="grid grid-cols-2 gap-4 justify-center w-full":v==="super_esticado"&&(f="grid grid-cols-1 gap-6 justify-center w-full");let I="";w.forEach((x,C)=>{const M=`
        <div class="flex justify-between items-center border-b border-blue-100 pb-4 mb-6 gap-4">
          <div class="flex items-center gap-4">
            <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
              <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
              <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>
              <g transform="translate(68, 2)">
                <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
              </g>
              <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
              <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
            </svg>
          </div>
          <div class="text-right">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wide">${W}</h4>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
              ${n?"Relatório de Turmas (Individual)":"Relatório de Professores (Individual)"} - ${T==="all"?"Grade Geral Acumulada":ne(T)}
            </p>
          </div>
        </div>
      `,R=x.map(F=>{if(n){const L=r.filter(_=>_.classGroup===F);return Ae(F,L,o)}else{const L=r.filter(_=>_.teacherId===F.uid);return ue(F,L,o,P)}}).join(""),D=`
        <div class="border-t border-slate-100 mt-6 pt-3 flex justify-between text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
          <span>Página ${C+1} de ${w.length}</span>
          <span>Data de emissão: ${new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      `,H=C===w.length-1?"":"page-break-after: always;";I+=`
        <div class="pdf-page bg-white" style="${H} width: 100%; box-sizing: border-box; padding-bottom: 20px;">
          ${M}
          <div class="${f}">
            ${R}
          </div>
          ${D}
        </div>
      `}),g.innerHTML=I,document.body.appendChild(g),typeof lucide<"u"&&lucide.createIcons({node:g});const u={margin:[.2,.2,.2,.2],filename:`Grade_Escolar_${T}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,backgroundColor:"#ffffff"},jsPDF:{unit:"in",format:"a4",orientation:"landscape"},pagebreak:{mode:["avoid-all","css","legacy"]}},S=Ie(g);let k=()=>{};try{k=await Ce()}catch(x){console.warn("Could not clean stylesheets:",x)}html2pdf().set(u).from(g).save().then(()=>{S(),k(),document.body.removeChild(g),t&&(t.innerHTML=a,t.disabled=!1,typeof lucide<"u"&&lucide.createIcons())}).catch(x=>{S(),k(),document.getElementById("temp-pdf-container")&&document.body.removeChild(g),console.error("Error generating PDF:",x),t&&(t.innerHTML=a,t.disabled=!1,typeof lucide<"u"&&lucide.createIcons()),m("Houve um erro ao gerar o PDF.")})},showCreateEscolaModal(){const e=document.getElementById("create-escola-modal");e&&e.classList.remove("hidden")},hideCreateEscolaModal(){var t;const e=document.getElementById("create-escola-modal");e&&e.classList.add("hidden"),(t=document.getElementById("escola-name"))!=null&&t.value&&(document.getElementById("escola-name").value="")},async createSchool(e){var a;e&&e.preventDefault();const t=(a=document.getElementById("escola-name"))==null?void 0:a.value;if(!t)return m("Nome da escola é obrigatório.");try{await h.post("/api/schools",{name:t,createdBy:i.uid}),this.hideCreateEscolaModal(),await this.refreshData(),this.init(),m("Escola criada com sucesso!")}catch(r){m(r.message||"Erro ao criar escola.")}},async deleteSchool(e){if(!e)return;const t=V.find(r=>r.id===e);if(await m(`Deseja excluir a escola "${t==null?void 0:t.name}"? Esta ação não pode ser desfeita.`,{confirm:!0,title:"Excluir escola"}))try{await h.delete(`/api/schools/${e}`),await this.refreshData(),this.init(),m("Escola excluída com sucesso.")}catch(r){m(r.message||"Erro ao excluir escola.")}},showCreateUserModal(e="admin"){const t=document.getElementById("create-user-modal");t&&t.classList.remove("hidden")},hideCreateUserModal(){var t,a,r,s,o;const e=document.getElementById("create-user-modal");e&&e.classList.add("hidden"),(t=document.getElementById("user-displayname"))!=null&&t.value&&(document.getElementById("user-displayname").value=""),(a=document.getElementById("user-email"))!=null&&a.value&&(document.getElementById("user-email").value=""),(r=document.getElementById("user-password"))!=null&&r.value&&(document.getElementById("user-password").value=""),(s=document.getElementById("user-subject"))!=null&&s.value&&(document.getElementById("user-subject").value=""),(o=document.getElementById("user-role"))!=null&&o.value&&(document.getElementById("user-role").value="")},async createUser(e){var n,p,c,w,g,f,I,u;e&&e.preventDefault();const t=(p=(n=document.getElementById("user-displayname"))==null?void 0:n.value)==null?void 0:p.trim(),a=(w=(c=document.getElementById("user-email"))==null?void 0:c.value)==null?void 0:w.trim(),r=(g=document.getElementById("user-password"))==null?void 0:g.value,s=(I=(f=document.getElementById("user-subject"))==null?void 0:f.value)==null?void 0:I.trim(),o=(u=document.getElementById("user-role"))==null?void 0:u.value;if(!t)return m("Nome é obrigatório.");if(!a)return m("E-mail é obrigatório.");if(!r)return m("Senha é obrigatória.");if(r.length<8)return m("Senha deve ter no mínimo 8 caracteres.");if(!o)return m("Cargo é obrigatório.");if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))return m("E-mail inválido.");try{const S={displayName:t,email:a,password:r,role:o,userRole:i==null?void 0:i.role,userSchoolId:i==null?void 0:i.school_id};s&&(S.subject=s),await h.post("/api/users/create",S),this.hideCreateUserModal(),await this.refreshData(),this.init(),m("Usuário criado com sucesso!")}catch(S){const k=S.message||"Erro ao criar usuário.";m(k)}}};function Pe(e){try{const t=e.match(/oklch\(([^)]+)\)/i);if(!t)return"rgb(0, 0, 0)";const a=t[1].trim().split(/[\s,+/]+/);if(a.length<3)return"rgb(0, 0, 0)";let r=a[0].endsWith("%")?parseFloat(a[0])/100:parseFloat(a[0]),s=a[1].endsWith("%")?parseFloat(a[1])/100*.4:parseFloat(a[1]),o=0;a[2]!=="none"&&(a[2].endsWith("deg")?o=parseFloat(a[2]):a[2].endsWith("rad")?o=parseFloat(a[2])*180/Math.PI:a[2].endsWith("turn")?o=parseFloat(a[2])*360:o=parseFloat(a[2]));let l=1;a[3]!==void 0&&(l=a[3].endsWith("%")?parseFloat(a[3])/100:parseFloat(a[3]));const n=s*Math.cos(o*Math.PI/180),p=s*Math.sin(o*Math.PI/180),c=r+.3963377774*n+.2158037573*p,w=r-.1055613458*n-.0638541728*p,g=r-.0894841775*n-1.291485548*p,f=Math.pow(Math.max(0,c),3),I=Math.pow(Math.max(0,w),3),u=Math.pow(Math.max(0,g),3);let S=4.0767416621*f-3.3077115913*I+.2309699292*u,k=-1.2684380046*f+2.6097574011*I-.3413193965*u,x=-.0041960863*f-.7034186147*I+1.707614701*u;const C=S<=.0031308?12.92*S:1.055*Math.pow(S,1/2.4)-.055,M=k<=.0031308?12.92*k:1.055*Math.pow(k,1/2.4)-.055,R=x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055,D=H=>Math.min(255,Math.max(0,Math.round(H*255)));return l===1?`rgb(${D(C)}, ${D(M)}, ${D(R)})`:`rgba(${D(C)}, ${D(M)}, ${D(R)}, ${l})`}catch{return"rgb(0, 0, 0)"}}function de(e){return!e||typeof e!="string"||!e.includes("oklch")?e:e.replace(/oklch\([^)]+\)/gi,t=>{let a=document.getElementById("temp-color-resolver");a||(a=document.createElement("div"),a.id="temp-color-resolver",a.style.position="absolute",a.style.visibility="hidden",a.style.width="0",a.style.height="0",document.body.appendChild(a));try{a.style.color=t;const r=window.getComputedStyle(a,null).getPropertyValue("color");if(r&&!r.includes("oklch"))return r}catch{}return Pe(t)})}async function Ce(){const e=[],t=Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));let a="";for(const o of t)try{if(o.tagName==="STYLE")a+=`
`+o.innerHTML,e.push({node:o,originalDisabled:o.disabled,type:"style"});else if(o.tagName==="LINK"){let l="";try{if(o.sheet){const n=o.sheet.cssRules||o.sheet.rules;for(let p=0;p<n.length;p++)l+=n[p].cssText+`
`}}catch{}if(!l){const n=o.getAttribute("href");n&&(n.startsWith("/")||n.startsWith("./")||n.startsWith("src/")||n.startsWith(window.location.origin))&&(l=await(await fetch(n)).text())}l&&(a+=`
`+l,e.push({node:o,originalDisabled:o.disabled,type:"link"}))}}catch(l){console.warn("Could not backup or read stylesheet:",o,l)}const r=a.replace(/oklch\([^)]+\)/gi,o=>Pe(o)),s=document.createElement("style");s.id="temp-cleaned-stylesheets",s.innerHTML=r,document.head.appendChild(s);for(const o of e)o.node.disabled=!0;return function(){for(const l of e)l.node.disabled=l.originalDisabled;s.parentNode&&s.parentNode.removeChild(s)}}function Ie(e){const t=Qe(),a=[e,...e.querySelectorAll("*")],r=[];for(const s of a){if(!s||!s.style)continue;const o=s.getAttribute("style")||"";r.push({el:s,originalInlineStyle:o});try{const l=window.getComputedStyle(s),n=["color","backgroundColor","borderColor","borderTopColor","borderBottomColor","borderLeftColor","borderRightColor","stroke","fill"];for(const p of n){let c="";try{c=l.getPropertyValue(p.replace(/([A-Z])/g,"-$1").toLowerCase())}catch{c=l[p]}if(c&&typeof c=="string"&&c.includes("oklch")){const w=de(c);s.style[p]=w}}}catch{}}return function(){t();for(const o of r)o.originalInlineStyle?o.el.setAttribute("style",o.originalInlineStyle):o.el.removeAttribute("style")}}function Qe(){const e=CSSStyleDeclaration.prototype.getPropertyValue;CSSStyleDeclaration.prototype.getPropertyValue=function(r){const s=e.call(this,r);return s&&typeof s=="string"&&s.includes("oklch")?de(s):s};const t=["color","backgroundColor","borderColor","borderTopColor","borderBottomColor","borderLeftColor","borderRightColor","stroke","fill"],a={};for(const r of t){const s=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,r);s&&s.get&&(a[r]=s,Object.defineProperty(CSSStyleDeclaration.prototype,r,{configurable:!0,enumerable:!0,get(){const o=s.get.call(this);return o&&typeof o=="string"&&o.includes("oklch")?de(o):o},set(o){s.set.call(this,o)}}))}return function(){CSSStyleDeclaration.prototype.getPropertyValue=e;for(const s in a)Object.defineProperty(CSSStyleDeclaration.prototype,s,a[s])}}window.actions=ze;ze.init();
