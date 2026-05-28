import { Component } from '@angular/core';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LegalLayoutComponent],
  template: `
    <app-legal-layout title="Privacy Policy" lastUpdated="May 28, 2026">
      <p>
        This policy explains how <strong>Wibo Systems</strong> handles personal data when you
        use <strong>wibotodo</strong>. We try to keep it short and clear.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> your email address, password (stored as a
          bcrypt hash — we never see your plaintext password), and optional display name.
        </li>
        <li>
          <strong>Content you create:</strong> todo titles, descriptions, due dates, and any
          images you attach.
        </li>
        <li>
          <strong>Technical data:</strong> minimal server logs (IP address, timestamp,
          request path) kept for up to 30 days for security and debugging.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <p>We use your data only to:</p>
      <ul>
        <li>authenticate you and keep your session active (JWT tokens);</li>
        <li>store and display your todos and images;</li>
        <li>compute your personal analytics (open count, completion rate, weekly activity);</li>
        <li>diagnose errors and protect against abuse.</li>
      </ul>
      <p>
        <strong>We do not</strong> sell, rent, or share your personal data with third parties
        for advertising or marketing purposes.
      </p>

      <h2>3. Where your data lives</h2>
      <p>
        Your data is stored on servers operated by Hetzner Online GmbH in the European
        Union. Communication between your browser and our servers is encrypted via HTTPS.
      </p>

      <h2>4. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> the personal data we hold about you (you already see all
          of it in your dashboard);
        </li>
        <li>
          <strong>Export</strong> your todos as PDF or Excel from the Reports tab at any
          time;
        </li>
        <li><strong>Correct</strong> or update your information from your account;</li>
        <li>
          <strong>Delete</strong> your account and all associated data — contact us via
          <a href="https://wibosystems.com" target="_blank" rel="noopener">wibosystems.com</a>
          and we will action it within 7 days.
        </li>
      </ul>
      <p>
        These rights are guaranteed under Indonesia's Personal Data Protection Law
        (UU PDP, 2024) and, where applicable, the European Union's GDPR.
      </p>

      <h2>5. Cookies &amp; tracking</h2>
      <p>
        We use a single browser storage entry to keep your login session active
        (<code>wibotodo.token</code>). We do not use third-party analytics, advertising
        trackers, or cross-site cookies.
      </p>

      <h2>6. Children</h2>
      <p>
        wibotodo is not intended for users under 13. We do not knowingly collect data from
        children. If you believe a child has provided us their data, contact us and we will
        delete it.
      </p>

      <h2>7. Demo account</h2>
      <p>
        The "Try the demo" account (<code>demo&#64;wibotodo.app</code>) is shared and may be
        reset periodically. Do not store anything sensitive there.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We will notify you of material changes via the Service or by email. Continued use
        constitutes acceptance.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions or data requests:
        <a href="https://wibosystems.com" target="_blank" rel="noopener">wibosystems.com</a>.
      </p>
    </app-legal-layout>
  `,
})
export class PrivacyComponent {}
