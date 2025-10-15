import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditDataService } from '../audit-data.service';

declare var Chart: any;

@Component({
  selector: 'app-audit-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-view.component.html',
  styleUrls: ['./audit-view.component.css']
})
export class AuditViewComponent implements OnInit {
  @ViewChild('overallScoreChart') overallScoreChart: ElementRef;
  @ViewChild('scoreByChapterChart') scoreByChapterChart: ElementRef;

  auditQuestions: any;
  demoData: any;
  objectKeys = Object.keys;
  activeTab: string = 'view-assessment';

  overallScore: number = 0;
  chapterScores: any[] = [];
  scoreBreakdown: any[] = [];
  totalFindings: number = 0;
  allFindings: any[] = [];
  openQuestions: { [key: string]: boolean } = {};
  openFindings: { [key: string]: boolean } = {};
  isDescriptionExpanded: { [key: string]: boolean } = {};
  colorConfig = {
    highScore: { threshold: 90, class: 'bg-green-100 hover:bg-green-200' },
    mediumScore: { threshold: 70, class: 'bg-amber-100 hover:bg-amber-200' },
    lowScore: { class: 'bg-red-100 hover:bg-red-200' }
  };
  scoreDescriptions = {
    3: "No issues found or process exceeds expectations.",
    2: "Minor issue(s) found, not affecting process safety or quality.",
    1: "Significant issue(s) found, process may be compromised."
  };

  constructor(private auditDataService: AuditDataService) {
    this.auditQuestions = this.auditDataService.auditQuestions;
    this.demoData = this.auditDataService.demoData;
  }

  ngOnInit() {
    this.calculateScores();
    this.generateCharts();
    this.getAllFindings();
  }

  getAllFindings() {
    this.allFindings = [];
    for (const chapterKey in this.auditQuestions) {
      const chapter = this.auditQuestions[chapterKey];
      chapter.questions.forEach((question, qIndex) => {
        const questionId = `q${chapterKey.split('-')[1]}.${qIndex + 1}`;
        if (this.demoData[questionId] && this.demoData[questionId].findings) {
          this.demoData[questionId].findings.forEach(finding => {
            this.allFindings.push({
              ...finding,
              questionText: question.text,
              questionId: questionId,
              chapterTitle: chapter.title,
              attachment: question.attachment
            });
          });
        }
      });
    }
  }

  isQuestionOpen(questionId: string): boolean {
    return this.openQuestions[questionId] || false;
  }

  toggleQuestion(questionId: string): void {
    this.openQuestions[questionId] = !this.isQuestionOpen(questionId);
  }

  isFindingOpen(findingId: string): boolean {
    return this.openFindings[findingId] || false;
  }

  toggleFinding(findingId: string): void {
    this.openFindings[findingId] = !this.isFindingOpen(findingId);
  }

  isDescriptionTruncated(findingId: string, description: string): boolean {
    const isExpanded = this.isDescriptionExpanded[findingId] || false;
    return description.length > 100 && !isExpanded;
  }

  toggleDescription(findingId: string): void {
    this.isDescriptionExpanded[findingId] = !(this.isDescriptionExpanded[findingId] || false);
  }

  getFirstLine(text: string): string {
    if (!text) {
      return '';
    }
    return text.split('\n')[0];
  }

  getScore(questionId: string): number | string {
    return this.demoData[questionId]?.auditorScore || 'N/A';
  }

  updateScore(questionId: string, score: number): void {
    if (!this.demoData[questionId]) {
      this.demoData[questionId] = { auditorScore: 0 };
    }
    this.demoData[questionId].auditorScore = score;
    this.calculateScores();
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
  }

  calculateScores() {
    const auditData = this.getAuditData();
    let totalScore = 0, totalMaxScore = 0;

    this.scoreBreakdown = auditData.map(chapter => {
        totalScore += chapter.score;
        totalMaxScore += chapter.maxScore;
        const percentage = chapter.maxScore > 0 ? ((chapter.score / chapter.maxScore) * 100).toFixed(0) : 0;
        return {
            title: chapter.title,
            score: chapter.score,
            maxScore: chapter.maxScore,
            percentage: percentage,
            findingsCount: chapter.findingsCount
        };
    });

    this.overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    this.chapterScores = this.scoreBreakdown.map(chapter => chapter.percentage);
    this.totalFindings = this.scoreBreakdown.reduce((acc, chapter) => acc + chapter.findingsCount, 0);

    this.generateCharts();
  }

  getAuditData() {
    const data = [];
    for (const chapterKey in this.auditQuestions) {
        const chapterNum = chapterKey.split('-')[1];
        const chapter = this.auditQuestions[chapterKey];
        const chapterData = { id: chapterKey, title: chapter.title, questions: [], score: 0, maxScore: 0, findingsCount: 0 };

        chapter.questions.forEach((question, index) => {
            const qNum = index + 1;
            const qId = `q${chapterNum}.${qNum}`;
            const questionData = this.demoData[qId];
            const score = questionData ? questionData.auditorScore : 0;

            chapterData.score += score;
            chapterData.maxScore += 3;
            chapterData.findingsCount += questionData && questionData.findings ? questionData.findings.length : 0;
        });

        data.push(chapterData);
    }
    return data;
  }

  getChapterColorClass(chapterKey: string): string {
    const chapter = this.auditQuestions[chapterKey];
    if (!chapter || !chapter.questions) {
        return 'bg-gray-50'; // Default color
    }

    const chapterNum = chapterKey.split('-')[1];
    let totalScore = 0;
    let totalMaxScore = 0;

    chapter.questions.forEach((question, index) => {
        const qNum = index + 1;
        const qId = `q${chapterNum}.${qNum}`;
        const questionData = this.demoData[qId];
        const score = questionData ? questionData.auditorScore : 0;
        totalScore += score;
        totalMaxScore += 3; // Assuming max score is 3 for each question
    });

    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    if (percentage >= this.colorConfig.highScore.threshold) {
      return this.colorConfig.highScore.class;
    } else if (percentage >= this.colorConfig.mediumScore.threshold) {
      return this.colorConfig.mediumScore.class;
    } else {
      return this.colorConfig.lowScore.class;
    }
  }

  applyBulkScore(chapterKey: string, score: any) {
    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore)) {
      return;
    }

    const chapter = this.auditQuestions[chapterKey];
    if (!chapter || !chapter.questions) {
      return;
    }

    const chapterNum = chapterKey.split('-')[1];
    chapter.questions.forEach((question, index) => {
      const qNum = index + 1;
      const qId = `q${chapterNum}.${qNum}`;
      if (!this.demoData[qId]) {
        this.demoData[qId] = { auditorScore: 0 };
      }
      this.demoData[qId].auditorScore = parsedScore;
    });

    this.calculateScores();
  }

  getFindings(questionId: string): any[] {
    return this.demoData[questionId]?.findings || [];
  }

  generateCharts() {
    if (this.overallScoreChart) {
      new Chart(this.overallScoreChart.nativeElement, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [this.overallScore, 100 - this.overallScore],
            backgroundColor: ['#4f46e5', '#e5e7eb'],
            borderWidth: 0,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          cutout: '80%',
          plugins: {
            tooltip: { enabled: false }
          }
        }
      });
    }

    if (this.scoreByChapterChart) {
      new Chart(this.scoreByChapterChart.nativeElement, {
        type: 'bar',
        data: {
          labels: this.scoreBreakdown.map(c => c.title),
          datasets: [{
            label: 'Score %',
            data: this.chapterScores,
            backgroundColor: ['#818cf8', '#6366f1', '#4f46e5', '#4338ca'],
            borderRadius: 4,
            maxBarThickness: 30
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              max: 100,
              beginAtZero: true
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}
