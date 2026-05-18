import type { Data } from "@repo/strapi-types"

import StrapiFaq from "@/components/page-builder/components/sections/StrapiFaq"

const faqData = {
  id: 1,
  __component: "sections.faq",
  title: "Frequently Asked Questions",
  subTitle: null,
  accordions: [
    {
      id: 1,
      question: "How do I get started with the product?",
      answer:
        "Sign up for an account using the signup page, verify your email, and follow the onboarding steps. If you need help, check the Getting Started guide in the documentation.",
      cta: null,
    },
    {
      id: 2,
      question: "How do I reset my password?",
      answer:
        "Use the 'Forgot password' link on the login page to request a password reset email. Follow the instructions in the email to set a new password.",
      cta: null,
    },
    {
      id: 3,
      question: "Where can I find the API documentation?",
      answer:
        "API documentation is available on the developer portal and includes examples, authentication methods, and rate limits. Check the docs for endpoints and request examples.",
      cta: null,
    },
    {
      id: 4,
      question: "How do I contact support?",
      answer:
        "Open a support ticket through the Help Center or email the support team. Include relevant details and screenshots for faster troubleshooting.",
      cta: null,
    },
    {
      id: 5,
      question: "Is there a service status page?",
      answer:
        "Yes, our public status page lists current incidents and maintenance windows. Subscribe to updates to receive notifications about major incidents.",
      cta: null,
    },
  ],
} as unknown as Data.Component<"sections.faq">

export default function MockedStrapiFaq() {
  return <StrapiFaq component={faqData} />
}
