import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found");
}

const release = import.meta.env.VITE_RELEASE_SHA ?? "local";
document.documentElement.dataset.release = release;

app.innerHTML = `
  <main>
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
