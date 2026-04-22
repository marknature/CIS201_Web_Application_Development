import { Driver, WeekRoster, LeaveRequest, OvertimeRecord } from "@/types/ffims-types";

export const DRIVERS: Driver[] = [
  { id: 1, name: "T. Chikwanda",  team: "A", licenseClass: "Class 4", skillTags: ["bus","long-route"], weeklyHours: 42, seniorityYears: 8, recentOtHours: 6, status: "duty",    phone: "+263771000001" },
  { id: 2, name: "S. Mutasa",     team: "A", licenseClass: "Class 4", skillTags: ["bus","night-duty"], weeklyHours: 38, seniorityYears: 5, recentOtHours: 2, status: "duty",    phone: "+263771000002" },
  { id: 3, name: "F. Dube",       team: "A", licenseClass: "Class 3", skillTags: ["van","light-duty"], weeklyHours: 40, seniorityYears: 3, recentOtHours: 4, status: "standby", phone: "+263771000003" },
  { id: 4, name: "P. Nyoni",      team: "A", licenseClass: "Class 4", skillTags: ["bus","events"],     weeklyHours: 35, seniorityYears: 6, recentOtHours: 0, status: "duty",    phone: "+263771000004" },
  { id: 5, name: "R. Moyo",       team: "A", licenseClass: "Class 2", skillTags: ["hgv","specialist"], weeklyHours: 44, seniorityYears: 10,recentOtHours: 8, status: "ot",      phone: "+263771000005" },
  { id: 6, name: "J. Sithole",    team: "B", licenseClass: "Class 4", skillTags: ["bus","night-duty"], weeklyHours: 8,  seniorityYears: 4, recentOtHours: 0, status: "rest",    phone: "+263771000006" },
  { id: 7, name: "L. Banda",      team: "B", licenseClass: "Class 3", skillTags: ["van","garden"],     weeklyHours: 8,  seniorityYears: 2, recentOtHours: 0, status: "rest",    phone: "+263771000007" },
  { id: 8, name: "C. Mwale",      team: "B", licenseClass: "Class 4", skillTags: ["bus","long-route"], weeklyHours: 8,  seniorityYears: 7, recentOtHours: 0, status: "rest",    phone: "+263771000008" },
  { id: 9, name: "D. Phiri",      team: "B", licenseClass: "Class 2", skillTags: ["hgv","brush-cut"],  weeklyHours: 8,  seniorityYears: 9, recentOtHours: 0, status: "rest",    phone: "+263771000009" },
  { id: 10,name: "M. Tembo",      team: "B", licenseClass: "Class 4", skillTags: ["bus","events"],     weeklyHours: 8,  seniorityYears: 1, recentOtHours: 0, status: "rest",    phone: "+263771000010" },
];

export const INITIAL_ROSTER: WeekRoster = {
  weekId: "2026-W15",
  startDate: "2026-04-07",
  roster: {
    1:  [{ driverId:1,  type:"duty" },    { driverId:1,  type:"duty" },    { driverId:1,  type:"duty" },    { driverId:1,  type:"duty" },    { driverId:1,  type:"duty" },    { driverId:1,  type:"rest" }, { driverId:1,  type:"rest" }],
    2:  [{ driverId:2,  type:"duty" },    { driverId:2,  type:"standby" }, { driverId:2,  type:"duty" },    { driverId:2,  type:"duty" },    { driverId:2,  type:"leave" },   { driverId:2,  type:"rest" }, { driverId:2,  type:"rest" }],
    3:  [{ driverId:3,  type:"standby" }, { driverId:3,  type:"duty" },    { driverId:3,  type:"duty" },    { driverId:3,  type:"standby" }, { driverId:3,  type:"duty" },    { driverId:3,  type:"rest" }, { driverId:3,  type:"rest" }],
    4:  [{ driverId:4,  type:"duty" },    { driverId:4,  type:"duty" },    { driverId:4,  type:"standby" }, { driverId:4,  type:"duty" },    { driverId:4,  type:"duty" },    { driverId:4,  type:"rest" }, { driverId:4,  type:"rest" }],
    5:  [{ driverId:5,  type:"ot" },      { driverId:5,  type:"duty" },    { driverId:5,  type:"duty" },    { driverId:5,  type:"duty" },    { driverId:5,  type:"duty" },    { driverId:5,  type:"rest" }, { driverId:5,  type:"rest" }],
    6:  [{ driverId:6,  type:"rest" },    { driverId:6,  type:"rest" },    { driverId:6,  type:"rest" },    { driverId:6,  type:"rest" },    { driverId:6,  type:"rest" },    { driverId:6,  type:"duty" }, { driverId:6,  type:"standby" }],
    7:  [{ driverId:7,  type:"rest" },    { driverId:7,  type:"rest" },    { driverId:7,  type:"rest" },    { driverId:7,  type:"rest" },    { driverId:7,  type:"rest" },    { driverId:7,  type:"standby" },{ driverId:7, type:"duty" }],
    8:  [{ driverId:8,  type:"rest" },    { driverId:8,  type:"rest" },    { driverId:8,  type:"rest" },    { driverId:8,  type:"rest" },    { driverId:8,  type:"rest" },    { driverId:8,  type:"duty" }, { driverId:8,  type:"duty" }],
    9:  [{ driverId:9,  type:"rest" },    { driverId:9,  type:"rest" },    { driverId:9,  type:"rest" },    { driverId:9,  type:"rest" },    { driverId:9,  type:"rest" },    { driverId:9,  type:"duty" }, { driverId:9,  type:"duty" }],
    10: [{ driverId:10, type:"rest" },    { driverId:10, type:"rest" },    { driverId:10, type:"rest" },    { driverId:10, type:"rest" },    { driverId:10, type:"rest" },    { driverId:10, type:"rest" }, { driverId:10, type:"rest" }],
  },
};

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id:"lr-001", driverId:2, driverName:"S. Mutasa",  startDate:"2026-04-11", endDate:"2026-04-11", reason:"Medical appointment", status:"approved",  submittedAt:"2026-04-07T08:00:00Z", reviewedBy:"Supervisor", reviewedAt:"2026-04-07T09:00:00Z" },
  { id:"lr-002", driverId:4, driverName:"P. Nyoni",   startDate:"2026-04-14", endDate:"2026-04-15", reason:"Family event",       status:"pending",   submittedAt:"2026-04-08T10:00:00Z" },
  { id:"lr-003", driverId:7, driverName:"L. Banda",   startDate:"2026-04-20", endDate:"2026-04-22", reason:"Annual leave",       status:"pending",   submittedAt:"2026-04-08T14:00:00Z" },
  { id:"lr-004", driverId:3, driverName:"F. Dube",    startDate:"2026-04-09", endDate:"2026-04-09", reason:"Sick leave",         status:"rejected",  submittedAt:"2026-04-08T07:00:00Z", reviewedBy:"Supervisor", reviewedAt:"2026-04-08T08:30:00Z" },
];

export const OVERTIME_RECORDS: OvertimeRecord[] = [
  { id:"ot-001", driverId:5, driverName:"R. Moyo",     date:"2026-04-07", hours:4, rate:1.5, reason:"Graduation ceremony transport", status:"accepted",  approvedBy:"Supervisor" },
  { id:"ot-002", driverId:1, driverName:"T. Chikwanda", date:"2026-04-08", hours:2, rate:1.5, reason:"Late VIP guest transfer",       status:"proposed" },
  { id:"ot-003", driverId:8, driverName:"C. Mwale",    date:"2026-04-12", hours:3, rate:1.5, reason:"Conference week coverage",      status:"proposed" },
];
