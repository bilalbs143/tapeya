<?php

namespace Database\Seeders;

use App\Models\StaticPage;
use Illuminate\Database\Seeder;

class StaticPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => $this->privacyPolicyHtml(),
            ],
            [
                'title' => 'Terms of Use',
                'slug' => 'terms-of-use',
                'content' => $this->termsOfUseHtml(),
            ],
        ];

        foreach ($pages as $page) {
            StaticPage::updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'content' => $page['content'],
                ]
            );
        }
    }

    private function termsOfUseHtml(): string
    {
        return <<<'HTML'
<article class="legal-doc">
  <h1>Tapeya — Terms of Use</h1>

  <p>Last updated: April 2026</p>

  <p>These Terms of Use (“Terms”) govern your access to and use of Tapeya’s websites, mobile applications, and related services (together, the “Service”). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>

  <h2>1. Who we are</h2>

  <p>Tapeya (“we”, “us”, “our”) provides tools for cricket tournaments, scoring, profiles, and related features. Contact: hello@tapeya.com.</p>

  <h2>2. Eligibility and accounts</h2>

  <ul>
    <li>You must provide accurate registration information and keep it up to date.</li>
    <li>You are responsible for all activity under your account and for keeping any login credentials or devices secure.</li>
    <li>We may suspend or close accounts that violate these Terms or misuse the Service.</li>
  </ul>

  <h2>3. Acceptable use</h2>

  <p>You agree not to:</p>

  <ul>
    <li>Use the Service in any unlawful way or to harm others.</li>
    <li>Attempt to access systems, data, or accounts you are not authorised to use.</li>
    <li>Upload malware, scrape the Service in a way that overloads or damages it, or reverse engineer the Service except where the law allows.</li>
    <li>Impersonate another person or misrepresent your affiliation.</li>
    <li>Use the Service to send spam or harass other users.</li>
  </ul>

  <h2>4. User content and conduct</h2>

  <ul>
    <li>You may submit content (for example profiles, tournament data, or messages). You retain your rights in your content, but you give us a licence to host, display, and process it as needed to run the Service.</li>
    <li>You are responsible for content you submit and for having the rights to share it.</li>
    <li>We may remove content or restrict features where we reasonably believe there is a breach of these Terms or a legal or safety risk.</li>
  </ul>

  <h2>5. Tournaments, scoring, and results</h2>

  <ul>
    <li>Features such as schedules, scoring, and statistics depend on user input and system processing. We do not guarantee that all data is complete, error-free, or official for any competition.</li>
    <li>Organisers and participants are responsible for the accuracy of information they enter and for complying with the rules of their leagues or bodies.</li>
  </ul>

  <h2>6. Shop and payments (if applicable)</h2>

  <ul>
    <li>Product listings, prices, and availability are shown as provided and may change.</li>
    <li>Orders are subject to acceptance, payment, and shipping or fulfilment terms shown at checkout or in separate notices.</li>
    <li>Taxes and duties may apply depending on your location.</li>
  </ul>

  <h2>7. Intellectual property</h2>

  <ul>
    <li>The Service, its branding, and our materials are owned by Tapeya or our licensors. You may not copy or use them except as allowed by these Terms or with our written permission.</li>
    <li>You may not use our trademarks without consent.</li>
  </ul>

  <h2>8. Third-party services</h2>

  <p>The Service may link to or integrate third parties (for example payment or map providers). Their terms and privacy notices apply to your use of those services.</p>

  <h2>9. Disclaimers</h2>

  <ul>
    <li>The Service is provided “as is” and “as available”. We disclaim warranties to the fullest extent permitted by law, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
    <li>We do not guarantee uninterrupted or error-free operation.</li>
  </ul>

  <h2>10. Limitation of liability</h2>

  <p>To the fullest extent permitted by law, Tapeya and its team will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the Service. Our total liability for any claim relating to the Service is limited to the amount you paid us for the Service in the twelve months before the claim (or, if none, to zero).</p>

  <h2>11. Changes</h2>

  <p>We may update these Terms from time to time. We will post the updated version and may notify you where appropriate. Continued use after changes means you accept the new Terms.</p>

  <h2>12. Termination</h2>

  <p>We may suspend or terminate access to the Service if you breach these Terms or if we need to for legal, security, or operational reasons. You may stop using the Service at any time.</p>

  <h2>13. Governing law</h2>

  <p>These Terms are governed by the laws applicable in the jurisdiction we designate for Tapeya’s operations, without regard to conflict-of-law rules, unless mandatory local laws require otherwise.</p>

  <h2>14. Contact</h2>

  <p>Questions about these Terms: hello@tapeya.com</p>
</article>
HTML;
    }

    private function privacyPolicyHtml(): string
    {
        return <<<'HTML'
<article class="legal-doc">
  <h1>Tapeya — Privacy Policy</h1>

  <p>Last updated: April 2026</p>

  <p>This Privacy Policy explains how Tapeya (“we”, “us”, “our”) collects, uses, stores, and shares information when you use our websites, mobile applications, and related services (the “Service”). If you do not agree with this Policy, please do not use the Service.</p>

  <p>Contact: hello@tapeya.com</p>

  <h2>1. Who this applies to</h2>

  <p>This Policy applies to visitors, registered users, organisers, players, and anyone who interacts with the Service.</p>

  <h2>2. Information we collect</h2>

  <p>We may collect:</p>

  <ul>
    <li>Account and profile data: for example name, nickname, phone number, email address, avatar, and role information you choose to provide.</li>
    <li>Authentication data: we may use one-time codes (OTP) sent to your phone or email to verify your identity.</li>
    <li>Usage data: for example device type, app version, log data, and how you navigate the Service (to improve performance and security).</li>
    <li>Content you submit: tournament details, match or scoring data, orders, messages, and other information you add to the Service.</li>
    <li>Payment-related data: when you make purchases, payment processors may collect billing details; we typically receive limited confirmation data, not full card numbers stored on our servers unless we state otherwise in product-specific notices.</li>
  </ul>

  <h2>3. How we use information</h2>

  <p>We use information to:</p>

  <ul>
    <li>Create and secure your account and provide the Service.</li>
    <li>Run tournaments, scoring, notifications, and features you request.</li>
    <li>Process orders and communicate about transactions.</li>
    <li>Send service messages (for example OTP, security alerts, or important updates).</li>
    <li>Improve, analyse, and protect the Service; detect fraud and abuse.</li>
    <li>Comply with law and enforce our Terms of Use.</li>
  </ul>

  <h2>4. Legal bases (where required)</h2>

  <p>Where applicable law requires a “legal basis”, we rely on:</p>

  <ul>
    <li>Performance of a contract (providing the Service you asked for).</li>
    <li>Legitimate interests (security, analytics, product improvement), balanced against your rights.</li>
    <li>Consent, where we ask for it (for example certain marketing or optional features).</li>
    <li>Legal obligation.</li>
  </ul>

  <h2>5. Sharing information</h2>

  <p>We may share information:</p>

  <ul>
    <li>With service providers who help us host, deliver SMS or email, analytics, payments, or customer support, under contracts that limit their use.</li>
    <li>With other users where the Service is designed to show information (for example public profiles or tournament listings).</li>
    <li>If required by law, court order, or to protect rights, safety, and security.</li>
    <li>In connection with a merger, acquisition, or sale of assets, with notice where required.</li>
  </ul>

  <p>We do not sell your personal information in the traditional “data broker” sense.</p>

  <h2>6. Retention</h2>

  <p>We keep information only as long as needed for the purposes above, including legal, tax, and dispute resolution needs. When data is no longer needed, we delete or anonymise it where feasible.</p>

  <h2>7. Security</h2>

  <p>We use reasonable technical and organisational measures to protect information. No method of transmission or storage is 100% secure.</p>

  <h2>8. Your choices and rights</h2>

  <p>Depending on where you live, you may have rights to:</p>

  <ul>
    <li>Access, correct, or delete certain personal data.</li>
    <li>Object to or restrict certain processing.</li>
    <li>Withdraw consent where processing is consent-based.</li>
    <li>Lodge a complaint with a data protection authority.</li>
  </ul>

  <p>To exercise these rights, contact hello@tapeya.com. We may need to verify your identity before responding.</p>

  <h2>9. Children</h2>

  <p>The Service is not directed at children under the age required by local law to consent without a parent. We do not knowingly collect personal information from those children. If you believe we have, contact us and we will take appropriate steps.</p>

  <h2 id="age-suitability">10. Age suitability</h2>

  <p>This section summarises how Tapeya is intended to be used and who it is suitable for. You may share this page with app stores or parents as supplemental information alongside our age rating disclosures.</p>

  <ul>
    <li><strong>What Tapeya is:</strong> Tapeya is a sports and community platform focused on cricket tournaments, scoring, schedules, profiles, highlights, and related features (including optional shop or organiser tools where available).</li>
    <li><strong>Typical audience:</strong> The Service is designed for teens and adults who participate in or follow amateur or organised cricket. Some regions require parental involvement for minors; where that applies, a parent or guardian should supervise account creation and use.</li>
    <li><strong>User-generated content:</strong> Users may upload or post content such as profile photos, match information, messages, or media. Content reflects what users choose to share; we provide tools and rules to reduce misuse, but we cannot guarantee that all user content will be free of strong language, competitive banter, or occasional mature themes.</li>
    <li><strong>Commerce:</strong> Where the Service includes a shop or payments, purchases are ordinary e-commerce transactions. We do not operate real-money gambling, sweepstakes, or wagering through the Service.</li>
    <li><strong>Safety and reporting:</strong> If you see content or behaviour that appears unsafe, illegal, or inappropriate, contact us at hello@tapeya.com with relevant details so we can review and take appropriate action consistent with our Terms of Use and policies.</li>
    <li><strong>Alignment with app store ratings:</strong> Our responses in platform age-rating questionnaires (including Apple’s) are answered honestly based on current features. If features change materially, we will update both the product and this section where needed.</li>
  </ul>

  <h2>11. International transfers</h2>

  <p>We may process and store information in countries other than your own. Where required, we use appropriate safeguards (for example contractual clauses) for cross-border transfers.</p>

  <h2>12. Cookies and similar technologies</h2>

  <p>We may use cookies, local storage, or similar technologies for sign-in, preferences, analytics, and security. You can control some of these through your browser or device settings.</p>

  <h2>13. Changes to this Policy</h2>

  <p>We may update this Policy from time to time. We will post the new version and update the “Last updated” date. For material changes, we may provide additional notice.</p>

  <h2>14. Contact</h2>

  <p>Privacy questions or requests: hello@tapeya.com</p>
</article>
HTML;
    }
}
