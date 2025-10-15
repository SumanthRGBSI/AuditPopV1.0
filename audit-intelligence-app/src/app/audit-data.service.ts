import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditDataService {

  constructor() { }

  demoData = {
    "q1.1": { "supplierScore": 3, "auditorScore": 3, "auditorComment": "All exits are clear and well-lit. Excellent." },
    "q1.2": { "supplierScore": 3, "auditorScore": 2, "auditorComment": "Log indicates maintenance was due last week for extinguishers on the west wall.", "findings": [{ "description": "Extinguisher maintenance overdue by 8 days.", "ownership": "Maintenance Dept.", "correctiveAction": "Schedule Immediate Service", "initialScore": 2, "updatedScore": "N/A", "stoppingParameter": "N", "targetDate": "2025-10-20", "followUpDate": "2025-11-01", "status": "Open" }] },
    "q1.3": { "supplierScore": 2, "auditorScore": 1, "auditorComment": "First aid kit in assembly area is missing bandages and antiseptic wipes.", "findings": [{ "description": "Critical supplies missing from first aid station in Zone B.", "ownership": "Safety Committee", "correctiveAction": "Restock Kit", "initialScore": 1, "updatedScore": "N/A", "stoppingParameter": "Y", "targetDate": "2025-10-15", "followUpDate": "2025-10-22", "status": "Open" }] },
    "q1.4": { "supplierScore": 3, "auditorScore": 3, "auditorComment": "Drill logs are up to date and routes are clearly posted." },
    "q2.1": { "supplierScore": 2, "auditorScore": 1, "auditorComment": "Guard on lathe #3 is cracked and has been temporarily repaired with duct tape.", "findings": [{ "description": "Improper repair on safety guard for lathe #3.", "ownership": "Machine Shop Lead", "correctiveAction": "Replace Guard", "initialScore": 1, "updatedScore": "N/A", "stoppingParameter": "Y", "targetDate": "2025-10-18", "followUpDate": "2025-10-25", "status": "Open" }, { "description": "Second finding for the same issue.", "ownership": "Machine Shop Lead", "correctiveAction": "Replace Guard", "initialScore": 1, "updatedScore": "N/A", "stoppingParameter": "Y", "targetDate": "2025-10-18", "followUpDate": "2025-10-25", "status": "In Progress" }] },
    "q2.2": { "supplierScore": 3, "auditorScore": 3, "auditorComment": "Observed proper LOTO procedure during maintenance of the conveyor belt." },
    "q2.3": { "supplierScore": 3, "auditorScore": 2, "auditorComment": "E-stop on the main press is partially obstructed by a waste bin.", "findings": [{ "description": "Emergency stop button for main press is blocked.", "ownership": "Production Floor Mgr.", "correctiveAction": "Clear Obstruction", "initialScore": 2, "updatedScore": "N/A", "stoppingParameter": "N", "targetDate": "2025-10-15", "followUpDate": "2025-10-16", "status": "Closed" }] },
    "q3.1": { "supplierScore": 3, "auditorScore": 3, "auditorComment": "Digital SDS database is easily accessible from all workstations." },
    "q3.2": { "supplierScore": 2, "auditorScore": 2, "auditorComment": "Secondary containment for the main chemical storage is adequate, but a temporary drum storage area lacks it.", "findings": [{ "description": "Temporary chemical drum storage area near loading dock B is missing secondary containment.", "ownership": "Shipping & Receiving", "correctiveAction": "Install Containment", "initialScore": 2, "updatedScore": "N/A", "stoppingParameter": "N", "targetDate": "2025-10-25", "followUpDate": "2025-11-05", "status": "Open" }] },
    "q4.1": { "supplierScore": 3, "auditorScore": 2, "auditorComment": "Panel 4B has pallets stored within the 3-foot clearance zone.", "findings": [{ "description": "Electrical Panel 4B in the main warehouse is blocked by pallets.", "ownership": "Warehouse Supervisor", "correctiveAction": "Clear Area & Mark Floor", "initialScore": 2, "updatedScore": "N/A", "stoppingParameter": "N", "targetDate": "2025-10-16", "followUpDate": "2025-10-17", "status": "Open" }] },
    "q4.2": { "supplierScore": 2, "auditorScore": 1, "auditorComment": "Extension cord running to the ventilation fan is frayed near the plug.", "findings": [{ "description": "A frayed extension cord is in use for the primary ventilation fan in the paint mixing room.", "ownership": "Facilities", "correctiveAction": "Replace Cord", "initialScore": 1, "updatedScore": "N/A", "stoppingParameter": "Y", "targetDate": "2025-10-15", "followUpDate": "2025-10-15", "status": "Open" }] }
  };
  auditQuestions = {
      "chapter-1": {
          title: "Emergency Preparedness",
          questions: [
              { text: "Are emergency exits clearly marked and unobstructed?", attachment: "emergency_exit_plan.pdf" },
              { text: "Is fire extinguisher maintenance up to date?", isCheckpoint: true, minScore: 2 },
              { text: "Are first aid kits readily available and fully stocked?" },
              { text: "Are evacuation routes clearly posted and drills conducted regularly?" },
              { text: "Is there a designated and known emergency assembly point?" }
          ]
      },
      "chapter-2": {
          title: "Machine Guarding & Safety",
          questions: [
              { text: "Are all rotating parts and pinch points on machinery properly guarded?", isCheckpoint: true, minScore: 2 },
              { text: "Is Lockout/Tagout (LOTO) procedure followed for equipment maintenance?" },
              { text: "Are emergency stop buttons easily accessible and functional?" },
              { text: "Have operators received specific training for the machinery they use?" },
              { text: "Are regular safety inspections of machinery documented?" }
          ]
      },
      "chapter-3": {
          title: "Chemical Safety & Handling",
          questions: [
              { text: "Are Safety Data Sheets (SDS) readily accessible for all hazardous chemicals?" },
              { text: "Is secondary containment used for liquid chemical storage areas?" },
              { text: "Are employees trained on the facility's Hazard Communication program?" },
              { text: "Is appropriate Personal Protective Equipment (PPE) available and used for chemical handling?" },
              { text: "Are chemical storage areas well-ventilated and labeled correctly?" }
          ]
      },
      "chapter-4": {
          title: "Electrical Safety",
          questions: [
              { text: "Are electrical panels clear and unobstructed for at least 3 feet?" },
              { text: "Are flexible cords and cables free from damage or fraying?", isCheckpoint: true, minScore: 2 },
              { text: "Is GFCI protection used in wet or damp locations?" },
              { text: "Are extension cords used only for temporary purposes and not as permanent wiring?" },
              { text: "Are all portable electrical tools in good condition and properly grounded?" }
          ]
      }
  };
}
