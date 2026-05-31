import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FiAlertTriangle } from 'react-icons/fi';

const TOC = [
  { id: 'acceptance',       label: '1. Acceptance of Terms'       },
  { id: 'definitions',      label: '2. Definitions'                },
  { id: 'products-pricing', label: '3. Products & Pricing', sub: [
    { id: 'product-descriptions', label: '3.1 Product Descriptions' },
    { id: 'pricing-policy',       label: '3.2 Pricing Policy'       },
    { id: 'stock',                label: '3.3 Stock Availability'   },
  ]},
  { id: 'use-of-website',   label: '4. Use of the Website', sub: [
    { id: 'eligibility',          label: '4.1 Eligibility'          },
    { id: 'account-registration', label: '4.2 Account Registration' },
    { id: 'prohibited-content',   label: '4.3 Prohibited Content'   },
  ]},
  { id: 'orders-payment',      label: '5. Orders & Payment'                     },
  { id: 'delivery',            label: '6. Delivery'                              },
  { id: 'returns-refunds',     label: '7. Returns & Refunds'                     },
  { id: 'intellectual-property', label: '8. Intellectual Property'              },
  { id: 'ugc',                 label: '9. User-Generated Content'                },
  { id: 'loyalty',             label: '10. Loyalty Programme'                    },
  { id: 'promotions',          label: '11. Promotional Codes & Discounts'        },
  { id: 'liability',           label: '12. Limitation of Liability'              },
  { id: 'governing-law',       label: '13. Governing Law & Dispute Resolution'   },
];

const DEFINITIONS = [
  { term: '"We / Us / Our"',         def: 'House of Cambridge, the operator of houseofcambridge.co.uk and all associated services.' },
  { term: '"You / Our / Customer"',  def: 'Any individual who accesses our website, creates an account, or places an order.' },
  { term: '"Website"',               def: 'The e-commerce platform at houseofcambridge.co.uk and all related mobile applications.' },
  { term: '"Products"',              def: 'Electronics, home appliances, cosmetics, Baby Care, kitchen appliances, and other goods listed for sale on our website.' },
  { term: '"Account"',               def: 'A registered user profile on the Website, protected by login credentials.' },
  { term: '"Loyalty Programme"',     def: 'The House of Cambridge points-based rewards scheme available to registered customers.' },
  { term: '"Content"',               def: 'All text, images, logos, product descriptions, and other materials on the website.' },
];

const ALL_TOC_IDS = TOC.flatMap((t) => [t.id, ...(t.sub || []).map((s) => s.id)]);

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="text-[18px] font-black text-[#1A1A1A] pb-2.5 mb-4 border-b border-[#E9E9E9] scroll-mt-24">
      {children}
    </h2>
  );
}

function SubHeading({ id, children }) {
  return (
    <h3 id={id} className="text-[14px] font-bold text-[#1A1A1A] mt-5 mb-2 scroll-mt-24">
      {children}
    </h3>
  );
}

function Body({ children }) {
  return <p className="text-[13px] text-[#60717B] leading-relaxed mb-3">{children}</p>;
}

function Ul({ items }) {
  return (
    <ul className="space-y-1.5 mb-3 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-[#60717B] leading-relaxed">
          <span className="text-[#FFB700] mt-1 flex-shrink-0" aria-hidden="true">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsAndConditions() {
  const [active, setActive] = useState('acceptance');

  const scrollTo = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observers = ALL_TOC_IDS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-20% 0px -70% 0px' },
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Pages', href: '#' }, { label: 'Terms & Conditions' }]} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 mb-6">
        <div className="bg-[#F5F5F5] border border-[#E9E9E9] rounded-[10px] overflow-hidden flex items-center gap-6 px-8 py-7 relative">
          <div className="flex-1 min-w-0">
            <h1 className="text-[32px] font-black text-[#1A1A1A] leading-tight mb-1">Terms &amp; Conditions</h1>
            <p className="text-[13px] text-[#60717B] mb-5">
              Please read these terms carefully before using our website or placing any orders.
            </p>
            <dl className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: 'Version',        value: '1.0'           },
                { label: 'Last Updated',   value: '31 March 2026' },
                { label: 'Effective Date', value: '01 April 2026' },
                { label: 'Governing Law',  value: 'Sri Lanka'     },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-1">
                  <dt className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider">{label}:</dt>
                  <dd className="text-[12px] text-[#1A1A1A]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src="/images/misc/terms-hero-illustration.png"
            alt=""
            aria-hidden="true"
            className="hidden lg:block w-[220px] object-contain flex-shrink-0"
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 mb-6">
        <div className="bg-amber-50 border border-amber-300 rounded-[8px] px-5 py-4 flex gap-3" role="note">
          <FiAlertTriangle size={16} className="text-[#FFB700] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">Important — Please Read</p>
            <p className="text-[12px] text-[#60717B] leading-relaxed">
              By accessing House of Cambridge or placing an order on this website, you agree to be legally bound by
              these Terms &amp; Conditions. If you do not agree, please do not use this website. These Terms form a
              legally binding agreement between you and House of Cambridge.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-14 flex gap-6 items-start">

        <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-24" aria-label="Terms & Conditions contents">
          <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[#E9E9E9]">
              <span className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider">Contents</span>
            </div>
            <nav aria-label="Page sections">
              {TOC.map((item) => (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={`w-full text-left px-4 py-2 text-[12px] transition-colors border-l-[3px] ${
                      active === item.id
                        ? 'border-[#FFB700] bg-amber-50 text-[#FFB700] font-bold'
                        : 'border-transparent text-[#60717B] hover:text-[#1A1A1A] hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                  {item.sub?.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      aria-current={active === s.id ? 'true' : undefined}
                      className={`w-full text-left pl-7 pr-4 py-1.5 text-[11px] transition-colors border-l-[3px] ${
                        active === s.id
                          ? 'border-[#FFB700] bg-amber-50 text-[#FFB700] font-medium'
                          : 'border-transparent text-gray-400 hover:text-[#60717B]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-8">
          <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-7 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">

            <section aria-labelledby="acceptance">
              <SectionHeading id="acceptance">1. Acceptance of Terms</SectionHeading>
              <Body>
                These Terms and Conditions ("Terms") govern your use of houseofcambridge.co.uk and all associated
                services including account creation, loyalty programmes, live chat, and promotional activities.
              </Body>
              <Body>
                By using our Website, creating an account, or completing a purchase, you confirm that you have read,
                understood, and agree to be bound by these Terms. You also confirm that you are at least 18 years of
                age or accessing the website under the supervision of a parent or guardian, and you agree to access
                the Website only for lawful purposes.
              </Body>
            </section>

            <section className="mt-8" aria-labelledby="definitions">
              <SectionHeading id="definitions">2. Definitions</SectionHeading>
              <div className="overflow-x-auto rounded-[8px] border border-[#E9E9E9]">
                <table className="w-full text-[12px]">
                  <caption className="sr-only">Glossary of terms used in this document</caption>
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#E9E9E9]">
                      <th scope="col" className="text-left px-4 py-2.5 font-bold text-[#1A1A1A] w-[35%]">Term</th>
                      <th scope="col" className="text-left px-4 py-2.5 font-bold text-[#1A1A1A]">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {DEFINITIONS.map(({ term, def }) => (
                      <tr key={term} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-semibold text-[#1A1A1A] align-top">{term}</td>
                        <td className="px-4 py-2.5 text-[#60717B] leading-relaxed">{def}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="products-pricing">
              <SectionHeading id="products-pricing">3. Products &amp; Pricing</SectionHeading>
              <SubHeading id="product-descriptions">3.1 Product Descriptions</SubHeading>
              <Body>
                We make every effort to display products, colours, sizes, and descriptions as accurately as possible.
                However, we cannot guarantee that your screen's colour display accurately represents the actual product.
                Product descriptions, images, and specifications are provided for guidance. We reserve the right to
                make minor adjustments to product specifications without prior notice.
              </Body>
              <SubHeading id="pricing-policy">3.2 Pricing Policy</SubHeading>
              <Body>
                All prices are displayed in Sri Lankan Rupees (LKR) unless otherwise stated and are inclusive of
                applicable local taxes. We reserve the right to change prices at any time without prior notice.
                However, the price you see at the time of completing your order is the price you will pay. In the
                event of an obvious pricing error, we will contact you prior to processing your order.
              </Body>
              <Body>
                Product pricing at checkout will always reflect the confirmed amount stated on your Order Confirmation
                email from us.
              </Body>
              <SubHeading id="stock">3.3 Stock Availability</SubHeading>
              <Body>
                All orders are subject to stock availability. In the event that an item becomes unavailable after
                your order is confirmed, we will notify you and issue a full refund if applicable.
              </Body>
            </section>

            <section className="mt-8" aria-labelledby="use-of-website">
              <SectionHeading id="use-of-website">4. Use of the Website</SectionHeading>
              <SubHeading id="eligibility">4.1 Eligibility</SubHeading>
              <Body>
                Our website is available to users who are 18 years of age or older. Users under 18 may use the
                website only with the involvement and consent of a parent or legal guardian who agrees to these Terms
                on their behalf.
              </Body>
              <SubHeading id="account-registration">4.2 Account Registration</SubHeading>
              <Body>
                To access features including order history, wishlist, loyalty points, and saved addresses, you must
                register for an account. You agree to:
              </Body>
              <Ul items={[
                'Provide accurate, complete, and current registration information',
                'Maintain the security of your password and account',
                'Notify us immediately of any unauthorised access to your account',
                'Accept responsibility for all activities that occur under your account',
                'Not transfer your account to any other person or entity',
              ]} />
              <SubHeading id="prohibited-content">4.3 Prohibited Content</SubHeading>
              <Body>You agree not to use the website to:</Body>
              <Ul items={[
                'Engage in any fraudulent, abusive, or otherwise illegal activity',
                'Attempt to gain unauthorised access to other users\' accounts',
                'Transmit spam, malware, viruses, or any harmful code',
                'Scrape, data-mine, or extract data from the website without written permission',
                'Post false, misleading, or defamatory product reviews without genuine experience of the product',
                'Interfere with the proper functioning of the website or our servers',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="orders-payment">
              <SectionHeading id="orders-payment">5. Orders &amp; Payment</SectionHeading>
              <Body>
                Placing an order constitutes an offer to purchase. An order is only confirmed when you receive an
                Order Confirmation email sent from us with an assigned Order ID.
              </Body>
              <Body>We use a manual payment system. After placing your order, payment instructions will be provided. By completing payment, you confirm that:</Body>
              <Ul items={[
                'You are the authorised holder of the payment method used',
                'Your payment information is accurate and complete',
                'Your payment method has sufficient funds for the transaction',
              ]} />
              <Body>
                We reserve the right to refuse or cancel any order at our discretion, including cases where payment
                fraud is suspected. We do not have access to your full card number or CVV codes.
              </Body>
            </section>

            <section className="mt-8" aria-labelledby="delivery">
              <SectionHeading id="delivery">6. Delivery</SectionHeading>
              <Body>
                Delivery timeframes are provided at checkout and in your Order Confirmation email. These are estimates
                only and are not guaranteed. Delays may occur due to circumstances beyond our control, including
                third-party carrier issues, weather conditions, and public holidays.
              </Body>
              <Ul items={[
                'House of Cambridge is not liable for delays caused by third-party shipping carriers',
                'Delivery addresses must be complete and accurate — we are not responsible for failed deliveries due to insufficient address details. Redelivery charges may apply',
                'Risk of loss passes to you upon successful delivery',
                'For orders that have not arrived within the expected timeframes, please contact our support team with your Order ID for assistance',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="returns-refunds">
              <SectionHeading id="returns-refunds">7. Returns &amp; Refunds</SectionHeading>
              <Body>
                Our full Returns &amp; Refunds Policy is detailed in a separate document. Key points are summarised below:
              </Body>
              <Ul items={[
                'Returns are accepted within 30 days of the delivery date',
                'Items must be in original, unused condition with all original packaging with tags attached',
                'Certain items (e.g. food, cosmetics, personalised products) are not eligible for returns',
                'Refunds are credited to the original payment method within 7–14 business days of receiving the return',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="intellectual-property">
              <SectionHeading id="intellectual-property">8. Intellectual Property</SectionHeading>
              <Body>
                All content on this website, including but not limited to text, product images, logos, page graphics,
                page layout, and software, is the property of House of Cambridge or its content suppliers and is
                protected by applicable intellectual property laws. You are granted a limited, non-exclusive,
                non-transferable licence to access and use the website for personal purposes only. You may not:
              </Body>
              <Ul items={[
                'Reproduce, distribute, modify, or create derivative works from any website content without prior written permission',
                'Use our logo or trademarks in any manner without our prior written consent',
                'Frame or embed our website within another website without permission',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="ugc">
              <SectionHeading id="ugc">9. User-Generated Content (Reviews &amp; Ratings)</SectionHeading>
              <Body>
                Registered customers who have completed a verified purchase may submit product reviews and ratings.
                By submitting a review, you grant us a non-exclusive, royalty-free licence to display that content
                on our website and in marketing materials. You agree that reviews must:
              </Body>
              <Ul items={[
                'Be truthful and based on genuine personal experience with the product',
                'Not contain offensive, defamatory, or otherwise inappropriate language',
                'Not include spam or references to other websites',
                'Not violate the privacy or impersonate the identity of any other person',
              ]} />
              <Body>We reserve the right to remove reviews that violate these guidelines without notice.</Body>
            </section>

            <section className="mt-8" aria-labelledby="loyalty">
              <SectionHeading id="loyalty">10. Loyalty Programme</SectionHeading>
              <Body>
                The House of Cambridge Loyalty Programme awards points on eligible purchases to registered customers.
                The following terms apply:
              </Body>
              <Ul items={[
                'Points are awarded only on qualifying purchases and are not earned on gift cards, shipping fees, or promotional credit',
                'Points expire after 12 months of account inactivity',
                'Redeemable points discounts are applied during checkout (100 points = Rs 30 off)',
                'Point balances are visible on the Loyalty tab of your account Dashboard',
                'We reserve the right to modify, suspend, or terminate the Loyalty Programme at any time with 30 days\' notice to enrolled members',
                'Points are non-transferable and may not be combined between accounts',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="promotions">
              <SectionHeading id="promotions">11. Promotional Codes &amp; Discounts</SectionHeading>
              <Body>Promotional codes and discount offers are subject to the following conditions:</Body>
              <Ul items={[
                'Only one promotional code may be applied per order unless explicitly stated otherwise',
                'Codes are non-transferable and may not be exchanged for cash or used in combination with other promotions unless specified',
                'Codes are only valid for the timeframe specified — expired codes will not be honoured or reactivated',
                'We reserve the right to revoke promotional codes if obtained or distributed through unauthorised means',
                'Codes are only valid for the applicable products specified and may not apply to sale items or clearance goods',
              ]} />
            </section>

            <section className="mt-8" aria-labelledby="liability">
              <SectionHeading id="liability">12. Limitation of Liability</SectionHeading>
              <Body>
                To the fullest extent permitted by applicable law, House of Cambridge shall not be liable for any
                indirect, incidental, consequential, or punitive damages, or any loss of profits or revenue, whether
                incurred directly or indirectly.
              </Body>
              <Body>
                Our total liability to you for any claims arising from your use of this website or purchases of
                products shall not exceed the total amount paid by you for the relevant order(s).
              </Body>
              <SubHeading id="website-availability">Website Availability</SubHeading>
              <Body>
                We do not guarantee that the website will be available at all times or be free from errors or
                interruptions. We may suspend access to the website for maintenance, updates, or unforeseen technical
                errors without notice.
              </Body>
            </section>

            <section className="mt-8" aria-labelledby="governing-law">
              <SectionHeading id="governing-law">13. Governing Law &amp; Dispute Resolution</SectionHeading>
              <Body>
                These Terms and your use of our website are governed by and construed in accordance with the laws of
                Sri Lanka. Any dispute arising from your use of this website or purchase from House of Cambridge shall
                be submitted first to negotiation or mediation with our customer support team. If unresolved, disputes
                shall be submitted to the courts of Sri Lanka.
              </Body>
              <Body>
                To report any issues or start a formal complaint, please contact our team at{' '}
                <a
                  href="mailto:info@houseofcambridge.co.uk"
                  className="font-semibold text-[#1A1A1A] underline underline-offset-2 hover:text-[#FFB700] transition-colors"
                >
                  info@houseofcambridge.co.uk
                </a>
                .
              </Body>
            </section>

          </div>
        </main>
      </div>
    </Layout>
  );
}