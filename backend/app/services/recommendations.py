from typing import Dict, Any, Optional

RECOMMENDATIONS_DATABASE: Dict[str, Dict[str, Any]] = {
    "cardboard": {
        "category": "cardboard",
        "name": "Cardboard & Corrugated Fibreboard",
        "recyclable_status": "Recyclable",
        "short_description": "Rigid paper-based packaging, shipping cartons, and corrugated boxes.",
        "preparation_rules": [
            "Keep dry and clean: wet or greasy cardboard degrades pulp fibers during repulping.",
            "Flatten all boxes completely before placing them into bins to maximize collection volume.",
            "Remove excessive food contamination, grease-soaked liners (e.g. oily pizza bases), and packing tape when possible.",
            "Remove interior plastic wrap, bubble pack, and polystyrene inserts before recycling."
        ],
        "local_facility_note": "Most municipal curbside programs accept dry corrugated cardboard. Wax-coated produce cartons cannot be recycled with regular paper pulp.",
        "eco_tip": "Unprinted cardboard is brown-carbon rich and can be shredded to serve as mulch or carbon layers in home compost systems.",
        "safety_warning": None,
        "common_examples": ["Shipping boxes", "Cereal boxes", "Shoe boxes", "Cardboard packaging"]
    },
    "glass": {
        "category": "glass",
        "name": "Glass Bottles & Containers",
        "recyclable_status": "Recyclable",
        "short_description": "Clear, green, and amber container glass such as beverage bottles and food jars.",
        "preparation_rules": [
            "Empty all liquid or food residue; give a light cold rinse if permitted by local water-saving guidelines.",
            "Remove metal or plastic caps and lids, and recycle them separately in their appropriate material stream.",
            "Separate broken glass safely: never mix broken drinking tumblers, Pyrex, or ceramics with bottle glass.",
            "Never handle dangerous shards directly. Wrap broken glass securely and label it if municipal disposal requires solid waste."
        ],
        "local_facility_note": "Check local recycling rules: some municipalities mandate separate colored glass bins or drop-off igloos rather than single-stream curbside collection to avoid contaminating paper.",
        "eco_tip": "Glass can be recycled indefinitely without degradation of purity or structural integrity.",
        "safety_warning": "Caution: Drinking glasses, cookware (Pyrex), mirror shards, and window panes have different melting temperatures and must NOT enter standard container glass recycling.",
        "common_examples": ["Beverage bottles", "Pasta sauce jars", "Jam jars", "Olive oil bottles"]
    },
    "metal": {
        "category": "metal",
        "name": "Metal & Aluminum Containers",
        "recyclable_status": "Recyclable",
        "short_description": "Beverage cans, tinned food cans, and clean aluminum trays.",
        "preparation_rules": [
            "Empty containers completely of liquids or food scraps.",
            "Rinse lightly when appropriate to prevent odor and pest attraction in storage containers.",
            "Push tin can lids inside the can or leave them attached so they do not jam automated magnetic sorters.",
            "Do not crush aluminum beverage cans if your local MRF uses automated optical or eddy-current sorters, as flattened cans can be misidentified as paper."
        ],
        "local_facility_note": "Follow local recycling guidelines: clean aluminum foil balled into a fist-sized orb is accepted in many jurisdictions, whereas loose foil flakes get lost in sorting.",
        "eco_tip": "Recycling aluminum saves 95% of the energy required to smelt new aluminum from raw bauxite ore.",
        "safety_warning": None,
        "common_examples": ["Soda and seltzer cans", "Soup and vegetable tins", "Pet food cans", "Clean foil pans"]
    },
    "paper": {
        "category": "paper",
        "name": "Paper & Mixed Fiber",
        "recyclable_status": "Recyclable",
        "short_description": "Office documents, newspapers, clean magazines, envelopes, and paper grocery bags.",
        "preparation_rules": [
            "Keep paper dry: moisture damages fibers and causes mold in collection bales.",
            "Separate heavily contaminated paper: used paper towels, soiled tissues, and grease-spotted napkins cannot be recycled.",
            "Reuse suitable paper before disposal: utilize unprinted reverse sides for scrap notes or drafting.",
            "Remove plastic poly-bagging, wax wrappers, and oversized metal binding rings."
        ],
        "local_facility_note": "Shredded paper is often excluded from curbside bins because strips jam sorting conveyers; verify if your local center requires paper bagging or dedicated drop-offs.",
        "eco_tip": "Paper fibers can be recycled 5 to 7 times into newsprint, egg cartons, and tissue products before fibers become too short.",
        "safety_warning": None,
        "common_examples": ["Newspapers & flyers", "Office printouts", "Envelopes", "Paper shopping bags"]
    },
    "plastic": {
        "category": "plastic",
        "name": "Rigid Plastics (Containers & Bottles)",
        "recyclable_status": "Conditional / Facility Dependent",
        "short_description": "Molded plastic bottles, jugs, tubs, and packaging containers.",
        "preparation_rules": [
            "Explain and verify resin codes: recyclability strictly depends on resin type (#1 PET, #2 HDPE are widely recycled; #3 PVC, #6 PS, #7 Other are rarely accepted curbside).",
            "Avoid claiming that all plastic is recyclable: soft plastic films, grocery bags, and bubble wrap tangle in sorting machinery and require return-to-store collection bins.",
            "Empty and rinse out food remnants and sticky syrups.",
            "Encourage reuse and correct sorting: replace single-use plastic containers with durable reusables whenever feasible."
        ],
        "local_facility_note": "Curbside acceptance varies widely by municipality. Check whether your local facility accepts #5 (Polypropylene) yogurt tubs.",
        "eco_tip": "Prioritize reduction: bulk purchasing and refillable containers prevent virgin fossil-fuel plastic synthesis.",
        "safety_warning": "Never place motor oil containers, pesticide jugs, or chemical containers into household recycling even if stamped with resin codes.",
        "common_examples": ["Water & soda bottles (#1 PET)", "Milk jugs & detergent bottles (#2 HDPE)", "Food storage containers (#5 PP)"]
    },
    "trash": {
        "category": "trash",
        "name": "Trash / Municipal Solid Waste",
        "recyclable_status": "Landfill / Solid Waste",
        "short_description": "Composite items, non-recyclable synthetics, and unclassifiable debris.",
        "preparation_rules": [
            "Explain that the model could not identify a more specific recyclable category or that the item consists of non-recoverable municipal solid waste.",
            "Recommend checking local waste guidelines: consult your city or regional sanitation directory for specialized item pickup.",
            "Bag waste securely to prevent windblown litter during curbside collection.",
            "Verify if any component parts (such as detached clean cardboard packaging or metal screws) can be segregated prior to disposal."
        ],
        "local_facility_note": "If the object contains electronic components, wiring, or chemical elements, do not place it in household trash.",
        "eco_tip": "Conduct a personal waste audit to identify recurring single-use trash items and replace them with durable alternatives.",
        "safety_warning": "Check for hazardous properties: never dispose of batteries, pressurized aerosol cans, or corrosive substances in household trash.",
        "common_examples": ["Composite laminated foil/plastic pouches", "Heavily soiled packaging", "Broken miscellaneous plastic toys", "Sanitary waste"]
    }
}

def get_recommendation_for_category(category: str) -> Optional[Dict[str, Any]]:
    return RECOMMENDATIONS_DATABASE.get(category.lower())
