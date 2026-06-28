export type DiyDifficulty = "Beginner" | "Beginner-Intermediate" | "Intermediate";

export type DiyCategory =
  | "Fluids"
  | "Filters"
  | "Tires & Wheels"
  | "Brakes"
  | "Belts & Driveline"
  | "Electrical"
  | "General Inspection";

export type DiyArticle = {
  slug: string;
  category: DiyCategory;
  popular?: boolean;
  title: string;
  summary: string;
  readTime: string;
  difficulty: DiyDifficulty;
  serviceTime: string;
  tools: string[];
  steps: string[];
  resources: Array<{ label: string; href: string }>;
};

export const DIY_TOOLS: string[] = [
  "Socket set (metric + SAE)",
  "Torque wrench",
  "Jack + jack stands",
  "Wheel chocks",
  "Drain pan / oil capture container",
  "Oil filter wrench",
  "Screwdriver + trim clip set",
  "Nitrile gloves + safety glasses",
];

export const DIY_SAFETY_TIPS: string[] = [
  "Always work on flat ground and chock wheels before lifting.",
  "Never rely on a floor jack alone. Use properly rated jack stands.",
  "Let hot engines and exhaust cool before touching fluids or filters.",
  "Capture fluids in proper containers and use approved recycling/disposal locations.",
  "Use torque specs for wheels and critical fasteners before driving.",
  "Keep a clean workspace and verify there are no leaks before road use.",
];

export const DIY_ARTICLES: DiyArticle[] = [
  {
    slug: "change-engine-oil",
    category: "Fluids",
    popular: true,
    title: "How to Change Engine Oil",
    summary: "A clean, repeatable oil-change workflow for home garages.",
    readTime: "6 min read",
    difficulty: "Beginner",
    serviceTime: "30-45 min",
    tools: ["Socket set", "Drain pan", "Oil filter wrench", "Funnel", "Gloves"],
    steps: [
      "Warm the engine briefly, shut off, and secure vehicle on level ground.",
      "Drain old oil and remove filter while checking for old gasket transfer.",
      "Install new filter, refill with correct oil spec/amount, and check dipstick.",
      "Run engine, inspect for leaks, recheck level, and reset maintenance reminder.",
    ],
    resources: [
      { label: "wikiHow: Change Your Oil", href: "https://www.wikihow.com/Change-Your-Oil" },
      { label: "EPA: Used Oil Management", href: "https://www.epa.gov/recycle/managing-reusing-and-recycling-used-oil" },
    ],
  },
  {
    slug: "change-transmission-fluid-basics",
    category: "Fluids",
    title: "Transmission Fluid Service Basics",
    summary: "When and how to approach drain-and-fill transmission service safely.",
    readTime: "7 min read",
    difficulty: "Intermediate",
    serviceTime: "45-90 min",
    tools: ["Socket set", "Drain pan", "Fluid pump/funnel", "Gloves"],
    steps: [
      "Confirm fluid type and service procedure in your owner or service manual.",
      "Perform drain-and-fill (not power flush) when applicable for your model.",
      "Refill by spec, check level at required temperature/procedure, and inspect leaks.",
    ],
    resources: [
      { label: "NHTSA: Vehicle Manuals and Safety Info", href: "https://www.nhtsa.gov/vehicle" },
      { label: "wikiHow: Change Transmission Fluid", href: "https://www.wikihow.com/Change-Transmission-Fluid" },
    ],
  },
  {
    slug: "change-coolant-basics",
    category: "Fluids",
    title: "Coolant Service Basics",
    summary: "Simple coolant maintenance guidance and safe handling reminders.",
    readTime: "6 min read",
    difficulty: "Beginner-Intermediate",
    serviceTime: "45-75 min",
    tools: ["Drain pan", "Funnel", "Pliers/screwdriver", "Gloves + eye protection"],
    steps: [
      "Only service coolant on a fully cool engine to avoid burns.",
      "Drain and refill with the correct coolant type and ratio for your vehicle.",
      "Bleed air as required, monitor temperature, and confirm stable level after cooldown.",
    ],
    resources: [
      { label: "wikiHow: Change Coolant", href: "https://www.wikihow.com/Change-Coolant" },
      { label: "CDC/NIOSH: Ethylene Glycol Safety", href: "https://www.cdc.gov/niosh/npg/npgd0262.html" },
    ],
  },
  {
    slug: "replace-cabin-air-filter",
    category: "Filters",
    popular: true,
    title: "Replace Cabin Air Filter",
    summary: "Quick service that improves cabin airflow and HVAC performance.",
    readTime: "4 min read",
    difficulty: "Beginner",
    serviceTime: "10-20 min",
    tools: ["Screwdriver set", "Trim clip tool (optional)", "Gloves"],
    steps: [
      "Locate cabin filter housing (often behind glove box or under cowl).",
      "Remove old filter and clean debris from the housing area.",
      "Install new filter in correct airflow direction and reassemble.",
    ],
    resources: [
      { label: "wikiHow: Change a Cabin Air Filter", href: "https://www.wikihow.com/Change-a-Cabin-Air-Filter" },
      { label: "Family Handyman: Cabin Air Filter Guide", href: "https://www.familyhandyman.com/project/change-a-cabin-air-filter/" },
    ],
  },
  {
    slug: "replace-engine-air-filter",
    category: "Filters",
    title: "Replace Engine Air Filter",
    summary: "Easy maintenance to keep intake airflow healthy.",
    readTime: "3 min read",
    difficulty: "Beginner",
    serviceTime: "10-15 min",
    tools: ["Screwdriver set (if needed)", "Gloves"],
    steps: [
      "Open the air box and remove the old filter element.",
      "Clean out leaves/debris without dropping anything into intake tract.",
      "Install new filter properly seated and close clips/fasteners.",
    ],
    resources: [
      { label: "wikiHow: Change a Car Air Filter", href: "https://www.wikihow.com/Change-a-Car-Air-Filter" },
      { label: "Popular Mechanics: Air Filter Basics", href: "https://www.popularmechanics.com/cars/how-to/" },
    ],
  },
  {
    slug: "rotate-tires",
    category: "Tires & Wheels",
    popular: true,
    title: "Rotate Tires Correctly",
    summary: "Improve tire life and wear consistency with proper rotation patterns.",
    readTime: "5 min read",
    difficulty: "Beginner-Intermediate",
    serviceTime: "35-55 min",
    tools: ["Jack + jack stands", "Torque wrench", "Socket set", "Wheel chocks"],
    steps: [
      "Confirm correct tire pattern for FWD/RWD/AWD and directional tires.",
      "Lift and support safely, rotate wheels, and hand-thread lugs first.",
      "Torque in star pattern to spec, then recheck after a short drive.",
    ],
    resources: [
      { label: "wikiHow: Rotate Tires", href: "https://www.wikihow.com/Rotate-Tires" },
      { label: "NHTSA: Tire Safety", href: "https://www.nhtsa.gov/equipment/tires" },
    ],
  },
  {
    slug: "check-tire-pressure-and-tread",
    category: "Tires & Wheels",
    popular: true,
    title: "Check Tire Pressure and Tread",
    summary: "A fast monthly check that improves safety and efficiency.",
    readTime: "4 min read",
    difficulty: "Beginner",
    serviceTime: "10-15 min",
    tools: ["Tire pressure gauge", "Tread depth gauge (or coin method)", "Air source"],
    steps: [
      "Set tire pressure when cold using door-jamb recommended PSI, not sidewall max.",
      "Inspect tread depth and uneven wear patterns across all tires.",
      "Adjust pressure, inspect sidewalls for damage, and check spare tire too.",
    ],
    resources: [
      { label: "NHTSA: Tire Pressure and Safety", href: "https://www.nhtsa.gov/equipment/tires" },
      { label: "wikiHow: Check Tire Pressure", href: "https://www.wikihow.com/Check-Tire-Pressure" },
    ],
  },
  {
    slug: "brake-pad-service-overview",
    category: "Brakes",
    popular: true,
    title: "Brake Pad Service Overview",
    summary: "Prep guide to brake pad service with key checks before attempting DIY.",
    readTime: "8 min read",
    difficulty: "Intermediate",
    serviceTime: "1.5-3 hrs",
    tools: ["Jack + jack stands", "Socket set", "Caliper tool", "Torque wrench", "Brake cleaner"],
    steps: [
      "Inspect pad thickness, rotor condition, and brake hardware before disassembly.",
      "Replace pads using service-manual torque values and sequence.",
      "Bed brakes in, verify pedal feel, and perform cautious initial road test.",
    ],
    resources: [
      { label: "wikiHow: Change Brake Pads", href: "https://www.wikihow.com/Change-Brake-Pads" },
      { label: "NHTSA: Recall and Safety Search", href: "https://www.nhtsa.gov/recalls" },
    ],
  },
  {
    slug: "brake-fluid-service-basics",
    category: "Brakes",
    title: "Brake Fluid Service Basics",
    summary: "Why periodic brake-fluid changes matter and what to watch for.",
    readTime: "5 min read",
    difficulty: "Intermediate",
    serviceTime: "45-90 min",
    tools: ["Wrench set", "Bleeder bottle/kit", "Brake fluid (correct spec)", "Safety glasses + gloves"],
    steps: [
      "Use only the brake fluid spec listed for your vehicle.",
      "Bleed in correct order while avoiding reservoir dry-out.",
      "Check pedal feel and inspect entire system for leaks after service.",
    ],
    resources: [
      { label: "wikiHow: Flush Brake Fluid", href: "https://www.wikihow.com/Flush-Brake-Fluid" },
      { label: "NHTSA: Vehicle Safety Overview", href: "https://www.nhtsa.gov/road-safety/vehicle-safety" },
    ],
  },
  {
    slug: "serpentine-belt-inspection",
    category: "Belts & Driveline",
    title: "Inspect Serpentine Belt",
    summary: "Spot belt wear early before it causes roadside breakdowns.",
    readTime: "4 min read",
    difficulty: "Beginner-Intermediate",
    serviceTime: "15-25 min",
    tools: ["Flashlight", "Belt tool/socket", "Gloves"],
    steps: [
      "Inspect belt for cracks, glazing, fraying, and contamination.",
      "Check tensioner movement/noise and pulley alignment.",
      "Replace belt if wear is visible or service interval is due.",
    ],
    resources: [
      { label: "wikiHow: Replace a Serpentine Belt", href: "https://www.wikihow.com/Replace-a-Serpentine-Belt" },
      { label: "Popular Mechanics: Belt Basics", href: "https://www.popularmechanics.com/cars/how-to/" },
    ],
  },
  {
    slug: "differential-fluid-overview",
    category: "Belts & Driveline",
    title: "Differential / Transfer Case Fluid Overview",
    summary: "What AWD/4WD owners should know about driveline fluid service.",
    readTime: "6 min read",
    difficulty: "Intermediate",
    serviceTime: "45-90 min",
    tools: ["Socket set", "Fluid transfer pump", "Drain pan", "Gloves"],
    steps: [
      "Confirm whether your vehicle has front/rear differential and transfer case service points.",
      "Use exact fluid spec and capacity from service information.",
      "Fill to level spec, clean residue, and check for seepage after drive cycle.",
    ],
    resources: [
      { label: "NHTSA: Vehicle Owner Resources", href: "https://www.nhtsa.gov/vehicle" },
      { label: "wikiHow: Change Differential Fluid", href: "https://www.wikihow.com/Change-Differential-Fluid" },
    ],
  },
  {
    slug: "battery-replacement-and-testing",
    category: "Electrical",
    popular: true,
    title: "Battery Testing and Replacement",
    summary: "Quick checks and safe replacement basics for 12V batteries.",
    readTime: "5 min read",
    difficulty: "Beginner",
    serviceTime: "20-35 min",
    tools: ["Gloves", "Socket/wrench set", "Battery terminal brush", "Multimeter (optional)"],
    steps: [
      "Check age, voltage, and signs of corrosion before replacing.",
      "Disconnect negative first, then positive; reverse order on installation.",
      "Secure hold-down, clean terminals, and confirm charging voltage after start.",
    ],
    resources: [
      { label: "wikiHow: Change a Car Battery", href: "https://www.wikihow.com/Change-a-Car-Battery" },
      { label: "NHTSA: Vehicle Safety", href: "https://www.nhtsa.gov/road-safety/vehicle-safety" },
    ],
  },
  {
    slug: "spark-plug-replacement-basics",
    category: "Electrical",
    title: "Spark Plug Replacement Basics",
    summary: "High-level guide to replacing spark plugs the right way.",
    readTime: "6 min read",
    difficulty: "Intermediate",
    serviceTime: "45-120 min",
    tools: ["Spark plug socket", "Torque wrench", "Extension set", "Compressed air"],
    steps: [
      "Confirm correct plug type and torque spec before starting.",
      "Blow debris out of plug wells before removing plugs.",
      "Install by hand first to avoid cross-threading, then torque to spec.",
    ],
    resources: [
      { label: "wikiHow: Change Spark Plugs", href: "https://www.wikihow.com/Change-Spark-Plugs" },
      { label: "NHTSA: Vehicle Information", href: "https://www.nhtsa.gov/vehicle" },
    ],
  },
  {
    slug: "monthly-vehicle-inspection",
    category: "General Inspection",
    popular: true,
    title: "Monthly Vehicle Health Check",
    summary: "A 10-minute routine to catch small issues before they become expensive.",
    readTime: "4 min read",
    difficulty: "Beginner",
    serviceTime: "10-15 min",
    tools: ["Flashlight", "Tire gauge", "Paper towels"],
    steps: [
      "Check fluid levels, visible leaks, lights, and wiper condition.",
      "Inspect tire pressure/tread and look for uneven wear.",
      "Listen for new noises on short drive and log findings in My Car Pal.",
    ],
    resources: [
      { label: "NHTSA: Safety and Maintenance", href: "https://www.nhtsa.gov/vehicle-safety" },
      { label: "wikiHow: Basic Car Maintenance", href: "https://www.wikihow.com/Do-Basic-Car-Maintenance" },
    ],
  },
];

export function getDiyArticle(slug: string): DiyArticle | undefined {
  return DIY_ARTICLES.find((article) => article.slug === slug);
}
