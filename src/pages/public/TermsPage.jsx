import React from 'react';
import LegalLayout from '../../components/public/LegalLayout.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { SITE } from '../../config/site.js';

const SECTIONS = [
  {
    heading: 'About these terms',
    paragraphs: [
      `These Terms of Service govern your use of TaskLink, operated by ${SITE.legalEntity}. By creating an account or using the platform you agree to them. If you do not agree, please do not use TaskLink.`,
    ],
  },
  {
    heading: 'What TaskLink is',
    paragraphs: [
      'TaskLink is an online marketplace that helps people who need tasks done ("Clients") find people willing to do them ("Workers"). One account can act as both. TaskLink is a platform only: we are not a party to the agreement between a Client and a Worker, and we do not employ Workers or guarantee the quality, safety or legality of any task or its outcome.',
    ],
  },
  {
    heading: 'Eligibility and accounts',
    list: [
      'You must be at least 18 years old and able to enter a binding contract.',
      'You must provide accurate information and keep it up to date. You may hold only one account.',
      'You are responsible for keeping your password secure and for all activity on your account. Tell us immediately if you suspect unauthorised use.',
      'You must verify your email address to post tasks or apply for tasks.',
    ],
  },
  {
    heading: 'Posting and applying for tasks',
    list: [
      'Tasks must be lawful, accurately described and not infringe anyone\'s rights. Prohibited tasks include anything illegal, harmful, deceptive or sexually explicit, and cheating on exams or assessments.',
      'A Client selecting a Worker creates an order. The agreed price is fixed in the order and does not change if the original task is later edited.',
      'Workers should apply only for tasks they can complete, and should apply honestly about their skills and experience.',
      'Free accounts have a monthly limit on applications. TaskLink Pro removes the limit.',
    ],
  },
  {
    heading: 'Payments, fees and payouts',
    list: [
      'Clients pay for an order through Paystack. Work should begin only after TaskLink confirms the payment.',
      'TaskLink charges a platform commission on completed orders, shown on the order before payment. Pro members pay a lower rate. Other fees, such as featuring a task or subscribing to Pro, are shown before you pay.',
      'When a Client approves submitted work, the Worker\'s earnings (the agreed price less the commission) are added to their TaskLink wallet.',
      'Workers can request withdrawals to a verified Nigerian bank account. Withdrawals may be subject to fees, limits and review, and may be delayed or declined where we suspect fraud or a breach of these terms.',
      'TaskLink\'s wallet is a record of amounts owed to you from completed tasks. It is not a bank account or an escrow account, and it does not earn interest.',
    ],
  },
  {
    heading: 'Revisions, cancellations and disputes',
    list: [
      'Clients can request a limited number of revisions on submitted work before approving it.',
      'Orders can be cancelled in line with the rules shown on the order page. Where payment has already been made, refunds are handled by TaskLink and depend on the circumstances.',
      'If a Client and Worker cannot agree, either can open a dispute. We may review the task, messages and submissions and make a decision, which may include releasing payment to the Worker, refunding the Client or splitting the amount. Our decision is final within the platform, without affecting any legal rights you have.',
    ],
  },
  {
    heading: 'Keep it on TaskLink',
    paragraphs: [
      'Paying, or asking to be paid, outside TaskLink for work found through TaskLink is not allowed. Payments made off the platform are not protected by our order, review and dispute process, and we cannot help if something goes wrong.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: ['You agree not to:'],
    list: [
      'Break the law, or use TaskLink to defraud, harass, threaten or discriminate against others.',
      'Post false, misleading or spam content, create fake accounts, fake applications or fake reviews, or manipulate ratings.',
      'Share malicious files, scrape the platform, or interfere with its security or operation.',
      'Impersonate another person or misrepresent your identity, skills or qualifications.',
    ],
  },
  {
    heading: 'Reviews and content',
    paragraphs: [
      'You own the content you post, but you give TaskLink a non-exclusive licence to host and display it as needed to run the service. Reviews must be honest and based on a real, completed order. We may remove content that breaks these terms.',
    ],
  },
  {
    heading: 'Suspension and termination',
    paragraphs: [
      'We may suspend or close accounts that break these terms, put other users at risk or create legal or security concerns. You can deactivate your account at any time in Settings; obligations relating to open orders and any amounts owed will remain.',
    ],
  },
  {
    heading: 'Disclaimers and limits of liability',
    paragraphs: [
      'TaskLink is provided "as is" and "as available". To the fullest extent permitted by law, we are not liable for the acts or omissions of users, for the quality or outcome of tasks, or for indirect or consequential losses. Nothing in these terms limits liability that cannot legally be limited.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: ['We may update these terms from time to time. If changes are significant we will let you know in the app or by email. Continuing to use TaskLink after changes take effect means you accept them.'],
  },
  {
    heading: 'Governing law and contact',
    paragraphs: [
      `These terms are governed by the laws of the Federal Republic of Nigeria. Questions? Email ${SITE.supportEmail}.`,
    ],
  },
];

export default function TermsPage() {
  usePageTitle('Terms of Service');
  return (
    <LegalLayout
      title="Terms of Service"
      intro="Please read these terms carefully. They explain the rules for using TaskLink, whether you are posting tasks or earning from them."
      sections={SECTIONS}
    />
  );
}
