import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditDataService } from '../audit-data.service';

declare var Chart: any;

@Component({
  selector: 'app-audit-view',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private auditDataService: AuditDataService) {
    this.auditQuestions = this.auditDataService.auditQuestions;
    this.demoData = this.auditDataService.demoData;
  }

  ngOnInit() {
    this.calculateScores();
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    if (tabId === 'view-score-details') {
      this.generateCharts();
    }
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
