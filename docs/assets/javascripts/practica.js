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
    var temaActual = "*";
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
    var temaActual = "*";
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

    // Fecha local en formato YYYY-MM-DD, para marcar "hoy" sin que el huso
    // horario corra el día como haría toISOString().
    var h = new Date();
    var hoy = h.getFullYear() + "-" +
      String(h.getMonth() + 1).padStart(2, "0") + "-" +
      String(h.getDate()).padStart(2, "0");

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
      datos.dias.forEach(function (d) {
        (d.tareas || []).forEach(function (x, i) { t.push(d.fecha + "." + i); });
      });
      return t;
    }

    function refrescar() {
      var todas = todasLasTareas();
      var n = todas.filter(function (k) { return hechas[k]; }).length;
      var pct = todas.length ? (100 * n) / todas.length : 0;
      progB.style.width = pct.toFixed(1) + "%";
      var faltan = datos.dias.filter(function (d) { return d.fecha >= hoy; }).length;
      resumen.textContent =
        n + " de " + todas.length + " tareas hechas · " +
        (faltan > 0 ? faltan + " día(s) de plan por delante" : "se terminó el plan");
    }

    function pintar() {
      zona.textContent = "";

      datos.dias.forEach(function (d) {
        var card = el("div", "pract-card pract-dia");
        var esHoy = d.fecha === hoy;
        var pasado = d.fecha < hoy;
        if (esHoy) card.classList.add("pract-dia--hoy");
        if (pasado) card.classList.add("pract-dia--pasado");

        var cab = el("div", "pract-dia__cab");
        var tit = el("div");
        tit.appendChild(el("span", "pract-tema", d.etiqueta));
        tit.appendChild(el("h3", "pract-dia__tit", d.titulo));
        cab.appendChild(tit);
        var horas = el("span", "pract-dia__horas", d.horas);
        cab.appendChild(horas);
        card.appendChild(cab);

        if (esHoy) {
          card.appendChild(el("p", "pract-veredicto pract-veredicto--medio", "Es hoy."));
        }

        card.appendChild(el("p", "pract-enunciado", d.porque));

        var hechasDia = 0;
        var marcador = el("p", "pract-puntaje");

        (d.tareas || []).forEach(function (t, i) {
          var k = d.fecha + "." + i;
          var lab = el("label", "pract-clave");
          var chk = el("input");
          chk.type = "checkbox";
          chk.checked = !!hechas[k];
          if (chk.checked) { lab.classList.add("pract-clave--ok"); hechasDia++; }

          chk.addEventListener("change", function () {
            hechas[k] = chk.checked;
            guardar(estadoClave, hechas);
            lab.classList.toggle("pract-clave--ok", chk.checked);
            hechasDia += chk.checked ? 1 : -1;
            marcador.textContent = hechasDia + " de " + d.tareas.length + " del día";
            refrescar();
          });

          var cuerpo = el("span");
          var linea = el("strong", null, t.titulo);
          cuerpo.appendChild(linea);
          if (t.minutos) {
            cuerpo.appendChild(el("span", "pract-min", "  " + t.minutos + " min"));
          }
          if (t.detalle) {
            cuerpo.appendChild(el("span", "pract-op__exp", t.detalle));
          }
          if (t.enlace) {
            var a = el("a", "pract-op__exp");
            a.href = t.enlace;
            a.textContent = "Ir a la ficha →";
            a.style.display = "block";
            cuerpo.appendChild(a);
          }
          lab.appendChild(chk);
          lab.appendChild(cuerpo);
          card.appendChild(lab);
        });

        marcador.textContent = hechasDia + " de " + (d.tareas || []).length + " del día";
        card.appendChild(marcador);

        if (d.metas && d.metas.length) {
          var m = el("div", "pract-rubrica");
          m.appendChild(el("p", "pract-rubrica__tit", "Metas del día"));
          d.metas.forEach(function (x) {
            var p = el("p", "pract-op__exp", "· " + x);
            m.appendChild(p);
          });
          card.appendChild(m);
        }

        if (d.minimo) {
          var mm = el("div", "pract-aviso");
          mm.innerHTML = "<strong>Si el día se complica:</strong> " + d.minimo;
          card.appendChild(mm);
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

  var TIPOS = {
    simulacro: montarSimulacro,
    fichas: montarFichas,
    opciones: montarOpciones,
    diagramas: montarDiagramas,
    plan: montarPlan
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
