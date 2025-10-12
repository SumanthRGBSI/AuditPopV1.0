document.addEventListener('DOMContentLoaded', function() {
    // --- Audit View Tab Logic ---
    const auditViewPage = document.getElementById('audit-view-page');
    const viewTabs = document.getElementById('view-tabs');

    viewTabs.addEventListener('click', (e) => {
        const tabButton = e.target.closest('.view-tab-btn');
        if (!tabButton || tabButton.dataset.target === '#') return;

        viewTabs.querySelectorAll('.view-tab-btn').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        tabButton.classList.add('text-blue-600', 'border-blue-600');

        const targetId = tabButton.dataset.target;
        auditViewPage.querySelectorAll('.view-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        const targetContent = document.getElementById(targetId);
        if(targetContent) {
            targetContent.classList.remove('hidden');
        }

        if (targetId === 'view-score-details') {
            setupScoreCharts();
        }
    });

    // --- Assessment Phase Tab Logic ---
    const assessmentPhaseTabs = document.getElementById('assessment-phase-tabs');
    assessmentPhaseTabs.addEventListener('click', (e) => {
        const phaseButton = e.target.closest('.assessment-phase-btn');
        if (!phaseButton) return;

        assessmentPhaseTabs.querySelectorAll('.assessment-phase-btn').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
        phaseButton.classList.add('text-blue-600', 'border-blue-600');

        document.querySelectorAll('.assessment-phase').forEach(phase => {
            phase.classList.remove('active');
            phase.classList.add('hidden');
        });
        const targetPhase = document.getElementById(`phase-${phaseButton.dataset.phase}`);
        if (targetPhase) {
            targetPhase.classList.add('active');
            targetPhase.classList.remove('hidden');
        }
    });

    // --- Inline Finding Management ---
    document.getElementById('view-assessment').addEventListener('click', function(e) {
        const addBtn = e.target.closest('.add-finding-btn');
        const removeBtn = e.target.closest('.remove-finding-btn');

        if (addBtn) {
            const tableBody = addBtn.previousElementSibling.querySelector('tbody');
            const newRow = document.createElement('tr');
            const rowCount = tableBody.rows.length + 1;
            newRow.innerHTML = `
                <td class="py-1 pr-2">${rowCount}</td>
                <td class="p-1"><input type="text" class="w-full p-1 border rounded-md"></td>
                <td class="p-1">
                    <select class="w-full p-1 border rounded-md">
                        <option>Area for Improvement</option>
                        <option>Non-Conformance</option>
                    </select>
                </td>
                <td class="py-1 pl-2 text-center">
                    <button class="text-gray-500 hover:text-blue-600"><i class="fas fa-paperclip"></i></button>
                    <button class="text-gray-500 hover:text-red-600 remove-finding-btn"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        }

        if (removeBtn) {
            const row = removeBtn.closest('tr');
            const tableBody = row.parentElement;
            row.remove();
            Array.from(tableBody.rows).forEach((r, index) => {
                r.cells[0].textContent = index + 1;
            });
        }
    });

    // --- CHAPTER NAVIGATION AND SCROLL-SPY ---
    const chapterNav = document.getElementById('chapter-nav');
    const chapterSections = document.querySelectorAll('.chapter-section');

    if(chapterNav) {
        chapterNav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = chapterNav.querySelector(`a[href="#${id}"]`);
            if (entry.isIntersecting) {
                chapterNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0
    });

    if (chapterSections.length > 0) {
         chapterSections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- CHAPTER PROGRESS BAR LOGIC ---
    const updateChapterProgress = () => {
        if (!chapterNav) return;
        chapterSections.forEach(section => {
            const chapterId = section.getAttribute('id');
            const questions = section.querySelectorAll('.question-container');
            const totalQuestions = questions.length;

            let answeredQuestions = 0;
            questions.forEach(q => {
                if (q.querySelector('input[type="radio"]:checked')) {
                    answeredQuestions++;
                }
            });

            const percentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

            const navTile = chapterNav.querySelector(`.chapter-tile[href="#${chapterId}"]`);
            if (navTile) {
                const progressBar = navTile.querySelector('.progress-bar');
                const progressText = navTile.querySelector('.progress-text');

                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (progressText) progressText.textContent = `${answeredQuestions}/${totalQuestions} Qs`;
            }
        });
    };

    updateChapterProgress(); // Initial Update

    const assessmentContent = document.getElementById('assessment-content');
    if (assessmentContent) {
        assessmentContent.addEventListener('change', (e) => {
            if (e.target.matches('input[type="radio"]')) {
                updateChapterProgress();
            }
        });
    }

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

    // --- Score Charts ---
    let overallScoreChart, scoreByGroupChart;
    const setupScoreCharts = () => {
        const overallCtx = document.getElementById('overallScoreChart');
        const overallScore = 55;
        document.getElementById('overallScoreText').textContent = `${overallScore}%`;

        if (overallCtx) {
            if (overallScoreChart) overallScoreChart.destroy();
            overallScoreChart = new Chart(overallCtx, {
                type: 'doughnut',
                data: { datasets: [{ data: [overallScore, 100 - overallScore], backgroundColor: ['#2563eb', '#e5e7eb'], borderWidth: 0, borderRadius: 5 }] },
                options: { responsive: true, cutout: '80%', plugins: { tooltip: { enabled: false } } }
            });
        }

        const groupByCtx = document.getElementById('scoreByGroupChart');
        if (groupByCtx) {
            if(scoreByGroupChart) scoreByGroupChart.destroy();
            scoreByGroupChart = new Chart(groupByCtx, {
                type: 'bar',
                data: {
                    labels: ['Emergency Prep', 'Machine Guarding', 'Chemical Safety', 'Electrical Safety'],
                    datasets: [{ label: 'Score %', data: [67, 25, 83, 33], backgroundColor: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'], borderRadius: 4, maxBarThickness: 30 }]
                },
                options: { responsive: true, indexAxis: 'y', scales: { x: { max: 100, beginAtZero: true } }, plugins: { legend: { display: false } } }
            });
        }
    };

    // --- 5 Whys Logic in Modal ---
    const whysContainer = document.getElementById('5-whys-container');
    const addWhyBtn = document.getElementById('addWhyBtn');
    let whyCount = 0;

    const addWhyInput = () => {
        if (whyCount >= 5) return;
        whyCount++;
        const whyBlock = `
            <div class="flex items-start space-x-2 why-block">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-sm">Why?</div>
                <div class="flex-grow">
                    <textarea class="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Because..."></textarea>
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
        findingTabs.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.finding-tab-btn');
            if (!tabButton) return;

            findingTabs.querySelectorAll('.finding-tab-btn').forEach(btn => {
                btn.classList.remove('text-blue-600', 'border-blue-600');
                btn.classList.add('text-gray-500', 'border-transparent');
            });
            tabButton.classList.add('text-blue-600', 'border-blue-600');

            const modalContent = tabButton.closest('.modal-content');
            modalContent.querySelectorAll('.finding-tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(tabButton.dataset.target).classList.remove('hidden');
        });
    }
});