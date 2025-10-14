document.addEventListener('DOMContentLoaded', function() {
    let updateTimeout;
    let overallScoreChart, scoreByChapterChart;

    // --- Main View Tab Logic ---
    const viewTabs = document.getElementById('view-tabs');
    const mainContentContainer = document.querySelector('#audit-view-page .pt-6');

    viewTabs.addEventListener('click', (e) => {
        const tabButton = e.target.closest('.view-tab-btn');
        if (!tabButton) return;

        viewTabs.querySelectorAll('.view-tab-btn').forEach(btn => {
            btn.classList.remove('text-indigo-600', 'border-indigo-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        tabButton.classList.add('text-indigo-600', 'border-indigo-600');

        const targetId = tabButton.dataset.target;
        mainContentContainer.querySelectorAll('.view-tab-content').forEach(content => {
            content.classList[content.id === targetId ? 'remove' : 'add']('hidden');
        });
        updateAllConnectedTabs();
    });

    // --- DEMO DATA ---
    const demoData = { "q1.1": { supplierScore: 3, auditorScore: 3, auditorComment: "All exits are clear and well-lit. Excellent." }, "q1.2": { supplierScore: 3, auditorScore: 2, auditorComment: "Log indicates maintenance was due last week for extinguishers on the west wall.", findings: [{ name: "Extinguisher maintenance overdue", type: "Area for Improvement" }] }, "q1.3": { supplierScore: 2, auditorScore: 1, auditorComment: "First aid kit in assembly area is missing bandages and antiseptic wipes.", findings: [{ name: "Incomplete first aid kit", type: "Non-Conformance" }] }, "q1.4": { supplierScore: 3, auditorScore: 3, auditorComment: "Drill logs are up to date and routes are clearly posted." }, "q2.1": { supplierScore: 2, auditorScore: 1, auditorComment: "Guard on lathe #3 is cracked and has been temporarily repaired with duct tape.", findings: [{ name: "Cracked machine guard", type: "Non-Conformance" }, { name: "Improper guard repair", type: "Non-Conformance" }] }, "q2.2": { supplierScore: 3, auditorScore: 3, auditorComment: "Observed proper LOTO procedure during maintenance of the conveyor belt." }, "q2.3": { supplierScore: 3, auditorScore: 2, auditorComment: "E-stop on the main press is partially obstructed by a waste bin." , findings: [{ name: "Obstructed E-stop button", type: "Area for Improvement" }] }, "q3.1": { supplierScore: 3, auditorScore: 3, auditorComment: "Digital SDS database is easily accessible from all workstations." }, "q3.2": { supplierScore: 2, auditorScore: 2, auditorComment: "Secondary containment for the main chemical storage is adequate, but a temporary drum storage area lacks it.", findings: [{ name: "Lack of secondary containment for temporary storage", type: "Area for Improvement" }] }, "q4.1": { supplierScore: 3, auditorScore: 2, auditorComment: "Panel 4B has pallets stored within the 3-foot clearance zone.", findings: [{ name: "Obstructed electrical panel", type: "Non-Conformance" }] }, "q4.2": { supplierScore: 2, auditorScore: 1, auditorComment: "Extension cord running to the ventilation fan is frayed near the plug.", findings: [{ name: "Frayed extension cord in use", type: "Non-Conformance" }] },};
    const auditQuestions = {
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

    function createQuestionHTML(chapterNum, questionNum, question, data) {
        const qId = `q${chapterNum}.${questionNum}`;
        const questionText = question.text;
        const isCheckpoint = question.isCheckpoint;
        const minScore = question.minScore;
        const hasData = !!data;
        const supplierScoreCheck = (val) => hasData && data.supplierScore === val ? 'checked' : '';
        const auditorScoreCheck = (val) => hasData && data.auditorScore === val ? 'checked' : '';
        const auditorComment = hasData ? data.auditorComment || '' : '';
        let findingsHTML = '<div class="text-center text-sm text-gray-500 py-4">No findings yet.</div>';
        if (hasData && data.findings && data.findings.length > 0) {
            findingsHTML = data.findings.map(finding => `<div class="finding-row bg-white p-2 border rounded-md flex items-center gap-3"><input type="text" class="finding-name flex-grow p-1.5 border-0 rounded-md text-sm focus:ring-1 focus:ring-indigo-500" value="${finding.name}" placeholder="Finding Name..."><select class="finding-type p-1.5 border-0 rounded-md text-sm bg-transparent focus:ring-1 focus:ring-indigo-500"><option value="">Select Type</option><option ${finding.type === 'Area for Improvement' ? 'selected' : ''}>Area for Improvement</option><option ${finding.type === 'Non-Conformance' ? 'selected' : ''}>Non-Conformance</option></select><div class="text-gray-400 space-x-2"><button class="hover:text-indigo-600"><i class="fas fa-paperclip"></i></button><button class="hover:text-red-600 remove-finding-btn"><i class="fas fa-trash"></i></button></div></div>`).join('');
        }
        const checkpointIndicator = isCheckpoint ? `<span class="checkpoint-indicator" title="Stopping Parameter Checkpoint"><i class="fas fa-shield-alt text-amber-500 mr-2"></i></span>` : '';
        const flagIcon = `<i class="fas fa-flag flag-icon text-gray-300 hover:text-blue-500 cursor-pointer" title="Flag for follow-up"></i>`;
        return `<div class="question-container bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" data-question-id="${qId}" data-question-text="${questionText}" ${isCheckpoint ? `data-is-checkpoint="true" data-min-score="${minScore}"` : ''} data-flagged="false"><div class="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center"><h4 class="font-semibold text-gray-800 pr-4 flex items-center">${checkpointIndicator}${chapterNum}.${questionNum} - ${questionText}</h4><div class="flex items-center gap-4">${flagIcon}<span class="score-pill text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full whitespace-nowrap">Score: <b class="score-display text-gray-700 font-bold">N/A</b></span></div></div><div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="space-y-4"><div class="grid grid-cols-2 gap-6"><div><label class="text-sm font-semibold text-gray-700">Supplier Score</label><div class="mt-2 space-y-2"><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_supplier_score" ${supplierScoreCheck(3)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="3"> None (3)</label><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_supplier_score" ${supplierScoreCheck(2)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="2"> Low (2)</label><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_supplier_score" ${supplierScoreCheck(1)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="1"> High (1)</label></div></div><div><label class="text-sm font-semibold text-gray-700">Auditor Score</label><div class="mt-2 space-y-2"><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_score" ${auditorScoreCheck(3)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="3"> None (3)</label><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_score" ${auditorScoreCheck(2)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="2"> Low (2)</label><label class="flex items-center text-sm cursor-pointer"><input type="radio" name="${qId}_score" ${auditorScoreCheck(1)} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2" value="1"> High (1)</label></div></div></div><div><label class="text-sm font-semibold text-gray-700">Supplier Comments</label><textarea class="w-full mt-1 p-2 border rounded-md text-sm bg-gray-50" rows="2" placeholder="No comments from supplier." readonly></textarea></div><div><label class="text-sm font-semibold text-gray-700 flex items-center justify-between"><span>Auditor Comments</span><span class="text-gray-400 space-x-3"><i class="fas fa-paperclip cursor-pointer hover:text-indigo-600"></i><i class="fas fa-microphone cursor-pointer hover:text-indigo-600"></i></span></label><textarea class="auditor-comment w-full mt-1 p-2 border rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" rows="2" placeholder="Add auditor comments...">${auditorComment}</textarea></div></div><div><h5 class="font-semibold text-gray-800 mb-2">Findings</h5><div class="findings-content border rounded-lg p-3 bg-gray-50/50 min-h-[150px] space-y-2">${findingsHTML}</div><button class="add-finding-btn mt-3 text-sm text-indigo-600 font-semibold hover:underline"><i class="fas fa-plus-circle mr-1"></i> Add Finding</button></div></div></div>`;
    }

    for (const chapterKey in auditQuestions) {
        const chapterNum = chapterKey.split('-')[1];
        const chapterElement = document.getElementById(chapterKey);
        const questions = auditQuestions[chapterKey].questions;
        let chapterHTML = '';
        questions.forEach((question, index) => {
            const qNum = index + 1;
            const qId = `q${chapterNum}.${qNum}`;
            const data = demoData[qId];
            chapterHTML += createQuestionHTML(chapterNum, qNum, question, data);
        });
        chapterElement.insertAdjacentHTML('beforeend', chapterHTML);
    }

    // Explicitly set the checked property for radios based on demoData to ensure state is correct
    for (const qId in demoData) {
        const data = demoData[qId];
        if (data && data.auditorScore) {
            const radio = document.querySelector(`input[name="${qId}_score"][value="${data.auditorScore}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    }

    const assessmentContent = document.getElementById('assessment-content');
    if (assessmentContent) {
         assessmentContent.addEventListener('click', function(e) {
            const addBtn = e.target.closest('.add-finding-btn');
            if (addBtn) {
                const findingsContent = addBtn.previousElementSibling;
                if (findingsContent.querySelector('.text-center')) findingsContent.innerHTML = '';
                const newFindingHTML = `<div class="finding-row bg-white p-2 border rounded-md flex items-center gap-3"><input type="text" class="finding-name flex-grow p-1.5 border-0 rounded-md text-sm focus:ring-1 focus:ring-indigo-500" placeholder="Finding Name..."><select class="finding-type p-1.5 border-0 rounded-md text-sm bg-transparent focus:ring-1 focus:ring-indigo-500"><option value="">Select Type</option><option>Area for Improvement</option><option>Non-Conformance</option></select><div class="text-gray-400 space-x-2"><button class="hover:text-indigo-600"><i class="fas fa-paperclip"></i></button><button class="hover:text-red-600 remove-finding-btn"><i class="fas fa-trash"></i></button></div></div>`;
                findingsContent.insertAdjacentHTML('beforeend', newFindingHTML);
                updateAllConnectedTabs();
            }
            const removeBtn = e.target.closest('.remove-finding-btn');
            if (removeBtn) {
                const row = removeBtn.closest('.finding-row');
                const findingsContent = row.parentElement;
                row.remove();
                if (findingsContent.children.length === 0) findingsContent.innerHTML = '<div class="text-center text-sm text-gray-500 py-4">No findings yet.</div>';
                updateAllConnectedTabs();
            }

            const flagIcon = e.target.closest('.flag-icon');
            if (flagIcon) {
                const qContainer = flagIcon.closest('.question-container');
                const isFlagged = qContainer.dataset.flagged === 'true';
                qContainer.dataset.flagged = !isFlagged;
                flagIcon.classList.toggle('text-gray-300', isFlagged);
                flagIcon.classList.toggle('text-blue-600', !isFlagged);
                updateAllConnectedTabs();
            }
        });

        assessmentContent.addEventListener('input', function(e) {
            const target = e.target;
            let shouldUpdate = false;

            if (target.matches('input[type="radio"][name$="_score"]')) {
                updateScorePill(target);
                shouldUpdate = true;
            } else if (target.matches('.auditor-comment, .finding-name, .finding-type')) {
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(updateAllConnectedTabs, 500);
            }
        });
    }

    function updateScorePill(radioElement) {
        const qContainer = radioElement.closest('.question-container');
        const scorePill = qContainer.querySelector('.score-pill');
        const scoreDisplay = qContainer.querySelector('.score-display');
        const selectedRadio = qContainer.querySelector(`input[name$="_score"]:checked`);

        if (selectedRadio) {
            const score = selectedRadio.value;
            scoreDisplay.textContent = score;
            scorePill.className = 'score-pill text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap';
            if (score === '1') scorePill.classList.add('bg-red-100', 'text-red-800');
            else if (score === '2') scorePill.classList.add('bg-orange-100', 'text-orange-800');
            else if (score === '3') scorePill.classList.add('bg-green-100', 'text-green-800');

            // Critical Failure Logic
            if (qContainer.dataset.isCheckpoint === 'true') {
                const minScore = parseInt(qContainer.dataset.minScore, 10);
                if (parseInt(score, 10) < minScore) {
                    qContainer.classList.add('critical-failure');
                } else {
                    qContainer.classList.remove('critical-failure');
                }
            }
        } else {
            scoreDisplay.textContent = 'N/A';
            scorePill.className = 'score-pill text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full whitespace-nowrap';
            qContainer.classList.remove('critical-failure');
        }
    }

    const chapterNav = document.getElementById('chapter-nav');
    const chapterSections = document.querySelectorAll('.chapter-section');
    if(chapterNav) {
        chapterNav.addEventListener('change', (e) => {
            if (e.target.classList.contains('quick-apply-score')) {
                const select = e.target;
                const score = select.value;
                if (!score) return;

                const chapterTile = select.closest('.chapter-tile');
                const chapterId = chapterTile.getAttribute('href').substring(1);
                const chapterSection = document.getElementById(chapterId);

                chapterSection.querySelectorAll('.question-container').forEach(qContainer => {
                    const qId = qContainer.dataset.questionId;
                    const radioToCheck = qContainer.querySelector(`input[name="${qId}_score"][value="${score}"]`);
                    if (radioToCheck) {
                        radioToCheck.checked = true;
                        updateScorePill(radioToCheck);
                    }
                });

                updateAllConnectedTabs();
                select.value = ""; // Reset dropdown
            }
        });

        chapterNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT') {
                e.preventDefault();
                return;
            }

            const flagCount = e.target.closest('.flag-count');
            if (flagCount) {
                e.preventDefault();
                const chapterTile = flagCount.closest('.chapter-tile');
                const chapterId = chapterTile.getAttribute('href').substring(1);
                const chapterSection = document.getElementById(chapterId);
                const firstFlagged = chapterSection.querySelector('[data-flagged="true"]');
                if (firstFlagged) {
                    firstFlagged.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstFlagged.classList.add('highlight-question');
                    setTimeout(() => firstFlagged.classList.remove('highlight-question'), 2500);
                }
                return;
            }

            const link = e.target.closest('a');
            if (!link) return;
            e.preventDefault();
            const targetElement = document.querySelector(link.getAttribute('href'));
            if (targetElement) window.scrollTo({ top: targetElement.getBoundingClientRect().top + window.pageYOffset - 150, behavior: "smooth" });
        });
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = chapterNav.querySelector(`a[href="#${id}"]`);
            if (entry.isIntersecting && navLink) {
                chapterNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    }, { rootMargin: "-40% 0px -60% 0px", threshold: 0 });
    if (chapterSections.length > 0) chapterSections.forEach(section => { observer.observe(section); });

    function updateChapterProgress() {
        if (!chapterNav) return;
        chapterSections.forEach(section => {
            const chapterId = section.getAttribute('id');
            const questions = section.querySelectorAll('.question-container');
            let answered = 0, findingsCount = 0, criticalFailures = 0, hasCheckpoints = false, flaggedQuestions = 0;
            questions.forEach(q => {
                if (q.querySelector('input[name$="_score"]:checked')) answered++;
                findingsCount += q.querySelectorAll('.finding-row').length;
                if (q.dataset.isCheckpoint === 'true') {
                    hasCheckpoints = true;
                    if (q.classList.contains('critical-failure')) {
                        criticalFailures++;
                    }
                }
                if (q.dataset.flagged === 'true') {
                    flaggedQuestions++;
                }
            });
            const percentage = questions.length > 0 ? (answered / questions.length) * 100 : 0;
            const navTile = chapterNav.querySelector(`.chapter-tile[href="#${chapterId}"]`);
            if (navTile) {
                navTile.querySelector('.progress-bar').style.width = `${percentage}%`;
                navTile.querySelector('.progress-text').textContent = `${answered}/${questions.length} Qs`;
                navTile.querySelector('.findings-count').innerHTML = `Findings: <b>${findingsCount}</b>`;

                const checkpointIndicator = navTile.querySelector('.checkpoint-tile-indicator');
                checkpointIndicator.classList.toggle('hidden', !hasCheckpoints);

                const criticalFailuresCount = navTile.querySelector('.critical-failures-count');
                criticalFailuresCount.innerHTML = `Failures: <b>${criticalFailures}</b>`;
                criticalFailuresCount.classList.toggle('hidden', criticalFailures === 0);

                const flagCount = navTile.querySelector('.flag-count');
                flagCount.innerHTML = `<i class="fas fa-flag text-blue-500"></i> <b>${flaggedQuestions}</b>`;
                flagCount.classList.toggle('hidden', flaggedQuestions === 0);
            }
        });
    };

    function getAuditData() {
        const data = [];
        document.querySelectorAll('.chapter-section').forEach((chap, i) => {
            const chapterNum = i + 1;
            const chapterData = { id: `chapter-${chapterNum}`, title: auditQuestions[`chapter-${chapterNum}`].title, questions: [], score: 0, maxScore: 0, findingsCount: 0 };
            chap.querySelectorAll('.question-container').forEach(q => {
                const scoreRadio = q.querySelector('input[name$="_score"]:checked');
                const score = scoreRadio ? parseInt(scoreRadio.value) : 0;
                const isCheckpoint = q.dataset.isCheckpoint === 'true';
                const minScore = isCheckpoint ? parseInt(q.dataset.minScore, 10) : null;
                const isCritical = isCheckpoint && score > 0 && score < minScore;

                const questionData = {
                    id: q.dataset.questionId,
                    text: q.dataset.questionText,
                    score: score,
                    maxScore: 3,
                    comment: q.querySelector('.auditor-comment').value,
                    findings: [],
                    isCheckpoint: isCheckpoint,
                    minScore: minScore,
                    isCritical: isCritical,
                    isFlagged: q.dataset.flagged === 'true'
                };
                q.querySelectorAll('.finding-row').forEach(f => {
                    const name = f.querySelector('.finding-name').value;
                    const type = f.querySelector('.finding-type').value;
                    if (name && type) {
                        questionData.findings.push({ name, type });
                        chapterData.findingsCount++;
                    }
                });
                if (scoreRadio) {
                    chapterData.score += questionData.score;
                    chapterData.maxScore += questionData.maxScore;
                }
                chapterData.questions.push(questionData);
            });
            data.push(chapterData);
        });
        return data;
    }

    function generateScoreAndDetailsTab() {
        const auditData = getAuditData();
        let totalScore = 0, totalMaxScore = 0;
        const breakdownBody = document.querySelector('#score-breakdown-table tbody');
        breakdownBody.innerHTML = '';
        const chapterScores = auditData.map(chapter => {
            totalScore += chapter.score;
            totalMaxScore += chapter.maxScore;
            const percentage = chapter.maxScore > 0 ? ((chapter.score / chapter.maxScore) * 100).toFixed(0) : 0;
            breakdownBody.innerHTML += `<tr class="border-b"><td class="p-3 font-medium">${chapter.title}</td><td class="p-3">${chapter.score}</td><td class="p-3">${chapter.maxScore}</td><td class="p-3 font-semibold">${percentage}%</td><td class="p-3">${chapter.findingsCount}</td></tr>`;
            return percentage;
        });
        const overallPercentage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;
        document.getElementById('overallScoreText').textContent = `${overallPercentage}%`;
        const overallCtx = document.getElementById('overallScoreChart').getContext('2d');
        if (overallScoreChart) overallScoreChart.destroy();
        overallScoreChart = new Chart(overallCtx, { type: 'doughnut', data: { datasets: [{ data: [overallPercentage, 100 - overallPercentage], backgroundColor: ['#4f46e5', '#e5e7eb'], borderWidth: 0, borderRadius: 5 }] }, options: { responsive: true, cutout: '80%', plugins: { tooltip: { enabled: false } } } });
        const chapterCtx = document.getElementById('scoreByChapterChart').getContext('2d');
        if (scoreByChapterChart) scoreByChapterChart.destroy();
        scoreByChapterChart = new Chart(chapterCtx, { type: 'bar', data: { labels: auditData.map(c => c.title), datasets: [{ label: 'Score %', data: chapterScores, backgroundColor: ['#818cf8', '#6366f1', '#4f46e5', '#4338ca'], borderRadius: 4, maxBarThickness: 30 }] }, options: { responsive: true, indexAxis: 'y', scales: { x: { max: 100, beginAtZero: true } }, plugins: { legend: { display: false } } } });
    }

    function generateFindingsActionsTab() {
        const auditData = getAuditData();
        const tableBody = document.getElementById('findings-action-table-body');
        tableBody.innerHTML = '';
        let totalFindings = 0, openFindings = 0, overdueFindings = 0;
        auditData.forEach(chapter => {
            chapter.questions.forEach(q => {
                q.findings.forEach(f => {
                    totalFindings++;
                    openFindings++;
                    const isOverdue = Math.random() > 0.8;
                    if (isOverdue) overdueFindings++;
                    const typeClass = f.type === 'Non-Conformance' ? 'status-non-conformance' : 'status-area-for-improvement';
                    const statusClass = isOverdue ? 'status-overdue' : 'status-open';
                    tableBody.innerHTML += `<tr class="border-t cursor-pointer hover:bg-gray-50 finding-nav-row" data-question-id="${q.id}"><td class="p-4 font-medium">${f.name}<br><small class="text-gray-500">From ${q.id.toUpperCase()}</small></td><td class="p-4"><span class="status-pill ${typeClass}">${f.type}</span></td><td class="p-4 ${isOverdue ? 'text-red-600' : ''}">2025-10-25</td><td class="p-4"><span class="status-pill ${statusClass}">${isOverdue ? 'Overdue' : 'Open'}</span></td><td class="p-4"><button class="text-indigo-600 font-semibold manage-finding-btn">Manage</button></td></tr>`;
                });
            });
        });
        document.getElementById('total-findings-count').textContent = totalFindings;
        document.getElementById('open-findings-count').textContent = openFindings - overdueFindings;
        document.getElementById('overdue-findings-count').textContent = overdueFindings;
    }

    function generateReportTab() {
        const auditData = getAuditData();
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = '';
        auditData.forEach(chapter => {
            let questionsHTML = '';
            chapter.questions.forEach(q => {
                if (q.score > 0 || q.comment || q.findings.length > 0) {
                     questionsHTML += `<div class="p-4 border-t"><p class="font-medium">${q.id.toUpperCase()} - ${q.text}</p><div class="mt-2 pl-4 text-sm space-y-2"><p><strong>Score:</strong> ${q.score} / ${q.maxScore}</p>${q.comment ? `<p><strong>Comments:</strong> ${q.comment}</p>` : ''}${q.findings.length > 0 ? `<div><p><strong>Findings:</strong></p><ul class="list-disc pl-5 mt-1 text-gray-700">${q.findings.map(f => `<li>${f.name} (${f.type})</li>`).join('')}</ul></div>` : ''}</div></div>`;
                }
            });
            if (questionsHTML) {
                reportContent.innerHTML += `<div class="border rounded-lg overflow-hidden"><h4 class="font-semibold p-3 bg-gray-100">${chapter.title}</h4>${questionsHTML}</div>`;
            }
        });
    }

    function generateCriticalSummary() {
        const auditData = getAuditData();
        const criticalSummarySection = document.getElementById('critical-summary-section');
        const criticalSummaryList = document.getElementById('critical-summary-list');
        criticalSummaryList.innerHTML = '';

        const criticalQuestions = auditData.flatMap(chapter => chapter.questions).filter(q => q.isCritical);

        if (criticalQuestions.length > 0) {
            criticalQuestions.forEach(q => {
                const listItem = `<a href="#" data-question-id="${q.id}" class="critical-summary-item block p-2.5 bg-white rounded-md hover:bg-gray-50 border border-gray-200 shadow-sm text-sm">
                    <span class="font-semibold text-gray-800">${q.id.toUpperCase()}:</span> ${q.text}
                    <span class="text-xs font-bold text-red-600 float-right bg-red-100 px-2 py-1 rounded">Score: ${q.score} (Min: ${q.minScore})</span>
                </a>`;
                criticalSummaryList.innerHTML += listItem;
            });
            criticalSummarySection.classList.remove('hidden');
        } else {
            criticalSummarySection.classList.add('hidden');
        }
    }

    function updateAllConnectedTabs() {
        updateChapterProgress();

        const activeTab = document.querySelector('.view-tab-btn.text-indigo-600');
        if (!activeTab) return;

        const targetId = activeTab.dataset.target;

        // Always generate summary if the assessment tab is active or becomes active
        if (targetId === 'view-assessment') {
            generateCriticalSummary();
        }

        if (targetId === 'view-score-details') generateScoreAndDetailsTab();
        else if (targetId === 'view-findings-actions') generateFindingsActionsTab();
        else if (targetId === 'view-report') generateReportTab();
    }

    const assessmentContentForSummary = document.getElementById('assessment-content');
    assessmentContentForSummary.addEventListener('click', (e) => {
        const item = e.target.closest('.critical-summary-item');
        if (item) {
            e.preventDefault();
            const questionId = item.dataset.questionId;
            const questionElement = document.querySelector(`.question-container[data-question-id="${questionId}"]`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                questionElement.classList.add('highlight-question');
                setTimeout(() => questionElement.classList.remove('highlight-question'), 2500);
            }
        }
    });

    const findingsActionTab = document.getElementById('view-findings-actions');
    findingsActionTab.addEventListener('click', (e) => {
        const row = e.target.closest('.finding-nav-row');
        if (!row) return;

        if (e.target.closest('.manage-finding-btn')) {
            openModal('manageFindingModal');
            return;
        }

        const questionId = row.dataset.questionId;
        document.querySelector('.view-tab-btn[data-target="view-assessment"]').click();
        setTimeout(() => {
            const questionElement = document.querySelector(`.question-container[data-question-id="${questionId}"]`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                questionElement.classList.add('highlight-question');
                setTimeout(() => questionElement.classList.remove('highlight-question'), 2500);
            }
        }, 100);
    });

    // --- Modal Logic ---
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.add('open'), 10);
        }
    };

    const closeAllModals = () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('open');
            setTimeout(() => modal.classList.add('hidden'), 300);
        });
    };

    window.openModal = openModal;
    window.closeAllModals = closeAllModals;

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeAllModals();
    });

    document.getElementById('view-findings-actions').addEventListener('click', (e) => {
        if (e.target.closest('.manage-finding-btn')) {
            openModal('manageFindingModal');
        }
    });

    setupFindingModalTabs();

    // --- 5 Whys Logic in Modal ---
    const whysContainer = document.getElementById('5-whys-container');
    const addWhyBtn = document.getElementById('addWhyBtn');
    let whyCount = 0;

    const addWhyInput = () => {
        if (whyCount >= 5) return;
        whyCount++;
        const whyBlock = `
            <div class="flex items-start space-x-2 why-block">
                <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-sm">Why?</div>
                <div class="flex-grow">
                    <textarea class="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500" rows="2" placeholder="Because..."></textarea>
                </div>
            </div>
            ${whyCount < 5 ? '<div class="h-6 w-px bg-gray-300 ml-5"></div>' : ''}
        `;
        whysContainer.insertAdjacentHTML('beforeend', whyBlock);
    };

    if (addWhyBtn) {
        addWhyBtn.addEventListener('click', addWhyInput);
        addWhyInput(); // Start with one input
    }

    function setupFindingModalTabs() {
        const findingTabs = document.getElementById('finding-tabs');
        if (!findingTabs) return;
        findingTabs.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.finding-tab-btn');
            if (!tabButton) return;

            findingTabs.querySelectorAll('.finding-tab-btn').forEach(btn => {
                btn.classList.remove('text-indigo-600', 'border-indigo-600');
                btn.classList.add('text-gray-500', 'border-transparent');
            });
            tabButton.classList.add('text-indigo-600', 'border-indigo-600');

            const modalContent = tabButton.closest('.modal-content');
            modalContent.querySelectorAll('.finding-tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(tabButton.dataset.target).classList.remove('hidden');
        });
    }

    function initializeAuditState() {
        document.querySelectorAll('.question-container').forEach(qContainer => {
            const anyRadio = qContainer.querySelector('input[name$="_score"]');
            if (anyRadio) {
                updateScorePill(anyRadio);
            }
        });
        // Initial call to sync tabs and generate summary
        updateAllConnectedTabs();
    }

    // Defer initialization to allow the browser to update the DOM state
    setTimeout(initializeAuditState, 0);
});