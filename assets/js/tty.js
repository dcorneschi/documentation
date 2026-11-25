/* tty theme: palette switcher, code tools, table of contents, sidebar,
   search palette (Pagefind) and the home-page terminal. No dependencies. */
(function () {
  "use strict";

  var cfg = window.TTY || { baseurl: "", palettes: ["phosphor"] };
  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- palettes ---------- */
  function setPalette(name, save) {
    if (cfg.palettes.indexOf(name) < 0) return false;
    root.setAttribute("data-palette", name);
    var sel = $("#palette-select");
    if (sel) sel.value = name;
    if (save !== false) store.set("tty-palette", name);
    return true;
  }
  var paletteSelect = $("#palette-select");
  if (paletteSelect) {
    paletteSelect.value = root.getAttribute("data-palette");
    paletteSelect.addEventListener("change", function () { setPalette(paletteSelect.value); });
  }

  /* ---------- article: tables, code blocks, heading links ---------- */
  var prose = $(".prose");
  if (prose) {
    $$("table", prose).forEach(function (t) {
      var wrap = document.createElement("div");
      wrap.className = "table-wrap";
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });

    $$("pre", prose).forEach(function (pre) {
      var box = pre.closest("div.highlighter-rouge") || pre;
      var m = /language-([\w+-]+)/.exec(box.className);
      var tools = document.createElement("div");
      tools.className = "code-tools";
      if (m && m[1] !== "plaintext" && m[1] !== "text") {
        tools.innerHTML = '<span class="code-lang">' + esc(m[1]) + "</span>";
      }
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.addEventListener("click", function () {
        var text = (pre.querySelector("code") || pre).innerText.replace(/\n$/, "");
        var done = function () {
          btn.textContent = "copied";
          btn.classList.add("done");
          setTimeout(function () { btn.textContent = "copy"; btn.classList.remove("done"); }, 1400);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      });
      tools.appendChild(btn);
      box.appendChild(tools);
    });

    $$("h2[id], h3[id]", prose).forEach(function (h) {
      var a = document.createElement("a");
      a.className = "anchor";
      a.href = "#" + h.id;
      a.setAttribute("aria-label", "Link to this section");
      a.textContent = "¶";
      h.appendChild(a);
    });
  }

  /* ---------- sidebar: mobile toggle, filter, keep current item in view ---------- */
  var toggle = $(".nav-toggle");
  if (toggle) {
    if (!$("#sidebar")) toggle.hidden = true;
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var filter = $("#nav-filter");
  if (filter) {
    var cats = $$(".nav-cat");
    var wasOpen = cats.map(function (d) { return d.open; });
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      cats.forEach(function (d, i) {
        var hits = 0;
        $$("li", d).forEach(function (li) {
          var show = !q || li.textContent.toLowerCase().indexOf(q) >= 0;
          li.hidden = !show;
          if (show) hits++;
        });
        d.hidden = q && !hits;
        d.open = q ? hits > 0 : wasOpen[i];
      });
    });
  }
  // /#<category> (article tags, the home page's latest list): open that category in the sidebar.
  function openCategory(id, fromLoad) {
    var d = id && document.getElementById(id);
    if (!d || !d.classList.contains("nav-cat")) return false;
    d.open = true;
    if (toggle && getComputedStyle(toggle).display !== "none") {
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    var inner = d.closest(".sidebar-inner");
    inner.scrollTop = d.offsetTop - inner.offsetTop - 8;
    d.querySelector("summary").focus({ preventScroll: true });
    if (fromLoad) window.scrollTo(0, 0); // the browser scrolled the page to the target
    return true;
  }
  if (location.hash) openCategory(decodeURIComponent(location.hash.slice(1)), true);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && openCategory(decodeURIComponent(a.getAttribute("href").slice(1)))) {
      e.preventDefault();
      history.replaceState(null, "", a.getAttribute("href"));
    }
  });

  var cur = $('.sidebar a[aria-current="page"]');
  if (cur) {
    var inner = cur.closest(".sidebar-inner");
    inner.scrollTop = cur.offsetTop - inner.clientHeight / 3;
  }

  /* ---------- search palette (Pagefind) ---------- */
  var search = $("#search"), input = $("#search-input"), results = $("#search-results");
  var pagefind = null, lastFocus = null, sel = -1, seq = 0;

  function loadPagefind() {
    if (pagefind) return Promise.resolve(pagefind);
    return import(cfg.baseurl + "/pagefind/pagefind.js").then(function (pf) {
      return pf.options({ baseUrl: cfg.baseurl + "/" }).then(function () { pagefind = pf; return pf; });
    });
  }
  function openSearch(q) {
    lastFocus = document.activeElement;
    search.hidden = false;
    document.body.style.overflow = "hidden";
    if (typeof q === "string") input.value = q;
    input.focus();
    input.select();
    runSearch();
  }
  function closeSearch() {
    search.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function select(i) {
    var items = $$("li[data-url]", results);
    if (!items.length) return;
    sel = (i + items.length) % items.length;
    items.forEach(function (li, j) { li.classList.toggle("sel", j === sel); });
    items[sel].scrollIntoView({ block: "nearest" });
  }
  function runSearch() {
    var q = input.value.trim();
    var my = ++seq;
    sel = -1;
    if (!q) { results.innerHTML = '<li class="r-note">type to search every article</li>'; return; }
    loadPagefind().then(function (pf) {
      return pf.debouncedSearch(q, {}, 150);
    }).then(function (res) {
      if (my !== seq || !res) return;
      if (!res.results.length) { results.innerHTML = '<li class="r-note">grep: no matches</li>'; return; }
      return Promise.all(res.results.slice(0, 12).map(function (r) { return r.data(); })).then(function (data) {
        if (my !== seq) return;
        results.innerHTML = data.map(function (d) {
          var path = d.url.replace(cfg.baseurl, "").replace(/\/$/, "") || "/";
          return '<li data-url="' + esc(d.url) + '"><a href="' + esc(d.url) + '">' +
            '<span class="r-title">' + esc(d.meta.title || path) + '</span><span class="r-url">' + esc(path) + "</span>" +
            '<span class="r-ex">' + d.excerpt + "</span></a></li>";   /* excerpt is Pagefind-escaped HTML with <mark> */
        }).join("");
        select(0);
      });
    }).catch(function () {
      if (my === seq) results.innerHTML = '<li class="r-note">search index not available (it is built in CI with Pagefind)</li>';
    });
  }
  if (search) {
    $$(".search-open").forEach(function (b) { b.addEventListener("click", function () { openSearch(); }); });
    $(".search-close").addEventListener("click", closeSearch);
    search.addEventListener("click", function (e) { if (e.target === search) closeSearch(); });
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
      else if (e.key === "Enter") {
        var li = $$("li[data-url]", results)[sel];
        if (li) location.href = li.getAttribute("data-url");
      }
    });
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) || e.target.isContentEditable;
      if (e.key === "Escape" && !search.hidden) { closeSearch(); return; }
      if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  /* ---------- home terminal ---------- */
  var termForm = $("#term-form");
  if (termForm) initTerminal();

  function initTerminal() {
    var out = $("#term-out"), tin = $("#term-input"), body = $("#term");
    var nav = JSON.parse($("#nav-data").textContent);
    var cwd = null;           // category id or null for ~
    var lastList = [];        // pages from the last listing, for "open <n>"
    var hist = [], hpos = 0;
    var promptLabel = $(".term-line .prompt .dim:last-child");
    var url = function (p) { return cfg.baseurl + p.url; };
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    function print(html, cls) {
      var p = document.createElement("p");
      if (cls) p.className = cls;
      p.innerHTML = html;
      out.appendChild(p);
      body.scrollTop = body.scrollHeight;
      return p;
    }
    function echo(cmd) {
      print('<span class="brand-user">' + esc($(".term-line .brand-user").textContent) + '</span><span class="dim">@</span>' +
        '<span class="brand-host">devops</span><span class="dim">:~' + (cwd ? "/" + esc(cwd) : "") + "$</span> " + esc(cmd));
    }
    function setCwd(c) {
      cwd = c;
      promptLabel.textContent = ":~" + (c ? "/" + c : "") + "$";
    }
    function findCat(arg) {
      arg = (arg || "").toLowerCase().replace(/\/$/, "").replace(/^~\//, "");
      return nav.filter(function (c) { return c.id === arg || c.id.indexOf(arg) === 0; })[0];
    }
    function listCat(c) {
      lastList = c.pages;
      print(c.pages.map(function (p, i) {
        return '<span class="dim">' + String(i + 1).padStart(2, " ") + "</span>  " +
          '<a href="' + esc(url(p)) + '">' + esc(p.slug) + "</a>";
      }).join("\n"));
      print('<span class="dim">open &lt;n&gt; to read one</span>');
    }
    function allPages() { return nav.reduce(function (a, c) { return a.concat(c.pages); }, []); }

    var cmds = {
      help: function () {
        print([
          "<b>commands</b>",
          "  ls [category]     list categories, or the articles in one",
          "  cd &lt;category&gt;     enter a category (cd .. to go back)",
          "  open &lt;n|name&gt;     read an article (number from the last ls)",
          "  grep &lt;words&gt;      full-text search across every article",
          "  theme [name]      list or switch color themes",
          "  whoami · date · history · clear"
        ].join("\n"));
      },
      ls: function (arg) {
        var c = arg ? findCat(arg) : (cwd && findCat(cwd));
        if (arg && !c) return print("ls: cannot access '" + esc(arg) + "': No such file or directory", "err");
        if (c) return listCat(c);
        print('<span class="cols">' + nav.map(function (c) {
          return '<span><a href="#' + esc(c.id) + '" data-cd="' + esc(c.id) + '">' + esc(c.id) + '/</a> <span class="dim">' + c.pages.length + "</span></span>";
        }).join("") + "</span>");
      },
      cd: function (arg) {
        if (!arg || arg === "~" || arg === ".." || arg === "/") return setCwd(null);
        var c = findCat(arg);
        if (!c) return print("cd: " + esc(arg) + ": No such file or directory", "err");
        setCwd(c.id);
        listCat(c);
      },
      open: function (arg) {
        if (!arg) return print("usage: open &lt;n|name&gt;", "err");
        var p = null;
        if (/^\d+$/.test(arg)) p = lastList[parseInt(arg, 10) - 1];
        if (!p) {
          var q = arg.toLowerCase();
          var pool = cwd ? findCat(cwd).pages : allPages();
          p = pool.filter(function (x) { return x.slug === q; })[0] ||
              pool.filter(function (x) { return (x.slug + " " + x.title).toLowerCase().indexOf(q) >= 0; })[0];
        }
        if (!p) return print("open: " + esc(arg) + ": not found (try ls, or grep " + esc(arg) + ")", "err");
        print('<span class="ok">opening</span> ' + esc(p.title) + " …");
        setTimeout(function () { location.href = url(p); }, reduce ? 0 : 250);
      },
      grep: function (arg) {
        if (!arg) return print("usage: grep &lt;words&gt;", "err");
        if (search) openSearch(arg);
      },
      theme: function (arg) {
        if (!arg) {
          var curP = root.getAttribute("data-palette");
          return print(cfg.palettes.map(function (p) {
            return (p === curP ? '<span class="ok">* ' : "  ") + esc(p) + (p === curP ? "</span>" : "");
          }).join("\n"));
        }
        if (!setPalette(arg.toLowerCase())) print("theme: unknown theme '" + esc(arg) + "' (try: " + cfg.palettes.join(", ") + ")", "err");
        else print('<span class="ok">theme set to ' + esc(arg.toLowerCase()) + "</span>");
      },
      whoami: function () { print("a curious engineer, reading notes from someone who broke it first"); },
      date: function () { print(esc(new Date().toString())); },
      history: function () { print(hist.map(function (h, i) { return String(i + 1).padStart(4, " ") + "  " + esc(h); }).join("\n") || ""); },
      clear: function () { out.innerHTML = ""; }
    };
    cmds.cat = cmds.open; cmds.less = cmds.open; cmds.search = cmds.grep;
    cmds.ll = cmds.ls; cmds.dir = cmds.ls; cmds.man = cmds.help; cmds["?"] = cmds.help;

    function run(line, silent) {
      line = line.trim();
      if (!silent) echo(line);
      if (!line) return;
      var parts = line.split(/\s+/), name = parts.shift().toLowerCase(), arg = parts.join(" ");
      if (name === "sudo") return print("nice try. this incident will be reported.", "err");
      var fn = cmds[name];
      if (!fn) return print(esc(name) + ": command not found (type help)", "err");
      fn(arg);
    }

    termForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = tin.value;
      if (v.trim()) { hist.push(v.trim()); hpos = hist.length; }
      tin.value = "";
      run(v);
    });
    tin.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" && hist.length) { e.preventDefault(); hpos = Math.max(0, hpos - 1); tin.value = hist[hpos]; }
      else if (e.key === "ArrowDown" && hist.length) { e.preventDefault(); hpos = Math.min(hist.length, hpos + 1); tin.value = hist[hpos] || ""; }
      else if (e.key === "Tab") {
        e.preventDefault();
        var parts = tin.value.split(/\s+/);
        var last = (parts[parts.length - 1] || "").toLowerCase();
        var pool = parts.length === 1 ? Object.keys(cmds)
          : (parts[0] === "theme" ? cfg.palettes
            : (/^(open|cat|less)$/.test(parts[0]) ? (cwd ? findCat(cwd).pages : allPages()).map(function (p) { return p.slug; })
              : nav.map(function (c) { return c.id; })));
        var hits = pool.filter(function (x) { return x.indexOf(last) === 0; });
        if (hits.length === 1) { parts[parts.length - 1] = hits[0]; tin.value = parts.join(" ") + " "; }
        else if (hits.length > 1) { echo(tin.value); print(hits.map(esc).join("  ")); }
      } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); cmds.clear(); }
    });
    out.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-cd]");
      if (a) { e.preventDefault(); echo("cd " + a.getAttribute("data-cd")); cmds.cd(a.getAttribute("data-cd")); tin.focus(); }
    });
    body.addEventListener("click", function (e) {
      if (!e.target.closest("a") && !window.getSelection().toString()) tin.focus({ preventScroll: true });
    });

    /* boot sequence: type a couple of commands, then hand over */
    var boot = ["cat motd", "ls"];
    var motd = function () {
      print("Welcome to the <b>DevOps Wiki</b> — " + allPages().length + " articles in " + nav.length + " categories.");
      print('<span class="dim">Commands and outputs come from real runs. Type </span>help<span class="dim"> to start.</span>');
    };
    if (reduce) { echo(boot[0]); motd(); run(boot[1]); return; }
    var i = 0;
    (function typeNext() {
      if (i >= boot.length) return;
      var cmd = boot[i++], k = 0;
      tin.value = "";
      var t = setInterval(function () {
        tin.value = cmd.slice(0, ++k);
        if (k >= cmd.length) {
          clearInterval(t);
          setTimeout(function () {
            tin.value = "";
            echo(cmd);
            if (cmd === "cat motd") motd(); else run(cmd, true);
            setTimeout(typeNext, 350);
          }, 220);
        }
      }, 55);
    })();
  }
})();
