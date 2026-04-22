import {
  Driver, WeekRoster, LeaveRequest, OvertimeRecord,
  AllowancePackage, Journey, DigitalTicket,
} from "@/types/ffims-types";

// ── Drivers ────────────────────────────────────────────────────────────
export const DRIVERS: Driver[] = [
  { id:1,  name:"T. Chikwanda",  team:"A", licenseClass:"Class 4", skillTags:["bus","long-route"],  weeklyHours:42, seniorityYears:8,  recentOtHours:6, status:"duty",    phone:"+263771000001", gpsLat:-17.8252, gpsLng:31.0335 },
  { id:2,  name:"S. Mutasa",     team:"A", licenseClass:"Class 4", skillTags:["bus","night-duty"],  weeklyHours:38, seniorityYears:5,  recentOtHours:2, status:"duty",    phone:"+263771000002", gpsLat:-17.8290, gpsLng:31.0524 },
  { id:3,  name:"F. Dube",       team:"A", licenseClass:"Class 3", skillTags:["van","light-duty"],  weeklyHours:40, seniorityYears:3,  recentOtHours:4, status:"standby", phone:"+263771000003", gpsLat:-17.8350, gpsLng:31.0412 },
  { id:4,  name:"P. Nyoni",      team:"A", licenseClass:"Class 4", skillTags:["bus","events"],      weeklyHours:35, seniorityYears:6,  recentOtHours:0, status:"duty",    phone:"+263771000004", gpsLat:-17.8180, gpsLng:31.0290 },
  { id:5,  name:"R. Moyo",       team:"A", licenseClass:"Class 2", skillTags:["hgv","specialist"],  weeklyHours:44, seniorityYears:10, recentOtHours:8, status:"ot",      phone:"+263771000005", gpsLat:-17.8400, gpsLng:31.0600 },
  { id:6,  name:"J. Sithole",    team:"B", licenseClass:"Class 4", skillTags:["bus","night-duty"],  weeklyHours:8,  seniorityYears:4,  recentOtHours:0, status:"rest",    phone:"+263771000006" },
  { id:7,  name:"L. Banda",      team:"B", licenseClass:"Class 3", skillTags:["van","garden"],      weeklyHours:8,  seniorityYears:2,  recentOtHours:0, status:"rest",    phone:"+263771000007" },
  { id:8,  name:"C. Mwale",      team:"B", licenseClass:"Class 4", skillTags:["bus","long-route"],  weeklyHours:8,  seniorityYears:7,  recentOtHours:0, status:"rest",    phone:"+263771000008" },
  { id:9,  name:"D. Phiri",      team:"B", licenseClass:"Class 2", skillTags:["hgv","brush-cut"],   weeklyHours:8,  seniorityYears:9,  recentOtHours:0, status:"rest",    phone:"+263771000009" },
  { id:10, name:"M. Tembo",      team:"B", licenseClass:"Class 4", skillTags:["bus","events"],      weeklyHours:8,  seniorityYears:1,  recentOtHours:0, status:"rest",    phone:"+263771000010" },
];

// ── Allowance packages lookup table ────────────────────────────────────
export const ALLOWANCE_PACKAGES: AllowancePackage[] = [
  { id:"ap-local",      name:"Local Package",          type:"local",          minDistanceKm:0,   maxDistanceKm:30,   rateUsd:5,   couponCode:"LOC-A", description:"Within Mutare city limits" },
  { id:"ap-local-b",    name:"Local Extended",         type:"local",          minDistanceKm:30,  maxDistanceKm:80,   rateUsd:10,  couponCode:"LOC-B", description:"Mutare metro area" },
  { id:"ap-longdist-a", name:"Long-Distance Package A", type:"long-distance", minDistanceKm:80,  maxDistanceKm:200,  rateUsd:25,  couponCode:"LD-A",  description:"Provincial routes" },
  { id:"ap-longdist-b", name:"Long-Distance Package B", type:"long-distance", minDistanceKm:200, maxDistanceKm:400,  rateUsd:45,  couponCode:"LD-B",  description:"Inter-provincial, overnight eligible" },
  { id:"ap-crossborder",name:"Cross-Border Package",   type:"cross-border",   minDistanceKm:400, maxDistanceKm:9999, rateUsd:80,  couponCode:"CB-A",  description:"International — Mozambique / Zambia / SA" },
  { id:"ap-earlystart", name:"Early Start Supplement", type:"early-start",    minDistanceKm:0,   maxDistanceKm:9999, rateUsd:8,   couponCode:"ES-A",  description:"4:00–5:30 AM shift starts" },
];

export function getAllowanceForDistance(km: number): AllowancePackage {
  return (
    ALLOWANCE_PACKAGES.find((p) => p.type !== "early-start" && km >= p.minDistanceKm && km < p.maxDistanceKm) ??
    ALLOWANCE_PACKAGES[ALLOWANCE_PACKAGES.length - 2]
  );
}

// ── Journeys seed data ─────────────────────────────────────────────────
// Africa University Mutare campus coordinates: -18.9707, 32.6709
const AU_LAT = -18.9707;
const AU_LNG = 32.6709;

export const JOURNEYS: Journey[] = [
  {
    id: "j-001", driverId: 1, driverName: "T. Chikwanda",
    date: "2026-04-10", shiftStart: "04:30",
    destination: "Mutare CBD — Staff Pickup",
    destinationLat: -18.9697, destinationLng: 32.6500,
    originLat: AU_LAT, originLng: AU_LNG,
    distanceKm: 8, journeyType: "local",
    status: "completed",
    allowancePackageId: "ap-local",
    estimatedDurationMin: 25, actualDurationMin: 28,
    completedAt: "2026-04-10T05:08:00Z",
    notes: "Night-duty staff pickup route A",
  },
  {
    id: "j-002", driverId: 4, driverName: "P. Nyoni",
    date: "2026-04-10", shiftStart: "06:00",
    destination: "Harare — VIP Delegation",
    destinationLat: -17.8292, destinationLng: 31.0522,
    originLat: AU_LAT, originLng: AU_LNG,
    distanceKm: 263, journeyType: "long-distance",
    status: "in-progress",
    allowancePackageId: "ap-longdist-b",
    estimatedDurationMin: 210,
    etaTimestamp: "2026-04-10T09:30:00Z",
    notes: "Vice Chancellor delegation — Conference Centre",
  },
  {
    id: "j-003", driverId: 2, driverName: "S. Mutasa",
    date: "2026-04-11", shiftStart: "04:30",
    destination: "Mutare North — Staff Pickup",
    destinationLat: -18.9500, destinationLng: 32.6800,
    originLat: AU_LAT, originLng: AU_LNG,
    distanceKm: 5, journeyType: "local",
    status: "scheduled",
    allowancePackageId: "ap-local",
    estimatedDurationMin: 20,
    notes: "Night-duty staff pickup route B",
  },
  {
    id: "j-004", driverId: 5, driverName: "R. Moyo",
    date: "2026-04-10", shiftStart: "07:00",
    destination: "Beira, Mozambique — Cross-border supply",
    destinationLat: -19.8437, destinationLng: 34.8389,
    originLat: AU_LAT, originLng: AU_LNG,
    distanceKm: 290, journeyType: "cross-border",
    status: "delayed",
    allowancePackageId: "ap-crossborder",
    estimatedDurationMin: 240,
    delayMinutes: 35,
    etaTimestamp: "2026-04-10T14:35:00Z",
    notes: "Border crossing — Machipanda. HGV specialist required.",
  },
];

// ── Digital tickets ────────────────────────────────────────────────────
export const DIGITAL_TICKETS: DigitalTicket[] = [
  {
    id: "tk-001", journeyId: "j-001", driverId: 1, driverName: "T. Chikwanda",
    allowancePackageId: "ap-local", couponCode: "LOC-A", rateUsd: 5,
    issuedAt: "2026-04-10T05:10:00Z", status: "redeemed",
    redeemedAt: "2026-04-10T08:00:00Z", auditRef: "PAY-2026-0410-001",
  },
  {
    id: "tk-002", journeyId: "j-004", driverId: 5, driverName: "R. Moyo",
    allowancePackageId: "ap-crossborder", couponCode: "CB-A", rateUsd: 80,
    issuedAt: "2026-04-10T07:05:00Z", status: "issued",
  },
  {
    id: "tk-003", journeyId: "j-002", driverId: 4, driverName: "P. Nyoni",
    allowancePackageId: "ap-longdist-b", couponCode: "LD-B", rateUsd: 45,
    issuedAt: "2026-04-10T06:05:00Z", status: "issued",
  },
  {
    id: "tk-004", journeyId: "j-003", driverId: 2, driverName: "S. Mutasa",
    allowancePackageId: "ap-local", couponCode: "LOC-A", rateUsd: 5,
    issuedAt: "2026-04-11T04:35:00Z", status: "issued",
  },
];

// ── Existing roster seed data (unchanged) ──────────────────────────────
export const INITIAL_ROSTER: WeekRoster = {
  weekId: "2026-W15", startDate: "2026-04-07",
  roster: {
    1:  [{driverId:1,type:"duty",journeyId:"j-001"},{driverId:1,type:"duty"},{driverId:1,type:"duty"},{driverId:1,type:"duty"},{driverId:1,type:"duty"},{driverId:1,type:"rest"},{driverId:1,type:"rest"}],
    2:  [{driverId:2,type:"duty"},{driverId:2,type:"standby"},{driverId:2,type:"duty"},{driverId:2,type:"duty"},{driverId:2,type:"leave"},{driverId:2,type:"rest"},{driverId:2,type:"rest"}],
    3:  [{driverId:3,type:"standby"},{driverId:3,type:"duty"},{driverId:3,type:"duty"},{driverId:3,type:"standby"},{driverId:3,type:"duty"},{driverId:3,type:"rest"},{driverId:3,type:"rest"}],
    4:  [{driverId:4,type:"duty",journeyId:"j-002"},{driverId:4,type:"duty"},{driverId:4,type:"standby"},{driverId:4,type:"duty"},{driverId:4,type:"duty"},{driverId:4,type:"rest"},{driverId:4,type:"rest"}],
    5:  [{driverId:5,type:"ot",journeyId:"j-004"},{driverId:5,type:"duty"},{driverId:5,type:"duty"},{driverId:5,type:"duty"},{driverId:5,type:"duty"},{driverId:5,type:"rest"},{driverId:5,type:"rest"}],
    6:  [{driverId:6,type:"rest"},{driverId:6,type:"rest"},{driverId:6,type:"rest"},{driverId:6,type:"rest"},{driverId:6,type:"rest"},{driverId:6,type:"duty"},{driverId:6,type:"standby"}],
    7:  [{driverId:7,type:"rest"},{driverId:7,type:"rest"},{driverId:7,type:"rest"},{driverId:7,type:"rest"},{driverId:7,type:"rest"},{driverId:7,type:"standby"},{driverId:7,type:"duty"}],
    8:  [{driverId:8,type:"rest"},{driverId:8,type:"rest"},{driverId:8,type:"rest"},{driverId:8,type:"rest"},{driverId:8,type:"rest"},{driverId:8,type:"duty"},{driverId:8,type:"duty"}],
    9:  [{driverId:9,type:"rest"},{driverId:9,type:"rest"},{driverId:9,type:"rest"},{driverId:9,type:"rest"},{driverId:9,type:"rest"},{driverId:9,type:"duty"},{driverId:9,type:"duty"}],
    10: [{driverId:10,type:"rest"},{driverId:10,type:"rest"},{driverId:10,type:"rest"},{driverId:10,type:"rest"},{driverId:10,type:"rest"},{driverId:10,type:"rest"},{driverId:10,type:"rest"}],
  },
};

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id:"lr-001", driverId:2, driverName:"S. Mutasa",  startDate:"2026-04-11", endDate:"2026-04-11", reason:"Medical appointment", status:"approved",  submittedAt:"2026-04-07T08:00:00Z", reviewedBy:"Supervisor", reviewedAt:"2026-04-07T09:00:00Z" },
  { id:"lr-002", driverId:4, driverName:"P. Nyoni",   startDate:"2026-04-14", endDate:"2026-04-15", reason:"Family event",       status:"pending",   submittedAt:"2026-04-08T10:00:00Z" },
  { id:"lr-003", driverId:7, driverName:"L. Banda",   startDate:"2026-04-20", endDate:"2026-04-22", reason:"Annual leave",       status:"pending",   submittedAt:"2026-04-08T14:00:00Z" },
  { id:"lr-004", driverId:3, driverName:"F. Dube",    startDate:"2026-04-09", endDate:"2026-04-09", reason:"Sick leave",         status:"rejected",  submittedAt:"2026-04-08T07:00:00Z", reviewedBy:"Supervisor", reviewedAt:"2026-04-08T08:30:00Z" },
];

export const OVERTIME_RECORDS: OvertimeRecord[] = [
  { id:"ot-001", driverId:5, driverName:"R. Moyo",      date:"2026-04-07", hours:4, rate:1.5, reason:"Graduation ceremony transport", status:"accepted",  approvedBy:"Supervisor", journeyDistanceKm:290, allowancePackageId:"ap-crossborder" },
  { id:"ot-002", driverId:1, driverName:"T. Chikwanda",  date:"2026-04-08", hours:2, rate:1.5, reason:"Late VIP guest transfer",       status:"proposed",  journeyDistanceKm:8,   allowancePackageId:"ap-local" },
  { id:"ot-003", driverId:8, driverName:"C. Mwale",      date:"2026-04-12", hours:3, rate:1.5, reason:"Conference week coverage",      status:"proposed",  journeyDistanceKm:263, allowancePackageId:"ap-longdist-b" },
];
