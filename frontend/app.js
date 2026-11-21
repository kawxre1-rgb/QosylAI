const API_URL = "/api";

let currentUserProfile = null;
let currentUserId = Number(localStorage.getItem("qosylUserId")) || null;
let excludedParticipantIds = [];
let activeConnectionId = null;
let messageRefreshTimer = null;
let currentPage = "home";

const translations = {
    kk: {
        navHome: "Басты бет",
        navDiscover: "AI ұсыныстары",
        navChats: "Чаттар",
        navNotifications: "Сұраныстар",
        navProfile: "Менің профилім",
        logout: "Шығу",
        welcomeTitle: "Дұрыс адамдармен танысыңыз.",
        welcomeText: "QOSYL AI сізге кәсіби мақсаттарыңызға сәйкес келетін адамдарды табуға көмектеседі.",
        heroButton: "Таныстықты бастау",
        statParticipants: "Қатысушылар",
        statConnections: "Байланыстарым",
        statRequests: "Келген сұраныстар",
        statAI: "AI ұсыныстары",
        quickActions: "Жылдам әрекеттер",
        quickActionsText: "QOSYL AI мүмкіндіктерін пайдаланыңыз.",
        quickDiscover: "AI арқылы адам табу",
        quickDiscoverText: "Сізге сәйкес қатысушыларды табыңыз",
        quickChats: "Чаттарға өту",
        quickChatsText: "Байланыстарыңызбен сөйлесіңіз",
        quickProfile: "Профильді өңдеу",
        quickProfileText: "Өзіңіз туралы ақпаратты жаңартыңыз",
        howTitle: "QOSYL AI қалай жұмыс істейді?",
        howText: "Үш қарапайым қадам арқылы пайдалы байланыстар орнатыңыз.",
        step1Title: "Профиль толтырыңыз",
        step1Text: "Рөліңізді, дағдыларыңызды және мақсатыңызды көрсетіңіз.",
        step2Title: "AI сәйкестендіреді",
        step2Text: "Жүйе сізге сәйкес келетін қатысушыларды анықтайды.",
        step3Title: "Байланыс орнатыңыз",
        step3Text: "Сұраныс жіберіп, жеке чатта сөйлесіңіз.",
        discoverTitle: "Сізге сәйкес адамдар",
        discoverText: "Профиліңізге сәйкес ең үздік бес қатысушыны табыңыз.",
        profileTitle: "Өзіңіз туралы айтып беріңіз",
        profileText: "Жеке ұсыныстар алу үшін анкетаны толтырыңыз.",
        nameLabel: "Аты-жөніңіз",
        roleLabel: "Сіздің рөліңіз",
        selectOption: "Таңдаңыз",
        skillsLabel: "Технологиялық дағдылар",
        commaHint: "Үтір арқылы бөліп жазыңыз.",
        experienceLabel: "Тәжірибеңіз",
        interestsLabel: "Қызығушылықтарыңыз",
        aboutLabel: "Өзіңіз туралы",
        goalLabel: "Негізгі мақсатыңыз",
        goalOption: "Мақсатты таңдаңыз",
        goalFindJob: "Жұмыс табу",
        goalHire: "Қызметкер жалдау",
        goalFindMentor: "Ментор табу",
        goalBecomeMentor: "Ментор болу",
        goalCofounder: "Ко-фаундер табу",
        goalExchange: "Тәжірибе алмасу",
        findButton: "Маған сәйкес адамдарды тап",
        resultsTitle: "AI ұсыныстары",
        resultsText: "Жеке ұсыныстарыңыз осы жерде көрсетіледі.",
        emptyMatchesTitle: "Әзірге ұсыныстар жоқ",
        emptyMatchesText: "Анкетаны толтырып, AI ұсыныстарын алыңыз.",
        connect: "Танысу",
        reject: "Сәйкес келмеді",
        introLabel: "Танысуға арналған сөйлем:",
        loading: "Жүктелуде...",
        noMatches: "Сәйкес қатысушылар табылмады.",
        noMatchesDetail: "Анкетаңызды өзгертіп көріңіз.",
        matchesFound: "Сізге сәйкес {count} қатысушы табылды.",
        feedbackError: "Кері байланысты сақтау мүмкін болмады.",
        requestError: "Сұранысты орындау мүмкін болмады.",
        serverError: "Сервердің жұмыс істеп тұрғанын тексеріңіз.",
        chatsTitle: "Жеке чаттар",
        chatsText: "Қабылданған байланыстарыңызбен сөйлесіңіз.",
        messages: "Хабарламалар",
        noConnections: "Әзірге қабылданған байланыстар жоқ.",
        selectChat: "Чатты таңдаңыз",
        selectChatText: "Хабарламаларды көру үшін сол жақтан қатысушыны таңдаңыз.",
        notificationsTitle: "Келген сұраныстар",
        notificationsText: "Сізбен танысқысы келетін қатысушылар.",
        incomingRequests: "Кіріс сұраныстары",
        refresh: "Жаңарту",
        noRequests: "Әзірге жаңа сұраныс жоқ.",
        acceptRequest: "Қабылдау",
        myProfile: "Менің профилім",
        myProfileText: "Жеке ақпаратыңыз бен кәсіби дағдыларыңыз.",
        editProfile: "Профильді өңдеу",
        requestSent: "Танысу сұранысы жіберілді.",
        requestPending: "Сұраныс жіберілді",
        openChat: "Чатты ашу",
        initialMessagePrompt: "Танысу үшін қысқаша хабарлама жазыңыз:",
        emptyInitialMessage: "Хабарлама бос болмауы керек.",
        demoConnection: "Бұл демо-профиль. Нақты қатысушымен байланыс орнатыңыз.",
        messagePlaceholder: "Хабарлама жазыңыз...",
        sendMessage: "Жіберу",
        backToChats: "← Чаттар",
        messageError: "Хабарламаны жіберу мүмкін болмады.",
        profileSaved: "Профиль жаңартылды.",
        confirmLogout: "Профильден шығуды қалайсыз ба?"
    },

    ru: {
        navHome: "Главная",
        navDiscover: "AI рекомендации",
        navChats: "Чаты",
        navNotifications: "Запросы",
        navProfile: "Мой профиль",
        logout: "Выйти",
        welcomeTitle: "Знакомьтесь с нужными людьми.",
        welcomeText: "QOSYL AI помогает находить людей, соответствующих вашим профессиональным целям.",
        heroButton: "Начать знакомство",
        statParticipants: "Участники",
        statConnections: "Мои связи",
        statRequests: "Входящие запросы",
        statAI: "AI рекомендации",
        quickActions: "Быстрые действия",
        quickActionsText: "Используйте возможности QOSYL AI.",
        quickDiscover: "Найти людей с AI",
        quickDiscoverText: "Найдите подходящих участников",
        quickChats: "Перейти к чатам",
        quickChatsText: "Общайтесь со своими контактами",
        quickProfile: "Редактировать профиль",
        quickProfileText: "Обновите информацию о себе",
        howTitle: "Как работает QOSYL AI?",
        howText: "Создавайте полезные связи в три простых шага.",
        step1Title: "Заполните профиль",
        step1Text: "Укажите роль, навыки и цели.",
        step2Title: "AI подбирает",
        step2Text: "Система находит подходящих участников.",
        step3Title: "Установите связь",
        step3Text: "Отправьте запрос и общайтесь в личном чате.",
        discoverTitle: "Подходящие вам люди",
        discoverText: "Найдите пять участников, подходящих вашему профилю.",
        profileTitle: "Расскажите о себе",
        profileText: "Заполните анкету для персональных рекомендаций.",
        nameLabel: "Ваше имя",
        roleLabel: "Ваша роль",
        selectOption: "Выберите",
        skillsLabel: "Технические навыки",
        commaHint: "Разделяйте запятыми.",
        experienceLabel: "Ваш опыт",
        interestsLabel: "Ваши интересы",
        aboutLabel: "О себе",
        goalLabel: "Ваша главная цель",
        goalOption: "Выберите цель",
        goalFindJob: "Найти работу",
        goalHire: "Найти сотрудника",
        goalFindMentor: "Найти ментора",
        goalBecomeMentor: "Стать ментором",
        goalCofounder: "Найти сооснователя",
        goalExchange: "Обмен опытом",
        findButton: "Найти подходящих людей",
        resultsTitle: "AI рекомендации",
        resultsText: "Ваши рекомендации появятся здесь.",
        emptyMatchesTitle: "Пока нет рекомендаций",
        emptyMatchesText: "Заполните анкету, чтобы получить рекомендации AI.",
        connect: "Познакомиться",
        reject: "Не подходит",
        introLabel: "Сообщение для знакомства:",
        loading: "Загрузка...",
        noMatches: "Подходящие участники не найдены.",
        noMatchesDetail: "Попробуйте изменить анкету.",
        matchesFound: "Для вас найдено участников: {count}.",
        feedbackError: "Не удалось сохранить отзыв.",
        requestError: "Не удалось выполнить запрос.",
        serverError: "Проверьте, работает ли сервер.",
        chatsTitle: "Личные чаты",
        chatsText: "Общайтесь с принятыми контактами.",
        messages: "Сообщения",
        noConnections: "Пока нет принятых контактов.",
        selectChat: "Выберите чат",
        selectChatText: "Выберите участника слева, чтобы увидеть сообщения.",
        notificationsTitle: "Входящие запросы",
        notificationsText: "Участники, которые хотят с вами познакомиться.",
        incomingRequests: "Входящие запросы",
        refresh: "Обновить",
        noRequests: "Пока новых запросов нет.",
        acceptRequest: "Принять",
        myProfile: "Мой профиль",
        myProfileText: "Ваша личная информация и навыки.",
        editProfile: "Редактировать профиль",
        requestSent: "Запрос на знакомство отправлен.",
        requestPending: "Запрос отправлен",
        openChat: "Открыть чат",
        initialMessagePrompt: "Напишите короткое сообщение для знакомства:",
        emptyInitialMessage: "Сообщение не должно быть пустым.",
        demoConnection: "Это демо-профиль. Выберите реального участника.",
        messagePlaceholder: "Напишите сообщение...",
        sendMessage: "Отправить",
        backToChats: "← Чаты",
        messageError: "Не удалось отправить сообщение.",
        profileSaved: "Профиль обновлён.",
        confirmLogout: "Вы хотите выйти из профиля?"
    },

    en: {
        navHome: "Home",
        navDiscover: "AI Discover",
        navChats: "Chats",
        navNotifications: "Requests",
        navProfile: "My Profile",
        logout: "Log out",
        welcomeTitle: "Connect with the right people.",
        welcomeText: "QOSYL AI helps you find people who match your professional goals.",
        heroButton: "Start networking",
        statParticipants: "Participants",
        statConnections: "My connections",
        statRequests: "Incoming requests",
        statAI: "AI matches",
        quickActions: "Quick actions",
        quickActionsText: "Explore QOSYL AI features.",
        quickDiscover: "Find people with AI",
        quickDiscoverText: "Discover relevant participants",
        quickChats: "Open chats",
        quickChatsText: "Talk to your connections",
        quickProfile: "Edit profile",
        quickProfileText: "Update your information",
        howTitle: "How does QOSYL AI work?",
        howText: "Build meaningful connections in three simple steps.",
        step1Title: "Complete your profile",
        step1Text: "Specify your role, skills, and goals.",
        step2Title: "AI matches people",
        step2Text: "The system finds relevant participants.",
        step3Title: "Connect",
        step3Text: "Send a request and chat privately.",
        discoverTitle: "People matching you",
        discoverText: "Find five participants relevant to your profile.",
        profileTitle: "Tell us about yourself",
        profileText: "Complete your profile to get recommendations.",
        nameLabel: "Your name",
        roleLabel: "Your role",
        selectOption: "Select",
        skillsLabel: "Technical skills",
        commaHint: "Separate with commas.",
        experienceLabel: "Your experience",
        interestsLabel: "Your interests",
        aboutLabel: "About you",
        goalLabel: "Your main goal",
        goalOption: "Choose a goal",
        goalFindJob: "Find a job",
        goalHire: "Hire an employee",
        goalFindMentor: "Find a mentor",
        goalBecomeMentor: "Become a mentor",
        goalCofounder: "Find a co-founder",
        goalExchange: "Exchange experience",
        findButton: "Find my matches",
        resultsTitle: "AI recommendations",
        resultsText: "Your recommendations will appear here.",
        emptyMatchesTitle: "No recommendations yet",
        emptyMatchesText: "Complete your profile to get AI recommendations.",
        connect: "Connect",
        reject: "Not relevant",
        introLabel: "Suggested introduction:",
        loading: "Loading...",
        noMatches: "No matching participants found.",
        noMatchesDetail: "Try changing your profile.",
        matchesFound: "{count} matching participants found.",
        feedbackError: "Could not save feedback.",
        requestError: "The request could not be completed.",
        serverError: "Please check whether the server is running.",
        chatsTitle: "Private chats",
        chatsText: "Talk to your accepted connections.",
        messages: "Messages",
        noConnections: "No accepted connections yet.",
        selectChat: "Select a chat",
        selectChatText: "Choose a participant on the left to view messages.",
        notificationsTitle: "Incoming requests",
        notificationsText: "Participants who want to connect with you.",
        incomingRequests: "Incoming requests",
        refresh: "Refresh",
        noRequests: "No new requests yet.",
        acceptRequest: "Accept",
        myProfile: "My profile",
        myProfileText: "Your personal information and professional skills.",
        editProfile: "Edit profile",
        requestSent: "Connection request sent.",
        requestPending: "Request sent",
        openChat: "Open chat",
        initialMessagePrompt: "Write a short introduction message:",
        emptyInitialMessage: "Message cannot be empty.",
        demoConnection: "This is a demo profile. Choose a real participant.",
        messagePlaceholder: "Write a message...",
        sendMessage: "Send",
        backToChats: "← Chats",
        messageError: "Could not send the message.",
        profileSaved: "Profile updated.",
        confirmLogout: "Do you want to log out?"
    }
};

function t(key) {
    const language = localStorage.getItem("qosylLanguage") || "kk";
    return translations[language]?.[key]
        || meetingTranslations?.[language]?.[key]
        || translations.kk[key]
        || meetingTranslations?.kk?.[key]
        || key;
}

function changeLanguage(language) {
    if (!translations[language]) return;

    localStorage.setItem("qosylLanguage", language);
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }
    updateOrganizerMapLanguage();
    });

    const heading = document.getElementById("pageHeading");
    const headingKeys = {
        home: "navHome",
        discover: "navDiscover",
        chats: "navChats",
        notifications: "navNotifications",
        profilePage: "navProfile",
        meetingsPage: "navMeetings"
    };

    if (heading && headingKeys[currentPage]) {
        heading.textContent = t(headingKeys[currentPage]);
    }

    updateMeetingLanguage();

    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) languageSelect.value = language;

    document.querySelectorAll(".match-actions button").forEach((button, index) => {
        if (!button.disabled) {
            button.textContent = index === 0 ? t("connect") : t("reject");
        }
    });
}

function initializeLanguage() {
    const language = localStorage.getItem("qosylLanguage") || "kk";
    changeLanguage(language);
}

function showPage(pageId) {
    const pages = ["home", "discover", "chats", "notifications", "profilePage", "meetingsPage", "boothsPage", "organizerMapPage"];

    if (!pages.includes(pageId)) return;

    currentPage = pageId;

    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) page.classList.toggle("hidden", id !== pageId);
    });

    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });

    const headingKeys = {
        home: "navHome",
        discover: "navDiscover",
        chats: "navChats",
        notifications: "navNotifications",
        profilePage: "navProfile",
        meetingsPage: "navMeetings",
        boothsPage: "boothsTitle"
    };

    document.getElementById("pageHeading").textContent = t(headingKeys[pageId]);

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pageId === "chats") loadConnections();
    if (pageId === "notifications") loadPendingRequests();
    if (pageId === "profilePage") renderProfile();
    if (pageId === "meetingsPage") loadMeetingPage();
    if (pageId === "home") refreshDashboard();
    if (pageId === "boothsPage") loadBoothRecommendations();
    if (pageId === "organizerMapPage") {
    loadOrganizerInterestMap();
}
}
function updateUserHeader() {
    const name = currentUserProfile?.name || "Guest User";
    const role = currentUserProfile?.role || "Networking member";
    const initial = name.charAt(0).toUpperCase();

    document.getElementById("sidebarName").textContent = name;
    document.getElementById("sidebarRole").textContent = role;
    document.getElementById("sidebarAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;
    document.getElementById("topUserName").textContent = name;
    document.getElementById("profileAvatar").textContent = initial;
}

function renderProfile() {
    if (!currentUserProfile) return;

    updateUserHeader();

    document.getElementById("profileName").textContent = currentUserProfile.name || "—";
    document.getElementById("profileRole").textContent = currentUserProfile.role || "—";
    document.getElementById("profileSkills").textContent = (currentUserProfile.skills || []).join(", ") || "—";
    document.getElementById("profileExperience").textContent = currentUserProfile.experience || "—";
    document.getElementById("profileInterests").textContent = (currentUserProfile.interests || []).join(", ") || "—";
    document.getElementById("profileGoal").textContent = currentUserProfile.goal || "—";
    document.getElementById("profileAbout").textContent = currentUserProfile.about || "—";
}

function editProfile() {
    if (!currentUserProfile) {
        showPage("discover");
        return;
    }

    document.getElementById("name").value = currentUserProfile.name || "";
    document.getElementById("role").value = currentUserProfile.role || "";
    document.getElementById("skills").value = (currentUserProfile.skills || []).join(", ");
    document.getElementById("experience").value = currentUserProfile.experience || "";
    document.getElementById("interests").value = (currentUserProfile.interests || []).join(", ");
    document.getElementById("about").value = currentUserProfile.about || "";
    document.getElementById("goal").value = currentUserProfile.goal || "";

    showPage("discover");
    document.getElementById("name").focus();
}

function logoutUser() {
    if (!confirm(t("confirmLogout"))) return;

    localStorage.removeItem("qosylUserId");
    localStorage.removeItem("qosylProfile");

    currentUserId = null;
    currentUserProfile = null;

    window.location.reload();
}

async function saveProfile(event) {
    event.preventDefault();

    const profile = {
        name: document.getElementById("name").value.trim(),
        role: document.getElementById("role").value,
        skills: document.getElementById("skills").value.split(",").map(x => x.trim()).filter(Boolean),
        experience: document.getElementById("experience").value.trim(),
        interests: document.getElementById("interests").value.split(",").map(x => x.trim()).filter(Boolean),
        about: document.getElementById("about").value.trim(),
        goal: document.getElementById("goal").value
    };

    try {
        let response;

        if (currentUserId) {
            response = await fetch(`${API_URL}/users/${currentUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
        } else {
            response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || t("requestError"));
        }

        currentUserId = data.id || currentUserId;
        localStorage.setItem("qosylUserId", currentUserId);

        currentUserProfile = { ...profile, id: currentUserId };
        localStorage.setItem("qosylProfile", JSON.stringify(currentUserProfile));

        updateUserHeader();
        renderProfile();

        alert(t("profileSaved"));
        showPage("profilePage");
    } catch (error) {
        console.error("Profile save error:", error);
        alert(error.message || t("serverError"));
    }
}

async function loadMatches() {
    if (!currentUserId) {
        alert(t("serverError"));
        return;
    }

    const container = document.getElementById("matchesContainer");
    const button = document.getElementById("findMatchesButton");

    if (button) {
        button.disabled = true;
        button.textContent = t("loading");
    }

    if (container) {
        container.innerHTML = `<p>${t("loading")}</p>`;
    }

    try {
        const response = await fetch(`${API_URL}/matches/${currentUserId}`);

        if (!response.ok) {
            throw new Error("Matches loading error");
        }

        const data = await response.json();
        renderMatches(data.matches || []);
    } catch (error) {
        console.error("Matching error:", error);

        if (container) {
            container.innerHTML = `<p>${t("serverError")}</p>`;
        }
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = t("findButton");
        }
    }
}

function renderMatches(matches) {
    const container = document.getElementById("matchesContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!matches.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>${t("emptyMatchesTitle")}</h3>
                <p>${t("emptyMatchesText")}</p>
            </div>
        `;
        return;
    }

    matches.forEach(user => {
        const card = document.createElement("div");
        card.className = "match-card";

        card.innerHTML = `
            <div class="match-card-header">
                <div class="match-avatar">
                    ${(user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3>${user.name || "Participant"}</h3>
                    <p>${user.role || ""}</p>
                </div>
            </div>

            <div class="match-card-body">
                <p><strong>${t("skillsLabel")}:</strong> ${user.skills || "—"}</p>
                <p><strong>${t("interestsLabel")}:</strong> ${user.interests || "—"}</p>
                <p><strong>${t("experienceLabel")}:</strong> ${user.experience || "—"}</p>
                <p>${user.about || ""}</p>
            </div>

            <div class="match-actions">
                <button class="primary-button" onclick="sendConnectionRequest(${user.id})">
                    ${t("connect")}
                </button>
                <button class="secondary-button" onclick="rejectMatch(${user.id})">
                    ${t("reject")}
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function sendConnectionRequest(userId) {
    if (!currentUserId) return;

    const message = prompt(t("initialMessagePrompt"));

    if (message === null) return;

    if (!message.trim()) {
        alert(t("emptyInitialMessage"));
        return;
    }

    try {
        const response = await fetch(`${API_URL}/connections/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                requester_id: currentUserId,
                recipient_id: userId,
                message: message.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || t("requestError"));
        }

        alert(t("requestSent"));
        await loadMatches();
        await refreshDashboard();
    } catch (error) {
        console.error("Connection request error:", error);
        alert(error.message || t("serverError"));
    }
}

async function rejectMatch(userId) {
    if (!currentUserId) return;

    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUserId,
                target_user_id: userId,
                feedback: "rejected"
            })
        });

        if (!response.ok) {
            throw new Error(t("feedbackError"));
        }

        excludedParticipantIds.push(userId);
        await loadMatches();
    } catch (error) {
        console.error("Feedback error:", error);
        alert(t("feedbackError"));
    }
}

async function loadConnections() {
    if (!currentUserId) return;

    const container = document.getElementById("connectionsList");

    if (!container) return;

    container.innerHTML = `<p>${t("loading")}</p>`;

    try {
        const response = await fetch(`${API_URL}/connections/${currentUserId}`);

        if (!response.ok) {
            throw new Error("Connections loading error");
        }

        const data = await response.json();

        if (!data.connections || data.connections.length === 0) {
            container.innerHTML = `<p>${t("noConnections")}</p>`;
            return;
        }

        container.innerHTML = "";

        data.connections.forEach(connection => {
            const item = document.createElement("div");
            item.className = "connection-item";

            item.innerHTML = `
                <div class="connection-avatar">
                    ${(connection.other_name || "U").charAt(0).toUpperCase()}
                </div>
                <div class="connection-info">
                    <h4>${connection.other_name || "Participant"}</h4>
                    <p>${connection.other_role || ""}</p>
                </div>
                <button class="primary-button" onclick="openChat(${connection.connection_id}, ${connection.other_user_id})">
                    ${t("openChat")}
                </button>
            `;

            container.appendChild(item);
        });
    } catch (error) {
        console.error("Connections error:", error);
        container.innerHTML = `<p>${t("serverError")}</p>`;
    }
}

async function openChat(connectionId, otherUserId) {
    activeConnectionId = connectionId;

    const chatWindow = document.getElementById("chatWindow");
    const chatTitle = document.getElementById("chatTitle");

    if (chatTitle) {
        chatTitle.textContent = "Chat";
    }

    if (chatWindow) {
        chatWindow.innerHTML = `<p>${t("loading")}</p>`;
    }

    showPage("chats");

    await loadMessages(otherUserId);
}

async function loadMessages(otherUserId) {
    if (!currentUserId || !otherUserId) return;

    const chatWindow = document.getElementById("chatWindow");

    if (!chatWindow) return;

    try {
        const response = await fetch(
            `${API_URL}/messages/${currentUserId}/${otherUserId}`
        );

        if (!response.ok) {
            throw new Error("Messages loading error");
        }

        const data = await response.json();

        chatWindow.innerHTML = "";

        (data.messages || []).forEach(message => {
            const item = document.createElement("div");
            item.className = Number(message.sender_id) === Number(currentUserId)
                ? "message own-message"
                : "message";

            item.textContent = message.content;
            chatWindow.appendChild(item);
        });

        chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
        console.error("Messages error:", error);
        chatWindow.innerHTML = `<p>${t("messageError")}</p>`;
    }
}

async function sendMessage(event) {
    event.preventDefault();

    if (!currentUserId || !activeConnectionId) return;

    const input = document.getElementById("messageInput");
    const content = input.value.trim();

    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                connection_id: activeConnectionId,
                sender_id: currentUserId,
                content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || t("messageError"));
        }

        input.value = "";
        await loadConnections();
    } catch (error) {
        console.error("Send message error:", error);
        alert(error.message || t("messageError"));
    }
}

async function loadPendingRequests() {
    if (!currentUserId) return;

    const container = document.getElementById("requestsList");

    if (!container) return;

    container.innerHTML = `<p>${t("loading")}</p>`;

    try {
        const response = await fetch(`${API_URL}/connections/pending/${currentUserId}`);

        if (!response.ok) {
            throw new Error("Requests loading error");
        }

        const data = await response.json();

        if (!data.requests || data.requests.length === 0) {
            container.innerHTML = `<p>${t("noRequests")}</p>`;
            return;
        }

        container.innerHTML = "";

        data.requests.forEach(request => {
            const item = document.createElement("div");
            item.className = "request-card";

            item.innerHTML = `
                <div>
                    <h4>${request.requester_name || "Participant"}</h4>
                    <p>${request.message || ""}</p>
                </div>
                <div class="request-actions">
                    <button class="primary-button" onclick="respondToRequest(${request.id}, 'accepted')">
                        ${t("acceptRequest")}
                    </button>
                    <button class="secondary-button" onclick="respondToRequest(${request.id}, 'rejected')">
                        ${t("decline")}
                    </button>
                </div>
            `;

            container.appendChild(item);
        });
    } catch (error) {
        console.error("Pending requests error:", error);
        container.innerHTML = `<p>${t("serverError")}</p>`;
    }
}

async function respondToRequest(requestId, status) {
    try {
        const response = await fetch(`${API_URL}/connections/respond`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                request_id: requestId,
                user_id: currentUserId,
                status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || t("requestError"));
        }

        await loadPendingRequests();
        await refreshDashboard();
    } catch (error) {
        console.error("Respond request error:", error);
        alert(error.message || t("requestError"));
    }
}
function updateUserHeader() {
    const name = currentUserProfile?.name || "Guest User";
    const role = currentUserProfile?.role || "Networking member";
    const initial = name.charAt(0).toUpperCase();

    document.getElementById("sidebarName").textContent = name;
    document.getElementById("sidebarRole").textContent = role;
    document.getElementById("sidebarAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;
    document.getElementById("topUserName").textContent = name;
    document.getElementById("profileAvatar").textContent = initial;
}

function renderProfile() {
    if (!currentUserProfile) return;

    updateUserHeader();

    document.getElementById("profileName").textContent = currentUserProfile.name || "—";
    document.getElementById("profileRole").textContent = currentUserProfile.role || "—";
    document.getElementById("profileSkills").textContent = (currentUserProfile.skills || []).join(", ") || "—";
    document.getElementById("profileExperience").textContent = currentUserProfile.experience || "—";
    document.getElementById("profileInterests").textContent = (currentUserProfile.interests || []).join(", ") || "—";
    document.getElementById("profileGoal").textContent = currentUserProfile.goal || "—";
    document.getElementById("profileAbout").textContent = currentUserProfile.about || "—";
}

function editProfile() {
    if (!currentUserProfile) {
        showPage("discover");
        return;
    }

    document.getElementById("name").value = currentUserProfile.name || "";
    document.getElementById("role").value = currentUserProfile.role || "";
    document.getElementById("skills").value = (currentUserProfile.skills || []).join(", ");
    document.getElementById("experience").value = currentUserProfile.experience || "";
    document.getElementById("interests").value = (currentUserProfile.interests || []).join(", ");
    document.getElementById("about").value = currentUserProfile.about || "";
    document.getElementById("goal").value = currentUserProfile.goal || "";

    showPage("discover");
    document.getElementById("name").focus();
}

function logoutUser() {
    if (!confirm(t("confirmLogout"))) return;

    localStorage.removeItem("qosylUserId");
    localStorage.removeItem("qosylProfile");

    currentUserId = null;
    currentUserProfile = null;
    excludedParticipantIds = [];

    updateUserHeader();
    showPage("home");
}

function createEmptyState(parent, icon, title, description = "") {
    parent.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.className = "empty-state";

    const iconElement = document.createElement("i");
    iconElement.className = icon;

    const heading = document.createElement("h3");
    heading.textContent = title;

    wrapper.append(iconElement, heading);

    if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        wrapper.appendChild(paragraph);
    }

    parent.appendChild(wrapper);
}

function createMatchCard(person, index) {
    const card = document.createElement("article");
    card.className = "match-card";

    const top = document.createElement("div");
    top.className = "match-top";

    const avatar = document.createElement("div");
    avatar.className = "match-avatar";
    avatar.textContent = (person.name || "?").charAt(0).toUpperCase();

    const info = document.createElement("div");
    info.className = "match-person";

    const name = document.createElement("h3");
    name.textContent = `${index + 1}. ${person.name}`;

    const role = document.createElement("p");
    role.textContent = person.role || "";

    info.append(name, role);

    const percentage = document.createElement("div");
    percentage.className = "match-percent";
    percentage.textContent = `${person.match_percentage ?? 0}%`;

    top.append(avatar, info, percentage);

    const reason = document.createElement("div");
    reason.className = "match-reason";
    reason.textContent = person.reason || "";

    const intro = document.createElement("p");
    intro.className = "match-intro";
    intro.textContent = `${t("introLabel")} ${person.opening_message || ""}`;

    const actions = document.createElement("div");
    actions.className = "match-actions";

    const connect = document.createElement("button");
    connect.textContent = t("connect");
    connect.addEventListener("click", () => requestConnection(person.id, connect));

    const reject = document.createElement("button");
    reject.textContent = t("reject");
    reject.addEventListener("click", () => sendFeedback(person.id, "not_relevant", reject));

    actions.append(connect, reject);
    card.append(top, reason, intro, actions);

    return card;
}

async function sendFeedback(candidateId, status, button) {
    if (!currentUserId) {
        alert(t("serverError"));
        return;
    }

    try {
        button.disabled = true;

        const response = await fetch(`${API_URL}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUserId,
                candidate_id: candidateId,
                status
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("feedbackError"));
        }

        if (status === "not_relevant") {
            if (!excludedParticipantIds.includes(candidateId)) {
                excludedParticipantIds.push(candidateId);
            }
            await loadMatches();
        }

    } catch (error) {
        console.error(error);
        button.disabled = false;
        alert(error.message || t("feedbackError"));
    }
}

async function loadMatches() {
    if (!currentUserProfile) {
        createEmptyState(
            document.getElementById("matchList"),
            "fa-solid fa-wand-magic-sparkles",
            t("emptyMatchesTitle"),
            t("emptyMatchesText")
        );
        return;
    }

    const matchList = document.getElementById("matchList");
    const subtitle = document.getElementById("resultSubtitle");

    subtitle.textContent = t("loading");
    matchList.textContent = t("loading");

    try {
        const response = await fetch(`${API_URL}/matches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...currentUserProfile,
                user_id: currentUserId,
                exclude_ids: excludedParticipantIds
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("requestError"));
        }

        if (result.user_id !== undefined && result.user_id !== null) {
            currentUserId = Number(result.user_id);
            localStorage.setItem("qosylUserId", String(currentUserId));
        }

        if (currentUserId !== null) {
            localStorage.setItem("qosylUserId", String(currentUserId));
        }

        localStorage.setItem("qosylProfile", JSON.stringify(currentUserProfile));

        updateUserHeader();

        matchList.replaceChildren();

        if (!result.matches || result.matches.length === 0) {
            subtitle.textContent = t("noMatches");

            createEmptyState(
                matchList,
                "fa-solid fa-users",
                t("noMatches"),
                t("noMatchesDetail")
            );

            return;
        }

        subtitle.textContent = t("matchesFound")
            .replace("{count}", result.matches.length);

        result.matches.forEach((person, index) => {
            matchList.appendChild(createMatchCard(person, index));
        });

    } catch (error) {
        console.error(error);

        subtitle.textContent = t("requestError");

        createEmptyState(
            matchList,
            "fa-solid fa-triangle-exclamation",
            t("requestError"),
            error.message
        );
    }
}

document.getElementById("profileForm").addEventListener("submit", async event => {
    event.preventDefault();

    const errorElement = document.getElementById("formError");
    const submitButton = document.querySelector(".submit-button");

    errorElement.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = t("loading");

    const userData = {
        name: document.getElementById("name").value.trim(),
        role: document.getElementById("role").value,
        skills: document.getElementById("skills").value
            .split(",").map(item => item.trim()).filter(Boolean),
        experience: document.getElementById("experience").value,
        interests: document.getElementById("interests").value
            .split(",").map(item => item.trim()).filter(Boolean),
        about: document.getElementById("about").value.trim(),
        goal: document.getElementById("goal").value
    };

    try {
        const isEditing = currentUserId !== null;

        currentUserProfile = userData;

        if (!isEditing) {
            excludedParticipantIds = [];
        }

        await loadMatches();

        if (currentUserId !== null) {
            localStorage.setItem("qosylProfile", JSON.stringify(currentUserProfile));
        }

        renderProfile();
        showPage("discover");

        if (isEditing) {
            alert(t("profileSaved"));
        }

    } catch (error) {
        console.error(error);
        errorElement.textContent = error.message || t("serverError");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = t("findButton");
    }
});

async function requestConnection(candidateId, button) {
    if (!currentUserId) {
        alert(t("serverError"));
        return;
    }

    if (Number(candidateId) <= 0) {
        alert(t("demoConnection"));
        return;
    }

    const initialMessage = prompt(t("initialMessagePrompt"));

    if (initialMessage === null) return;

    if (!initialMessage.trim()) {
        alert(t("emptyInitialMessage"));
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(`${API_URL}/connections/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUserId,
                candidate_id: candidateId,
                initial_message: initialMessage.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("feedbackError"));
        }

        const connection = result.connection;

        if (connection?.status === "accepted") {
            button.textContent = t("openChat");
            button.disabled = false;

            button.onclick = () => {
                openChat(connection.id, candidateId, "");
                showPage("chats");
            };
        } else {
            button.textContent = t("requestPending");
            button.disabled = true;
        }

        alert(t("requestSent"));

        await refreshDashboard();

    } catch (error) {
        console.error(error);
        button.disabled = false;
        alert(error.message || t("feedbackError"));
    }
}

async function loadPendingRequests() {
    const list = document.getElementById("pendingRequestsList");

    if (!list) return;

    if (!currentUserId) {
        createEmptyState(
            list,
            "fa-regular fa-bell",
            t("noRequests")
        );
        return;
    }

    list.textContent = t("loading");

    try {
        const response = await fetch(
            `${API_URL}/connections/pending/${currentUserId}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("requestError"));
        }

        list.replaceChildren();

        const requests = result.requests || [];

        if (requests.length === 0) {
            createEmptyState(
                list,
                "fa-regular fa-bell",
                t("noRequests")
            );

            updateNotificationCount(0);
            return;
        }

        updateNotificationCount(requests.length);

        requests.forEach(request => {
            list.appendChild(createRequestCard(request));
        });

    } catch (error) {
        console.error(error);
        createEmptyState(
            list,
            "fa-solid fa-triangle-exclamation",
            t("requestError"),
            error.message
        );
    }
}
async function loadPendingRequests() {
    const list = document.getElementById("pendingRequestsList");

    if (!list) return;

    if (!currentUserId) {
        createEmptyState(
            list,
            "fa-regular fa-bell",
            t("noRequests")
        );
        return;
    }

    list.textContent = t("loading");

    try {
        const response = await fetch(
            `${API_URL}/connections/pending/${currentUserId}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("requestError"));
        }

        list.replaceChildren();

        const requests = result.requests || [];

        if (requests.length === 0) {
            createEmptyState(
                list,
                "fa-regular fa-bell",
                t("noRequests")
            );

            updateNotificationCount(0);
            return;
        }

        updateNotificationCount(requests.length);

        requests.forEach(request => {
            const item = document.createElement("div");
            item.className = "network-item";

            const info = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = request.name || "Participant";

            const role = document.createElement("p");
            role.textContent = request.role || "";

            const message = document.createElement("p");
            message.textContent = request.initial_message || "";

            info.append(name, role, message);

            const accept = document.createElement("button");
            accept.type = "button";
            accept.textContent = t("acceptRequest");

            accept.addEventListener("click", async () => {
                accept.disabled = true;
                await acceptConnectionRequest(request.connection_id);
            });

            item.append(info, accept);
            list.appendChild(item);
        });

    } catch (error) {
        console.error(error);

        createEmptyState(
            list,
            "fa-solid fa-triangle-exclamation",
            t("requestError"),
            error.message
        );
    }
}

async function acceptConnectionRequest(connectionId) {
    try {
        const response = await fetch(`${API_URL}/connections/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                connection_id: connectionId,
                user_id: currentUserId
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("feedbackError"));
        }

        await loadPendingRequests();
        await loadConnections();
        await refreshDashboard();

        showPage("chats");

        openChat(connectionId, null, "");

    } catch (error) {
        console.error(error);
        alert(error.message || t("feedbackError"));
    }
}

function updateNotificationCount(count) {
    const badge = document.getElementById("notificationCount");
    const dot = document.getElementById("topNotificationDot");
    const total = document.getElementById("totalRequests");

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "grid" : "none";
    }

    if (dot) {
        dot.style.display = count > 0 ? "block" : "none";
    }

    if (total) total.textContent = count;
}

async function loadConnections() {
    const list = document.getElementById("chatList");

    if (!list) return;

    if (!currentUserId) {
        createEmptyState(list, "fa-regular fa-comments", t("noConnections"));
        return;
    }

    list.textContent = t("loading");

    try {
        const response = await fetch(
            `${API_URL}/connections/${currentUserId}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("requestError"));
        }

        list.replaceChildren();

        const connections = result.connections || [];

        document.getElementById("totalConnections").textContent =
            connections.length;

        if (connections.length === 0) {
            createEmptyState(
                list,
                "fa-regular fa-comments",
                t("noConnections")
            );
            return;
        }

        connections.forEach(connection => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "chat-list-item";

            const avatar = document.createElement("div");
            avatar.className = "chat-list-avatar";
            avatar.textContent =
                (connection.other_name || "?").charAt(0).toUpperCase();

            const info = document.createElement("div");
            info.className = "chat-list-info";

            const name = document.createElement("strong");
            name.textContent = connection.other_name || "Participant";

            const role = document.createElement("small");
            role.textContent = connection.other_role || "";

            info.append(name, role);
            button.append(avatar, info);

            button.addEventListener("click", () => {
                document.querySelectorAll(".chat-list-item").forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                openChat(
                    connection.connection_id,
                    connection.other_user_id,
                    connection.other_name
                );
            });

            list.appendChild(button);
        });

    } catch (error) {
        console.error(error);

        createEmptyState(
            list,
            "fa-solid fa-triangle-exclamation",
            t("requestError"),
            error.message
        );
    }
}

async function openChat(connectionId, otherUserId, otherName) {
    activeConnectionId = connectionId;

    if (messageRefreshTimer) {
        clearInterval(messageRefreshTimer);
        messageRefreshTimer = null;
    }

    const conversation = document.getElementById("chatConversation");

    if (!conversation) return;

    const chat = document.createElement("div");
    chat.className = "chat-box";

    const header = document.createElement("div");
    header.className = "chat-header";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "chat-back";
    back.textContent = t("backToChats");

    back.addEventListener("click", () => {
        if (messageRefreshTimer) {
            clearInterval(messageRefreshTimer);
            messageRefreshTimer = null;
        }

        activeConnectionId = null;

        conversation.replaceChildren();

        const placeholder = document.createElement("div");
        placeholder.className = "chat-placeholder";

        const icon = document.createElement("i");
        icon.className = "fa-regular fa-message";

        const title = document.createElement("h3");
        title.textContent = t("selectChat");

        const description = document.createElement("p");
        description.textContent = t("selectChatText");

        placeholder.append(icon, title, description);
        conversation.appendChild(placeholder);
    });

    const title = document.createElement("strong");
    title.textContent = otherName || t("messages");

    header.append(back, title);

    const messages = document.createElement("div");
    messages.className = "chat-messages";
    messages.id = "activeChatMessages";

    const form = document.createElement("form");
    form.className = "chat-send";

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 2000;
    input.placeholder = t("messagePlaceholder");
    input.required = true;

    const send = document.createElement("button");
    send.type = "submit";
    send.textContent = t("sendMessage");

    form.append(input, send);

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const messageText = input.value.trim();

        if (!messageText) return;

        send.disabled = true;

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connection_id: connectionId,
                    sender_id: currentUserId,
                    content: messageText
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || t("messageError"));
            }

            input.value = "";

            await refreshChatMessages(connectionId);

        } catch (error) {
            console.error(error);
            alert(error.message || t("messageError"));

        } finally {
            send.disabled = false;
            input.focus();
        }
    });

    chat.append(header, messages, form);
    conversation.replaceChildren(chat);

    await refreshChatMessages(connectionId);

    messageRefreshTimer = setInterval(() => {
        if (activeConnectionId === connectionId) {
            refreshChatMessages(connectionId);
        }
    }, 3000);
}

async function refreshChatMessages(connectionId) {
    const messagesElement = document.getElementById("activeChatMessages");

    if (!messagesElement || !currentUserId) return;

    try {
        const response = await fetch(
            `${API_URL}/messages/${connectionId}?user_id=${encodeURIComponent(currentUserId)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || t("messageError"));
        }

        const oldScrollTop = messagesElement.scrollTop;
        const wasAtBottom =
            messagesElement.scrollHeight -
            messagesElement.clientHeight -
            oldScrollTop < 50;

        messagesElement.replaceChildren();

        (result.messages || []).forEach(message => {
            const bubble = document.createElement("div");

            bubble.className =
                "chat-message" +
                (Number(message.sender_id) === Number(currentUserId) ? " mine" : "");

            const body = document.createElement("div");
            body.textContent = message.content;

            const time = document.createElement("small");

            const date = new Date(message.created_at);

            time.textContent = isNaN(date.getTime())
                ? ""
                : date.toLocaleString();

            bubble.append(body, time);
            messagesElement.appendChild(bubble);
        });

        if (wasAtBottom) {
            messagesElement.scrollTop = messagesElement.scrollHeight;
        } else {
            messagesElement.scrollTop = oldScrollTop;
        }

    } catch (error) {
        console.error("Chat refresh error:", error);
    }
}

async function refreshDashboard() {
    if (!currentUserId) {
        updateNotificationCount(0);
        document.getElementById("totalConnections").textContent = "0";
        return;
    }

    try {
        const [pendingResponse, connectionsResponse, participantsResponse] =
            await Promise.all([
                fetch(`${API_URL}/connections/pending/${currentUserId}`),
                fetch(`${API_URL}/connections/${currentUserId}`),
                fetch(`${API_URL}/participants`)
            ]);

        const pendingData = await pendingResponse.json();
        const connectionsData = await connectionsResponse.json();
        const participantsData = await participantsResponse.json();

        updateNotificationCount(
            (pendingData.requests || []).length
        );

        document.getElementById("totalConnections").textContent =
            (connectionsData.connections || []).length;

        if (participantsData.total !== undefined) {
            document.getElementById("totalParticipants").textContent =
                participantsData.total;
        }

    } catch (error) {
        console.error("Dashboard refresh:", error);
    }
}

function restoreSession() {
    const savedProfile = localStorage.getItem("qosylProfile");

    if (!savedProfile || !currentUserId) {
        updateUserHeader();
        return;
    }

    try {
        currentUserProfile = JSON.parse(savedProfile);
        updateUserHeader();
        renderProfile();

        refreshDashboard();

    } catch (error) {
        console.error("Session restore error:", error);
    }
}

function initializeDate() {
    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            localStorage.getItem("qosylLanguage") || "kk",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }
}
// =========================
// MEETING SCHEDULER FRONTEND
// =========================

const meetingTranslations = {
    kk: {
        navMeetings: "Кездесулер",
        title: "Кездесулерді жоспарлау",
        subtitle: "Бос уақытыңызды көрсетіп, басқа қатысушылармен кездесуді жоспарлаңыз.",
        availabilityTitle: "Менің бос уақытым",
        start: "Басталу уақыты",
        end: "Аяқталу уақыты",
        addSlot: "Бос уақытты сақтау",
        mySlots: "Сақталған уақыттар",
        noSlots: "Әзірге бос уақыт қосылмаған.",
        peopleTitle: "Кездесу жоспарлау",
        choosePerson: "Қатысушыны таңдаңыз",
        chooseSlot: "Ортақ уақытты таңдаңыз",
        findSlots: "Ортақ уақытты табу",
        sendMeeting: "Кездесу сұранысын жіберу",
        meetingNote: "Қысқаша хабарлама (міндетті емес)",
        pendingTitle: "Келген кездесу сұраныстары",
        allTitle: "Менің кездесулерім",
        noMeetings: "Әзірге кездесулер жоқ.",
        accept: "Қабылдау",
        reject: "Қабылдамау",
        cancel: "Болдырмау",
        pending: "Күтуде",
        accepted: "Қабылданды",
        rejected: "Қабылданбады",
        cancelled: "Болдырылмады",
        saved: "Бос уақытыңыз сақталды.",
        sent: "Кездесу сұранысы жіберілді.",
        noCommon: "Ортақ бос уақыт табылмады.",
        selectTimes: "Басталу және аяқталу уақытын таңдаңыз.",
        selectPerson: "Алдымен қатысушыны таңдаңыз.",
        selectCommon: "Алдымен ортақ уақытты табыңыз.",
        error: "Әрекетті орындау мүмкін болмады."
    },
    ru: {
        navMeetings: "Встречи",
        title: "Планирование встреч",
        subtitle: "Укажите свободное время и запланируйте встречу с другим участником.",
        availabilityTitle: "Моё свободное время",
        start: "Начало",
        end: "Окончание",
        addSlot: "Сохранить время",
        mySlots: "Сохранённые интервалы",
        noSlots: "Свободное время пока не добавлено.",
        peopleTitle: "Запланировать встречу",
        choosePerson: "Выберите участника",
        chooseSlot: "Выберите общее время",
        findSlots: "Найти общее время",
        sendMeeting: "Отправить запрос на встречу",
        meetingNote: "Краткое сообщение (необязательно)",
        pendingTitle: "Входящие запросы на встречи",
        allTitle: "Мои встречи",
        noMeetings: "Встреч пока нет.",
        accept: "Принять",
        reject: "Отклонить",
        cancel: "Отменить",
        pending: "Ожидает",
        accepted: "Принята",
        rejected: "Отклонена",
        cancelled: "Отменена",
        saved: "Свободное время сохранено.",
        sent: "Запрос на встречу отправлен.",
        noCommon: "Общего свободного времени не найдено.",
        selectTimes: "Выберите время начала и окончания.",
        selectPerson: "Сначала выберите участника.",
        selectCommon: "Сначала найдите общее время.",
        error: "Не удалось выполнить действие."
    },
    en: {
        navMeetings: "Meetings",
        title: "Meeting scheduler",
        subtitle: "Share your availability and schedule a meeting with another participant.",
        availabilityTitle: "My availability",
        start: "Start time",
        end: "End time",
        addSlot: "Save availability",
        mySlots: "Saved time slots",
        noSlots: "No availability added yet.",
        peopleTitle: "Schedule a meeting",
        choosePerson: "Choose a participant",
        chooseSlot: "Choose a common time",
        findSlots: "Find common times",
        sendMeeting: "Send meeting request",
        meetingNote: "Short message (optional)",
        pendingTitle: "Incoming meeting requests",
        allTitle: "My meetings",
        noMeetings: "No meetings yet.",
        accept: "Accept",
        reject: "Decline",
        cancel: "Cancel",
        pending: "Pending",
        accepted: "Accepted",
        rejected: "Declined",
        cancelled: "Cancelled",
        saved: "Your availability has been saved.",
        sent: "Meeting request sent.",
        noCommon: "No common availability found.",
        selectTimes: "Choose start and end times.",
        selectPerson: "Choose a participant first.",
        selectCommon: "Find common times first.",
        error: "The action could not be completed."
    }
};

function mt(key) {
    const language = localStorage.getItem("qosylLanguage") || "kk";
    return meetingTranslations[language]?.[key] || meetingTranslations.kk[key] || key;
}

function addMeetingStyles() {
    if (document.getElementById("qosylMeetingStyles")) return;

    const style = document.createElement("style");
    style.id = "qosylMeetingStyles";
    style.textContent = `
        #meetingsPage { padding: 24px; }
        .meeting-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
        .meeting-panel { background:var(--card-bg,#fff); border:1px solid var(--border-color,#e7eaf0); border-radius:16px; padding:20px; margin-bottom:20px; min-width:0; }
        .meeting-panel h3 { margin:0 0 14px; }
        .meeting-panel p { color:var(--text-muted,#687386); }
        .meeting-form { display:grid; gap:12px; }
        .meeting-form label { display:grid; gap:6px; font-size:14px; }
        .meeting-form input,.meeting-form select,.meeting-form textarea { width:100%; min-width:0; padding:11px 12px; border:1px solid var(--border-color,#dce1e9); border-radius:9px; background:var(--input-bg,#fff); color:inherit; font:inherit; }
        .meeting-form button,.meeting-action { border:0; border-radius:9px; padding:11px 15px; cursor:pointer; background:var(--primary,#315efb); color:white; font-weight:600; }
        .meeting-form button:disabled,.meeting-action:disabled { opacity:.55; cursor:not--allowed; }
        .meeting-slot,.meeting-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; border-bottom:1px solid var(--border-color,#edf0f4); }
        .meeting-item small,.meeting-slot small { display:block; color:var(--text-muted,#687386); margin-top:4px; }
        .meeting-actions { display:flex; flex-wrap:wrap; gap:8px; }
        .meeting-action.secondary { background:#687386; }
        .meeting-action.danger { background:#c0392b; }
        .meeting-status { font-size:12px; padding:5px 9px; border-radius:20px; background:#eef1f6; white-space:nowrap; }
        .meeting-empty { color:var(--text-muted,#687386); padding:12px 0; }
        .meeting-common-list { display:grid; gap:8px; margin:12px 0; }
        .meeting-common-option { display:flex; align-items:center; gap:9px; padding:10px; border:1px solid var(--border-color,#dce1e9); border-radius:9px; }
        @media(max-width:800px) { .meeting-grid { grid-template-columns:1fr; } #meetingsPage { padding:14px; } .meeting-slot,.meeting-item { align-items:flex-start; flex-direction:column; } }
    `;
    document.head.appendChild(style);
}

function createMeetingPage() {
    if (document.getElementById("meetingsPage")) return;

    const homePage = document.getElementById("home");
    if (!homePage || !homePage.parentElement) {
        console.error("Could not find the main page container for Meeting Scheduler.");
        return;
    }

    const page = document.createElement("section");
    page.id = "meetingsPage";
    page.className = "page-section hidden";
    page.innerHTML = `
        <div class="page-heading">
            <h2 id="meetingPageTitle"></h2>
            <p id="meetingPageSubtitle"></p>
        </div>
        <div class="meeting-grid">
            <section class="meeting-panel">
                <h3 id="meetingAvailabilityTitle"></h3>
                <form id="availabilityForm" class="meeting-form">
                    <label><span id="meetingStartLabel"></span><input id="availabilityStart" type="datetime-local" required></label>
                    <label><span id="meetingEndLabel"></span><input id="availabilityEnd" type="datetime-local" required></label>
                    <button type="submit" id="saveAvailabilityButton"></button>
                </form>
                <h3 id="meetingSlotsTitle" style="margin-top:22px"></h3>
                <div id="myAvailabilityList"></div>
            </section>
            <section class="meeting-panel">
                <h3 id="meetingPeopleTitle"></h3>
                <form id="meetingRequestForm" class="meeting-form">
                    <label><span id="meetingPersonLabel"></span><select id="meetingParticipant" required></select></label>
                    <button type="button" id="findCommonButton" class="meeting-action secondary"></button>
                    <div id="commonSlotsList" class="meeting-common-list"></div>
                    <label><span id="meetingNoteLabel"></span><textarea id="meetingMessage" rows="3" maxlength="2000"></textarea></label>
                    <button type="submit" id="sendMeetingButton"></button>
                </form>
            </section>
        </div>
        <section class="meeting-panel">
            <h3 id="pendingMeetingsTitle"></h3>
            <div id="pendingMeetingsList"></div>
        </section>
        <section class="meeting-panel">
            <h3 id="allMeetingsTitle"></h3>
            <div id="allMeetingsList"></div>
        </section>
    `;

    homePage.parentElement.appendChild(page);

    const navReference = document.querySelector(".nav-item[data-page]");
    if (navReference && navReference.parentElement &&
        !document.querySelector('.nav-item[data-page="meetingsPage"]')) {
        const navButton = document.createElement("button");
        navButton.type = "button";
        navButton.className = "nav-item";
        navButton.dataset.page = "meetingsPage";
        navButton.innerHTML = '<i class="fa-regular fa-calendar"></i><span id="meetingNavLabel"></span>';
        navButton.addEventListener("click", () => showPage("meetingsPage"));
        navReference.parentElement.appendChild(navButton);
    }

    addMeetingStyles();
    updateMeetingLanguage();
    document.getElementById("availabilityForm").addEventListener("submit", saveMyAvailability);
    document.getElementById("findCommonButton").addEventListener("click", findCommonSlots);
    document.getElementById("meetingRequestForm").addEventListener("submit", submitMeetingRequest);
}

function updateMeetingLanguage() {
    const textMap = {
        meetingNavLabel: "navMeetings",
        meetingPageTitle: "title",
        meetingPageSubtitle: "subtitle",
        meetingAvailabilityTitle: "availabilityTitle",
        meetingStartLabel: "start",
        meetingEndLabel: "end",
        saveAvailabilityButton: "addSlot",
        meetingSlotsTitle: "mySlots",
        meetingPeopleTitle: "peopleTitle",
        findCommonButton: "findSlots",
        meetingNoteLabel: "meetingNote",
        sendMeetingButton: "sendMeeting",
        pendingMeetingsTitle: "pendingTitle",
        allMeetingsTitle: "allTitle"
    };

    Object.entries(textMap).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = mt(key);
    });

    const participantSelect = document.getElementById("meetingParticipant");
    if (participantSelect && participantSelect.options.length) {
        participantSelect.options[0].textContent = mt("choosePerson");
    }
}

async function meetingApi(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(options.body ? { "Content-Type": "application/json" } : {})
        }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.detail || mt("error"));
    return result;
}

function formatMeetingTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

async function loadMeetingPage() {
    if (!currentUserId) {
        alert(t("serverError"));
        showPage("discover");
        return;
    }

    updateMeetingLanguage();
    await Promise.all([
        loadMyAvailability(),
        loadMeetingParticipants(),
        loadPendingMeetings(),
        loadAllMeetings()
    ]);
}

async function saveMyAvailability(event) {
    event.preventDefault();

    if (!currentUserId) return;

    const start = document.getElementById("availabilityStart").value;
    const end = document.getElementById("availabilityEnd").value;

    if (!start || !end || start >= end) {
        alert(mt("selectTimes"));
        return;
    }

    const button = document.getElementById("saveAvailabilityButton");
    button.disabled = true;

    try {
        const existing = await meetingApi(`/availability/${currentUserId}`);
        const slots = (existing.slots || []).map(slot => ({
            start_time: slot.start_time,
            end_time: slot.end_time
        }));

        if (slots.some(slot => slot.start_time === start && slot.end_time === end)) {
            alert(mt("saved"));
            return;
        }

        slots.push({ start_time: start, end_time: end });

        await meetingApi("/availability", {
            method: "POST",
            body: JSON.stringify({
                user_id: currentUserId,
                slots
            })
        });

        document.getElementById("availabilityForm").reset();
        alert(mt("saved"));
        await loadMyAvailability();
    } catch (error) {
        console.error(error);
        alert(error.message || mt("error"));
    } finally {
        button.disabled = false;
    }
}
async function loadMyAvailability() {
    const list = document.getElementById("myAvailabilityList");
    if (!list || !currentUserId) return;

    try {
        const result = await meetingApi(`/availability/${currentUserId}`);
        list.replaceChildren();

        if (!result.slots?.length) {
            list.textContent = mt("noSlots");
            list.className = "meeting-empty";
            return;
        }

        list.className = "";
        result.slots.forEach(slot => {
            const row = document.createElement("div");
            row.className = "meeting-slot";

            const text = document.createElement("span");
            text.textContent = `${formatMeetingTime(slot.start_time)} — ${formatMeetingTime(slot.end_time)}`;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "meeting-action danger";
            remove.textContent = "×";
            remove.setAttribute("aria-label", mt("cancel"));
            remove.addEventListener("click", async () => {
                try {
                    await meetingApi(`/availability/${currentUserId}/${slot.id}`, {
                        method: "DELETE"
                    });
                    await loadMyAvailability();
                } catch (error) {
                    alert(error.message || mt("error"));
                }
            });

            row.append(text, remove);
            list.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        list.textContent = error.message || mt("error");
    }
}

async function loadMeetingParticipants() {
    const select = document.getElementById("meetingParticipant");
    if (!select || !currentUserId) return;

    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = mt("choosePerson");
    select.appendChild(placeholder);

    try {
        const result = await meetingApi(`/connections/${currentUserId}`);
        (result.connections || []).forEach(person => {
            const option = document.createElement("option");
            option.value = person.other_user_id;
            option.textContent = `${person.other_name} — ${person.other_role || ""}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

async function findCommonSlots() {
    const otherUserId = Number(document.getElementById("meetingParticipant").value);
    const list = document.getElementById("commonSlotsList");

    if (!otherUserId) {
        alert(mt("selectPerson"));
        return;
    }

    list.textContent = mt("loading");

    try {
        const result = await meetingApi(
            `/availability/${currentUserId}/common/${otherUserId}`
        );

        list.replaceChildren();

        if (!result.common_slots?.length) {
            list.textContent = mt("noCommon");
            list.className = "meeting-empty";
            return;
        }

        list.className = "meeting-common-list";
        result.common_slots.forEach((slot, index) => {
            const label = document.createElement("label");
            label.className = "meeting-common-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "commonMeetingSlot";
            radio.value = String(index);
            radio.dataset.start = slot.start_time;
            radio.dataset.end = slot.end_time;
            if (index === 0) radio.checked = true;

            const text = document.createElement("span");
            text.textContent = `${formatMeetingTime(slot.start_time)} — ${formatMeetingTime(slot.end_time)}`;

            label.append(radio, text);
            list.appendChild(label);
        });
    } catch (error) {
        console.error(error);
        list.textContent = error.message || mt("error");
    }
}

async function submitMeetingRequest(event) {
    event.preventDefault();

    const recipientId = Number(document.getElementById("meetingParticipant").value);
    const selected = document.querySelector('input[name="commonMeetingSlot"]:checked');

    if (!recipientId) {
        alert(mt("selectPerson"));
        return;
    }

    if (!selected) {
        alert(mt("selectCommon"));
        return;
    }

    const button = document.getElementById("sendMeetingButton");
    button.disabled = true;

    try {
        await meetingApi("/meetings", {
            method: "POST",
            body: JSON.stringify({
                requester_id: currentUserId,
                recipient_id: recipientId,
                start_time: selected.dataset.start,
                end_time: selected.dataset.end,
                message: document.getElementById("meetingMessage").value.trim()
            })
        });

        document.getElementById("meetingMessage").value = "";
        alert(mt("sent"));
        await loadPendingMeetings();
        await loadAllMeetings();
    } catch (error) {
        console.error(error);
        alert(error.message || mt("error"));
    } finally {
        button.disabled = false;
    }
}

function meetingStatusText(status) {
    const keys = {
        pending: "pending",
        accepted: "accepted",
        rejected: "rejected",
        cancelled: "cancelled"
    };
    return mt(keys[status] || status);
}

async function loadPendingMeetings() {
    const list = document.getElementById("pendingMeetingsList");
    if (!list || !currentUserId) return;

    try {
        const result = await meetingApi(`/meetings/pending/${currentUserId}`);
        list.replaceChildren();

        if (!result.pending_meetings?.length) {
            list.textContent = mt("noMeetings");
            list.className = "meeting-empty";
            return;
        }

        list.className = "";
        result.pending_meetings.forEach(meeting => {
            const item = document.createElement("div");
            item.className = "meeting-item";

            const info = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = `${meeting.requester_name} — ${meeting.requester_role || ""}`;
            const time = document.createElement("small");
            time.textContent = `${formatMeetingTime(meeting.start_time)} — ${formatMeetingTime(meeting.end_time)}`;
            const note = document.createElement("small");
            note.textContent = meeting.message || "";
            info.append(name, time, note);

            const actions = document.createElement("div");
            actions.className = "meeting-actions";

            const accept = document.createElement("button");
            accept.type = "button";
            accept.className = "meeting-action";
            accept.textContent = mt("accept");
            accept.addEventListener("click", () => changeMeetingStatus(meeting.id, "accepted"));

            const reject = document.createElement("button");
            reject.type = "button";
            reject.className = "meeting-action danger";
            reject.textContent = mt("reject");
            reject.addEventListener("click", () => changeMeetingStatus(meeting.id, "rejected"));

            actions.append(accept, reject);
            item.append(info, actions);
            list.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        list.textContent = error.message || mt("error");
    }
}

async function loadAllMeetings() {
    const list = document.getElementById("allMeetingsList");
    if (!list || !currentUserId) return;

    try {
        const result = await meetingApi(`/meetings/${currentUserId}`);
        list.replaceChildren();

        if (!result.meetings?.length) {
            list.textContent = mt("noMeetings");
            list.className = "meeting-empty";
            return;
        }

        list.className = "";
        result.meetings.forEach(meeting => {
            const item = document.createElement("div");
            item.className = "meeting-item";

            const info = document.createElement("div");
            const otherName = Number(meeting.requester_id) === Number(currentUserId)
                ? meeting.recipient_name
                : meeting.requester_name;

            const name = document.createElement("strong");
            name.textContent = otherName || "Participant";

            const time = document.createElement("small");
            time.textContent = `${formatMeetingTime(meeting.start_time)} — ${formatMeetingTime(meeting.end_time)}`;

            const status = document.createElement("span");
            status.className = "meeting-status";
            status.textContent = meetingStatusText(meeting.status);

            info.append(name, time, status);

            if (["pending", "accepted"].includes(meeting.status)) {
                const cancel = document.createElement("button");
                cancel.type = "button";
                cancel.className = "meeting-action danger";
                cancel.textContent = mt("cancel");
                cancel.addEventListener("click", () => changeMeetingStatus(meeting.id, "cancelled"));
                item.append(info, cancel);
            } else {
                item.append(info);
            }

            list.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        list.textContent = error.message || mt("error");
    }
}

async function changeMeetingStatus(meetingId, status) {
    try {
        await meetingApi("/meetings/status", {
            method: "POST",
            body: JSON.stringify({
                meeting_id: meetingId,
                user_id: currentUserId,
                status
            })
        });

        await Promise.all([
            loadPendingMeetings(),
            loadAllMeetings()
        ]);
    } catch (error) {
        console.error(error);
        alert(error.message || mt("error"));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeLanguage();
    initializeDate();
    createMeetingPage();
    createBoothsPage();
    createOrganizerMapPage();
    restoreSession();
    showPage("home");
});


const boothTranslations = {
    kk: {
        nav: "Серіктес стендтері",
        title: "Сізге ұсынылатын стендтер",
        subtitle: "AI сіздің қызығушылықтарыңыз бен мақсатыңызға сәйкес стендтерді таңдады.",
        score: "Сәйкестік ұпайы",
        reasons: "Неге ұсынылды?",
        empty: "Әзірге стенд ұсыныстары жоқ.",
        error: "Стендтерді жүктеу мүмкін болмады.",
        details: "Стенд туралы",
        boothTitle: "Стенд"
    },
    ru: {
        nav: "Партнёрские стенды",
        title: "Рекомендованные стенды",
        subtitle: "AI подобрал стенды на основе ваших интересов и целей.",
        score: "Балл соответствия",
        reasons: "Почему рекомендован?",
        empty: "Пока нет рекомендаций.",
        error: "Не удалось загрузить стенды.",
        details: "О стенде",
        boothTitle: "Стенд"
    },
    en: {
        nav: "Partner booths",
        title: "Recommended booths",
        subtitle: "AI selected booths based on your interests and goals.",
        score: "Match score",
        reasons: "Why recommended?",
        empty: "No booth recommendations yet.",
        error: "Could not load recommendations.",
        details: "Booth details",
        boothTitle: "Booth"
    }
};

function bt(key) {
    const lang = localStorage.getItem("qosylLanguage") || "kk";
    return boothTranslations[lang]?.[key] || boothTranslations.kk[key];
}

const boothInfographics = {
    "AI & Machine Learning": "/site/assets/booths/01_ai_machine_learning.png",
    "Startup & Innovation": "/site/assets/booths/02_startup_business.png",
    "Career & IT Jobs": "/site/assets/booths/03_career_it_jobs.png",
    "Robotics & Engineering": "/site/assets/booths/04_robotics_engineering.png",
    "Web & Digital Technologies": "/site/assets/booths/05_web_ux_ui.png",
    "Education & Mentorship": "/site/assets/booths/06_education_mentorship.png"
};

function createBoothsPage() {
    if (document.getElementById("boothsPage")) return;

    const home = document.getElementById("home");

    if (!home || !home.parentElement) {
        console.error("Home page not found");
        return;
    }

    const page = document.createElement("section");
    page.id = "boothsPage";
    page.className = "page-section hidden";

    page.innerHTML = `
        <div class="booth-heading">
            <span class="booth-tag">AI POWERED RECOMMENDATIONS</span>
            <h2 id="boothsTitle"></h2>
            <p id="boothsSubtitle"></p>
        </div>

        <div id="boothRecommendations" class="booth-grid"></div>
    `;

    home.parentElement.appendChild(page);

    const nav = document.querySelector(".nav-item[data-page]")?.parentElement;

    if (nav && !document.querySelector('.nav-item[data-page="boothsPage"]')) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "nav-item";
        button.dataset.page = "boothsPage";

        button.innerHTML = `
            <i class="fa-solid fa-store"></i>
            <span id="boothNavLabel"></span>
        `;

        button.addEventListener("click", () => showPage("boothsPage"));

        nav.appendChild(button);
    }

    addBoothStyles();
    updateBoothLanguage();
}

function updateBoothLanguage() {
    const title = document.getElementById("boothsTitle");
    const subtitle = document.getElementById("boothsSubtitle");
    const nav = document.getElementById("boothNavLabel");

    if (title) title.textContent = bt("title");
    if (subtitle) subtitle.textContent = bt("subtitle");
    if (nav) nav.textContent = bt("nav");
}

function addBoothStyles() {
    if (document.getElementById("boothStyles")) return;

    const style = document.createElement("style");
    style.id = "boothStyles";

    style.textContent = `
        #boothsPage {
            padding: 24px;
        }

        .booth-heading {
            margin-bottom: 28px;
        }

        .booth-heading h2 {
            font-size: 28px;
            margin: 12px 0;
        }

        .booth-heading p {
            color: var(--text-muted, #687386);
        }

        .booth-tag {
            color: var(--primary, #315efb);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .booth-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
        }

        .booth-card {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 16px;
            padding: 22px;
            display: flex;
            flex-direction: column;
            gap: 13px;
            min-width: 0;
        }

        .booth-card h3 {
            font-size: 19px;
            margin: 0;
        }

        .booth-card p {
            color: var(--text-muted, #687386);
            line-height: 1.6;
        }

        .booth-score {
            font-size: 25px;
            font-weight: 750;
            color: var(--primary, #315efb);
        }

        .booth-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
        }

        .booth-keyword {
            background: rgba(49, 94, 251, 0.09);
            color: var(--primary, #315efb);
            padding: 6px 9px;
            border-radius: 20px;
            font-size: 12px;
        }

        .booth-card button {
            margin-top: auto;
            padding: 11px;
            border: 0;
            border-radius: 9px;
            background: var(--primary, #315efb);
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .booth-empty {
            padding: 25px;
            color: var(--text-muted, #687386);
        }

        @media(max-width: 1000px) {
            .booth-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media(max-width: 650px) {
            .booth-grid {
                grid-template-columns: 1fr;
            }

            #boothsPage {
                padding: 14px;
            }
        }
    `;

    document.head.appendChild(style);
}

async function loadBoothRecommendations() {
    const container = document.getElementById("boothRecommendations");

    if (!container) return;

    updateBoothLanguage();

    if (!currentUserId) {
        container.textContent = t("serverError");
        return;
    }

    container.textContent = t("loading");

    try {
        const response = await fetch(
            `${API_URL}/booths/recommendations/${currentUserId}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || bt("error"));
        }

        container.replaceChildren();

        const recommendations = result.recommendations || [];

        if (!recommendations.length) {
            container.textContent = bt("empty");
            container.className = "booth-empty";
            return;
        }

        container.className = "booth-grid";

        recommendations.forEach((booth, index) => {
            const card = document.createElement("article");
            card.className = "booth-card";

            const number = document.createElement("span");
            number.className = "booth-tag";
            number.textContent = `TOP ${index + 1}`;

            const name = document.createElement("h3");
            name.textContent = booth.name;

            const description = document.createElement("p");
            description.textContent = booth.description;

            const scoreLabel = document.createElement("small");
            scoreLabel.textContent = bt("score");

            const score = document.createElement("div");
            score.className = "booth-score";
            score.textContent = `${booth.score} pts`;

            const reasonTitle = document.createElement("strong");
            reasonTitle.textContent = bt("reasons");

            const keywords = document.createElement("div");
            keywords.className = "booth-keywords";

            (booth.matched_keywords || []).forEach(keyword => {
                const tag = document.createElement("span");
                tag.className = "booth-keyword";
                tag.textContent = keyword;
                keywords.appendChild(tag);
            });

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = bt("details");

            button.addEventListener("click", () => {
            openBoothInfographic(booth.name, booth.description);
            });

            card.append(
                number,
                name,
                description,
                scoreLabel,
                score,
                reasonTitle,
                keywords,
                button
            );

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Booth recommendations:", error);
        container.textContent = error.message || bt("error");
        container.className = "booth-empty";
    }
}

function openBoothInfographic(name, description) {
    const imagePath = boothInfographics[name];

    if (!imagePath) {
        alert(description);
        return;
    }

    let modal = document.getElementById("boothInfographicModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "boothInfographicModal";
        modal.className = "booth-infographic-modal";

        modal.innerHTML = `
            <div class="booth-infographic-content">
                <button class="booth-infographic-close" type="button">
                    &times;
                </button>
                <img id="boothInfographicImage" alt="Стенд инфографикасы">
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener("click", event => {
            if (
                event.target === modal ||
                event.target.closest(".booth-infographic-close")
            ) {
                modal.classList.remove("active");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                modal.classList.remove("active");
            }
        });
    }

    const image = document.getElementById("boothInfographicImage");
    image.src = imagePath;
    image.alt = name;

    modal.classList.add("active");
}




const organizerMapTranslations = {
    kk: {
        nav: "Қызығушылықтар картасы",
        title: "Залдың қызығушылықтар картасы",
        subtitle: "Қатысушылардың қызығушылықтары бойынша виртуалды зал картасы.",
        entrance: "КІРЕБЕРІС",
        rest: "NETWORKING / ДЕМАЛЫС АЙМАҒЫ",
        participants: "Қатысушы",
        popularity: "Қызығушылық деңгейі",
        select: "Толығырақ көру үшін аймақты таңдаңыз",
        loading: "Карта жүктелуде...",
        error: "Карта деректерін жүктеу мүмкін болмады.",
        total: "Жалпы қатысушылар",
        zones: "Аймақтар",
        popular: "Ең танымал бағыт",
        empty: "Бұл аймақта әзірге қатысушылар жоқ."
    },
    ru: {
        nav: "Карта интересов",
        title: "Карта интересов зала",
        subtitle: "Виртуальная карта интересов участников мероприятия.",
        entrance: "ВХОД",
        rest: "NETWORKING / ЗОНА ОТДЫХА",
        participants: "Участников",
        popularity: "Уровень интереса",
        select: "Выберите зону для подробной информации",
        loading: "Загрузка карты...",
        error: "Не удалось загрузить данные карты.",
        total: "Всего участников",
        zones: "Зоны",
        popular: "Самое популярное направление",
        empty: "Пока в этой зоне нет участников."
    },
    en: {
        nav: "Interest map",
        title: "Hall interest map",
        subtitle: "Virtual map of event participants' interests.",
        entrance: "ENTRANCE",
        rest: "NETWORKING / REST ZONE",
        participants: "Participants",
        popularity: "Interest level",
        select: "Select a zone to see details",
        loading: "Loading map...",
        error: "Could not load map data.",
        total: "Total participants",
        zones: "Zones",
        popular: "Most popular area",
        empty: "No participants in this area yet."
    }
};

const organizerZoneIcons = {
    ai: "fa-solid fa-brain",
    startup: "fa-solid fa-rocket",
    career: "fa-solid fa-briefcase",
    robotics: "fa-solid fa-robot",
    web: "fa-solid fa-code",
    education: "fa-solid fa-graduation-cap"
};
const organizerZoneImages = {
    ai: "assets/zones/ai-zone.png",
    startup: "assets/zones/startup-zone.png",
    career: "assets/zones/career-zone.png",
    robotics: "assets/zones/robotics-zone.png",
    web: "assets/zones/web-ux-zone.png",
    education: "assets/zones/education-zone.png"
};

function omt(key) {
    const lang = localStorage.getItem("qosylLanguage") || "kk";
    return organizerMapTranslations[lang]?.[key]
        || organizerMapTranslations.kk[key];
}

function createOrganizerMapPage() {
    if (document.getElementById("organizerMapPage")) return;

    const home = document.getElementById("home");

    if (!home || !home.parentElement) {
        console.error("Main page container not found");
        return;
    }

    const page = document.createElement("section");
    page.id = "organizerMapPage";
    page.className = "page-section hidden";

    page.innerHTML = `
        <div class="organizer-map-heading">
            <span class="organizer-map-tag">QOSYL AI · ORGANIZER</span>
            <h2 id="organizerMapTitle"></h2>
            <p id="organizerMapSubtitle"></p>
        </div>

        <div class="organizer-map-stats">
            <div class="organizer-stat">
                <span id="organizerTotalLabel"></span>
                <strong id="organizerTotal">—</strong>
            </div>
            <div class="organizer-stat">
                <span id="organizerZonesLabel"></span>
                <strong id="organizerZones">6</strong>
            </div>
            <div class="organizer-stat">
                <span id="organizerPopularLabel"></span>
                <strong id="organizerPopular">—</strong>
            </div>
        </div>

        <div class="organizer-map-layout">
            <div class="organizer-map">
                <div class="organizer-entrance" id="organizerEntrance"></div>
                <div class="organizer-zone-grid" id="organizerZoneGrid"></div>
                <div class="organizer-rest-zone" id="organizerRestZone"></div>
            </div>

            <aside class="organizer-zone-details" id="organizerZoneDetails">
                <div class="organizer-detail-placeholder" id="organizerSelectText"></div>
            </aside>
        </div>
    `;

    home.parentElement.appendChild(page);

    const nav = document.querySelector(".nav-item[data-page]")?.parentElement;

    if (nav && !document.querySelector(
        '.nav-item[data-page="organizerMapPage"]'
    )) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "nav-item";
        button.dataset.page = "organizerMapPage";

        button.innerHTML = `
            <i class="fa-solid fa-map"></i>
            <span id="organizerMapNavLabel"></span>
        `;

        button.addEventListener("click", () => {
            showPage("organizerMapPage");
        });

        nav.appendChild(button);
    }

    addOrganizerMapStyles();
    updateOrganizerMapLanguage();
}

function updateOrganizerMapLanguage() {
    const labels = {
        organizerMapNavLabel: "nav",
        organizerMapTitle: "title",
        organizerMapSubtitle: "subtitle",
        organizerTotalLabel: "total",
        organizerZonesLabel: "zones",
        organizerPopularLabel: "popular",
        organizerEntrance: "entrance",
        organizerRestZone: "rest",
        organizerSelectText: "select"
    };

    Object.entries(labels).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = omt(key);
    });

    const details = document.getElementById("organizerZoneDetails");

    if (details && !details.dataset.selectedZone) {
        const placeholder = document.getElementById("organizerSelectText");
        if (placeholder) placeholder.textContent = omt("select");
    }
}

function addOrganizerMapStyles() {
    if (document.getElementById("organizerMapStyles")) return;

    const style = document.createElement("style");
    style.id = "organizerMapStyles";

    style.textContent = `
        #organizerMapPage {
            padding: 24px;
        }

        .organizer-map-heading {
            margin-bottom: 22px;
        }

        .organizer-map-heading h2 {
            margin: 10px 0;
            font-size: 27px;
        }

        .organizer-map-heading p {
            color: var(--text-muted, #687386);
        }

        .organizer-map-tag {
            color: var(--primary, #315efb);
            font-size: 11px;
            font-weight: 750;
            letter-spacing: 1.2px;
        }

        .organizer-map-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 22px;
        }

        .organizer-stat {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 13px;
            padding: 17px;
            display: flex;
            flex-direction: column;
            gap: 9px;
            min-width: 0;
        }

        .organizer-stat span {
            color: var(--text-muted, #687386);
            font-size: 13px;
        }

        .organizer-stat strong {
            font-size: 21px;
            overflow-wrap: anywhere;
        }

        .organizer-map-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.6fr) minmax(230px, 0.8fr);
            gap: 18px;
            align-items: start;
        }

        .organizer-map {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 17px;
            padding: 18px;
            display: grid;
            gap: 15px;
        }

        .organizer-entrance,
        .organizer-rest-zone {
            text-align: center;
            padding: 13px;
            border-radius: 10px;
            background: var(--input-bg, #f1f4f9);
            font-size: 12px;
            font-weight: 750;
            letter-spacing: 1px;
        }

        .organizer-zone-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 13px;
        }

        .organizer-zone {
            border: 2px solid transparent;
            border-radius: 13px;
            padding: 17px 12px;
            min-height: 145px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            cursor: pointer;
            text-align: left;
            color: #203047;
            transition: transform .18s, border-color .18s;
        }
        .organizer-zone {
            overflow: hidden;
        }

        .organizer-zone-image {
            width: 100%;
            height: 145px;
            object-fit: cover;
            border-radius: 9px;
            display: block;
            margin-bottom: 8px;
        }

        .organizer-zone strong {
            font-size: 14px;
            line-height: 1.4;
        }

        .organizer-zone small {
            margin-top: 5px;
    }

        .organizer-zone:hover {
            transform: translateY(-2px);
        }

        .organizer-zone.active {
            border-color: var(--primary, #315efb);
        }

        .organizer-zone i {
            font-size: 23px;
        }

        .organizer-zone strong {
            font-size: 14px;
        }

        .organizer-zone small {
            font-size: 12px;
            opacity: .8;
        }

        .organizer-zone.ai { background: #dceaff; }
        .organizer-zone.startup { background: #e1f3e8; }
        .organizer-zone.career { background: #eee5ff; }
        .organizer-zone.robotics { background: #fff0dc; }
        .organizer-zone.web { background: #fbe5ef; }
        .organizer-zone.education { background: #def1f2; }

        .organizer-zone-details {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: 15px;
            padding: 20px;
            min-height: 220px;
        }

        .organizer-detail-placeholder {
            color: var(--text-muted, #687386);
            line-height: 1.6;
        }

        .organizer-detail-icon {
            font-size: 26px;
            margin-bottom: 14px;
        }

        .organizer-detail-count {
            font-size: 30px;
            font-weight: 750;
            margin: 15px 0 5px;
        }

        .organizer-detail-muted {
            color: var(--text-muted, #687386);
            font-size: 13px;
        }

        .organizer-progress {
            height: 9px;
            border-radius: 20px;
            background: var(--input-bg, #edf0f5);
            overflow: hidden;
            margin-top: 12px;
        }

        .organizer-progress > div {
            height: 100%;
            background: var(--primary, #315efb);
            border-radius: inherit;
        }

        @media(max-width: 850px) {
            .organizer-map-layout {
                grid-template-columns: 1fr;
            }
        }

        @media(max-width: 600px) {
            #organizerMapPage {
                padding: 14px;
            }

            .organizer-map-stats {
                grid-template-columns: 1fr;
            }

            .organizer-zone-grid {
                gap: 8px;
            }

            .organizer-zone {
                min-height: 125px;
                padding: 12px 9px;
            }

            .organizer-detail-image {
            width: 100%;
            max-height: 220px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 16px;
            display: block;
            }
        }
    `;

    document.head.appendChild(style);
}

async function loadOrganizerInterestMap() {
    const grid = document.getElementById("organizerZoneGrid");
    if (!grid) return;

    updateOrganizerMapLanguage();
    grid.textContent = omt("loading");

    try {
        const response = await fetch(
            `${API_URL}/organizer/interest-map`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || omt("error"));
        }

        document.getElementById("organizerTotal").textContent =
            result.total_participants ?? 0;

        document.getElementById("organizerZones").textContent =
            result.total_zones ?? 0;

        document.getElementById("organizerPopular").textContent =
            result.most_popular?.name || "—";

        grid.replaceChildren();

        const zones = result.zones || [];

        zones.forEach(zone => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `organizer-zone ${zone.id}`;
            button.dataset.zoneId = zone.id;

            const photo = document.createElement("img");
            photo.className = "organizer-zone-image";
            photo.src = organizerZoneImages[zone.id];
            photo.alt = zone.name;
            photo.loading = "lazy";

            photo.onerror = () => {
                photo.style.display = "none";
            };

            const name = document.createElement("strong");
            name.textContent = zone.name;

            const count = document.createElement("small");
            count.textContent =
                `${zone.participants} · ${omt("participants")}`;

            button.append(photo, name, count);

            button.addEventListener("click", () => {
                document.querySelectorAll(".organizer-zone").forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");
                showOrganizerZoneDetails(zone);
            });

            grid.appendChild(button);
        });

        const details = document.getElementById("organizerZoneDetails");
        details.dataset.selectedZone = "";

        const placeholder = document.createElement("p");
        placeholder.className = "organizer-detail-placeholder";
        placeholder.textContent = omt("select");
        details.replaceChildren(placeholder);

    } catch (error) {
        console.error("Organizer interest map:", error);
        grid.textContent = error.message || omt("error");
    }
}

function showOrganizerZoneDetails(zone) {
    const details = document.getElementById("organizerZoneDetails");
    if (!details) return;

    details.dataset.selectedZone = zone.id;
    details.replaceChildren();

    const photo = document.createElement("img");
    photo.className = "organizer-detail-image";
    photo.src = organizerZoneImages[zone.id];
    photo.alt = zone.name;

    photo.onerror = () => {
    photo.style.display = "none";
    };

    details.appendChild(photo);

    const icon = document.createElement("i");
    icon.className =
        `organizer-detail-icon ${organizerZoneIcons[zone.id] || "fa-solid fa-location-dot"}`;

    const title = document.createElement("h3");
    title.textContent = zone.name;

    const count = document.createElement("div");
    count.className = "organizer-detail-count";
    count.textContent = zone.participants;

    const countLabel = document.createElement("p");
    countLabel.className = "organizer-detail-muted";
    countLabel.textContent = omt("participants");

    const popularity = document.createElement("strong");
    popularity.textContent =
        `${zone.percentage}% · ${omt("popularity")}`;

    const progress = document.createElement("div");
    progress.className = "organizer-progress";

    const fill = document.createElement("div");
    fill.style.width = `${Math.max(0, Math.min(100, zone.percentage))}%`;

    progress.appendChild(fill);

    const empty = document.createElement("p");
    empty.className = "organizer-detail-muted";
    empty.textContent = zone.participants === 0 ? omt("empty") : "";

    details.append(
        icon,
        title,
        count,
        countLabel,
        popularity,
        progress,
        empty
    );
}

