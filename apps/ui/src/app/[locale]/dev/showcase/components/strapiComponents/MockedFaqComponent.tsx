import type { Data } from "@repo/strapi-types"

import StrapiFaq from "@/components/page-builder/components/sections/StrapiFaq"

const faqData = {
  id: 1,
  __component: "sections.faq",
  title: "FAQ",
  subTitle: null,
  accordions: [
    {
      id: 1,
      question: "What is the Endowment?",
      answer:
        "The Endowment comprises thousands of designated funds supporting the University's core mission. About 75% is restricted for specific purposes. Yale Investments manages endowment funds as a single pool to benefit future generations.",
      cta: null,
    },
    {
      id: 2,
      question: "How much does Yale spend each year from the Endowment?",
      answer:
        "Yale aims to spend 5.25% of the Endowment's value each year, which accounts for over one-third of the annual operating budget. Over the course of a decade, Yale spends about half of the total value of the Endowment. The university's spending policy is designed to smooth the impact of short-term fluctuations in the Endowment's market value to mitigate disruptive changes to the budget when the Endowment value drops.",
      cta: {
        id: 1,
        type: "external",
        label: "Read more",
        href: "https://www.yale.edu/funding-yale-home/overview-yales-endowment",
        newTab: true,
        decorations: null,
      },
    },
    {
      id: 3,
      question: "What is 'The Yale Model'?",
      answer:
        "An investment strategy developed by David Swensen and Dean Takahashi emphasizing long-term partnerships with premier managers, creating diversified, equity-oriented portfolios. Widely considered successful and influential in reshaping institutional investor fund management.",
      cta: null,
    },
    {
      id: 4,
      question: "What is Yale's approach to investor responsibility?",
      answer:
        "Yale pioneered formal ethical frameworks for institutional investors over 50 years ago, influenced by 'The Ethical Investor' (1972). The university implements proxy voting and divestment policies addressing social and ethical concerns, maintaining zero tolerance for substandard investments.",
      cta: {
        id: 2,
        type: "external",
        label: "Read more",
        href: "https://acir.yale.edu/",
        newTab: true,
        decorations: null,
      },
    },
    {
      id: 5,
      question: "Why doesn't Yale disclose its endowment holdings?",
      answer:
        "Yale maintains confidentiality to honor contractual obligations to investment managers and preserve their competitive advantages. Disclosure would increase competition for manager access. The Investment Committee and CCIR maintain transparency for oversight.",
      cta: null,
    },
    {
      id: 6,
      question:
        "How does the team implement Yale's ethical investing policies?",
      answer:
        "Third-party managers typically control investments. When policies change, managers remove ineligible holdings according to contractual terms. Divestment timing depends on manager relationships and investment liquidity, though the Endowment rarely actually held flagged holdings.",
      cta: null,
    },
    {
      id: 7,
      question:
        "What does it mean for a company to show up on Yale's Form 13-F?",
      answer:
        "Form 13-F listings indicate securities where Yale exercises discretion but don't necessarily mean direct investment. Holdings typically result from liquidating distributions or gifts. Yale generally sells received securities, though holdings may appear if liquidation timing aligns with filing dates.",
      cta: null,
    },
    {
      id: 8,
      question:
        "What does it mean for an index fund or ETF to show up on Yale's Form 13-F?",
      answer:
        "Index funds and ETFs serve passive portfolio rebalancing rather than active strategies. Yale doesn't engage with their sponsors. Given their limited passive use and ubiquitous portfolio role, underlying holdings aren't subject to ethical investment policies.",
      cta: null,
    },
  ],
} as unknown as Data.Component<"sections.faq">

export default function MockedFaqComponent() {
  return <StrapiFaq component={faqData} />
}
