import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="home-page">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Carpool 2026</p>
          <h1>Optimize your carpool routing with a modern web app</h1>
          <p>
            Plan efficient pickup orders, reduce commute time, and manage weekly carpool routes with a simple web app built for teams and commuters.
          </p>
          <div class="actions">
            <a class="button button-primary" href="/login">Sign in</a>
            <a class="button button-secondary" href="/register">Create account</a>
          </div>
        </div>
      </section>

      <section class="features">
        <h2>What this app offers</h2>
        <ul>
          <li>Google Maps-backed route optimization</li>
          <li>Automatic pickup order generation</li>
          <li>Weekly route planning and driver rotation</li>
          <li>Saved postal codes and multitier route templates</li>
        </ul>
      </section>
    </main>
  `,
  styles: [
    `
      .home-page {
        padding: 3rem 1.5rem;
        max-width: 960px;
        margin: 0 auto;
        color: #1f2937;
      }

      .hero {
        display: grid;
        gap: 1.5rem;
        margin-bottom: 3rem;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #6366f1;
        font-weight: 700;
        margin: 0 0 0.75rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.25rem, 4vw, 3.5rem);
        line-height: 1.05;
      }

      p {
        max-width: 56rem;
        line-height: 1.75;
        margin: 1.5rem 0 0;
        color: #4b5563;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 2rem;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        padding: 0 1.25rem;
        border-radius: 9999px;
        font-weight: 600;
        text-decoration: none;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      .button:hover {
        transform: translateY(-1px);
      }

      .button-primary {
        background: #4338ca;
        color: white;
      }

      .button-secondary {
        border: 1px solid #4338ca;
        color: #4338ca;
      }

      .features {
        padding: 2rem 0;
      }

      .features h2 {
        margin-top: 0;
        font-size: 2rem;
      }

      .features ul {
        margin: 1rem 0 0;
        padding-left: 1.25rem;
        color: #374151;
      }

      .features li {
        margin-bottom: 0.75rem;
      }

      @media (min-width: 768px) {
        .hero {
          gap: 2.5rem;
        }
      }
    `
  ]
})
export class HomeComponent {}
