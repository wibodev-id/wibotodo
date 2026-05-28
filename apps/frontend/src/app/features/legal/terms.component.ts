import { Component } from '@angular/core';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [LegalLayoutComponent],
  template: `
    <app-legal-layout title="Terms of Service" lastUpdated="May 28, 2026">
      <h2>1. About this service</h2>
      <p>
        <strong>wibotodo</strong> ("the Service") is a personal todo list and productivity
        application operated by <strong>Wibo Systems</strong>
        (<a href="https://wibosystems.com" target="_blank" rel="noopener">wibosystems.com</a>),
        based in Indonesia.
      </p>

      <h2>2. Eligibility &amp; account</h2>
      <p>
        You must be at least 13 years old to create an account. You are responsible for
        keeping your password confidential and for all activity that happens under your
        account.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>upload illegal, infringing, harmful, or harassing content;</li>
        <li>attempt to compromise the security or integrity of the Service;</li>
        <li>send automated requests beyond reasonable use;</li>
        <li>impersonate another person or misrepresent your identity.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You retain ownership of the todos, descriptions, and images you create. You grant
        Wibo Systems a limited, non-exclusive license to store, process, and display your
        content solely to operate the Service for you.
      </p>

      <h2>5. Service availability</h2>
      <p>
        The Service is provided <strong>"as is"</strong> and may be modified, suspended, or
        discontinued at any time. We do not guarantee uninterrupted availability and are not
        liable for data loss caused by service interruption, account termination, or your
        own actions.
      </p>

      <h2>6. Termination</h2>
      <p>
        You may delete your account at any time from the settings page or by contacting us.
        We may suspend or terminate your account if you violate these Terms.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Wibo Systems shall not be liable for any
        indirect, incidental, or consequential damages arising from your use of the Service.
      </p>

      <h2>8. Changes to these terms</h2>
      <p>
        We may update these Terms occasionally. Material changes will be communicated via
        the Service or by email. Continued use after a change constitutes acceptance.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Indonesia, without regard to
        its conflict of laws principles.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about these Terms, reach out via
        <a href="https://wibosystems.com" target="_blank" rel="noopener">wibosystems.com</a>.
      </p>
    </app-legal-layout>
  `,
})
export class TermsComponent {}
