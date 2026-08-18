/* ------------------------------------------------------------------
   Motor de los widgets de práctica.

   JS plano, sin dependencias ni build. Cada widget es un
   <div class="pract" data-tipo="..." data-datos="ID"> acompañado de un
   <script type="application/json" id="ID"> con sus datos, que emite
   scripts/gen_practica.py. Los datos van embebidos en la página a
   propósito: sin fetch no hay rutas relativas que romper ni CORS, y
   funciona con la pestaña sin señal.

   El progreso vive en localStorage. Es por dispositivo: no sincroniza.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var CLAVE = "ac.practica.";
  var DUR_FINAL = 3 * 60 * 60 * 1000; // 3 horas reloj, como el final real

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function leer(clave, porDefecto) {
    try {
      var v = localStorage.getItem(CLAVE + clave);
      return v ? JSON.parse(v) : porDefecto;
    } catch (e) {
      return porDefecto;
    }
  }

  function guardar(clave, valor) {
    try {
      localStorage.setItem(CLAVE + clave, JSON.stringify(valor));
    } catch (e) {
      /* modo privado o cuota llena: se sigue sin persistir */
    }
  }

  function borrar(clave) {
    try {
      localStorage.removeItem(CLAVE + clave);
    } catch (e) {}
  }

  /** Baraja in-place (Fisher-Yates). */
  function barajar(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function hhmmss(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var seg = s % 60;
    return (
      String(h).padStart(2, "0") + ":" +
      String(m).padStart(2, "0") + ":" +
      String(seg).padStart(2, "0")
    );
  }

  function letra(i) {
    return String.fromCharCode(97 + i); // a, b, c…
  }

  function fuenteAlPie(texto) {
    var s = el("small", "pract-fuente");
    s.innerHTML = "Fuente: <code>" + texto + "</code>";
    return s;
  }

  /**
   * Tema pedido por la URL (?tema=memoria-cache).
   *
   * Permite que cada ficha cierre con un enlace de repaso que abre la práctica
   * ya filtrada, sin que haya que buscar el tema en el desplegable.
   */
  function temaDeLaUrl() {
    try {
      var t = new URLSearchParams(window.location.search).get("tema");
      return t || "*";
    } catch (e) {
      return "*";
    }
  }

  // ---------------------------------------------------------------
  // Bloque de rúbrica reutilizable (simulacro y fichas)
  // ---------------------------------------------------------------

  /**
   * Checklist de "lo que el profe espera que aparezca".
   * onCambio recibe (marcadas, total) cada vez que se tilda algo.
   */
  function rubrica(rub, claveEstado, onCambio) {
    var caja = el("div", "pract-rubrica");
    var tit = el("p", "pract-rubrica__tit");
    tit.textContent = "Tiene que aparecer — " + rub.titulo;
    caja.appendChild(tit);

    if (rub.extension) {
      var ext = el("p", "pract-meta", "Largo esperado: " + rub.extension);
      caja.appendChild(ext);
    }

    var estado = claveEstado ? leer(claveEstado, {}) : {};
    var total = rub.claves.length;

    function contar() {
      var n = 0;
      for (var i = 0; i < total; i++) if (estado[rub.id + "." + i]) n++;
      return n;
    }

    var marcador = el("p", "pract-puntaje");

    function refrescar() {
      var n = contar();
      marcador.textContent = "Cubriste " + n + " de " + total + " puntos clave.";
      if (onCambio) onCambio(n, total);
    }

    rub.claves.forEach(function (txt, i) {
      var k = rub.id + "." + i;
      var lab = el("label", "pract-clave");
      var chk = el("input");
      chk.type = "checkbox";
      chk.checked = !!estado[k];
      if (chk.checked) lab.classList.add("pract-clave--ok");

      chk.addEventListener("change", function () {
        estado[k] = chk.checked;
        lab.classList.toggle("pract-clave--ok", chk.checked);
        if (claveEstado) guardar(claveEstado, estado);
        refrescar();
      });

      lab.appendChild(chk);
      lab.appendChild(el("span", null, txt));
      caja.appendChild(lab);
    });

    caja.appendChild(marcador);
    if (rub.fuente) caja.appendChild(fuenteAlPie(rub.fuente));
    refrescar();
    return caja;
  }

  // ---------------------------------------------------------------
  // 1) Simulacro cronometrado
  // ---------------------------------------------------------------

  function montarSimulacro(raiz, datos) {
    var sims = datos.simulacros;
    var rubricas = datos.rubricas; // { tema: [rub, …] }
    var estadoClave = "sim";
    var st = leer(estadoClave, null);
    var timerId = null;

    function pintar() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      raiz.textContent = "";
      if (!st || !st.simId) pintarSelector();
      else pintarExamen();
    }

    // --- Pantalla de selección ---
    function pintarSelector() {
      var barra = el("div", "pract-barra");
      var sel = el("select");
      sims.forEach(function (s, i) {
        var o = el("option", null, s.nombre + (s.fecha ? " — " + s.fecha : ""));
        o.value = String(i);
        sel.appendChild(o);
      });
      var btn = el("button", "pract-btn", "Empezar las 3 horas");
      btn.addEventListener("click", function () {
        st = {
          simId: sims[Number(sel.value)].id,
          inicio: Date.now(),
          respuestas: {},
          entregado: false
        };
        guardar(estadoClave, st);
        pintar();
        window.scrollTo({ top: raiz.offsetTop - 60, behavior: "smooth" });
      });
      barra.appendChild(sel);
      barra.appendChild(btn);
      raiz.appendChild(barra);

      var aviso = el("div", "pract-aviso");
      aviso.innerHTML =
        "El reloj arranca al apretar el botón y <strong>sigue corriendo aunque " +
        "cierres la pestaña</strong>. Lo que escribas se guarda solo en este " +
        "dispositivo. No hay corrección automática: al entregar aparece la " +
        "rúbrica para que te corrijas vos.";
      raiz.appendChild(aviso);
    }

    // --- Pantalla de examen ---
    function pintarExamen() {
      var sim = sims.filter(function (s) { return s.id === st.simId; })[0];
      if (!sim) { borrar(estadoClave); st = null; return pintar(); }

      // Reloj pegajoso
      var reloj = el("div", "pract-reloj");
      var t = el("span", "pract-reloj__t");
      var acciones = el("span");
      var btnEntregar = el("button", "pract-btn", "Entregar");
      var btnSalir = el("button", "pract-btn pract-btn--sec", "Descartar");
      acciones.appendChild(btnEntregar);
      acciones.appendChild(btnSalir);
      reloj.appendChild(t);
      reloj.appendChild(acciones);
      raiz.appendChild(reloj);

      function tick() {
        var resta = st.inicio + DUR_FINAL - Date.now();
        t.textContent = hhmmss(resta);
        reloj.classList.toggle("pract-reloj--poco", resta < 30 * 60 * 1000);
        reloj.classList.toggle("pract-reloj--fin", resta <= 0);
        if (resta <= 0 && !st.entregado) entregar(true);
      }

      if (st.entregado) {
        t.textContent = "Entregado";
        btnEntregar.remove();
        btnSalir.textContent = "Empezar otro";
      } else {
        tick();
        timerId = setInterval(tick, 1000);
      }

      var h = el("h3", null, sim.nombre + (sim.fecha ? " — " + sim.fecha : ""));
      raiz.appendChild(h);
      if (sim.nota) {
        var n = el("p", "pract-meta", sim.nota);
        raiz.appendChild(n);
      }

      sim.puntos.forEach(function (p) {
        var bloque = el("div", "pract-punto");
        bloque.appendChild(
          el("div", "pract-punto__tit", "Punto " + p.numero + (p.titulo ? " — " + p.titulo : ""))
        );

        p.incisos.forEach(function (inc, j) {
          var k = sim.id + "." + p.numero + "." + (inc.letra || j);
          var card = el("div", "pract-card");

          var enc = el("p", "pract-enunciado");
          enc.textContent = (inc.letra ? inc.letra + ") " : "") + inc.enunciado;
          card.appendChild(enc);
          card.appendChild(el("span", "pract-tema", inc.tema_nombre || inc.tema));

          if (!st.entregado) {
            var ta = el("textarea", "pract-resp");
            ta.placeholder = "Escribí acá tu respuesta…";
            ta.value = st.respuestas[k] || "";
            ta.addEventListener("input", function () {
              st.respuestas[k] = ta.value;
              guardar(estadoClave, st);
            });
            card.appendChild(ta);
          } else {
            // Al entregar: se muestra lo escrito y debajo la rúbrica
            var esc = el("div", "pract-rubrica");
            esc.appendChild(el("p", "pract-rubrica__tit", "Lo que escribiste"));
            var pre = el("p", "pract-enunciado", st.respuestas[k] || "(en blanco)");
            pre.style.whiteSpace = "pre-wrap";
            esc.appendChild(pre);
            card.appendChild(esc);

            // La del inciso concreto si el generador la pudo cruzar; si no,
            // todas las del tema, que es ruidoso pero mejor que nada.
            var propias = inc.rubricas && inc.rubricas.length;
            var rubs = propias ? inc.rubricas : (rubricas[inc.tema] || []);

            if (!rubs.length) {
              var sin = el("div", "pract-aviso");
              sin.textContent =
                "Todavía no hay rúbrica cargada para " + (inc.tema_nombre || inc.tema) +
                ". Corregite contra la ficha del tema.";
              card.appendChild(sin);
            } else {
              if (!propias) {
                card.appendChild(
                  el("p", "pract-meta",
                     "Sin rúbrica exacta para este enunciado: van todas las de " +
                     (inc.tema_nombre || inc.tema) + ". Usá la que corresponda.")
                );
              }
              rubs.forEach(function (r) {
                card.appendChild(rubrica(r, "rub." + sim.id, null));
              });
            }
          }

          bloque.appendChild(card);
        });

        raiz.appendChild(bloque);
      });

      function entregar(porTiempo) {
        st.entregado = true;
        guardar(estadoClave, st);
        pintar();
        if (porTiempo) {
          window.alert(
            "Se terminaron las 3 horas. En el final real acá te levantan la hoja: " +
            "corregí lo que llegaste a escribir, no lo que ibas a escribir."
          );
        }
      }

      btnEntregar.addEventListener("click", function () {
        if (window.confirm("¿Entregar? No se puede volver a editar.")) entregar(false);
      });

      btnSalir.addEventListener("click", function () {
        var msg = st.entregado
          ? "¿Empezar otro simulacro? Se borra este."
          : "¿Descartar este simulacro? Se pierde lo escrito.";
        if (window.confirm(msg)) {
          borrar(estadoClave);
          st = null;
          pintar();
        }
      });
    }

    pintar();
  }

  // ---------------------------------------------------------------
  // 2) Fichas de recuperación activa
  // ---------------------------------------------------------------

  function montarFichas(raiz, datos) {
    var todas = datos.fichas;
    var estadoClave = "fichas";
    var cajones = leer(estadoClave, {}); // qid -> 0 (no) | 1 (a medias) | 2 (sabía)
    var temaActual = temaDeLaUrl();
    var mazo = [];
    var pos = 0;

    var barra = el("div", "pract-barra");
    var sel = el("select");
    var opTodos = el("option", null, "Todos los temas");
    opTodos.value = "*";
    sel.appendChild(opTodos);
    datos.temas.forEach(function (t) {
      var o = el("option", null, t.nombre);
      o.value = t.slug;
      if (t.slug === temaActual) o.selected = true;
      sel.appendChild(o);
    });
    var btnReset = el("button", "pract-btn pract-btn--sec", "Reiniciar progreso");
    barra.appendChild(sel);
    barra.appendChild(btnReset);
    raiz.appendChild(barra);

    var prog = el("div", "pract-prog");
    var progB = el("div", "pract-prog__b");
    prog.appendChild(progB);
    raiz.appendChild(prog);

    var contador = el("p", "pract-meta");
    raiz.appendChild(contador);

    var zona = el("div");
    raiz.appendChild(zona);

    /**
     * Arma el mazo: primero lo que no salió, después lo dudoso, al final
     * lo sabido. Repetición espaciada de pobre, pero suficiente para
     * dos semanas.
     */
    function armarMazo() {
      var f = todas.filter(function (x) {
        return temaActual === "*" || x.tema === temaActual;
      });
      var g = [[], [], []];
      f.forEach(function (x) { g[cajones[x.id] || 0].push(x); });
      mazo = barajar(g[0]).concat(barajar(g[1]), barajar(g[2]));
      pos = 0;
    }

    function refrescarProgreso() {
      var f = todas.filter(function (x) {
        return temaActual === "*" || x.tema === temaActual;
      });
      var sabidas = f.filter(function (x) { return cajones[x.id] === 2; }).length;
      var pct = f.length ? (100 * sabidas) / f.length : 0;
      progB.style.width = pct.toFixed(1) + "%";
      contador.textContent =
        sabidas + " de " + f.length + " fichas marcadas como sabidas · " +
        "ficha " + Math.min(pos + 1, mazo.length) + " de " + mazo.length;
    }

    function pintar() {
      zona.textContent = "";
      refrescarProgreso();

      if (!mazo.length) {
        zona.appendChild(el("div", "pract-aviso", "No hay fichas para este tema."));
        return;
      }

      if (pos >= mazo.length) {
        var fin = el("div", "pract-veredicto pract-veredicto--ok");
        fin.textContent =
          "Terminaste la vuelta. Volvé a empezar: las que marcaste como flojas " +
          "salen primero.";
        zona.appendChild(fin);
        var otra = el("button", "pract-btn", "Otra vuelta");
        otra.addEventListener("click", function () { armarMazo(); pintar(); });
        zona.appendChild(otra);
        return;
      }

      var f = mazo[pos];
      var card = el("div", "pract-card pract-ficha");
      card.appendChild(el("span", "pract-tema", f.tema_nombre));
      var enc = el("p", "pract-enunciado", f.enunciado);
      card.appendChild(enc);

      var meta = el("p", "pract-meta");
      meta.textContent =
        (f.fechas && f.fechas.length ? "Tomada en: " + f.fechas.join(", ") : "Sin fecha registrada") +
        (f.variantes ? " · " + f.variantes + " variante(s) de redacción" : "");
      card.appendChild(meta);

      var btnVer = el("button", "pract-btn", "Ver qué tiene que aparecer");
      card.appendChild(btnVer);

      btnVer.addEventListener("click", function () {
        btnVer.remove();
        var dorso = el("div", "pract-ficha__dorso");
        if (f.rubricas && f.rubricas.length) {
          f.rubricas.forEach(function (r) {
            dorso.appendChild(rubrica(r, null, null));
          });
        } else {
          var s = el("div", "pract-aviso");
          s.innerHTML =
            "Sin rúbrica cargada todavía. Corregite contra la " +
            '<a href="' + datos.base + "temas/" + f.tema + '/">ficha de ' +
            f.tema_nombre + "</a>.";
          dorso.appendChild(s);
        }

        var eval_ = el("div", "pract-autoeval");
        [
          ["No me salió", 0, "pract-btn pract-btn--peligro"],
          ["A medias", 1, "pract-btn pract-btn--sec"],
          ["La sabía", 2, "pract-btn"]
        ].forEach(function (op) {
          var b = el("button", op[2], op[0]);
          b.addEventListener("click", function () {
            cajones[f.id] = op[1];
            guardar(estadoClave, cajones);
            pos++;
            pintar();
          });
          eval_.appendChild(b);
        });
        dorso.appendChild(eval_);
        card.appendChild(dorso);
      });

      zona.appendChild(card);
    }

    sel.addEventListener("change", function () {
      temaActual = sel.value;
      armarMazo();
      pintar();
    });

    btnReset.addEventListener("click", function () {
      if (window.confirm("¿Borrar el progreso de todas las fichas?")) {
        cajones = {};
        guardar(estadoClave, cajones);
        armarMazo();
        pintar();
      }
    });

    armarMazo();
    pintar();
  }

  // ---------------------------------------------------------------
  // 3) Opción múltiple  ·  4) Detectá la afirmación falsa
  // ---------------------------------------------------------------

  /**
   * Ambos formatos son el mismo widget: una consigna, N opciones, una o
   * varias correctas, y una explicación por opción. Cambia sólo la
   * consigna y de dónde salen las opciones.
   */
  function montarOpciones(raiz, datos) {
    var items = datos.items;
    var temaActual = temaDeLaUrl();
    var vivos = [];
    var pos = 0;
    var aciertos = 0;
    var respondidas = 0;

    var barra = el("div", "pract-barra");
    var sel = el("select");
    var opTodos = el("option", null, "Todos los temas");
    opTodos.value = "*";
    sel.appendChild(opTodos);
    datos.temas.forEach(function (t) {
      var o = el("option", null, t.nombre);
      o.value = t.slug;
      if (t.slug === temaActual) o.selected = true;
      sel.appendChild(o);
    });
    barra.appendChild(sel);
    raiz.appendChild(barra);

    var marcador = el("p", "pract-meta");
    raiz.appendChild(marcador);

    var zona = el("div");
    raiz.appendChild(zona);

    function armar() {
      vivos = barajar(
        items.filter(function (x) {
          return temaActual === "*" || x.tema === temaActual;
        }).slice()
      );
      pos = 0;
      aciertos = 0;
      respondidas = 0;
    }

    function refrescarMarcador() {
      marcador.textContent = vivos.length
        ? "Pregunta " + Math.min(pos + 1, vivos.length) + " de " + vivos.length +
          " · " + aciertos + "/" + respondidas + " bien"
        : "";
    }

    function pintar() {
      zona.textContent = "";
      refrescarMarcador();

      if (!vivos.length) {
        zona.appendChild(el("div", "pract-aviso", "No hay preguntas para este tema."));
        return;
      }

      if (pos >= vivos.length) {
        var pct = respondidas ? Math.round((100 * aciertos) / respondidas) : 0;
        var clase = pct >= 80 ? "ok" : pct >= 55 ? "medio" : "mal";
        var v = el("div", "pract-veredicto pract-veredicto--" + clase);
        v.textContent =
          "Terminaste: " + aciertos + " de " + respondidas + " (" + pct + "%). " +
          (pct >= 80
            ? "Sólido. Pasá a escribir la respuesta larga."
            : pct >= 55
            ? "Va, pero repasá las que fallaste en la ficha del tema."
            : "Volvé a la ficha antes de seguir: esto no se arregla repitiendo el quiz.");
        zona.appendChild(v);
        var otra = el("button", "pract-btn", "Otra vuelta");
        otra.addEventListener("click", function () { armar(); pintar(); });
        zona.appendChild(otra);
        return;
      }

      var it = vivos[pos];
      var card = el("div", "pract-card");
      card.appendChild(el("span", "pract-tema", it.tema_nombre));
      card.appendChild(el("p", "pract-enunciado", it.consigna));

      var multiple = it.correctas.length > 1;
      if (multiple) {
        card.appendChild(
          el("p", "pract-meta", "Hay más de una correcta: marcá todas y confirmá.")
        );
      }

      // El orden de las opciones se baraja, pero se recuerda cuál era cuál
      var orden = barajar(
        it.opciones.map(function (o, i) { return i; })
      );
      var elegidas = {};
      var revelado = false;
      var botones = [];

      function revelar() {
        revelado = true;
        var bien =
          it.correctas.length === Object.keys(elegidas).length &&
          it.correctas.every(function (i) { return elegidas[i]; });
        respondidas++;
        if (bien) aciertos++;

        botones.forEach(function (b) {
          var i = b.dataset.i;
          var esCorrecta = it.correctas.indexOf(Number(i)) >= 0;
          b.classList.add("pract-op--revelada");
          b.classList.remove("pract-op--sel");
          if (esCorrecta) b.classList.add("pract-op--ok");
          else if (elegidas[i]) b.classList.add("pract-op--mal");

          var exp = it.opciones[Number(i)].explicacion;
          if (exp) {
            var e = el("span", "pract-op__exp", exp);
            b.appendChild(e);
          }
          b.disabled = true;
        });

        if (it.fuente) card.appendChild(fuenteAlPie(it.fuente));

        var sig = el("button", "pract-btn", "Siguiente");
        sig.addEventListener("click", function () { pos++; pintar(); });
        card.appendChild(sig);
        refrescarMarcador();
      }

      orden.forEach(function (i, n) {
        var o = it.opciones[i];
        var b = el("button", "pract-op");
        b.dataset.i = String(i);
        b.appendChild(el("span", "pract-op__letra", letra(n)));
        b.appendChild(el("span", null, o.texto));
        b.addEventListener("click", function () {
          if (revelado) return;
          if (multiple) {
            elegidas[i] = !elegidas[i];
            if (!elegidas[i]) delete elegidas[i];
            b.classList.toggle("pract-op--sel", !!elegidas[i]);
          } else {
            elegidas = {};
            elegidas[i] = true;
            revelar();
          }
        });
        botones.push(b);
        card.appendChild(b);
      });

      if (multiple) {
        var conf = el("button", "pract-btn", "Confirmar");
        conf.addEventListener("click", function () {
          if (!Object.keys(elegidas).length) return;
          conf.remove();
          revelar();
        });
        card.appendChild(conf);
      }

      zona.appendChild(card);
    }

    sel.addEventListener("change", function () {
      temaActual = sel.value;
      armar();
      pintar();
    });

    armar();
    pintar();
  }

  // ---------------------------------------------------------------
  // 5) Elegí el diagrama correcto
  // ---------------------------------------------------------------

  function montarDiagramas(raiz, datos) {
    var items = datos.items;
    var vivos = [];
    var pos = 0;
    var aciertos = 0;
    var respondidas = 0;

    var marcador = el("p", "pract-meta");
    raiz.appendChild(marcador);
    var zona = el("div");
    raiz.appendChild(zona);

    function armar() {
      vivos = barajar(items.slice());
      pos = 0;
      aciertos = 0;
      respondidas = 0;
    }

    function pintar() {
      zona.textContent = "";
      marcador.textContent = vivos.length
        ? "Diagrama " + Math.min(pos + 1, vivos.length) + " de " + vivos.length +
          " · " + aciertos + "/" + respondidas + " bien"
        : "";

      if (pos >= vivos.length) {
        var pct = respondidas ? Math.round((100 * aciertos) / respondidas) : 0;
        var clase = pct >= 80 ? "ok" : pct >= 55 ? "medio" : "mal";
        var v = el("div", "pract-veredicto pract-veredicto--" + clase);
        v.textContent = "Terminaste: " + aciertos + " de " + respondidas + " (" + pct + "%).";
        zona.appendChild(v);
        var otra = el("button", "pract-btn", "Otra vuelta");
        otra.addEventListener("click", function () { armar(); pintar(); });
        zona.appendChild(otra);
        return;
      }

      var it = vivos[pos];
      var card = el("div", "pract-card");
      card.appendChild(el("span", "pract-tema", it.tema_nombre));
      card.appendChild(el("p", "pract-enunciado", it.consigna));

      var grilla = el("div", "pract-difs");
      var orden = barajar(it.opciones.map(function (o, i) { return i; }));
      var revelado = false;

      orden.forEach(function (i, n) {
        var o = it.opciones[i];
        var b = el("button", "pract-dif");
        var img = el("img");
        img.alt = "Opción " + letra(n);
        // El listener va ANTES de asignar src: el navegador arranca la
        // descarga apenas se lo asigna, y un 404 rápido llegaría antes de
        // que estuviéramos escuchando. Sin lazy por el mismo motivo: una
        // imagen diferida fuera del viewport nunca dispara el error.
        img.addEventListener("error", function () {
          img.remove();
          var a = el("div", "pract-aviso");
          a.textContent =
            "Falta " + o.svg.split("/").pop() + ". Corré scripts/render_puml.sh.";
          b.insertBefore(a, b.firstChild);
        });
        img.src = o.svg;
        b.appendChild(img);
        b.appendChild(el("span", "pract-dif__n", letra(n) + ")"));

        b.addEventListener("click", function () {
          if (revelado) return;
          revelado = true;
          respondidas++;
          var bien = i === it.correcta;
          if (bien) aciertos++;

          Array.prototype.forEach.call(grilla.children, function (hijo, k) {
            var idx = orden[k];
            hijo.disabled = true;
            if (idx === it.correcta) hijo.classList.add("pract-dif--ok");
            else if (idx === i) hijo.classList.add("pract-dif--mal");
          });

          var exp = el("div", "pract-veredicto pract-veredicto--" + (bien ? "ok" : "mal"));
          exp.textContent = (bien ? "Bien. " : "No. ") + it.explicacion;
          card.appendChild(exp);
          if (it.fuente) card.appendChild(fuenteAlPie(it.fuente));

          var sig = el("button", "pract-btn", "Siguiente");
          sig.addEventListener("click", function () { pos++; pintar(); });
          card.appendChild(sig);
        });

        grilla.appendChild(b);
      });

      card.appendChild(grilla);
      zona.appendChild(card);
    }

    armar();
    pintar();
  }

  // ---------------------------------------------------------------
  // Arranque
  // ---------------------------------------------------------------

  // ---------------------------------------------------------------
  // 6) Plan de estudio con checklist persistente
  // ---------------------------------------------------------------

  function montarPlan(raiz, datos) {
    var estadoClave = "plan";
    var hechas = leer(estadoClave, {});

    var barra = el("div", "pract-barra");
    var resumen = el("p", "pract-meta");
    var btnReset = el("button", "pract-btn pract-btn--sec", "Reiniciar el plan");
    barra.appendChild(btnReset);
    raiz.appendChild(barra);

    var prog = el("div", "pract-prog");
    var progB = el("div", "pract-prog__b");
    prog.appendChild(progB);
    raiz.appendChild(prog);
    raiz.appendChild(resumen);

    var zona = el("div");
    raiz.appendChild(zona);

    function todasLasTareas() {
      var t = [];
      datos.bloques.forEach(function (b) {
        (b.tareas || []).forEach(function (x, i) { t.push(b.id + "." + i); });
      });
      return t;
    }

    function refrescar() {
      var todas = todasLasTareas();
      var n = todas.filter(function (k) { return hechas[k]; }).length;
      var pct = todas.length ? (100 * n) / todas.length : 0;
      progB.style.width = pct.toFixed(1) + "%";
      var quedan = datos.bloques.filter(function (b) { return !b.vencido; }).length;
      resumen.textContent =
        n + " de " + todas.length + " tareas hechas · " +
        (quedan ? quedan + " semana(s) por delante" : "se terminó el plan");
    }

    function pintar() {
      zona.textContent = "";

      datos.bloques.forEach(function (b) {
        var card = el("div", "pract-card pract-dia");
        if (b.actual) card.classList.add("pract-dia--hoy");
        if (b.vencido) card.classList.add("pract-dia--pasado");

        var cab = el("div", "pract-dia__cab");
        var tit = el("div");
        tit.appendChild(el("span", "pract-tema", b.rango));
        tit.appendChild(el("h3", "pract-dia__tit", b.titulo));
        cab.appendChild(tit);
        card.appendChild(cab);

        if (b.actual) {
          card.appendChild(
            el("p", "pract-veredicto pract-veredicto--medio", "Es esta semana.")
          );
        }

        card.appendChild(el("p", "pract-enunciado", b.porque));

        var hechasBloque = 0;
        var marcador = el("p", "pract-puntaje");

        (b.tareas || []).forEach(function (t, i) {
          var k = b.id + "." + i;
          var lab = el("label", "pract-clave");
          var chk = el("input");
          chk.type = "checkbox";
          chk.checked = !!hechas[k];
          if (chk.checked) { lab.classList.add("pract-clave--ok"); hechasBloque++; }

          chk.addEventListener("change", function () {
            hechas[k] = chk.checked;
            guardar(estadoClave, hechas);
            lab.classList.toggle("pract-clave--ok", chk.checked);
            hechasBloque += chk.checked ? 1 : -1;
            marcador.textContent = hechasBloque + " de " + b.tareas.length + " de la semana";
            refrescar();
          });

          var cuerpo = el("span");
          cuerpo.appendChild(el("strong", null, t.titulo));
          if (t.detalle) cuerpo.appendChild(el("span", "pract-op__exp", t.detalle));
          if (t.enlace) {
            var a = el("a", "pract-op__exp");
            a.href = t.enlace;
            a.textContent = "Abrir →";
            a.style.display = "block";
            cuerpo.appendChild(a);
          }
          lab.appendChild(chk);
          lab.appendChild(cuerpo);
          card.appendChild(lab);
        });

        marcador.textContent = hechasBloque + " de " + (b.tareas || []).length + " de la semana";
        card.appendChild(marcador);

        if (b.metas && b.metas.length) {
          var m = el("div", "pract-rubrica");
          m.appendChild(el("p", "pract-rubrica__tit", "Metas de la semana"));
          b.metas.forEach(function (x) {
            m.appendChild(el("p", "pract-op__exp", "· " + x));
          });
          card.appendChild(m);
        }

        if (b.aviso) {
          var av = el("div", "pract-aviso");
          av.textContent = b.aviso;
          card.appendChild(av);
        }

        zona.appendChild(card);
      });

      refrescar();
    }

    btnReset.addEventListener("click", function () {
      if (window.confirm("¿Destildar todas las tareas del plan?")) {
        hechas = {};
        guardar(estadoClave, hechas);
        pintar();
      }
    });

    pintar();
  }
  // ---------------------------------------------------------------
  // 7) Contrarreloj — modo arcade
  // ---------------------------------------------------------------

  /**
   * Partida corta: 3 vidas, reloj por pregunta, racha con multiplicador.
   *
   * El objetivo no es el puntaje, es bajar el costo de arrancar: una partida
   * dura 2-3 minutos y se empieza sin decidir nada. Al terminar, el resumen
   * apunta a las fichas de los temas que costaron vidas, para que el impulso
   * se convierta en dirección y no en otra partida.
   */
  function montarJuego(raiz, datos) {
    var VIDAS = 3;
    var SEG = 25;          // por pregunta simple
    var SEG_MULTI = 35;    // con más de una correcta hay que leer todo
    var estadoClave = "juego";

    var hist = leer(estadoClave, {
      record: 0, mejorRacha: 0, partidas: 0,
      porTema: {}, ultimoDia: "", rachaDias: 0
    });

    var temaFiltro = temaDeLaUrl();
    var mazo = [], pos = 0, vidas = VIDAS, puntos = 0, racha = 0, mejorRachaPartida = 0;
    var erroresPartida = {}, timerId = null, quedan = 0, jugando = false;

    function hoyStr() {
      var d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
        "-" + String(d.getDate()).padStart(2, "0");
    }

    function multiplicador() {
      if (racha >= 10) return 4;
      if (racha >= 6) return 3;
      if (racha >= 3) return 2;
      return 1;
    }

    var zona = el("div");
    raiz.appendChild(zona);

    // ---------- Portada ----------
    function pintarInicio() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      jugando = false;
      zona.textContent = "";

      var card = el("div", "pract-card");
      card.appendChild(el("h3", "pract-juego__tit", "Contrarreloj"));
      card.appendChild(el("p", "pract-enunciado",
        "3 vidas. Reloj por pregunta. Cada acierto seguido sube el multiplicador. " +
        "Una partida dura 2 o 3 minutos."));

      var marcas = el("div", "pract-marcas");
      [["Récord", hist.record], ["Mejor racha", hist.mejorRacha],
       ["Partidas", hist.partidas], ["Días seguidos", hist.rachaDias]
      ].forEach(function (m) {
        var b = el("div", "pract-marca");
        b.appendChild(el("span", "pract-marca__n", String(m[1])));
        b.appendChild(el("span", "pract-marca__t", m[0]));
        marcas.appendChild(b);
      });
      card.appendChild(marcas);

      var barra = el("div", "pract-barra");
      var sel = el("select");
      var o = el("option", null, "Todos los temas");
      o.value = "*";
      sel.appendChild(o);
      datos.temas.forEach(function (t) {
        var op = el("option", null, t.nombre);
        op.value = t.slug;
        if (t.slug === temaFiltro) op.selected = true;
        sel.appendChild(op);
      });
      sel.addEventListener("change", function () { temaFiltro = sel.value; });
      var btn = el("button", "pract-btn pract-btn--grande", "Jugar");
      btn.addEventListener("click", empezar);
      barra.appendChild(sel);
      barra.appendChild(btn);
      card.appendChild(barra);
      zona.appendChild(card);

      // Dominio acumulado por tema: la parte que "cubre todos los temas"
      var dom = el("div", "pract-card");
      dom.appendChild(el("p", "pract-rubrica__tit", "Tu dominio por tema"));
      dom.appendChild(el("p", "pract-meta",
        "Acumulado de todas tus partidas. Los que están en rojo son los que te " +
        "hacen perder vidas."));

      datos.temas.forEach(function (t) {
        var s = hist.porTema[t.slug] || { ok: 0, mal: 0 };
        var tot = s.ok + s.mal;
        var pct = tot ? Math.round((100 * s.ok) / tot) : 0;
        var fila = el("div", "pract-dom");
        var cab = el("div", "pract-dom__cab");
        cab.appendChild(el("span", null, t.nombre));
        cab.appendChild(el("span", "pract-min",
          tot ? pct + "% (" + tot + ")" : "sin jugar"));
        fila.appendChild(cab);
        var b = el("div", "pract-prog");
        var bi = el("div", "pract-prog__b");
        bi.style.width = pct + "%";
        if (tot) {
          bi.style.background = pct >= 80 ? "#2e7d32" : pct >= 55 ? "#ef9a00" : "#c62828";
        }
        b.appendChild(bi);
        fila.appendChild(b);
        dom.appendChild(fila);
      });
      zona.appendChild(dom);
    }

    // ---------- Partida ----------
    function empezar() {
      mazo = barajar(datos.items.filter(function (x) {
        return temaFiltro === "*" || x.tema === temaFiltro;
      }).slice());
      if (!mazo.length) return;
      pos = 0; vidas = VIDAS; puntos = 0; racha = 0;
      mejorRachaPartida = 0; erroresPartida = {}; jugando = true;

      var h = hoyStr();
      if (hist.ultimoDia !== h) {
        var ayer = new Date(Date.now() - 864e5);
        var ayerStr = ayer.getFullYear() + "-" +
          String(ayer.getMonth() + 1).padStart(2, "0") + "-" +
          String(ayer.getDate()).padStart(2, "0");
        hist.rachaDias = hist.ultimoDia === ayerStr ? (hist.rachaDias || 0) + 1 : 1;
        hist.ultimoDia = h;
      }
      pintarPregunta();
    }

    function pintarPregunta() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      zona.textContent = "";

      if (vidas <= 0 || pos >= mazo.length) return terminar();

      var it = mazo[pos];
      var multiple = it.correctas.length > 1;

      // Marcador pegajoso
      var hud = el("div", "pract-hud");
      var vidasEl = el("span", "pract-hud__vidas",
        "♥".repeat(vidas) + "♡".repeat(VIDAS - vidas));
      var puntosEl = el("span", "pract-hud__pts", String(puntos));
      var comboEl = el("span", "pract-hud__combo");
      comboEl.textContent = racha > 0 ? "x" + multiplicador() + "  racha " + racha : "";
      hud.appendChild(vidasEl);
      hud.appendChild(comboEl);
      hud.appendChild(puntosEl);
      zona.appendChild(hud);

      var reloj = el("div", "pract-reloj-barra");
      var relojB = el("div", "pract-reloj-barra__b");
      reloj.appendChild(relojB);
      zona.appendChild(reloj);

      var card = el("div", "pract-card");
      card.appendChild(el("span", "pract-tema", it.tema_nombre));
      card.appendChild(el("p", "pract-enunciado", it.consigna));
      if (multiple) {
        card.appendChild(el("p", "pract-meta", "Más de una correcta."));
      }

      var elegidas = {}, revelado = false, botones = [];
      var total = (multiple ? SEG_MULTI : SEG) * 1000;
      quedan = total;

      timerId = setInterval(function () {
        quedan -= 100;
        var pct = Math.max(0, (100 * quedan) / total);
        relojB.style.width = pct + "%";
        relojB.classList.toggle("pract-reloj-barra__b--poco", pct < 30);
        if (quedan <= 0) { clearInterval(timerId); timerId = null; revelar(true); }
      }, 100);

      function revelar(porTiempo) {
        if (revelado) return;
        revelado = true;
        if (timerId) { clearInterval(timerId); timerId = null; }

        var bien = !porTiempo &&
          it.correctas.length === Object.keys(elegidas).length &&
          it.correctas.every(function (i) { return elegidas[i]; });

        var st = hist.porTema[it.tema] || { ok: 0, mal: 0 };
        var ganados = 0;
        if (bien) {
          st.ok++;
          racha++;
          if (racha > mejorRachaPartida) mejorRachaPartida = racha;
          // El multiplicador se aplica con la racha YA incrementada: el
          // acierto que te lleva a 3 seguidas es el que empieza a pagar x2.
          ganados = (100 + Math.round(100 * (quedan / total))) * multiplicador();
          puntos += ganados;
          puntosEl.textContent = String(puntos);
        } else {
          st.mal++;
          racha = 0;
          vidas--;
          erroresPartida[it.tema] = (erroresPartida[it.tema] || 0) + 1;
          vidasEl.textContent = "♥".repeat(Math.max(0, vidas)) +
            "♡".repeat(VIDAS - Math.max(0, vidas));
          vidasEl.classList.add("pract-hud__vidas--golpe");
        }
        // El HUD tiene que reflejar el resultado de ESTA respuesta, no el
        // estado con el que se dibujó la pregunta: si no, perdés una vida y
        // el combo sigue anunciando la racha que acabás de cortar.
        comboEl.textContent = racha > 0
          ? "x" + multiplicador() + "  racha " + racha
          : "";
        hist.porTema[it.tema] = st;
        guardar(estadoClave, hist);

        botones.forEach(function (b) {
          var i = Number(b.dataset.i);
          var esOk = it.correctas.indexOf(i) >= 0;
          b.disabled = true;
          b.classList.add("pract-op--revelada");
          b.classList.remove("pract-op--sel");
          if (esOk) b.classList.add("pract-op--ok");
          else if (elegidas[i]) b.classList.add("pract-op--mal");
        });

        var v = el("div", "pract-veredicto pract-veredicto--" + (bien ? "ok" : "mal"));
        v.textContent = porTiempo
          ? "Se acabó el tiempo."
          : bien
          ? "Bien. +" + ganados + " puntos." +
            (multiplicador() > 1 ? "  (x" + multiplicador() + " por racha de " + racha + ")" : "")
          : "No.";
        card.appendChild(v);

        // La explicación de la correcta, siempre: la partida tiene que enseñar
        var exp = it.opciones[it.correctas[0]].explicacion;
        if (exp) card.appendChild(el("p", "pract-op__exp", exp));
        if (it.fuente) card.appendChild(fuenteAlPie(it.fuente));

        var sig = el("button", "pract-btn", vidas > 0 ? "Seguir" : "Ver resultado");
        sig.addEventListener("click", function () { pos++; pintarPregunta(); });
        card.appendChild(sig);
      }

      var orden = barajar(it.opciones.map(function (_, i) { return i; }));
      orden.forEach(function (i, n) {
        var b = el("button", "pract-op");
        b.dataset.i = String(i);
        b.appendChild(el("span", "pract-op__letra", letra(n)));
        b.appendChild(el("span", null, it.opciones[i].texto));
        b.addEventListener("click", function () {
          if (revelado) return;
          if (multiple) {
            elegidas[i] = !elegidas[i];
            if (!elegidas[i]) delete elegidas[i];
            b.classList.toggle("pract-op--sel", !!elegidas[i]);
          } else {
            elegidas = {};
            elegidas[i] = true;
            revelar(false);
          }
        });
        botones.push(b);
        card.appendChild(b);
      });

      if (multiple) {
        var conf = el("button", "pract-btn", "Confirmar");
        conf.addEventListener("click", function () {
          if (!Object.keys(elegidas).length) return;
          conf.remove();
          revelar(false);
        });
        card.appendChild(conf);
      }

      zona.appendChild(card);
    }

    // ---------- Resultado ----------
    function terminar() {
      jugando = false;
      hist.partidas++;
      var recordNuevo = puntos > hist.record;
      if (recordNuevo) hist.record = puntos;
      if (mejorRachaPartida > hist.mejorRacha) hist.mejorRacha = mejorRachaPartida;
      guardar(estadoClave, hist);

      zona.textContent = "";
      var card = el("div", "pract-card");
      card.appendChild(el("h3", "pract-juego__tit",
        recordNuevo ? "¡Récord nuevo!" : "Fin de la partida"));

      var marcas = el("div", "pract-marcas");
      [["Puntos", puntos], ["Mejor racha", mejorRachaPartida],
       ["Récord", hist.record]].forEach(function (m) {
        var b = el("div", "pract-marca");
        b.appendChild(el("span", "pract-marca__n", String(m[1])));
        b.appendChild(el("span", "pract-marca__t", m[0]));
        marcas.appendChild(b);
      });
      card.appendChild(marcas);

      var temasMal = Object.keys(erroresPartida).sort(function (a, b) {
        return erroresPartida[b] - erroresPartida[a];
      });
      if (temasMal.length) {
        var r = el("div", "pract-rubrica");
        r.appendChild(el("p", "pract-rubrica__tit", "Lo que te costó vidas"));
        temasMal.forEach(function (slug) {
          var nom = (datos.temas.filter(function (t) { return t.slug === slug; })[0] || {}).nombre || slug;
          var p = el("p", "pract-op__exp");
          var a = el("a", null, nom);
          a.href = datos.base + "temas/" + slug + "/";
          p.appendChild(a);
          p.appendChild(document.createTextNode(
            " — " + erroresPartida[slug] + " error(es). Abrí la ficha antes de la próxima partida."));
          r.appendChild(p);
        });
        card.appendChild(r);
      } else {
        card.appendChild(el("div", "pract-veredicto pract-veredicto--ok",
          "Sin errores. Andá a escribir una respuesta a mano, que es lo que esto no entrena."));
      }

      var barra = el("div", "pract-barra");
      var otra = el("button", "pract-btn pract-btn--grande", "Otra partida");
      otra.addEventListener("click", empezar);
      var volver = el("button", "pract-btn pract-btn--sec", "Volver");
      volver.addEventListener("click", pintarInicio);
      barra.appendChild(otra);
      barra.appendChild(volver);
      card.appendChild(barra);
      zona.appendChild(card);
    }

    pintarInicio();
  }

  // ---------------------------------------------------------------
  // 8) Armá la respuesta — ¿qué conceptos no pueden faltar?
  // ---------------------------------------------------------------

  /**
   * Chips que se mueven entre "disponibles" y "mi respuesta".
   *
   * En el celular se resuelve TOCANDO: el arrastre HTML5 no existe en touch,
   * y esta página se lee sobre todo desde el teléfono. El arrastre queda
   * disponible con mouse, como atajo, no como única vía.
   */
  function montarArmar(raiz, datos) {
    var items = datos.items;
    var vivos = [], pos = 0, aciertos = 0, respondidas = 0;
    var temaActual = temaDeLaUrl();

    var barra = el("div", "pract-barra");
    var sel = el("select");
    var op = el("option", null, "Todos los temas");
    op.value = "*";
    sel.appendChild(op);
    datos.temas.forEach(function (t) {
      var o = el("option", null, t.nombre);
      o.value = t.slug;
      if (t.slug === temaActual) o.selected = true;
      sel.appendChild(o);
    });
    barra.appendChild(sel);
    raiz.appendChild(barra);

    var marcador = el("p", "pract-meta");
    raiz.appendChild(marcador);
    var zona = el("div");
    raiz.appendChild(zona);

    function armarMazo() {
      vivos = barajar(items.filter(function (x) {
        return temaActual === "*" || x.tema === temaActual;
      }).slice());
      pos = 0; aciertos = 0; respondidas = 0;
    }

    function pintar() {
      zona.textContent = "";
      marcador.textContent = vivos.length
        ? "Ejercicio " + Math.min(pos + 1, vivos.length) + " de " + vivos.length +
          (respondidas ? " · " + aciertos + "/" + respondidas + " sin errores" : "")
        : "";

      if (!vivos.length) {
        zona.appendChild(el("div", "pract-aviso", "No hay ejercicios para este tema."));
        return;
      }
      if (pos >= vivos.length) {
        var v = el("div", "pract-veredicto pract-veredicto--ok");
        v.textContent = "Terminaste: " + aciertos + " de " + respondidas +
          " armadas sin ningún error.";
        zona.appendChild(v);
        var otra = el("button", "pract-btn", "Otra vuelta");
        otra.addEventListener("click", function () { armarMazo(); pintar(); });
        zona.appendChild(otra);
        return;
      }

      var it = vivos[pos];
      var card = el("div", "pract-card");
      card.appendChild(el("span", "pract-tema", it.tema_nombre));
      card.appendChild(el("p", "pract-enunciado", it.pregunta));
      card.appendChild(el("p", "pract-meta",
        "Tocá los conceptos que SÍ tienen que aparecer. Tocalos de nuevo para " +
        "sacarlos. Con mouse también podés arrastrarlos."));

      var cajaTit = el("p", "pract-rubrica__tit", "Mi respuesta");
      card.appendChild(cajaTit);
      var caja = el("div", "pract-zona pract-zona--respuesta");
      caja.dataset.destino = "1";
      card.appendChild(caja);

      card.appendChild(el("p", "pract-rubrica__tit", "Disponibles"));
      var pool = el("div", "pract-zona");
      card.appendChild(pool);

      var todos = barajar(
        it.van.map(function (c) { return { c: c, va: true }; })
          .concat(it.no_van.map(function (c) { return { c: c, va: false }; }))
      );

      var corregido = false;

      function mover(chip) {
        if (corregido) return;
        var destino = chip.parentNode === caja ? pool : caja;
        destino.appendChild(chip);
      }

      todos.forEach(function (x, i) {
        var chip = el("button", "pract-chip", x.c.chip);
        chip.dataset.va = x.va ? "1" : "0";
        chip.dataset.detalle = x.c.detalle || "";
        chip.dataset.i = String(i);
        chip.draggable = true;
        chip.addEventListener("click", function () { mover(chip); });
        chip.addEventListener("dragstart", function (e) {
          if (corregido) return e.preventDefault();
          e.dataTransfer.setData("text/plain", chip.dataset.i);
          chip.classList.add("pract-chip--arrastre");
        });
        chip.addEventListener("dragend", function () {
          chip.classList.remove("pract-chip--arrastre");
        });
        pool.appendChild(chip);
      });

      [caja, pool].forEach(function (z) {
        z.addEventListener("dragover", function (e) {
          if (corregido) return;
          e.preventDefault();
          z.classList.add("pract-zona--sobre");
        });
        z.addEventListener("dragleave", function () {
          z.classList.remove("pract-zona--sobre");
        });
        z.addEventListener("drop", function (e) {
          e.preventDefault();
          z.classList.remove("pract-zona--sobre");
          if (corregido) return;
          var i = e.dataTransfer.getData("text/plain");
          var chip = card.querySelector('.pract-chip[data-i="' + i + '"]');
          if (chip) z.appendChild(chip);
        });
      });

      var btn = el("button", "pract-btn", "Corregir");
      card.appendChild(btn);

      btn.addEventListener("click", function () {
        if (corregido) return;
        corregido = true;
        btn.remove();
        respondidas++;

        var puestos = [].slice.call(caja.querySelectorAll(".pract-chip"));
        var sobran = 0, faltan = 0;

        puestos.forEach(function (chip) {
          var ok = chip.dataset.va === "1";
          chip.classList.add(ok ? "pract-chip--ok" : "pract-chip--mal");
          if (!ok) sobran++;
        });

        [].slice.call(pool.querySelectorAll(".pract-chip")).forEach(function (chip) {
          if (chip.dataset.va === "1") {
            chip.classList.add("pract-chip--falta");
            faltan++;
          } else {
            chip.classList.add("pract-chip--bien-fuera");
          }
        });

        var perfecto = sobran === 0 && faltan === 0;
        if (perfecto) aciertos++;

        var v = el("div", "pract-veredicto pract-veredicto--" +
          (perfecto ? "ok" : faltan + sobran <= 2 ? "medio" : "mal"));
        v.textContent = perfecto
          ? "Perfecto: están todos los que van y ninguno de los que no."
          : "Te faltaron " + faltan + " y pusiste " + sobran + " que no van.";
        card.appendChild(v);

        // El detalle de cada chip: acá es donde el ejercicio enseña
        var det = el("div", "pract-rubrica");
        det.appendChild(el("p", "pract-rubrica__tit", "Qué es cada uno"));
        todos.forEach(function (x, i) {
          var chip = card.querySelector('.pract-chip[data-i="' + i + '"]');
          var p = el("p", "pract-op__exp");
          p.innerHTML = "<strong>" + (x.va ? "✓ " : "✗ ") + x.c.chip +
            "</strong> — " + (x.c.detalle || "");
          if (!x.va) p.classList.add("pract-op__exp--fuera");
          det.appendChild(p);
        });
        card.appendChild(det);

        if (it.fuente) card.appendChild(fuenteAlPie(it.fuente));

        var sig = el("button", "pract-btn", "Siguiente");
        sig.addEventListener("click", function () { pos++; pintar(); });
        card.appendChild(sig);
        marcador.textContent = "Ejercicio " + (pos + 1) + " de " + vivos.length +
          " · " + aciertos + "/" + respondidas + " sin errores";
      });

      zona.appendChild(card);
    }

    sel.addEventListener("change", function () {
      temaActual = sel.value;
      armarMazo();
      pintar();
    });

    armarMazo();
    pintar();
  }

  // ---------------------------------------------------------------
  // 9) Ordená la secuencia — arrastre que funciona en el celular
  // ---------------------------------------------------------------

  function montarOrdenar(raiz, datos) {
    var items = datos.items;
    var vivos = [], pos = 0, aciertos = 0, respondidas = 0;
    // Respeta ?tema= igual que el resto: la ficha enlaza "Ordená SUS
    // secuencias", así que tiene que traer sólo las de ese tema.
    var temaActual = temaDeLaUrl();

    var marcador = el("p", "pract-meta");
    raiz.appendChild(marcador);
    var zona = el("div");
    raiz.appendChild(zona);

    function armarMazo() {
      vivos = barajar(items.filter(function (x) {
        return temaActual === "*" || x.tema === temaActual;
      }).slice());
      pos = 0; aciertos = 0; respondidas = 0;
    }

    function pintar() {
      zona.textContent = "";
      marcador.textContent = vivos.length
        ? "Secuencia " + Math.min(pos + 1, vivos.length) + " de " + vivos.length +
          (respondidas ? " · " + aciertos + "/" + respondidas + " bien" : "")
        : "";

      if (!vivos.length) {
        zona.appendChild(el("div", "pract-aviso",
          "Este tema no tiene secuencias para ordenar. Probá con las de otros " +
          "temas desde la página completa."));
        return;
      }

      if (pos >= vivos.length) {
        var v = el("div", "pract-veredicto pract-veredicto--ok");
        v.textContent = "Terminaste: " + aciertos + " de " + respondidas + ".";
        zona.appendChild(v);
        var otra = el("button", "pract-btn", "Otra vuelta");
        otra.addEventListener("click", function () { armarMazo(); pintar(); });
        zona.appendChild(otra);
        return;
      }

      var it = vivos[pos];
      var card = el("div", "pract-card");
      card.appendChild(el("span", "pract-tema", it.tema_nombre));
      card.appendChild(el("p", "pract-enunciado", it.consigna));
      card.appendChild(el("p", "pract-meta",
        "Arrastrá desde el ⠿ para reordenar, o usá las flechas."));

      var lista = el("div", "pract-lista");
      card.appendChild(lista);

      // Se baraja hasta que quede distinto del original: un ejercicio que
      // arranca resuelto no ejercita nada.
      var orden = it.pasos.map(function (_, i) { return i; });
      var intentos = 0;
      do {
        barajar(orden);
        intentos++;
      } while (intentos < 20 && orden.every(function (v, i) { return v === i; }));

      var corregido = false;

      function repintarNumeros() {
        [].slice.call(lista.children).forEach(function (fila, i) {
          fila.querySelector(".pract-fila__n").textContent = String(i + 1);
        });
      }

      orden.forEach(function (idx) {
        var fila = el("div", "pract-fila");
        fila.dataset.idx = String(idx);

        var asa = el("span", "pract-fila__asa", "⠿");
        asa.setAttribute("aria-hidden", "true");
        fila.appendChild(asa);
        fila.appendChild(el("span", "pract-fila__n", "1"));
        fila.appendChild(el("span", "pract-fila__t", it.pasos[idx]));

        var btns = el("span", "pract-fila__btns");
        var arriba = el("button", "pract-mini", "↑");
        arriba.setAttribute("aria-label", "Subir");
        var abajo = el("button", "pract-mini", "↓");
        abajo.setAttribute("aria-label", "Bajar");
        arriba.addEventListener("click", function () {
          if (corregido) return;
          var p = fila.previousElementSibling;
          if (p) { lista.insertBefore(fila, p); repintarNumeros(); }
        });
        abajo.addEventListener("click", function () {
          if (corregido) return;
          var n = fila.nextElementSibling;
          if (n) { lista.insertBefore(n, fila); repintarNumeros(); }
        });
        btns.appendChild(arriba);
        btns.appendChild(abajo);
        fila.appendChild(btns);

        // --- Arrastre con pointer events: anda con dedo y con mouse ---
        asa.addEventListener("pointerdown", function (e) {
          if (corregido) return;
          e.preventDefault();
          asa.setPointerCapture(e.pointerId);
          fila.classList.add("pract-fila--arrastre");

          function mover(ev) {
            var bajo = document.elementFromPoint(ev.clientX, ev.clientY);
            if (!bajo) return;
            var otra = bajo.closest ? bajo.closest(".pract-fila") : null;
            if (!otra || otra === fila || otra.parentNode !== lista) return;
            var r = otra.getBoundingClientRect();
            var despues = ev.clientY > r.top + r.height / 2;
            lista.insertBefore(fila, despues ? otra.nextSibling : otra);
            repintarNumeros();
          }
          function soltar(ev) {
            fila.classList.remove("pract-fila--arrastre");
            asa.releasePointerCapture(ev.pointerId);
            asa.removeEventListener("pointermove", mover);
            asa.removeEventListener("pointerup", soltar);
            asa.removeEventListener("pointercancel", soltar);
          }
          asa.addEventListener("pointermove", mover);
          asa.addEventListener("pointerup", soltar);
          asa.addEventListener("pointercancel", soltar);
        });

        lista.appendChild(fila);
      });
      repintarNumeros();

      var btn = el("button", "pract-btn", "Corregir");
      card.appendChild(btn);

      btn.addEventListener("click", function () {
        if (corregido) return;
        corregido = true;
        btn.remove();
        respondidas++;

        var filas = [].slice.call(lista.children);
        var bien = 0;
        filas.forEach(function (fila, i) {
          var ok = Number(fila.dataset.idx) === i;
          fila.classList.add(ok ? "pract-fila--ok" : "pract-fila--mal");
          if (ok) bien++;
          if (!ok) {
            var n = el("span", "pract-fila__real", "va " + (Number(fila.dataset.idx) + 1) + "º");
            fila.appendChild(n);
          }
        });

        var perfecto = bien === filas.length;
        if (perfecto) aciertos++;

        var v = el("div", "pract-veredicto pract-veredicto--" +
          (perfecto ? "ok" : bien >= filas.length - 2 ? "medio" : "mal"));
        v.textContent = perfecto
          ? "Orden correcto, los " + filas.length + " pasos."
          : bien + " de " + filas.length + " en su lugar.";
        card.appendChild(v);

        if (!perfecto) {
          var r = el("div", "pract-rubrica");
          r.appendChild(el("p", "pract-rubrica__tit", "El orden correcto"));
          it.pasos.forEach(function (p, i) {
            r.appendChild(el("p", "pract-op__exp", (i + 1) + ". " + p));
          });
          card.appendChild(r);
        }

        if (it.fuente) card.appendChild(fuenteAlPie(it.fuente));
        var sig = el("button", "pract-btn", "Siguiente");
        sig.addEventListener("click", function () { pos++; pintar(); });
        card.appendChild(sig);
        marcador.textContent = "Secuencia " + (pos + 1) + " de " + vivos.length +
          " · " + aciertos + "/" + respondidas + " bien";
      });

      zona.appendChild(card);
    }

    armarMazo();
    pintar();
  }

  var TIPOS = {
    simulacro: montarSimulacro,
    fichas: montarFichas,
    opciones: montarOpciones,
    diagramas: montarDiagramas,
    plan: montarPlan,
    juego: montarJuego,
    armar: montarArmar,
    ordenar: montarOrdenar
  };

  function iniciar() {
    var nodos = document.querySelectorAll(".pract[data-tipo]");
    Array.prototype.forEach.call(nodos, function (raiz) {
      if (raiz.dataset.montado) return;
      var fn = TIPOS[raiz.dataset.tipo];
      var fuente = document.getElementById(raiz.dataset.datos);
      if (!fn || !fuente) return;
      var datos;
      try {
        datos = JSON.parse(fuente.textContent);
      } catch (e) {
        raiz.appendChild(el("div", "pract-aviso", "No se pudieron leer los datos del ejercicio."));
        return;
      }
      raiz.dataset.montado = "1";
      fn(raiz, datos);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
