export type ToolDef = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  howTo: string[];
};

export const toolsCatalog: ToolDef[] = [
  {
    "slug": "assignment-fee",
    "title": "Assignment Fee Calculator",
    "description": "Estimate your assignment fee and net profit quickly.",
    "tags": [
      "calculator",
      "wholesaling"
    ],
    "howTo": [
      "Enter purchase price, ARV, repairs, and desired spread.",
      "Use the result as a quick sanity check before offering."
    ]
  },
  {
    "slug": "cash-flow",
    "title": "Cash Flow Calculator",
    "description": "Simple rental cash flow estimate.",
    "tags": [
      "rental",
      "roi"
    ],
    "howTo": [
      "Enter rent, expenses, and financing assumptions.",
      "Compare scenarios before you buy."
    ]
  },
  {
    "slug": "closing-costs",
    "title": "Closing Costs Estimator",
    "description": "Quick closing cost approximation for deals.",
    "tags": [
      "closing",
      "estimate"
    ],
    "howTo": [
      "Enter purchase price and select buyer/seller side.",
      "Use as a placeholder until title quote."
    ]
  },
  {
    "slug": "cold-calling-scripts",
    "title": "Cold Calling Scripts",
    "description": "Organized scripts and objection handlers.",
    "tags": [
      "scripts",
      "sales"
    ],
    "howTo": [
      "Pick a script template.",
      "Customize to your voice and market."
    ]
  },
  {
    "slug": "deal-comparison",
    "title": "Deal Comparison",
    "description": "Compare two deals side-by-side.",
    "tags": [
      "analysis",
      "compare"
    ],
    "howTo": [
      "Fill inputs for Deal A and Deal B.",
      "Export the winner to your pipeline."
    ]
  },
  {
    "slug": "deal-pipeline",
    "title": "Deal Pipeline",
    "description": "Basic pipeline view (UI-only).",
    "tags": [
      "crm",
      "pipeline"
    ],
    "howTo": [
      "Add deals as you analyze them.",
      "Move deals through stages."
    ]
  },
  {
    "slug": "offer-message",
    "title": "Offer Message Generator",
    "description": "Generate a clean offer message/email.",
    "tags": [
      "templates",
      "offers"
    ],
    "howTo": [
      "Enter property + offer details.",
      "Copy/paste into email/SMS (SMS removed in your app)."
    ]
  },
  {
    "slug": "roi",
    "title": "ROI Calculator",
    "description": "ROI and cap rate quick math.",
    "tags": [
      "roi",
      "cap-rate"
    ],
    "howTo": [
      "Enter NOI and purchase price.",
      "Use for fast rental screening."
    ]
  },
  {
    "slug": "buyer-matcher",
    "title": "Buyer Matcher",
    "description": "Match deals to buyer criteria (UI shell).",
    "tags": [
      "buyers",
      "dispo"
    ],
    "howTo": [
      "Store buyer criteria.",
      "Match by zip, beds/baths, price range."
    ]
  },
  {
    "slug": "marketing-flyer",
    "title": "Marketing Flyer",
    "description": "Generate a flyer layout (UI shell).",
    "tags": [
      "dispo",
      "marketing"
    ],
    "howTo": [
      "Enter deal highlights.",
      "Export a PDF in a later step."
    ]
  }
];

export const toolsBySlug: Record<string, ToolDef> = Object.fromEntries(
  toolsCatalog.map((t) => [t.slug, t])
);
