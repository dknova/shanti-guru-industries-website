const nav = document.getElementById("nav"),
  b = document.getElementById("burger");
const hdr = document.querySelector("header");
function setHH() {
  document.documentElement.style.setProperty("--hh", hdr.offsetHeight + "px");
}
setHH();
addEventListener("resize", setHH);
addEventListener("load", setHH);
if ("ResizeObserver" in window) new ResizeObserver(setHH).observe(hdr);
const closeNav = () => {
  nav.classList.remove("open");
  b.setAttribute("aria-expanded", false);
  b.setAttribute("aria-label", "Open menu");
};
b.onclick = () => {
  const o = nav.classList.toggle("open");
  b.setAttribute("aria-expanded", o);
  b.setAttribute("aria-label", o ? "Close menu" : "Open menu");
};
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});
addEventListener("resize", () => {
  if (innerWidth > 1320) closeNav();
});
document.addEventListener("click", (e) => {
  if (nav.classList.contains("open") && !nav.contains(e.target)) closeNav();
});
// theme toggle: tablet and desktop only (CSS keeps mobile on the original light theme)
(() => {
  const root = document.documentElement,
    btn = document.getElementById("themeToggle"),
    KEY = "sg-theme";
  const sync = () => {
    const d = root.dataset.theme === "dark";
    btn.setAttribute("aria-pressed", d);
    btn.setAttribute(
      "aria-label",
      d ? "Switch to light theme" : "Switch to dark theme",
    );
    btn.title = d ? "Light theme" : "Dark theme";
  };
  btn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
    sync();
    dispatchEvent(new Event("themechange"));
  });
  matchMedia("(min-width:768px)").addEventListener("change", () =>
    dispatchEvent(new Event("themechange")),
  );
  sync();
})();
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
// reveal + counters
const co = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-n]").forEach((el) => {
        const t = +el.dataset.n;
        let s = null;
        const step = (ts) => {
          s = s || ts;
          const p = Math.min((ts - s) / 1500, 1);
          el.textContent =
            Math.floor(t * (1 - Math.pow(1 - p, 3))) + (p === 1 ? "+" : "");
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      co.unobserve(e.target);
    }),
  { threshold: 0.2 },
);
document.querySelectorAll(".reveal").forEach((el) => co.observe(el));
// tabs
document.querySelectorAll(".tab").forEach(
  (t) =>
    (t.onclick = () => {
      document
        .querySelectorAll(".tab")
        .forEach((x) => x.setAttribute("aria-selected", x === t));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.toggle("show", p.id === t.dataset.p));
    }),
);
// active link
const links = [...document.querySelectorAll("nav a.link")];
const secs = [...document.querySelectorAll("#home,section[id]")];
let tick = false;
function setActive() {
  tick = false;
  const y = window.innerHeight * 0.35;
  let cur = secs[0];
  secs.forEach((s) => {
    if (s.getBoundingClientRect().top <= y) cur = s;
  });
  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4
  )
    cur = secs[secs.length - 1];
  const cid = cur.dataset.nav || cur.id;
  links.forEach((l) =>
    l.classList.toggle("active", l.getAttribute("href") === "#" + cid),
  );
}
window.addEventListener(
  "scroll",
  () => {
    if (!tick) {
      tick = true;
      requestAnimationFrame(setActive);
    }
  },
  { passive: true },
);
window.addEventListener("resize", setActive);
window.addEventListener("hashchange", () => setTimeout(setActive, 50));
setActive();
// WebGL hero: glossy sauce-and-oil droplets that drift, merge and split; the pointer drags a droplet
(() => {
  const cv = document.getElementById("gl"),
    hero = document.getElementById("home");
  const gl = cv.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) {
    cv.style.display = "none";
    return;
  }
  const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform vec2 m;uniform float t;uniform float dk;
void main(){
  float asp=r.x/r.y;
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  vec2 mp=(m*r-.5*r)/r.y;
  float f=0.;vec2 g=vec2(0.);
  for(int i=0;i<10;i++){
    float fi=float(i);
    float a=fi*2.399+t*(.07+.02*fi);
    float k=fract(fi*.371);
    vec2 c=vec2(cos(a)*(.5+.5*k)*asp*.95,sin(a*1.3+fi)*(.45+.25*k));
    float rr=.1+.08*fract(fi*.773);rr*=rr;
    vec2 dv=p-c;float d2=dot(dv,dv)+1e-4;
    f+=rr/d2;g+=-2.*rr*dv/(d2*d2);
  }
  {
    vec2 dv=p-mp;float d2=dot(dv,dv)+1e-4;float rr=.0165;
    f+=rr/d2;g+=-2.*rr*dv/(d2*d2);
  }
  float inside=smoothstep(.97,1.03,f);
  vec3 n=normalize(vec3(-g/(f*f)*.25,1.));
  vec3 L=normalize(vec3(-.5,.7,.6));
  float diff=max(dot(n,L),0.);
  float deep=smoothstep(1.,3.,f);
  vec3 base=mix(vec3(.88,.17,.21),vec3(.5,.05,.1),deep);
  vec3 col=base*(.45+.75*diff);
  float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),48.);
  col+=spec*.9*vec3(1.,.95,.85);
  col+=pow(1.-n.z,3.)*vec3(.95,.55,.3)*.35;
  vec3 bg=mix(vec3(1.),vec3(.1,.06,.07),dk);
  float sh=smoothstep(.6,1.,f+dot(g,vec2(.035,.05)))*.14;
  vec3 o=bg*(1.-sh*(1.-dk*.5));
  float fade=.12+.88*smoothstep(.2,.8,length(p*vec2(.5,1.15)));
  o=mix(o,col,inside*fade);
  gl_FragColor=vec4(o,1.);
}`;
  const mk = (ty, src) => {
    const s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
    cv.style.display = "none";
    return;
  }
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(pr, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  const ur = U("r"),
    um = U("m"),
    ut = U("t"),
    ud = U("dk");
  const wide = matchMedia("(min-width:768px)");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mx = 0.5,
    my = 0.5,
    tx = 0.5,
    ty = 0.5,
    run = false,
    raf = 0;
  function size() {
    const d = Math.min(devicePixelRatio || 1, 1.25);
    cv.width = Math.max(1, hero.clientWidth * d);
    cv.height = Math.max(1, hero.clientHeight * d);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  function draw(ts) {
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    gl.uniform2f(ur, cv.width, cv.height);
    gl.uniform2f(um, mx, my);
    gl.uniform1f(ut, ts / 1000);
    gl.uniform1f(
      ud,
      wide.matches && document.documentElement.dataset.theme === "dark" ? 1 : 0,
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (run && !still) raf = requestAnimationFrame(draw);
  }
  addEventListener("themechange", () => draw(performance.now()));
  hero.addEventListener("pointermove", (e) => {
    const b = hero.getBoundingClientRect();
    tx = (e.clientX - b.left) / b.width;
    ty = 1 - (e.clientY - b.top) / b.height;
  });
  new ResizeObserver(() => {
    size();
    draw(performance.now());
  }).observe(hero);
  new IntersectionObserver((es) => {
    run = es[0].isIntersecting;
    cancelAnimationFrame(raf);
    if (run) raf = requestAnimationFrame(draw);
  }).observe(hero);
})();
// form
document.getElementById("f").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(e.target),
    g = (k) => (d.get(k) || "").toString().trim();
  const subject = "[" + g("t") + "] Enquiry from " + g("n");
  const body =
    "Name: " +
    g("n") +
    "\nEmail: " +
    g("e") +
    (g("p") ? "\nPhone: " + g("p") : "") +
    "\nEnquiry type: " +
    g("t") +
    "\n\n" +
    g("m");
  window.location.href =
    "mailto:rclretail@gmail.com?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);
  document.getElementById("ok").textContent =
    "Thank you. Your email app is opening with your message ready to send.";
});

// about us: words light up as you scroll
(() => {
  const box = document.getElementById("scrolltext");
  if (!box) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const words = [];
  box.querySelectorAll("p").forEach((p) => {
    const t = p.textContent.trim().split(/\s+/);
    p.textContent = "";
    t.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      p.appendChild(s);
      if (i < t.length - 1) p.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  });
  const rail = document.createElement("i");
  rail.className = "rail";
  box.appendChild(rail);
  let tk = false;
  function upd() {
    tk = false;
    const r = box.getBoundingClientRect(),
      vh = window.innerHeight;
    const start = vh * 0.85,
      end = vh * 0.45;
    const p = Math.min(
      1,
      Math.max(0, (start - r.top) / (start - end + r.height)),
    );
    const n = words.length,
      f = p * (n + 8);
    rail.style.setProperty("--p", p.toFixed(3));
    words.forEach((w, i) => {
      const t = Math.min(1, Math.max(0, f - i));
      w.style.setProperty("--o", (0.18 + 0.82 * t).toFixed(2));
      w.style.setProperty("--t", t.toFixed(2));
    });
  }
  addEventListener(
    "scroll",
    () => {
      if (!tk) {
        tk = true;
        requestAnimationFrame(upd);
      }
    },
    { passive: true },
  );
  addEventListener("resize", upd);
  upd();
})();

// about us: split heading into words that rise in, and parallax the background shapes
(() => {
  const h = document.querySelector(".about h2");
  if (!h) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const words = h.textContent.trim().split(/\s+/);
  h.setAttribute("aria-label", words.join(" "));
  h.textContent = "";
  words.forEach((w, i) => {
    const o = document.createElement("span");
    o.className = "hw";
    o.setAttribute("aria-hidden", "true");
    const n = document.createElement("span");
    n.style.setProperty("--i", i);
    n.textContent = w;
    o.appendChild(n);
    h.appendChild(o);
    if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
  });
  h.classList.add("split");
})();

// products: split heading letters, staggered cards, count-up numbers, card tilt
(() => {
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const pr = document.getElementById("products");
  if (!pr) return;
  if (!reduce) {
    const h = pr.querySelector("h2");
    if (h) {
      const t = h.textContent.trim();
      h.setAttribute("aria-label", t);
      h.textContent = "";
      [...t].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", i);
        s.textContent = ch;
        h.appendChild(s);
      });
    }
  }
  const count = (el) => {
    const t = parseInt(el.dataset.to || el.textContent, 10);
    if (isNaN(t)) return;
    el.dataset.to = t;
    if (reduce) {
      el.textContent = t;
      return;
    }
    let st = null;
    const step = (ts) => {
      st = st || ts;
      const p = Math.min((ts - st) / 900, 1);
      el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = 0;
    requestAnimationFrame(step);
  };
  const grids = [...pr.querySelectorAll(".pgrid")];
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting && !e.target.classList.contains("go")) {
          e.target.classList.add("go");
          e.target
            .closest(".panel")
            .querySelectorAll(".pmeta b")
            .forEach(count);
        }
      }),
    { threshold: 0.15 },
  );
  grids.forEach((g) => io.observe(g));
  const bo = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          pr.querySelectorAll(".pcount").forEach(count);
          bo.disconnect();
        }
      }),
    { threshold: 0.3 },
  );
  const tabs = pr.querySelector(".ptabs");
  if (tabs) bo.observe(tabs);
  // replay the staggered entrance each time a tab is opened
  pr.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      const g = document.getElementById(t.dataset.p).querySelector(".pgrid");
      g.classList.remove("go");
      void g.offsetWidth;
      g.classList.add("go");
      document
        .getElementById(t.dataset.p)
        .querySelectorAll(".pmeta b")
        .forEach(count);
    }),
  );
  // tilt + glare on hover (mouse only)
  if (!reduce && matchMedia("(hover:hover)").matches) {
    pr.querySelectorAll(".pcard").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect(),
          px = (e.clientX - r.left) / r.width,
          py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--rx", ((py - 0.5) * -9).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2) + "deg");
        card.style.setProperty("--gx", (px * 100).toFixed(0) + "%");
        card.style.setProperty("--gy", (py * 100).toFixed(0) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }
})();

// products: scroll-linked animation (progress bar, parallax, scrubbed entrances)
(() => {
  const band = document.querySelector(".products-band");
  if (!band) return;
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const prog = band.querySelector(".pr-progress");
  const items = [...band.querySelectorAll(".sx")];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let tk = false;
  function upd() {
    tk = false;
    const vh = innerHeight;
    const br = band.getBoundingClientRect();
    const sp = clamp((vh - br.top) / (br.height + vh));
    if (prog) prog.style.setProperty("--sp", sp.toFixed(3));
    band.style.setProperty("--bs", ((sp - 0.5) * 2).toFixed(3));
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return; // hidden tab
      const idx = el.parentElement
        ? [...el.parentElement.children].indexOf(el)
        : 0;
      const start = vh * 1.0,
        end = vh * 0.66;
      let p = reduce ? 1 : clamp((start - (r.top + idx * 46)) / (start - end));
      const e = 1 - Math.pow(1 - p, 3);
      el.style.setProperty("--op", e.toFixed(3));
      el.style.setProperty("--ty", ((1 - e) * 70).toFixed(1) + "px");
      el.style.setProperty("--sc", (0.9 + 0.1 * e).toFixed(3));
      const par = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2), -1, 1);
      el.style.setProperty("--par", reduce ? 0 : par.toFixed(3));
    });
  }
  const req = () => {
    if (!tk) {
      tk = true;
      requestAnimationFrame(upd);
    }
  };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  band
    .querySelectorAll(".tab")
    .forEach((t) => t.addEventListener("click", () => setTimeout(upd, 30)));
  upd();
})();

// board committee tabs
document.querySelectorAll(".ctab").forEach((t) =>
  t.addEventListener("click", () => {
    document
      .querySelectorAll(".ctab")
      .forEach((x) => x.setAttribute("aria-selected", x === t));
    document
      .querySelectorAll(".cpanel")
      .forEach((p) => p.classList.toggle("show", p.id === t.dataset.c));
  }),
);

// investors desk tabs
document.querySelectorAll(".itab").forEach((t) =>
  t.addEventListener("click", () => {
    document
      .querySelectorAll(".itab")
      .forEach((x) => x.setAttribute("aria-selected", x === t));
    document
      .querySelectorAll(".ipanel")
      .forEach((p) => p.classList.toggle("show", p.id === t.dataset.i));
  }),
);

// DOC LIBRARY: policies and code of conduct open inside this site
const DOC_REMOTE = false; // false: read PDFs from the local documents/ folder
const LIB = {
  fin: {
    title: "Financial",
    kicker: "Investors Desk",
    ext: true,
    groups: [
      {
        n: "Annual reports",
        d: [
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/ANNUAL_REPORT_%20SHANTI_GURU_01092026.pdf",
            "Annual Report 2025–26",
            "Latest",
          ],
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/ANNUAL-REPORT-SG-2025.pdf",
            "Annual Report 2024–25",
            "PDF",
          ],
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/annual-report-2024-SHANTI-GURU-INDUSTRIES.pdf",
            "Annual Report 2023–24",
            "PDF",
          ],
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/2-SHANTI-GURU-INDUSTRIES-LIMITED-Annual-Report-2223.pdf",
            "Annual Report 2022–23",
            "PDF",
          ],
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/ANNUAL-REPORT-2021-2022.pdf",
            "Annual Report 2021–22",
            "PDF",
          ],
          [
            "https://shantiguruindustries.com/pdf/annual_reports_pdf/RCL_RETAIL_BSE_2020_21.pdf",
            "Annual Report 2020–21",
            "PDF",
          ],
          [
            "https://shantiguruindustries.com/annual_reports",
            "All annual reports from 2010–11",
            "Company website",
          ],
        ],
      },
      {
        n: "Financial results",
        d: [
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/HALF_YEARLY_RESULTS_AS_AT_30.09.2026.pdf",
            "Half-year ended 30 September 2026",
            "Unaudited half-yearly results",
          ],
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/SGFINANCIALRESULTS2526FINAL.pdf",
            "Year ended 31 March 2026",
            "Second half-year and year-end results",
          ],
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/SG2-FIN-RESULTS-300935-2SD.pdf",
            "Half-year ended 30 September 2025",
            "Half-yearly financial results",
          ],
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/2ND-HALF-YEAR-YEAR-TO-DATE-RESULTS-ENDED-31.03.2025.pdf",
            "Year ended 31 March 2025",
            "Second half-year and year-to-date results",
          ],
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/2SGHYR30092024sd1mrpdf.pdf",
            "Half-year ended 30 September 2024",
            "Half-yearly financial results",
          ],
          [
            "https://shantiguruindustries.com/pdf/half_yearly_financial_results_pdf/SG-auditeed-financial-results-2023-24.pdf",
            "Financial year 2023–24",
            "Audited financial results",
          ],
        ],
      },
      {
        n: "Related party transactions and annual return",
        d: [
          [
            "https://shantiguruindustries.com/pdf/RELATED_PARTY_TRANS_pdf/RELATED_PARTY_TRANS_2ND-HY-31.03.2021.pdf",
            "Related party transactions",
            "Half-year ended 31 March 2021",
          ],
          [
            "https://shantiguruindustries.com/mgt7",
            "Annual return (Form MGT-7)",
            "Company website",
          ],
        ],
      },
    ],
  },
  coc: {
    title: "Code of Conduct",
    kicker: "Governance",
    remote: "https://shantiguruindustries.com/pdf/code_of_conduct_pdf/",
    local: "documents/code-of-conduct/",
    groups: [
      {
        n: "Code to Regulate, Monitor and Report Trading by Insiders",
        d: [
          [
            "COC2.pdf",
            "Code of Conduct to Regulate, Monitor and Report Trading by Insiders",
            "Document 1 of 2",
          ],
          [
            "COC1.pdf",
            "Code of Conduct to Regulate, Monitor and Report Trading by Insiders",
            "Document 2 of 2, dated 29 July 2021",
          ],
        ],
      },
    ],
  },
  policies: {
    title: "Policies",
    kicker: "Governance",
    remote: "https://shantiguruindustries.com/pdf/policies_pdf/",
    local: "documents/policies/",
    groups: [
      {
        n: "Corporate governance policies",
        d: [
          [
            "P2.pdf",
            "Archival Policy",
            "Retention of stock exchange disclosures",
          ],
          [
            "P3.pdf",
            "Code of Fair Disclosure of Unpublished Price Sensitive Information",
            "SEBI (Prohibition of Insider Trading) Regulations, 2015",
          ],
          [
            "P5.pdf",
            "Policy for Determining Material Subsidiaries",
            "Governance framework for subsidiaries",
          ],
          [
            "P6.pdf",
            "Nomination and Remuneration Policy",
            "Selection and remuneration of directors",
          ],
          [
            "P7.pdf",
            "Related Party Transactions Policy",
            "Approval and disclosure of related party transactions",
          ],
          [
            "P8.pdf",
            "Risk Management Policy",
            "Identification and mitigation of business risks",
          ],
          [
            "P9.pdf",
            "Whistle Blower Policy",
            "Vigil mechanism for reporting concerns",
          ],
          [
            "dividend-policy.pdf",
            "Dividend Policy",
            "Framework for dividend decisions",
          ],
          [
            "corporate-social-responsility-policy.pdf",
            "Corporate Social Responsibility Policy",
            "Approach to CSR activities",
          ],
          [
            "independent-directors-policy.pdf",
            "Independent Directors Policy",
            "Role and conduct of independent directors",
          ],
        ],
      },
      {
        n: "Committee charters and programmes",
        d: [
          ["P10.pdf", "Audit Committee", "Terms of reference and charter"],
          [
            "P11.pdf",
            "Stakeholders Relationship Committee",
            "Terms of reference and charter",
          ],
          [
            "P4.pdf",
            "Familiarisation Program for Independent Directors",
            "Induction and ongoing orientation",
          ],
          [
            "Independent-directors-time-spent.pdf",
            "Familiarisation programmes: time spent",
            "Time spent by independent directors",
          ],
        ],
      },
      {
        n: "Independent directors: appointment letters",
        d: [
          [
            "P1.pdf",
            "Appointment letter, Independent Director",
            "Board approval dated 3 September 2019",
          ],
          [
            "P12.pdf",
            "Appointment letter: Navratan Mal Lunkar",
            "Independent Director",
          ],
          [
            "P13.pdf",
            "Appointment letter: Sujathaa Metha",
            "Independent Director",
          ],
          [
            "madhu-suthan-apt-letter.pdf",
            "Appointment letter: Madhu Suthan",
            "Director",
          ],
        ],
      },
    ],
  },
};
(() => {
  const dlg = document.getElementById("lib"),
    body = document.getElementById("libB"),
    tt = document.getElementById("libT"),
    kk = document.getElementById("libK");
  if (!dlg) return;
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const url = (k, f) =>
    (DOC_REMOTE ? LIB[k].remote : LIB[k].local) + encodeURI(f);
  const show = () => {
    if (!dlg.open) dlg.showModal();
  };
  function list(k) {
    const L = LIB[k];
    kk.textContent = L.kicker;
    tt.textContent = L.title;
    body.innerHTML = L.groups
      .map(
        (g) =>
          '<h4 class="lib-g">' +
          esc(g.n) +
          '</h4><div class="doclist">' +
          g.d
            .map((d) =>
              L.ext
                ? '<a class="doc" href="' +
                  esc(d[0]) +
                  '" target="_blank" rel="noopener"><span class="di">PDF</span><span class="dt"><b>' +
                  esc(d[1]) +
                  "</b><small>" +
                  esc(d[2]) +
                  '</small></span><span class="go">Open &rarr;</span></a>'
                : '<button type="button" class="doc" data-doc="' +
                  k +
                  "|" +
                  esc(d[0]) +
                  '"><span class="di">PDF</span><span class="dt"><b>' +
                  esc(d[1]) +
                  "</b><small>" +
                  esc(d[2]) +
                  '</small></span><span class="go">Read &rarr;</span></button>',
            )
            .join("") +
          "</div>",
      )
      .join("");
    body.scrollTop = 0;
    show();
  }
  function view(k, f) {
    const L = LIB[k];
    let t = "";
    L.groups.forEach((g) =>
      g.d.forEach((d) => {
        if (d[0] === f)
          t = d[1] + (d[2] && k === "coc" ? " (" + d[2] + ")" : "");
      }),
    );
    kk.textContent = L.title;
    tt.textContent = t || f;
    const u = url(k, f);
    body.innerHTML =
      '<div class="lib-bar"><button type="button" class="lib-btn" data-back="' +
      k +
      '">&larr; All documents</button><a class="lib-btn" href="' +
      esc(u) +
      '" download>Download</a><a class="lib-btn" href="' +
      esc(u) +
      '" target="_blank" rel="noopener">Open in new tab</a></div><iframe class="lib-frame" title="' +
      esc(t || f) +
      '" src="' +
      esc(u) +
      '"></iframe>' +
      (DOC_REMOTE
        ? ""
        : '<p class="lib-hint">If the document does not load, make sure the documents folder sits next to index.html.</p>');
    show();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lib]");
    if (a) {
      list(a.dataset.lib);
      return;
    }
    const b = e.target.closest("[data-doc]");
    if (b) {
      const p = b.dataset.doc.split("|");
      view(p[0], p[1]);
      return;
    }
    const c = e.target.closest("[data-back]");
    if (c) {
      list(c.dataset.back);
      return;
    }
    if (e.target === dlg) dlg.close();
  });
  document.getElementById("libX").addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", () => {
    body.innerHTML = "";
  });
})();

// accordions: one open at a time per list
document.querySelectorAll(".acc-b").forEach((b) =>
  b.addEventListener("click", () => {
    const a = b.closest(".acc"),
      open = !a.classList.contains("open"),
      scope = a.closest("[data-acc-scope]");
    if (open && scope)
      scope.querySelectorAll(".acc.open").forEach((x) => {
        if (x !== a) {
          x.classList.remove("open");
          x.querySelector(".acc-b").setAttribute("aria-expanded", "false");
        }
      });
    a.classList.toggle("open", open);
    b.setAttribute("aria-expanded", open);
  }),
);

// products: spotlight showcase (scroll-driven on desktop, hover/click elsewhere)
(() => {
  const rows = [...document.querySelectorAll(".sh-row")];
  if (!rows.length) return;
  const track = document.querySelector(".sh-track"),
    sh = document.querySelector(".sh"),
    prog = document.querySelector(".sh-prog i");
  const pinQ = matchMedia(
    "(min-width:961px) and (min-height:680px), (max-width:960px) and (min-height:480px)",
  );
  const hover = matchMedia("(hover:hover)").matches;
  let cur = 0;
  function pick(r, focus) {
    cur = rows.indexOf(r);
    rows.forEach((x) => {
      const on = x === r;
      x.setAttribute("aria-selected", on);
      x.tabIndex = on ? 0 : -1;
      document
        .getElementById(x.getAttribute("aria-controls"))
        .classList.toggle("on", on);
    });
    if (focus) r.focus({ preventScroll: true });
  }
  const metrics = () => {
    const top = track.getBoundingClientRect().top + scrollY,
      sticky = parseFloat(getComputedStyle(sh).top) || 0,
      span = track.offsetHeight - sh.offsetHeight;
    return { top, sticky, span };
  };
  function onScroll() {
    if (!pinQ.matches) return;
    const m = metrics(),
      p = Math.min(1, Math.max(0, (scrollY + m.sticky - m.top) / m.span));
    if (prog) sh.style.setProperty("--pp", p.toFixed(3));
    if (prog) prog.parentElement.style.setProperty("--pp", p.toFixed(3));
    const i = Math.min(rows.length - 1, Math.floor(p * rows.length));
    if (i !== cur) pick(rows[i]);
  }
  let tk = false;
  const req = () => {
    if (!tk) {
      tk = true;
      requestAnimationFrame(() => {
        tk = false;
        onScroll();
      });
    }
  };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  function goto(i) {
    const m = metrics(),
      seg = m.span / rows.length;
    scrollTo({ top: m.top - m.sticky + seg * i + seg / 2, behavior: "smooth" });
  }
  rows.forEach((r, i) => {
    r.addEventListener("click", () => {
      if (pinQ.matches) {
        goto(i);
        return;
      }
      pick(r);
      if (innerWidth <= 960) {
        const st = document.querySelector(".sh-stage");
        const b = st.getBoundingClientRect();
        if (b.top < 70 || b.bottom > innerHeight)
          st.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    if (hover)
      r.addEventListener("mouseenter", () => {
        if (!pinQ.matches && innerWidth > 960) pick(r);
      });
    r.addEventListener("focus", () => {
      if (!pinQ.matches) pick(r);
    });
    r.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k !== "ArrowDown" && k !== "ArrowUp") return;
      e.preventDefault();
      const n = (i + (k === "ArrowDown" ? 1 : rows.length - 1)) % rows.length;
      if (pinQ.matches) {
        goto(n);
        rows[n].focus({ preventScroll: true });
      } else pick(rows[n], true);
    });
  });
  onScroll();
})();
