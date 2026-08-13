import React from 'react';
import { LegalDocument, LegalSection } from '@/components/legal/LegalDocument';

const sections: LegalSection[] = [
  {
    heading: 'Acceptance of these terms',
    blocks: [
      {
        type: 'p',
        text: "By downloading, accessing, or using MyBabySteps, you agree to be bound by these Terms of Service. If you don't agree, please don't use the app.",
      },
    ],
  },
  {
    heading: 'The service',
    blocks: [
      {
        type: 'p',
        text: "MyBabySteps is a mobile app that lets parents and caregivers log and share a baby's feeding, sleep, nappy, growth, and other care activity within a shared household. We may add, change, or remove features over time as the app evolves.",
      },
    ],
  },
  {
    heading: 'Accounts & eligibility',
    blocks: [
      {
        type: 'ul',
        items: [
          'You must be at least 18 years old to create an account.',
          "You're responsible for the accuracy of the information you enter and for keeping your login credentials secure.",
          "You're responsible for all activity that happens under your account.",
          'Tell us right away at the email below if you suspect unauthorized access to your account.',
        ],
      },
    ],
  },
  {
    heading: 'Households & caregivers',
    blocks: [
      {
        type: 'p',
        text: "MyBabySteps lets you invite other adults into your household to view or add to your baby's record. You control who you invite and what role they hold (parent, caregiver, or viewer). You're responsible for only inviting people you trust with this information, and for removing access when it's no longer appropriate — for example, if someone should no longer have access to your household's data.",
      },
    ],
  },
  {
    heading: 'Acceptable use',
    blocks: [
      { type: 'p', text: 'You agree not to:' },
      {
        type: 'ul',
        items: [
          "Use the app for any unlawful purpose or in a way that violates anyone else's rights.",
          "Attempt to gain unauthorized access to another user's account or household.",
          "Upload content that is harmful, abusive, or that you don't have the right to share.",
          'Reverse engineer, decompile, or attempt to extract the source code of the app, except where the law expressly permits it.',
          'Use automated means to access or scrape the service.',
        ],
      },
    ],
  },
  {
    heading: 'Not medical advice',
    blocks: [
      {
        type: 'callout',
        lines: [
          "MyBabySteps is a personal record-keeping tool, not a medical device or a source of medical advice. Feeding, sleep, temperature, medicine, and growth logs are for your own reference and to help you communicate with caregivers and healthcare professionals — they are not a diagnosis, a treatment recommendation, or a substitute for professional medical judgment.",
          "Always consult a qualified healthcare provider for any concerns about your baby's health, and seek emergency care immediately if your baby needs it, regardless of what's logged in the app.",
        ],
      },
    ],
  },
  {
    heading: 'Your content',
    blocks: [
      {
        type: 'p',
        text: "You own the photos, notes, and other content you add to MyBabySteps. By uploading it, you give us a limited license to store, process, and display it back to you and the caregivers you've shared it with — solely to provide the service to you. We don't use your content for any other purpose, and we don't claim ownership of it.",
      },
      {
        type: 'p',
        text: "You're responsible for having the right to upload any content you add, and for its accuracy.",
      },
    ],
  },
  {
    heading: 'Our intellectual property',
    blocks: [
      {
        type: 'p',
        text: "The MyBabySteps app, its design, and its underlying software are owned by us and protected by intellectual property law. These terms don't grant you any rights to our trademarks, logos, or branding beyond what's needed to use the app as intended.",
      },
    ],
  },
  {
    heading: 'Termination',
    blocks: [
      {
        type: 'p',
        text: 'You can stop using MyBabySteps and request deletion of your account at any time by contacting us. We may suspend or terminate access to the service if we reasonably believe you\'ve violated these terms, or if we discontinue the service, with notice where practical.',
      },
    ],
  },
  {
    heading: 'Disclaimers & limitation of liability',
    blocks: [
      {
        type: 'p',
        text: 'MyBabySteps is provided "as is" without warranties of any kind, express or implied, including that it will be uninterrupted, error-free, or fit for a particular purpose. To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the app, including reliance on logged data. Nothing in these terms limits liability that cannot be excluded under applicable law, including for death or personal injury caused by negligence, or fraud.',
      },
    ],
  },
  {
    heading: 'Governing law',
    blocks: [
      {
        type: 'p',
        text: 'These terms are governed by the laws of England and Wales, and any dispute arising from them will be subject to the exclusive jurisdiction of the courts of England and Wales, without regard to conflict-of-law principles.',
      },
    ],
  },
  {
    heading: 'Changes to these terms',
    blocks: [
      {
        type: 'p',
        text: "We may update these terms from time to time. If we make material changes, we'll update the effective date above and, where appropriate, notify you in the app. Continuing to use MyBabySteps after a change means you accept the updated terms.",
      },
    ],
  },
];

export default function TermsOfServiceScreen() {
  return (
    <LegalDocument
      title="Terms of Service"
      effectiveDate="13 August 2026"
      intro="These terms govern your use of MyBabySteps. By creating an account or using the app, you agree to them. Please also read our Privacy Policy, which explains how we handle your data."
      sections={sections}
      contactEmail="support@mybabysteps.app"
      backTo="/(tabs)/profile"
    />
  );
}
