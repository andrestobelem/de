import "./style.css";

// PROTOTYPE — three visual directions for Pandi, switchable with
// ?prototype=pandi&variant=A|B|C on the existing root route.

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("Application root was not found");
}

const app = appRoot;
const release = import.meta.env.VITE_RELEASE_SHA ?? "local";
document.documentElement.dataset.release = release;

const variants = [
  { key: "A", name: "Cuento editorial" },
  { key: "B", name: "Expediente juguetón" },
  { key: "C", name: "Diario nocturno" },
] as const;

type VariantKey = (typeof variants)[number]["key"];

const searchParameters = new URLSearchParams(window.location.search);
const prototypeRequested = searchParameters.get("prototype") === "pandi";
let currentVariant = readVariant(searchParameters.get("variant"));

if (prototypeRequested) {
  renderPrototype();
} else {
  renderDeliveryStatus();
}

document.addEventListener("keydown", (event) => {
  if (
    !prototypeRequested ||
    (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
  ) {
    return;
  }

  const target = event.target;

  if (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, [contenteditable='true']") ||
      target.closest("[contenteditable='true']"))
  ) {
    return;
  }

  event.preventDefault();
  cycleVariant(event.key === "ArrowRight" ? 1 : -1);
});

function renderDeliveryStatus() {
  document.documentElement.lang = "en";
  document.title = "Delivery status";
  setDescription("A walking skeleton for continuous delivery.");
  document.body.dataset.prototypeVariant = "";

  app.innerHTML = `
    <main class="delivery-main">
      <section class="status-card" aria-labelledby="delivery-status">
        <div class="status-indicator" aria-hidden="true"></div>
        <p class="eyebrow">Walking skeleton</p>
        <h1 id="delivery-status">Continuous delivery is operational</h1>
        <p class="summary">
          This revision passed the delivery pipeline and is running in the
          production-shaped build.
        </p>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>Healthy</dd>
          </div>
          <div>
            <dt>Release</dt>
            <dd><code data-testid="release"></code></dd>
          </div>
        </dl>
      </section>
    </main>
  `;

  const releaseElement = app.querySelector<HTMLElement>(
    "[data-testid='release']"
  );

  if (!releaseElement) {
    throw new Error("Release indicator was not found");
  }

  releaseElement.textContent = release.slice(0, 12);
}

function renderPrototype() {
  document.documentElement.lang = "es";
  document.title = `Pandi — ${variantName(currentVariant)} · Pobres Pandas`;
  setDescription(
    "Prototipo visual de la página de Pandi, un personaje de Pobres Pandas."
  );
  document.body.dataset.prototypeVariant = currentVariant;

  const variantMarkup = {
    A: renderEditorialVariant(),
    B: renderDossierVariant(),
    C: renderNightVariant(),
  } satisfies Record<VariantKey, string>;

  app.innerHTML = `
    <div class="pandi-prototype pandi-variant-${currentVariant.toLowerCase()}">
      ${variantMarkup[currentVariant]}
      ${renderPrototypeSwitcher()}
    </div>
  `;

  app
    .querySelector<HTMLButtonElement>("[data-prototype-previous]")
    ?.addEventListener("click", () => cycleVariant(-1));
  app
    .querySelector<HTMLButtonElement>("[data-prototype-next]")
    ?.addEventListener("click", () => cycleVariant(1));
}

function renderEditorialVariant() {
  return `
    <div class="editorial-page">
      <header class="editorial-nav">
        ${renderWordmark()}
        <p>Archivo de personajes <span>01 / Pandi</span></p>
        <a href="#historia-a">Descubrilo <span aria-hidden="true">↓</span></a>
      </header>

      <main class="editorial-main">
        <section class="editorial-hero" aria-labelledby="pandi-title-a">
          <div class="editorial-copy">
            <p class="pandi-kicker">Un pobre panda, como todos nosotros</p>
            <h1 id="pandi-title-a">Hola, soy <em>Pandi.</em></h1>
            <p class="editorial-intro">
              Tengo un corazón gigante, una batería chiquita y un lugar libre
              abajo de la manta.
            </p>
            <div class="editorial-actions">
              <a class="editorial-primary" href="#historia-a">Conoceme mejor</a>
              <span>Tiempo de lectura<br /><strong>2 minutos</strong></span>
            </div>
          </div>

          <div class="editorial-art" aria-label="Retrato de Pandi">
            <div class="editorial-sun" aria-hidden="true"></div>
            <span class="editorial-sticker">100% abrazable</span>
            ${renderPandiPortrait()}
            <p class="editorial-note">hoy hice lo que pude ♡</p>
          </div>
        </section>

        <section class="editorial-story" id="historia-a" aria-labelledby="story-title-a">
          <div class="editorial-story-heading">
            <p>01 — Su historia</p>
            <h2 id="story-title-a">Pandi siente<br />todo un poquito más.</h2>
          </div>
          <div class="editorial-story-body">
            <p class="editorial-lede">
              No llegó para salvar el mundo. Algunos días, llegar al martes ya
              le parece bastante heroico.
            </p>
            <p>
              Pandi observa, escucha y guarda las cosas importantes. Le gusta
              el bambú crocante, cancelar planes con tiempo y acompañar sin
              llenar todos los silencios.
            </p>
            <ul class="editorial-traits" aria-label="Rasgos de Pandi">
              <li><span>Superpoder</span>Hacer compañía sin decir nada</li>
              <li><span>Plan favorito</span>Manta, lluvia y cero notificaciones</li>
              <li><span>Debilidad</span>Los martes y los audios de 8 minutos</li>
            </ul>
          </div>
        </section>

        <section class="editorial-finale" id="pandilla-a">
          <p>“No tenés que poder con todo para merecer un abrazo.”</p>
          <a href="#pandi-title-a">Conocé a los demás Pobres Pandas <span>→</span></a>
        </section>
      </main>

      ${renderPrototypeFooter("Dirección A · Cuento editorial")}
    </div>
  `;
}

function renderDossierVariant() {
  return `
    <div class="dossier-page">
      <div class="dossier-ticker" aria-hidden="true">
        <span>POBRES PANDAS ✦ SENTIMIENTOS GRANDES ✦ POQUITAS GANAS ✦</span>
        <span>POBRES PANDAS ✦ SENTIMIENTOS GRANDES ✦ POQUITAS GANAS ✦</span>
      </div>

      <header class="dossier-nav">
        ${renderWordmark()}
        <span class="dossier-live"><i></i> Archivo abierto</span>
        <a href="#ficha-b">Ir a la ficha ↘</a>
      </header>

      <main class="dossier-board" id="ficha-b">
        <section class="dossier-window" aria-labelledby="pandi-title-b">
          <header class="dossier-window-bar">
            <div aria-hidden="true"><i></i><i></i><i></i></div>
            <p>pobres-pandas / personajes / pandi.pp</p>
            <span>№ 001</span>
          </header>

          <div class="dossier-layout">
            <aside class="dossier-index">
              <p>Índice del archivo</p>
              <ol>
                <li class="is-active"><span>01</span>Identidad</li>
                <li><span>02</span>Estado actual</li>
                <li><span>03</span>Cosas favoritas</li>
                <li><span>04</span>Notas sensibles</li>
              </ol>
              <div class="dossier-barcode" aria-label="Código de personaje 001">
                <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
            </aside>

            <article class="dossier-profile">
              <div class="dossier-heading">
                <p>Expediente confidencial-ish</p>
                <h1 id="pandi-title-b">PAN<span>DI</span></h1>
                <div class="dossier-stamp">PANDA<br />VERIFICADO</div>
              </div>

              <div class="dossier-content">
                <div class="dossier-photo">
                  <span>foto reciente*</span>
                  ${renderPandiPortrait()}
                  <p>*después de una siesta</p>
                </div>

                <dl class="dossier-facts">
                  <div><dt>Especie</dt><dd>Panda sensible</dd></div>
                  <div><dt>Pronombre</dt><dd>Él</dd></div>
                  <div><dt>Energía social</dt><dd><meter min="0" max="100" value="12">12%</meter> 12%</dd></div>
                  <div><dt>Estado</dt><dd>Haciendo lo posible</dd></div>
                  <div><dt>Combustible</dt><dd>Bambú + cariño</dd></div>
                  <div><dt>Riesgo</dt><dd>Podría encariñarse</dd></div>
                </dl>
              </div>

              <div class="dossier-bottom">
                <blockquote>“Si también estás cansado, podemos no hacer nada juntos.”</blockquote>
                <a href="#notas-b">Abrir notas personales <span>↗</span></a>
              </div>
            </article>
          </div>
        </section>

        <aside class="dossier-scraps" id="notas-b" aria-label="Notas sobre Pandi">
          <div class="dossier-note dossier-note-one">recordatorio:<br /><strong>tomar agüita</strong><br />y respirar</div>
          <div class="dossier-note dossier-note-two">nivel de ternura<br /><strong>fuera de norma</strong></div>
          <div class="dossier-pin">PP!</div>
        </aside>
      </main>

      ${renderPrototypeFooter("Dirección B · Expediente juguetón")}
    </div>
  `;
}

function renderNightVariant() {
  return `
    <div class="night-page">
      <header class="night-nav">
        ${renderWordmark()}
        <p>Historias para días difíciles</p>
        <a href="#historia-c">La historia <span>↓</span></a>
      </header>

      <main>
        <section class="night-hero" aria-labelledby="pandi-title-c">
          <div class="night-orbit night-orbit-one" aria-hidden="true"></div>
          <div class="night-orbit night-orbit-two" aria-hidden="true"></div>
          <div class="night-stars" aria-hidden="true">✦ · ✧ · ✦</div>
          <div class="night-portrait">${renderPandiPortrait()}</div>
          <div class="night-title">
            <p>Pobres Pandas presenta</p>
            <h1 id="pandi-title-c">Pandi</h1>
            <p class="night-subtitle">el arte silencioso de seguir intentando</p>
          </div>
          <a class="night-scroll" href="#historia-c"><span></span>Seguir leyendo</a>
        </section>

        <section class="night-story" id="historia-c" aria-labelledby="story-title-c">
          <p class="night-chapter">Capítulo uno · Un día más</p>
          <h2 id="story-title-c">Hay días en los que Pandi se siente muy pequeño.</h2>
          <div class="night-prose">
            <p>
              El mundo hace ruido. Todo parece urgente. Pandi se queda quieto
              hasta volver a escuchar su propia respiración.
            </p>
            <p>
              Entonces recuerda algo sencillo: avanzar también puede ser tomar
              agua, abrir la ventana o pedir que alguien se quede un rato.
            </p>
          </div>
        </section>

        <section class="night-manifesto">
          <p>No siempre está bien.</p>
          <p>No siempre puede.</p>
          <p class="is-bright">Pero nunca tiene que hacerlo solo.</p>
        </section>

        <section class="night-details" aria-label="Pequeñas certezas sobre Pandi">
          <p class="night-chapter">Tres pequeñas certezas</p>
          <ol>
            <li><span>01</span><p>El descanso no se gana.<br /><strong>Se necesita.</strong></p></li>
            <li><span>02</span><p>Estar sensible no es estar roto.<br /><strong>Es estar vivo.</strong></p></li>
            <li><span>03</span><p>Siempre hay lugar en la manta.<br /><strong>Acercate.</strong></p></li>
          </ol>
        </section>

        <section class="night-finale">
          <p>Este es Pandi.</p>
          <h2>Un pobre panda.<br />Uno de los nuestros.</h2>
          <a href="#pandi-title-c">Conocé a toda la pandilla <span>→</span></a>
        </section>
      </main>

      ${renderPrototypeFooter("Dirección C · Diario nocturno")}
    </div>
  `;
}

function renderPandiPortrait() {
  return `
    <svg class="pandi-portrait" viewBox="0 0 520 560" role="img" aria-label="Ilustración provisional de Pandi">
      <path class="pandi-bamboo" d="M424 464c-15-108-7-217 27-326M442 240l-56-43M445 201l48-54M430 302l-58-29M436 347l53-40" />
      <ellipse class="pandi-body" cx="260" cy="482" rx="139" ry="122" />
      <ellipse class="pandi-belly" cx="260" cy="475" rx="91" ry="84" />
      <circle class="pandi-ear" cx="151" cy="151" r="70" />
      <circle class="pandi-ear" cx="369" cy="151" r="70" />
      <ellipse class="pandi-head" cx="260" cy="265" rx="171" ry="167" />
      <ellipse class="pandi-patch pandi-patch-left" cx="193" cy="259" rx="55" ry="73" />
      <ellipse class="pandi-patch pandi-patch-right" cx="327" cy="259" rx="55" ry="73" />
      <ellipse class="pandi-eye-white" cx="200" cy="259" rx="17" ry="22" />
      <ellipse class="pandi-eye-white" cx="320" cy="259" rx="17" ry="22" />
      <circle class="pandi-eye" cx="203" cy="264" r="9" />
      <circle class="pandi-eye" cx="317" cy="264" r="9" />
      <circle class="pandi-eye-glint" cx="206" cy="260" r="3" />
      <circle class="pandi-eye-glint" cx="320" cy="260" r="3" />
      <ellipse class="pandi-blush" cx="155" cy="321" rx="25" ry="12" />
      <ellipse class="pandi-blush" cx="365" cy="321" rx="25" ry="12" />
      <path class="pandi-nose" d="M237 309c12-10 34-10 46 0-2 19-13 27-23 27s-21-8-23-27Z" />
      <path class="pandi-mouth" d="M260 335c0 16-11 25-25 25m25-25c0 16 11 25 25 25" />
      <path class="pandi-arm pandi-arm-left" d="M145 433c-35 27-51 68-34 86 17 19 53-4 75-39" />
      <path class="pandi-arm pandi-arm-right" d="M375 433c35 27 51 68 34 86-17 19-53-4-75-39" />
    </svg>
  `;
}

function renderWordmark() {
  return `<a class="pandi-wordmark" href="#" aria-label="Pobres Pandas, inicio"><span>pobres</span> pandas<i>●</i></a>`;
}

function renderPrototypeFooter(direction: string) {
  return `
    <footer class="prototype-page-footer">
      <p>${direction}</p>
      <p>Prototipo descartable · texto e ilustración provisionales</p>
      <code>${release.slice(0, 12)}</code>
    </footer>
  `;
}

function renderPrototypeSwitcher() {
  return `
    <nav class="prototype-switcher" aria-label="Cambiar variante del prototipo">
      <button type="button" data-prototype-previous aria-label="Variante anterior">←</button>
      <p><span>Prototipo</span><strong>${currentVariant} — ${variantName(currentVariant)}</strong></p>
      <button type="button" data-prototype-next aria-label="Variante siguiente">→</button>
    </nav>
  `;
}

function cycleVariant(direction: -1 | 1) {
  const currentIndex = variants.findIndex(({ key }) => key === currentVariant);
  const nextIndex =
    (currentIndex + direction + variants.length) % variants.length;
  const nextVariant = variants[nextIndex];

  if (!nextVariant) {
    return;
  }

  currentVariant = nextVariant.key;
  const nextParameters = new URLSearchParams(window.location.search);
  nextParameters.set("prototype", "pandi");
  nextParameters.set("variant", currentVariant);
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${nextParameters}`
  );
  renderPrototype();
}

function readVariant(value: string | null): VariantKey {
  return variants.some(({ key }) => key === value)
    ? (value as VariantKey)
    : "A";
}

function variantName(key: VariantKey) {
  return (
    variants.find((variant) => variant.key === key)?.name ?? variants[0].name
  );
}

function setDescription(content: string) {
  document
    .querySelector<HTMLMetaElement>("meta[name='description']")
    ?.setAttribute("content", content);
}
