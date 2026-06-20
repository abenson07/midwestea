import type { PageSection } from "@/lib/site-config";

export const privacyPolicySections: PageSection[] = [
  {
    type: "component",
    component: "Header 64",
    props: {
      heading: "Privacy Policy",
      description: <strong>Last Updated: 11/22/2024</strong>,
    },
  },
  {
    type: "component",
    component: "Content 7",
    props: {
      noTopPadding: true,
      children: (
        <div>
          <h4>Information We Collect</h4>
          <p>
            We collect personal information that you provide when accessing or using MidwestEA
            services, including:
          </p>
          <ul role="list">
            <li>Name, email address, phone number, and mailing address</li>
            <li>Payment and billing details</li>
            <li>Course enrollment and completion data</li>
            <li>Uploaded documents required for programs (e.g., ID, certifications)</li>
            <li>
              Technical information such as IP address, device type, browser, and usage patterns
            </li>
          </ul>
          <p>
            We collect this information to deliver training, maintain course records, provide
            support, and improve our services.
          </p>
          <h4>How We Use Your Information</h4>
          <p>MidwestEA uses your information to:</p>
          <ul role="list">
            <li>Process enrollments and payments</li>
            <li>Deliver online courses, blended programs, and skills evaluations</li>
            <li>Issue certifications and maintain training records</li>
            <li>Communicate updates, class information, and support messages</li>
            <li>Improve website performance and enhance the student experience</li>
            <li>Meet regulatory, compliance, and accreditation requirements</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your information to third parties.
          </p>
          <h4>How We Share Your Information</h4>
          <p>We may share your information with:</p>
          <ul role="list">
            <li>
              Third-party vendors who support course delivery, payments, scheduling, and
              certification systems
            </li>
            <li>Accrediting bodies or regulatory agencies when required</li>
            <li>Organizations requesting verification of your certification, with your consent</li>
            <li>Instructors and authorized MidwestEA staff who need access for training purposes</li>
          </ul>
          <p>All partners are required to protect your information according to industry standards.</p>
          <h4>Payment Information</h4>
          <p>
            Payment transactions are processed by secure, third-party payment providers.
            <br />
            MidwestEA does not store full credit card numbers or sensitive financial data on our
            servers.
          </p>
          <h4>Cookies and Tracking Technologies</h4>
          <p>We use cookies and similar technologies to:</p>
          <ul role="list">
            <li>Maintain login sessions</li>
            <li>Remember user preferences</li>
            <li>Analyze site usage and improve functionality</li>
            <li>Track marketing performance and website analytics</li>
          </ul>
          <p>
            You may disable cookies through your browser settings, though some features may not
            function properly.
          </p>
          <h4>Data Retention</h4>
          <p>
            We retain course and certification records to meet regulatory requirements and provide
            verification when needed.
            <br />
            Personal account information is retained only as long as necessary to provide services
            or comply with the law.
          </p>
          <h4>Security Measures</h4>
          <p>
            We use administrative, technical, and physical safeguards to protect your information,
            including:
          </p>
          <ul role="list">
            <li>Encrypted data transmission</li>
            <li>Secure server environments</li>
            <li>Access controls for internal staff</li>
            <li>Regular system monitoring</li>
          </ul>
          <p>However, no online system is 100% secure. You share information at your own risk.</p>
          <h4>Your Rights and Choices</h4>
          <p>Depending on your location, you may have the right to:</p>
          <ul role="list">
            <li>Access your personal information</li>
            <li>Update or correct your information</li>
            <li>Request deletion of your data</li>
            <li>Limit certain types of data use</li>
            <li>Request a copy of your records</li>
          </ul>
          <p>To exercise these rights, contact us using the information below.</p>
          <h4>Children&rsquo;s Privacy</h4>
          <p>
            Our courses are intended for individuals <strong>13 years and older</strong>.
            <br />
            We do not knowingly collect information from children under 13 without parental consent.
          </p>
          <h4>Third-Party Links</h4>
          <p>
            Our website may contain links to third-party sites.
            <br />
            MidwestEA is not responsible for the privacy practices or content of these external
            websites.
          </p>
          <h4>Changes to This Policy</h4>
          <p>
            We may update this Privacy Policy from time to time.
            <br />
            Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date.
            <br />
            Continued use of our services indicates acceptance of the revised policy.
          </p>
          <h4>Contact Information</h4>
          <p>For questions about this Privacy Policy or your data, contact:</p>
          <p>
            <strong>Midwest Emergency Academy</strong>
            <br />
            Email:{" "}
            <a href="mailto:info@midwestea.com">
              <strong>info@midwestea.com</strong>
            </a>
            <br />
            Phone: <strong>913-712-4560 EXT #800</strong>
            <br />
            Website:{" "}
            <a href="http://www.midwestea.com">
              <strong>www.midwestea.com</strong>
            </a>
          </p>
        </div>
      ),
    },
  },
];
