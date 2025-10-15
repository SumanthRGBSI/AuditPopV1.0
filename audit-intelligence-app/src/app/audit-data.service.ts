import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditDataService {

  constructor() { }

  demoData = { "q1.1": { supplierScore: 3, auditorScore: 3, auditorComment: "All exits are clear and well-lit. Excellent." }, "q1.2": { supplierScore: 3, auditorScore: 2, auditorComment: "Log indicates maintenance was due last week for extinguishers on the west wall.", findings: [{ name: "Extinguisher maintenance overdue", type: "Area for Improvement" }] }, "q1.3": { supplierScore: 2, auditorScore: 1, auditorComment: "First aid kit in assembly area is missing bandages and antiseptic wipes.", findings: [{ name: "Incomplete first aid kit", type: "Non-Conformance" }] }, "q1.4": { supplierScore: 3, auditorScore: 3, auditorComment: "Drill logs are up to date and routes are clearly posted." }, "q2.1": { supplierScore: 2, auditorScore: 1, auditorComment: "Guard on lathe #3 is cracked and has been temporarily repaired with duct tape.", findings: [{ name: "Cracked machine guard", type: "Non-Conformance" }, { name: "Improper guard repair", type: "Non-Conformance" }] }, "q2.2": { supplierScore: 3, auditorScore: 3, auditorComment: "Observed proper LOTO procedure during maintenance of the conveyor belt." }, "q2.3": { supplierScore: 3, auditorScore: 2, auditorComment: "E-stop on the main press is partially obstructed by a waste bin." , findings: [{ name: "Obstructed E-stop button", type: "Area for Improvement" }] }, "q3.1": { supplierScore: 3, auditorScore: 3, auditorComment: "Digital SDS database is easily accessible from all workstations." }, "q3.2": { supplierScore: 2, auditorScore: 2, auditorComment: "Secondary containment for the main chemical storage is adequate, but a temporary drum storage area lacks it.", findings: [{ name: "Lack of secondary containment for temporary storage", type: "Area for Improvement" }] }, "q4.1": { supplierScore: 3, auditorScore: 2, auditorComment: "Panel 4B has pallets stored within the 3-foot clearance zone.", findings: [{ name: "Obstructed electrical panel", type: "Non-Conformance" }] }, "q4.2": { supplierScore: 2, auditorScore: 1, auditorComment: "Extension cord running to the ventilation fan is frayed near the plug.", findings: [{ name: "Frayed extension cord in use", type: "Non-Conformance" }] },};
  auditQuestions = {
      "chapter-1": {
          title: "Emergency Preparedness",
          questions: [
              { text: "Are emergency exits clearly marked and unobstructed?" },
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
