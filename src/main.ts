import "./style.css";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("Application root was not found");
}

const release = import.meta.env.VITE_RELEASE_SHA ?? "local";
document.documentElement.dataset.release = release;

appRoot.innerHTML = `
  <div class="pandi-page">
    <header class="site-header">
      <a class="wordmark" href="#pandi" aria-label="Pobres Pandas, inicio">
        <span>pobres</span> pandas<i aria-hidden="true"></i>
      </a>
      <p>Archivo de personajes <span>01 / Pandi</span></p>
      <p class="header-promise">Historias para días difíciles</p>
    </header>

    <main>
      <section class="pandi-hero" id="pandi" aria-labelledby="pandi-title">
        <div class="hero-copy">
          <p class="kicker">Un pobre panda, como todos nosotros</p>
          <h1 id="pandi-title">Hola, soy <em>Pandi.</em></h1>
          <p class="hero-intro">
            Tengo un corazón gigante, una batería chiquita y un lugar libre
            abajo de la manta.
          </p>
          <p class="hero-caption">Personaje 01 · Pobres Pandas</p>
        </div>

        <div class="hero-art">
          <div class="portrait-backdrop" aria-hidden="true"></div>
          <span class="portrait-sticker">100% abrazable</span>
          ${renderPandiPortrait()}
          <p class="portrait-note">hoy hice lo que pude ♡</p>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>Pandi · Personaje 01</p>
      <p>Hecho con sentimientos grandes y poquitas ganas</p>
      <code data-testid="release"></code>
    </footer>
  </div>
`;

const releaseElement = appRoot.querySelector<HTMLElement>(
  "[data-testid='release']"
);

if (!releaseElement) {
  throw new Error("Release indicator was not found");
}

releaseElement.textContent = release.slice(0, 12);

function renderPandiPortrait() {
  return `
    <svg class="pandi-portrait" viewBox="0 0 520 560" role="img" aria-label="Ilustración de Pandi">
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
