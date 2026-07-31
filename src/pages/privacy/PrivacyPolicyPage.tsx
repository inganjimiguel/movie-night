import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          onClick={() => void navigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: August 1, 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-gray-300">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">1. Information We Collect</h2>
            <p>
              Movie Night is a free streaming discovery platform. We do not require you to create an
              account or provide personal information to browse content. We may collect non-personal
              data such as your browser type, device information, and pages visited to improve our
              service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">2. Local Storage</h2>
            <p>
              We use your browser&apos;s local storage to save your preferences, liked titles, watch
              queues, and continue-watching progress. This data stays on your device and is never
              sent to our servers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">3. Cookies and Third-Party Services</h2>
            <p>
              We use Google Analytics to understand how visitors interact with our site. Google
              Analytics uses cookies to collect anonymous usage data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">5. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Anonymous,
              aggregated usage data may be shared with analytics providers to help us improve the
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">6. Children&apos;s Privacy</h2>
            <p>
              Movie Night is not directed at children under the age of 13. We do not knowingly
              collect information from children. If you believe a child has provided us with personal
              data, please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted on this
              page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please reach out to us at{' '}
              <a
                href="mailto:themovienightscorps@gmail.com"
                className="text-red-400 underline underline-offset-2 transition-colors hover:text-red-300"
              >
                themovienightscorps@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
