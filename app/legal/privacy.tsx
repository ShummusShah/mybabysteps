import React from 'react';
import { LegalDocument, LegalSection } from '@/components/legal/LegalDocument';

const sections: LegalSection[] = [
  {
    heading: 'Who we are',
    blocks: [
      {
        type: 'p',
        text: 'MyBabySteps is developed and operated by Shum Shah ("we", "us", "our"). For the purposes of UK data protection law, Shum Shah is the data controller for the personal information described in this policy.',
      },
    ],
  },
  {
    heading: 'Information we collect',
    blocks: [
      {
        type: 'p',
        text: 'We collect information you provide directly when you use the app, and nothing else — MyBabySteps has no analytics, advertising, or tracking SDKs.',
      },
      {
        type: 'table',
        rows: [
          [
            'Account',
            'Email address, display name, and password (your password is handled by our authentication provider and never visible to us in plain text).',
          ],
          ['Baby profile', 'Name, date of birth, sex, birth weight and length, and an optional photo.'],
          [
            'Care logs',
            "Feeding, sleep, nappy, pumping, tummy time, medicine, temperature, growth and milestone entries, and any photos you add to a baby's gallery — each timestamped and attributed to whoever logged it.",
          ],
          [
            'Household & caregivers',
            'The email addresses you invite as caregivers, and the role (parent, caregiver or viewer) you assign them.',
          ],
          [
            'Reminders',
            'Reminder times you set, scheduled as local notifications on your own device — these are never sent to us or any third party.',
          ],
        ],
      },
      {
        type: 'p',
        text: 'We do not collect your location, contacts, or any information from your device beyond what you explicitly enter into the app.',
      },
    ],
  },
  {
    heading: 'How we use it',
    blocks: [
      {
        type: 'ul',
        items: [
          'To create and secure your account, and let you sign back in.',
          "To store and display your baby's profile and care history back to you and the caregivers you've invited.",
          "To let household members you invite view and add to a shared record, according to the role you give them.",
          'To send you the reminder notifications you schedule (handled entirely on your device).',
          'To respond when you contact us for support.',
        ],
      },
      {
        type: 'p',
        text: 'We do not use your data to train AI models, build advertising profiles, or for any purpose other than running the app for you.',
      },
    ],
  },
  {
    heading: 'Who we share it with',
    blocks: [
      { type: 'p', text: "We do not sell your data. It's shared only in these limited situations:" },
      {
        type: 'ul',
        items: [
          "Caregivers you invite. Anyone you add to your household can see the baby profile and logs their role permits — that's the core purpose of the app.",
          'Supabase, our backend and database provider, which stores your account and app data on our behalf under a data processing agreement. Supabase does not use your data for its own purposes.',
          'Apple and Google, who distribute the app through their app stores and may process basic technical information (like crash logs, if you opt in to share them) under their own privacy policies.',
          "Legal requirements. If we're required to disclose information to comply with the law, protect our rights, or respond to a valid legal request.",
        ],
      },
    ],
  },
  {
    heading: "Children's information",
    blocks: [
      {
        type: 'callout',
        lines: [
          'MyBabySteps is designed for use by parents and caregivers, not by children. Creating an account requires you to be an adult. The baby\'s information in the app is entered and managed by the adult account holders on the baby\'s behalf — the baby does not create an account or interact with the app directly.',
          'Because that information can identify or relate to a child, we treat it with the same care as any other personal data in this policy, and we never use it for advertising or share it outside your household without your action.',
        ],
      },
    ],
  },
  {
    heading: 'Storage & security',
    blocks: [
      {
        type: 'p',
        text: 'Your data is stored in a Supabase-managed database and file storage system. Photos are kept in a private storage bucket — they are not publicly accessible by URL, and every request to view one is checked against your household membership. All traffic between the app and our servers is encrypted in transit (HTTPS/TLS). Row-level security rules on every table restrict access so that only members of your household can read or write your baby\'s data.',
      },
      {
        type: 'p',
        text: "No system is perfectly secure, but we design access controls around the principle that only people you've explicitly invited can see your data.",
      },
    ],
  },
  {
    heading: 'Data retention',
    blocks: [
      {
        type: 'p',
        text: "We keep your account and care log data for as long as your account is active. If you'd like your account and associated data deleted, contact us at the email below — we don't yet have automatic in-app deletion, but we'll action a request promptly and confirm once it's complete. Removing a caregiver from a household immediately ends their access to that household's data.",
      },
    ],
  },
  {
    heading: 'Your rights',
    blocks: [
      { type: 'p', text: 'Under UK GDPR, you have the right to:' },
      {
        type: 'ul',
        items: [
          "Access the personal data we hold about you and your baby's profile.",
          'Correct inaccurate data — most of this you can edit directly in the app.',
          'Request deletion of your account and data.',
          'Request a copy of your data in a portable format.',
          'Object to or restrict certain processing.',
        ],
      },
      {
        type: 'p',
        text: "To exercise any of these, email us below. You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk if you believe we haven't handled your data properly.",
      },
    ],
  },
  {
    heading: 'International transfers',
    blocks: [
      {
        type: 'p',
        text: "Our service providers may process and store data in countries outside the UK. Where that happens, we rely on the safeguards required by UK data protection law, such as standard contractual clauses, to make sure your information stays protected wherever it's processed.",
      },
    ],
  },
  {
    heading: 'Changes to this policy',
    blocks: [
      {
        type: 'p',
        text: "If we make material changes to this policy, we'll update the effective date above and, where appropriate, let you know in the app. Continuing to use MyBabySteps after a change means you accept the updated policy.",
      },
    ],
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <LegalDocument
      title="Privacy Policy"
      effectiveDate="13 August 2026"
      intro="MyBabySteps helps parents and caregivers track feeding, sleep, nappies, growth and milestones for a baby, and share that record with the people who help care for them. This policy explains what we collect to make that possible, why, and the choices you have over it."
      sections={sections}
      contactEmail="support@mybabysteps.app"
      backTo="/(tabs)/profile"
    />
  );
}
