export type PODItem = {
  item: string;
  description: string;
  why: string;
};

export type PhotoCheckItem = {
  what: string;
  why: string;
};

export type DeliveryBufferResult = {
  days: number;
  factors: string[];
};

export type PODMistake = {
  mistake: string;
  consequence: string;
  prevention: string;
};

const CITY_TRANSIT_DAYS: Record<string, number> = {
  jaipur: 1,
  jodhpur: 2,
  udaipur: 2,
  kota: 2,
  ajmer: 1,
  bikaner: 3,
  delhi: 3,
  mumbai: 5,
  bangalore: 5,
  hyderabad: 4,
};

const PINCODE_REGION_DAYS: Record<string, number> = {
  "30": 0,
  "31": 1,
  "32": 1,
  "33": 2,
  "34": 2,
};

export function getPODChecklist(): {
  required: PODItem[];
  recommended: PODItem[];
} {
  return {
    required: [
      {
        item: "Government office stamp (round seal)",
        description: "Official round seal of the receiving department",
        why: "Without stamp, GeM consignee may reject acceptance — no CRAC generated",
      },
      {
        item: "Receiver's signature",
        description: "Authorized signatory of the consignee department",
        why: "Proves handover to government representative, not a security guard or clerk",
      },
      {
        item: "Date of delivery",
        description: "Date written clearly on delivery challan / POD",
        why: "Starts the 45-day MSMED payment clock after CRAC",
      },
      {
        item: "Receiver's name and designation",
        description: "Full name + post (e.g. Store Keeper, AO)",
        why: "GeM audits who accepted goods — vague signatures are rejected",
      },
      {
        item: '"Received in good condition" note',
        description: "Written confirmation that goods arrived undamaged",
        why: "Prevents buyer from later claiming damage to delay payment",
      },
    ],
    recommended: [
      {
        item: "Your company stamp",
        description: "Seller stamp on duplicate copy",
        why: "Strengthens your record in payment disputes",
      },
      {
        item: "Quantity tally",
        description: "Item count verified and noted on challan",
        why: "Avoids short-delivery disputes during CRAC",
      },
      {
        item: "Mobile number of receiver",
        description: "Optional contact for follow-up",
        why: "Helps if CRAC is delayed — you can follow up directly",
      },
    ],
  };
}

export function getPhotoChecklist(): PhotoCheckItem[] {
  return [
    {
      what: "Delivery truck at government office",
      why: "Proves you reached the correct location on the stated date",
    },
    {
      what: "Goods being unloaded",
      why: "Shows quantity and condition at point of handover",
    },
    {
      what: "Goods at destination (office in background)",
      why: "Links delivery to the specific government building",
    },
    {
      what: "Close-up of stamp and signature",
      why: "Readable proof if buyer later disputes acceptance",
    },
    {
      what: "Your delivery challan",
      why: "Matches GeM order ID and quantity for CRAC verification",
    },
  ];
}

function normalizeCity(city: string): string {
  return city.toLowerCase().trim();
}

function pincodePrefix(pincode: string): string {
  return pincode.trim().slice(0, 2);
}

export function calculateDeliveryBuffer(
  origin: string,
  destination: string
): DeliveryBufferResult {
  const originCity = normalizeCity(origin);
  const destPin = destination.trim();
  const factors: string[] = [];
  let days = 2;

  const originDays = CITY_TRANSIT_DAYS[originCity];
  if (originDays !== undefined) {
    days = originDays;
    factors.push(`Origin hub: ${origin} (+${originDays} base day${originDays > 1 ? "s" : ""})`);
  } else {
    days = 3;
    factors.push(`Origin ${origin}: standard 3-day dispatch buffer`);
  }

  const pinPrefix = pincodePrefix(destPin);
  const regionDays = PINCODE_REGION_DAYS[pinPrefix];
  if (regionDays !== undefined) {
    days += regionDays;
    factors.push(`Destination pin ${destPin}: +${regionDays} regional transit day${regionDays !== 1 ? "s" : ""}`);
  } else if (destPin.length >= 6) {
    days += 3;
    factors.push(`Remote pin code ${destPin}: +3 days for last-mile delivery`);
  } else {
    factors.push("Enter a valid 6-digit pin code for accurate estimate");
  }

  days += 1;
  factors.push("+1 day buffer for government office receiving hours (10 AM–5 PM)");

  if (days >= 4) {
    factors.push("Recommend scheduling delivery before 2 PM for same-day acceptance");
  }

  return { days, factors };
}

export function getCommonPODMistakes(): PODMistake[] {
  return [
    {
      mistake: "Delivered without getting stamp/signature",
      consequence: "No CRAC generated — payment indefinitely delayed",
      prevention: "Do not unload until authorized receiver is present with official seal",
    },
    {
      mistake: "No photo evidence",
      consequence: "Buyer can claim non-delivery — you have no proof",
      prevention: "Take all 5 checklist photos before leaving the site",
    },
    {
      mistake: "Delivered to wrong person (not authorized receiver)",
      consequence: "CRAC rejected — goods considered not delivered",
      prevention: "Verify receiver name matches GeM consignee contact before handover",
    },
    {
      mistake: "Left goods at gate without confirmation",
      consequence: "Buyer disputes receipt — payment blocked",
      prevention: "Wait for indoor acceptance. Never leave goods unattended.",
    },
    {
      mistake: "Delivery challan missing GeM order ID",
      consequence: "Accounts team cannot match payment to order",
      prevention: "Print GeM order summary and attach to delivery challan",
    },
  ];
}
