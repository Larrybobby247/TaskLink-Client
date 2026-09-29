import React from 'react';
import LegalLayout from '../../components/public/LegalLayout.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { SITE } from '../../config/site.js';

const SECTIONS = [
  {
    heading: 'Who we are',
    paragraphs: [
      `${SITE.legalEntity} ("TaskLink", "we", "us") operates the TaskLink website and app, a marketplace where people post small tasks and other people apply to complete them. We are the controller of the personal data described in this policy.`,
      `Questions about this policy can be sent to ${SITE.supportEmail}.`,
    ],
  },
  {
    heading: 'Information we collect',
    list: [
      'Account details: your full name, username, email address, phone number and password (stored only in hashed form).',
      'Profile details: profile photo, bio, location, school, skills, portfolio items and availability.',
      'Marketplace activity: tasks you post, applications you send, orders, submissions, revisions, reviews, disputes and reports.',
      'Messages and files you send to other users or upload to tasks and submissions.',
      'Payment and payout details: transaction references and amounts, and, for workers who withdraw, the bank name, verified account name and the last four digits of the account number. Card details are entered on Paystack and are never stored by us.',
      'Technical data: IP address, device and browser information, and security logs such as sign-ins.',
    ],
  },
  {
    heading: 'How we use your information',
    list: [
      'To create and secure your account, including email verification and password resets.',
      'To operate the marketplace: showing tasks and profiles, matching applications, creating orders, and processing payments and withdrawals.',
      'To send service messages such as verification codes, application updates, payment confirmations and security alerts.',
      'To keep TaskLink safe: preventing fraud and abuse, reviewing reports and disputes, and enforcing our Terms.',
      'To improve the product, for example by understanding which features are used.',
      'To meet legal and regulatory obligations.',
    ],
  },
  {
    heading: 'Legal bases for processing',
    paragraphs: [
      'Where the Nigeria Data Protection Act, 2023 applies, we rely on: performance of our contract with you (providing the service), our legitimate interests (security, fraud prevention and improving TaskLink), compliance with legal obligations, and your consent where we ask for it, for example for optional marketing emails.',
    ],
  },
  {
    heading: 'Who we share information with',
    paragraphs: ['We do not sell your personal data. We share it only as needed to run TaskLink:'],
    list: [
      'Other users: your public profile (name, username, photo, bio, skills, ratings and reviews) is visible to others. When you apply for or are selected for a task, the other party can see relevant details and chat with you. We do not show your email, phone number or bank details to other users.',
      'Service providers who process data on our behalf: Paystack (payments and payouts), Cloudinary (image and file storage), Resend (transactional email) and our hosting and database providers.',
      'Authorities or professional advisers where required by law, or to protect the rights, safety and property of TaskLink and its users.',
    ],
  },
  {
    heading: 'Cookies and similar technologies',
    paragraphs: [
      'We use a secure, HTTP-only cookie to keep you signed in. We do not use advertising cookies. If we add analytics tools in future, we will update this policy.',
    ],
  },
  {
    heading: 'How long we keep data',
    paragraphs: [
      'We keep your account data while your account is active. Financial records, order history and dispute records are retained for as long as needed to meet accounting, legal and fraud-prevention requirements, even after an account is closed. Verification codes and password reset tokens expire automatically.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'We use industry-standard safeguards including hashed passwords, encrypted connections, rate limiting, access controls and audit logs for administrative actions. No system is perfectly secure, so please use a strong, unique password and tell us straight away if you suspect unauthorised access.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: ['Subject to applicable law, you may ask us to:'],
    list: [
      'Access the personal data we hold about you and receive a copy.',
      'Correct inaccurate or incomplete data (you can edit most details in Settings).',
      'Delete your data or deactivate your account, subject to records we must keep by law.',
      'Object to or restrict certain processing, or withdraw consent you previously gave.',
    ],
    },
  {
    heading: 'Children',
    paragraphs: ['TaskLink is not intended for anyone under 18. If you believe a minor has created an account, please contact us and we will take appropriate action.'],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: ['We may update this policy from time to time. If we make significant changes we will notify you in the app or by email. The date at the top shows when it was last updated.'],
  },
  {
    heading: 'Contact us',
    paragraphs: [`For any privacy question or to exercise your rights, email ${SITE.supportEmail}. You also have the right to complain to the Nigeria Data Protection Commission.`],
  },
];

export default function PrivacyPage() {
  usePageTitle('Privacy Policy');
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="Your privacy matters. This policy explains what information TaskLink collects, why we collect it, who we share it with, and the choices you have."
      sections={SECTIONS}
    />
  );
}
