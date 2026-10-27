import { CategoryGuidance, WasteCategory } from '../types/waste';

export const WASTE_GUIDANCE_MAP: Record<WasteCategory, CategoryGuidance> = {
  cardboard: {
    id: 'cardboard',
    name: 'Cardboard & Corrugated Fibreboard',
    shortDesc: 'Rigid paper-based packaging, shipping cartons, and corrugated food boxes.',
    recyclableStatus: 'Recyclable',
    color: 'emerald',
    preparationRules: [
      'Keep dry and clean: wet or greasy cardboard degrades pulp fibers during repulping.',
      'Flatten all boxes completely before placing them into bins to maximize collection volume.',
      'Remove excessive food contamination, grease-soaked liners (e.g. oily pizza bases), and packing tape when possible.',
      'Remove interior plastic wrap, bubble pack, and polystyrene inserts before recycling.'
    ],
    localFacilityNote: 'Most municipal curbside programs accept dry corrugated cardboard. Wax-coated produce cartons cannot be recycled with regular paper pulp.',
    ecoTip: 'Unprinted cardboard is brown-carbon rich and can be shredded to serve as mulch or carbon layers in home compost systems.',
    commonExamples: ['Shipping boxes', 'Cereal and grocery packaging', 'Shoe boxes', 'Corrugated mailers']
  },
  glass: {
    id: 'glass',
    name: 'Glass Bottles & Containers',
    shortDesc: 'Clear, green, and amber container glass such as beverage bottles and food jars.',
    recyclableStatus: 'Recyclable',
    color: 'teal',
    preparationRules: [
      'Empty all liquid or food residue; give a light cold rinse if permitted by local water-saving guidelines.',
      'Remove metal or plastic caps and lids, and recycle them separately in their appropriate material stream.',
      'Separate broken glass safely: never mix broken drinking tumblers, Pyrex, or ceramics with bottle glass.',
      'Never handle dangerous shards directly. Wrap broken glass securely and label it if municipal disposal requires solid waste.'
    ],
    localFacilityNote: 'Check local recycling rules: some municipalities mandate separate colored glass bins or drop-off igloos rather than single-stream curbside collection to avoid contaminating paper.',
    safetyWarning: 'Caution: Drinking glasses, cookware (Pyrex), mirror shards, and window panes have different melting temperatures and must NOT enter standard container glass recycling.',
    ecoTip: 'Glass can be recycled indefinitely without degradation of purity or structural integrity.',
    commonExamples: ['Beverage bottles', 'Pasta sauce jars', 'Jam jars', 'Olive oil bottles']
  },
  metal: {
    id: 'metal',
    name: 'Metal & Aluminum Containers',
    shortDesc: 'Beverage cans, tinned food cans, and clean aluminum trays.',
    recyclableStatus: 'Recyclable',
    color: 'cyan',
    preparationRules: [
      'Empty containers completely of liquids or food scraps.',
      'Rinse lightly when appropriate to prevent odor and pest attraction in storage containers.',
      'Push tin can lids inside the can or leave them attached so they do not jam automated magnetic sorters.',
      'Do not crush aluminum beverage cans if your local MRF (Material Recovery Facility) uses automated optical or eddy-current sorters, as flattened cans can be misidentified as paper.'
    ],
    localFacilityNote: 'Follow local recycling guidelines: clean aluminum foil balled into a fist-sized orb is accepted in many jurisdictions, whereas loose foil flakes get lost in sorting.',
    ecoTip: 'Recycling aluminum saves 95% of the energy required to smelt new aluminum from raw bauxite ore.',
    commonExamples: ['Soda and seltzer cans', 'Soup and vegetable tins', 'Pet food cans', 'Clean foil pans']
  },
  paper: {
    id: 'paper',
    name: 'Paper & Mixed Fiber',
    shortDesc: 'Office documents, newspapers, clean magazines, envelopes, and paper grocery bags.',
    recyclableStatus: 'Recyclable',
    color: 'sky',
    preparationRules: [
      'Keep paper dry: moisture damages fibers and causes mold in collection bales.',
      'Separate heavily contaminated paper: used paper towels, soiled tissues, and grease-spotted napkins cannot be recycled.',
      'Reuse suitable paper before disposal: utilize unprinted reverse sides for scrap notes or drafting.',
      'Remove plastic poly-bagging, wax wrappers, and oversized metal binding rings.'
    ],
    localFacilityNote: 'Shredded paper is often excluded from curbside bins because strips jam sorting conveyers; verify if your local center requires paper bagging or dedicated drop-offs.',
    ecoTip: 'Paper fibers can be recycled 5 to 7 times into newsprint, egg cartons, and tissue products before fibers become too short.',
    commonExamples: ['Newspapers & flyers', 'Office printouts', 'Envelopes (plastic windows usually acceptable)', 'Paper shopping bags']
  },
  plastic: {
    id: 'plastic',
    name: 'Rigid Plastics (Containers & Bottles)',
    shortDesc: 'Molded plastic bottles, jugs, tubs, and packaging containers.',
    recyclableStatus: 'Conditional / Facility Dependent',
    color: 'amber',
    preparationRules: [
      'Explain and verify resin codes: recyclability strictly depends on resin type (#1 PET, #2 HDPE are widely recycled; #3 PVC, #6 PS, #7 Other are rarely accepted curbside).',
      'Avoid claiming that all plastic is recyclable: soft plastic films, grocery bags, and bubble wrap tangle in sorting machinery and require return-to-store collection bins.',
      'Empty and rinse out food remnants and sticky syrups.',
      'Encourage reuse and correct sorting: replace single-use plastic containers with durable reusables whenever feasible.'
    ],
    localFacilityNote: 'Curbside acceptance varies widely by municipality. Check whether your local facility accepts #5 (Polypropylene) yogurt tubs.',
    safetyWarning: 'Never place motor oil containers, pesticide jugs, or chemical containers into household recycling even if stamped with resin codes.',
    ecoTip: 'Prioritize reduction: bulk purchasing and refillable containers prevent virgin fossil-fuel plastic synthesis.',
    commonExamples: ['Water & soda bottles (#1 PET)', 'Milk jugs & detergent bottles (#2 HDPE)', 'Food storage containers (#5 PP)']
  },
  trash: {
    id: 'trash',
    name: 'Trash / Municipal Solid Waste',
    shortDesc: 'Composite items, non-recyclable synthetics, and unclassifiable debris.',
    recyclableStatus: 'Landfill / Solid Waste',
    color: 'rose',
    preparationRules: [
      'Explain that the model could not identify a more specific recyclable category or that the item consists of non-recoverable municipal solid waste.',
      'Recommend checking local waste guidelines: consult your city or regional sanitation directory for specialized item pickup.',
      'Bag waste securely to prevent windblown litter during curbside collection.',
      'Verify if any component parts (such as detached clean cardboard packaging or metal screws) can be segregated prior to disposal.'
    ],
    localFacilityNote: 'If the object contains electronic components, wiring, or chemical elements, do not place it in household trash.',
    safetyWarning: 'Check for hazardous properties: never dispose of batteries, pressurized aerosol cans, or corrosive substances in household trash.',
    ecoTip: 'Conduct a personal waste audit to identify recurring single-use trash items and replace them with durable alternatives.',
    commonExamples: ['Composite laminated foil/plastic pouches', 'Heavily soiled packaging', 'Broken miscellaneous plastic toys', 'Sanitary waste']
  },
};

export interface HazardousGuidanceItem {
  name: string;
  category: string;
  hazards: string[];
  safeDisposal: string;
}

export const HAZARDOUS_WASTE_GUIDELINES: HazardousGuidanceItem[] = [
  {
    name: 'Lithium-Ion & Household Batteries',
    category: 'Universal Hazardous Waste',
    hazards: ['Fire risk', 'Heavy metal leeching (cadmium, lead, lithium)', 'Explosion risk when crushed in trucks'],
    safeDisposal: 'Never discard in household trash or recycling bins. Tape terminals with clear tape and deliver to hardware store drop-offs or municipal hazardous waste depots.'
  },
  {
    name: 'Electronic Waste (E-Waste)',
    category: 'Electronic Scrap',
    hazards: ['Toxic flame retardants', 'Lead solder', 'Mercury backlighting'],
    safeDisposal: 'Take to certified e-Stewards or municipal electronics recycling depots. Erase personal data before donation or drop-off.'
  },
  {
    name: 'Chemicals, Solvents & Motor Oils',
    category: 'Toxic & Flammable Liquids',
    hazards: ['Groundwater contamination', 'Skin caustic burns', 'Explosive fumes'],
    safeDisposal: 'Keep in original sealed containers with labels intact. Deliver to household hazardous waste (HHW) collection events. Never pour down drains.'
  },
  {
    name: 'Medical Waste & Sharps (Needles/Syringes)',
    category: 'Biohazardous Sharps',
    hazards: ['Puncture wounds', 'Bloodborne pathogen transmission', 'Risk to sanitation workers'],
    safeDisposal: 'Deposit in puncture-resistant rigid sharps containers (or heavy-duty detergent jugs with sealed lids). Drop off at pharmacies or designated medical drop kiosks.'
  }
];
