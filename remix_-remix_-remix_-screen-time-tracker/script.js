(function () {
  // --- STATE KEYS ---
  const PROFILES_KEY = "screen_time_student_profiles_v4";
  const ACTIVE_PROFILE_ID_KEY = "screen_time_active_profile_id_v4";

  // --- MOCK DATABASE SEED ---
  const MOCK_PROFILES = [];

  // --- APP STATE ENGINE ---
  let profiles = [];
  let currentProfileId = null;
  let activeAuthTab = "login"; // "login" | "signup"
  let isAdminLoggedIn = false;
  
  // Current submission form holds
  let uploadImageUrl = "";
  let uploadImageName = "";

  // --- INITIALIZE APPLICATION DATA ---
  function initData() {
    const savedProfiles = localStorage.getItem(PROFILES_KEY);
    if (!savedProfiles) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(MOCK_PROFILES));
      profiles = [...MOCK_PROFILES];
    } else {
      profiles = JSON.parse(savedProfiles);
    }
    
    // Filter out mock seed data to make sure no fake accounts remain in existing localStorage
    profiles = profiles.filter(p => !p.id.startsWith("seed-user-"));
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    
    currentProfileId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY) || null;
  }

  function saveToLocalStorage() {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    if (currentProfileId) {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, currentProfileId);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    }
  }

  // --- DOM ELEMENT CACHE ---
  const headerUserBadge = document.getElementById("header-user-badge");
  const brandLogoBtn = document.getElementById("brand-logo-btn");
  const appHeader = document.getElementById("app-header");
  const loginView = document.getElementById("login-view");
  const dashboardView = document.getElementById("dashboard-view");
  
  // Auth view cache
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const authForm = document.getElementById("auth-form");
  const authGrade = document.getElementById("auth-grade");
  const authClass = document.getElementById("auth-class");
  const authNumber = document.getElementById("auth-number");
  const authNameContainer = document.getElementById("auth-name-container");
  const authName = document.getElementById("auth-name");
  const authNicknameContainer = document.getElementById("auth-nickname-container");
  const authNickname = document.getElementById("auth-nickname");
  const authPassword = document.getElementById("auth-password");
  const btnAuthSubmit = document.getElementById("btn-auth-submit");
  const authSubmitLabel = document.getElementById("auth-submit-label");
  const authErrorBox = document.getElementById("auth-error-box");
  const authErrorMsg = document.getElementById("auth-error-msg");

  // Form inputs cache
  const formHours = document.getElementById("form-hours");
  const formMinutes = document.getElementById("form-minutes");
  const formFileInput = document.getElementById("form-file-input");
  const uploaderDropzone = document.getElementById("uploader-dropzone");
  const uploadCompressionStatus = document.getElementById("upload-compression-status");
  const uploaderPreviewArea = document.getElementById("uploader-preview-area");
  const uploadPreviewImg = document.getElementById("upload-preview-img");
  const uploadPreviewFilename = document.getElementById("upload-preview-filename");
  const btnDeleteUploadedImage = document.getElementById("btn-delete-uploaded-image");
  const btnZoomImage = document.getElementById("btn-zoom-image");
  const btnZoomTextArea = document.getElementById("btn-zoom-text-area");
  const formNotes = document.getElementById("form-notes");
  const formErrorBox = document.getElementById("form-error-box");
  const formErrorMsg = document.getElementById("form-error-msg");
  const formSuccessBox = document.getElementById("form-success-box");
  const screentimeForm = document.getElementById("screentime-form");
  const btnResetFormTime = document.getElementById("btn-reset-form-time");

  // Leaderboard panels cache
  const boardUserRankBanner = document.getElementById("board-user-rank-banner");
  const boardUserRankDesc = document.getElementById("board-user-rank-desc");
  const leaderboardList = document.getElementById("leaderboard-list");
  const wellbeingTipsPanel = document.getElementById("wellbeing-tips-panel");
  const wellbeingTipsContainer = document.getElementById("wellbeing-tips-container");

  // Edit User Modal cache
  const modalEditUser = document.getElementById("modal-edit-user");
  const btnEditUser = document.getElementById("btn-edit-user");
  const modalEditClose = document.getElementById("modal-edit-close");
  const btnEditCancel = document.getElementById("btn-edit-cancel");
  const modalEditForm = document.getElementById("modal-edit-form");
  const editGrade = document.getElementById("edit-grade");
  const editClass = document.getElementById("edit-class");
  const editNumber = document.getElementById("edit-number");
  const editName = document.getElementById("edit-name");
  const editNickname = document.getElementById("edit-nickname");
  const editPassword = document.getElementById("edit-password");
  const editErrorBox = document.getElementById("edit-error-box");
  const editErrorMsg = document.getElementById("edit-error-msg");

  // Lightbox Modal cache
  const modalLightbox = document.getElementById("modal-lightbox");
  const lightboxCloseTop = document.getElementById("lightbox-close-top");
  const btnLightboxClose = document.getElementById("btn-lightbox-close");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxFilename = document.getElementById("lightbox-filename");

  // Logout button cache
  const btnLogout = document.getElementById("btn-logout");

  // Admin center elements
  const btnAdminGate = document.getElementById("btn-admin-gate");
  const modalAdminLogin = document.getElementById("modal-admin-login");
  const adminLoginForm = document.getElementById("admin-login-form");
  const adminPasswordInput = document.getElementById("admin-password-input");
  const adminLoginErrorBox = document.getElementById("admin-login-error-box");
  const btnAdminLoginCancel = document.getElementById("btn-admin-login-cancel");
  
  const adminView = document.getElementById("admin-view");
  const btnAdminLogout = document.getElementById("btn-admin-logout");
  const btnAdminRefresh = document.getElementById("btn-admin-refresh");
  const adminUserCount = document.getElementById("admin-user-count");
  const adminUserTableBody = document.getElementById("admin-user-table-body");
  const adminEmptyState = document.getElementById("admin-empty-state");

  // Empty helper reference block


  // --- ROUTE & VIEW CONTROLLER ---
  function renderView() {
    if (isAdminLoggedIn) {
      // Admin Mode: Show admin view, hide everything else.
      appHeader.classList.add("hidden");
      loginView.classList.add("hidden");
      dashboardView.classList.add("hidden");
      adminView.classList.remove("hidden");
      
      renderAdminDatabase();
    } else if (currentProfileId && profiles.some(p => p.id === currentProfileId)) {
      // Logged In: Show dashboard, Header. Hide login screen and admin view.
      loginView.classList.add("hidden");
      adminView.classList.add("hidden");
      appHeader.classList.remove("hidden");
      dashboardView.classList.remove("hidden");
      
      const user = profiles.find(p => p.id === currentProfileId);
      headerUserBadge.innerText = `${user.userInfo.grade}학년 ${user.userInfo.classGroup}반 ${user.userInfo.number}번 학생`;
      
      // Load current entries for form state
      loadActiveEntriesIntoForm(user);
      renderLeaderboard();
      renderDynamicTips(user);
    } else {
      // Logged Out: Show login screen. Hide dashboard, Header and admin view.
      appHeader.classList.add("hidden");
      dashboardView.classList.add("hidden");
      adminView.classList.add("hidden");
      loginView.classList.remove("hidden");
      resetFormInputs();
    }
    
    // Refresh Lucide Icons to capture dynamically rendered elements
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function loadActiveEntriesIntoForm(user) {
    const entries = user.entries || [];
    if (entries.length > 0) {
      const totalMin = entries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
      const avgOverallMin = Math.round(totalMin / entries.length);
      const avgH = Math.floor(avgOverallMin / 60);
      const avgM = Math.round(avgOverallMin % 60);
      
      formHours.value = avgH;
      formMinutes.value = avgM;

      // Find any entry with notes or image
      const noteEntry = entries.find(e => e.notes);
      formNotes.value = noteEntry ? noteEntry.notes : "";

      const imgEntry = entries.find(e => e.imageUrl);
      if (imgEntry && imgEntry.imageUrl) {
        uploadImageUrl = imgEntry.imageUrl;
        uploadImageName = imgEntry.imageName || "screenshot.png";
        displayUploadedImagePreview();
      } else {
        hideUploadedImagePreview();
      }
    } else {
      formHours.value = "3";
      formMinutes.value = "30";
      formNotes.value = "";
      hideUploadedImagePreview();
    }
  }

  function resetFormInputs() {
    formHours.value = "3";
    formMinutes.value = "30";
    formNotes.value = "";
    hideUploadedImagePreview();
    formErrorBox.classList.add("hidden");
    formSuccessBox.classList.add("hidden");
  }

  function displayUploadedImagePreview() {
    uploaderDropzone.classList.add("hidden");
    uploaderPreviewArea.classList.remove("hidden");
    uploadPreviewImg.src = uploadImageUrl;
    uploadPreviewFilename.innerText = uploadImageName;
  }

  function hideUploadedImagePreview() {
    uploadImageUrl = "";
    uploadImageName = "";
    uploaderDropzone.classList.remove("hidden");
    uploaderPreviewArea.classList.add("hidden");
    formFileInput.value = "";
  }

  // --- ADMIN DATABASE RENDERER ---
  function renderAdminDatabase() {
    const userCount = profiles.length;
    adminUserCount.innerText = `총 ${userCount}명`;
    
    if (userCount === 0) {
      adminEmptyState.classList.remove("hidden");
      adminUserTableBody.innerHTML = "";
      return;
    }
    
    adminEmptyState.classList.add("hidden");
    
    let tableHtml = "";
    profiles.forEach(p => {
      const uInfo = p.userInfo || {};
      const gradeText = `${uInfo.grade || "-"}학년`;
      const classText = `${uInfo.classGroup || "-"}반`;
      const numText = `${uInfo.number || "-"}번`;
      const nameText = uInfo.name || "미지정";
      const nickText = uInfo.nickname || uInfo.name || "미지정";
      const pwText = uInfo.password || "없음";
      
      const entries = p.entries || [];
      let timeText = "미작성";
      if (entries.length > 0) {
        const totalMin = entries.reduce((sum, curr) => sum + (curr.hours * 60 + curr.minutes), 0);
        const avgMin = totalMin / entries.length;
        const avgH = Math.floor(avgMin / 60);
        const avgM = Math.round(avgMin % 60);
        timeText = `${avgH}시간 ${avgM}분`;
      }
      
      const hasScreenshot = entries.some(e => e.imageUrl);
      const isVerifiedBadge = hasScreenshot 
        ? `<span class="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">인증 완료</span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full font-bold">미인증</span>`;
        
      tableHtml += `
        <tr class="hover:bg-neutral-850/30 transition-colors">
          <td class="py-3 px-4 font-bold text-neutral-200">${gradeText} ${classText} ${numText}</td>
          <td class="py-3 px-4 font-black text-white text-xs">${nameText} <span class="text-neutral-500 font-normal">(${nickText})</span></td>
          <td class="py-3 px-4 text-center font-mono text-emerald-400/80 font-bold select-all">${pwText}</td>
          <td class="py-3 px-4 text-center text-neutral-200 font-bold">${timeText}</td>
          <td class="py-3 px-4 text-center">${isVerifiedBadge}</td>
          <td class="py-3 px-4 text-right">
            <button class="btn-admin-login-as text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer mr-1.5" data-pid="${p.id}">
              들어가기
            </button>
            <button class="btn-admin-delete-user text-rose-500 hover:text-rose-400 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer" data-pid="${p.id}" data-pname="${gradeText} ${classText} ${numText} ${nameText}">
              삭제
            </button>
          </td>
        </tr>
      `;
    });
    
    adminUserTableBody.innerHTML = tableHtml;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- PROFILE LOGIC ---
  function computeRankings() {
    return profiles.map(p => {
      const entries = p.entries || [];
      const totalMinutes = entries.reduce((sum, curr) => sum + (curr.hours * 60 + curr.minutes), 0);
      const avgMinutes = entries.length > 0 ? totalMinutes / entries.length : 0;
      
      return {
        id: p.id,
        grade: p.userInfo.grade,
        classGroup: p.userInfo.classGroup,
        number: p.userInfo.number,
        name: p.userInfo.name || "학생",
        nickname: p.userInfo.nickname || p.userInfo.name || `${p.userInfo.number}번 학생`,
        avgMinutes,
        totalMinutes,
        entriesCount: entries.length,
        isUser: p.id === currentProfileId
      };
    }).sort((a, b) => a.avgMinutes - b.avgMinutes);
  }

  // --- LEADERBOARD COMPONENT INTERACTIVE ---
  function renderLeaderboard() {
    const sorted = computeRankings();
    
    // Highlight logged-in banner status
    const userIndex = sorted.findIndex(p => p.isUser);
    if (userIndex !== -1 && currentProfileId) {
      boardUserRankBanner.classList.remove("hidden");
      const uAvg = sorted[userIndex].avgMinutes;
      const uH = Math.floor(uAvg / 60);
      const uM = Math.round(uAvg % 60);
      boardUserRankDesc.innerHTML = `전체 <span class="text-emerald-400 font-extrabold text-sm">${userIndex + 1}위</span> (하루 평균 <span class="text-neutral-200 font-bold">${uH}시간 ${uM}분</span> 사용 중)`;
    } else {
      boardUserRankBanner.classList.add("hidden");
    }

    // Render ranks list
    let listHtml = "";
    sorted.forEach((p, idx) => {
      const rank = idx + 1;
      const isUser = p.id === currentProfileId;
      
      const hours = Math.floor(p.avgMinutes / 60);
      const mins = Math.round(p.avgMinutes % 60);
      const formattedAvg = hours === 0 ? `${mins}분` : `${hours}시간 ${mins}분`;

      const badgeHtml = getRankBadgeElementValue(rank);

      listHtml += `
        <div class="flex items-center justify-between p-3 rounded-xl border transition-all ${
          isUser 
            ? "border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/8 font-semibold" 
            : "border-neutral-850/60 bg-neutral-950/20 hover:border-neutral-800 hover:bg-neutral-900/10"
        }">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="shrink-0">
              ${badgeHtml}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold truncate ${isUser ? "text-emerald-400" : "text-neutral-200"}">
                  ${p.nickname}
                </span>
                ${isUser ? `<span class="bg-emerald-500 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded leading-tight">선택됨</span>` : ""}
              </div>
              <div class="flex items-center gap-2 text-[10px] text-neutral-500 font-sans mt-0.5">
                <span>일주일 일과 일괄 설정</span> • 
                <span class="text-neutral-400 font-semibold truncate ${p.totalMinutes > 305 ? "text-rose-455" : "text-emerald-455"}">${formattedAvg} / 일평균</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button class="btn-delete-profile text-neutral-600 hover:text-rose-400 active:scale-95 transition-all cursor-pointer p-1" data-pid="${p.id}" data-pname="${p.nickname}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    });

    leaderboardList.innerHTML = listHtml;

    // Attach click events on dynamic buttons
    document.querySelectorAll(".btn-delete-profile").forEach(btn => {
      btn.addEventListener("click", function (e) {
        const pid = e.currentTarget.getAttribute("data-pid");
        const name = e.currentTarget.getAttribute("data-pname");
        
        if (btn.classList.contains("primed-delete-leaderboard")) {
          // Second click: perform deletion
          profiles = profiles.filter(item => item.id !== pid);
          if (currentProfileId === pid) {
            currentProfileId = null;
          }
          saveToLocalStorage();
          renderView();
        } else {
          // First click: turn indicators to primed red mode
          document.querySelectorAll(".btn-delete-profile").forEach(b => {
            b.classList.remove("primed-delete-leaderboard", "bg-rose-600", "text-white", "rounded-md", "p-1");
            b.classList.add("text-neutral-600", "hover:text-rose-400", "p-1");
          });

          btn.classList.add("primed-delete-leaderboard", "bg-rose-600", "text-white", "rounded-md", "p-1");
          btn.classList.remove("text-neutral-600", "hover:text-rose-400");
          
          btn.title = "한 번 더 누르면 영구 삭제됩니다!";
          
          // Reset after 3.5 seconds
          setTimeout(() => {
            if (btn && btn.classList.contains("primed-delete-leaderboard")) {
              btn.classList.remove("primed-delete-leaderboard", "bg-rose-600", "text-white", "rounded-md");
              btn.classList.add("text-neutral-600", "hover:text-rose-400");
              btn.title = "";
            }
          }, 3500);
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function getRankBadgeElementValue(rank) {
    if (rank === 1) {
      return `
        <div class="w-6 h-6 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-500 flex items-center justify-center font-bold text-xs" title="1등 금메달">
          🥇
        </div>
      `;
    }
    if (rank === 2) {
      return `
        <div class="w-6 h-6 rounded-full bg-slate-400/15 border border-slate-400/30 text-slate-300 flex items-center justify-center font-bold text-xs" title="2등 은메달">
          🥈
        </div>
      `;
    }
    if (rank === 3) {
      return `
        <div class="w-6 h-6 rounded-full bg-amber-600/15 border border-amber-600/30 text-amber-500 flex items-center justify-center font-bold text-xs" title="3등 동메달">
          🥉
        </div>
      `;
    }
    return `
      <div class="w-6 h-6 rounded-full bg-neutral-850 border border-neutral-800 text-neutral-500 flex items-center justify-center font-mono text-[9px] font-bold">
        ${rank}
      </div>
    `;
  }

  // --- DYNAMIC WELLBEING ADVICES ---
  function renderDynamicTips(user) {
    if (!wellbeingTipsPanel || !wellbeingTipsContainer) return;
    const entries = user.entries || [];
    if (entries.length === 0) {
      wellbeingTipsPanel.classList.add("hidden");
      return;
    }

    wellbeingTipsPanel.classList.remove("hidden");
    const totalMin = entries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
    const avgMinutes = totalMin / entries.length;

    const isHighUsage = avgMinutes > 5 * 60; // 5 hours+
    const isModerateUsage = avgMinutes >= 3 * 60 && avgMinutes <= 5 * 60;

    const tips = [];
    if (isHighUsage) {
      tips.push({
        title: "소셜 미디어 및 유튜브 중독 방지 타이머",
        desc: "인스타그램이나 틱톡 앱에 일별 사용 타이머를 설정하여 오랜 시간 동안 자극적 숏폼 미디어에 도파민이 지배되는 것을 보호하세요.",
        icon: "brain-circuit"
      });
      tips.push({
        title: "20-20 시력 및 망막 안구 보호",
        desc: "스마트 기기 화면 사용 20분마다 20초간 먼 외측의 초록색 자연 조경물이나 건물 벽면을 응시하여 안구 건조와 안구 긴장을 조절하세요.",
        icon: "shield-check"
      });
    } else if (isModerateUsage) {
      tips.push({
        title: "불필요한 인앱 알림의 소음화 방지",
        desc: "소리나 진동 등 방해 알림 채널은 무음으로 일괄 전환해 두며, 오직 필요할 때에만 목적형으로 스마트폰을 켜는 약속을 실천하십시오.",
        icon: "shield-check"
      });
      tips.push({
        title: "취침 전 청색광 도파민 클리어",
        desc: "잠들기 30분 전 자극 광선은 수면 호르몬인 멜라토닌 정상 생성을 중단합니다. 침대와 휴대폰 보관 거리를 늘리세요.",
        icon: "moon"
      });
    }

    // Common seed tips default
    tips.push({
      title: "물리적 공간 격리를 통한 도파민 세척",
      desc: "휴대폰 기기를 가방이나 먼 보관함 등 시야 밖 멀리 두세요. 화면과의 불필요한 접근성이 차단될수록 자유 탐구 및 두뇌 집중 시간은 껑충뜁니다.",
      icon: "check-circle-2"
    });

    let tipsHtml = "";
    tips.forEach(t => {
      const iconName = t.icon || "check-circle-2";
      tipsHtml += `
        <div class="bg-neutral-950/40 border border-neutral-850/60 p-3 rounded-xl flex items-start gap-2.5 hover:border-neutral-800 transition-all">
          <div class="mt-0.5 text-emerald-400 shrink-0">
            <i data-lucide="${iconName}" class="w-4 h-4"></i>
          </div>
          <div>
            <h4 class="font-extrabold text-white text-[11px] tracking-tight leading-snug">${t.title}</h4>
            <p class="text-[10px] text-neutral-400 font-sans leading-relaxed mt-0.5">${t.desc}</p>
          </div>
        </div>
      `;
    });

    wellbeingTipsContainer.innerHTML = tipsHtml;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- COMPRESS IMAGE UTILITY ---
  function processAndCompressFile(file) {
    if (!file.type.startsWith("image/")) {
      showFormError("이미지 형태의 스크린샷 증명 파일만 업로드할 수 있습니다.");
      return;
    }

    // [SPEED OPTIMIZATION 1] Instant visual feedback using a local object URL (0ms latency!)
    const tempUrl = URL.createObjectURL(file);
    uploadImageUrl = tempUrl;
    uploadImageName = file.name;
    displayUploadedImagePreview();

    uploadCompressionStatus.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      초고속 이미지 최적화 중...
    `;
    uploadCompressionStatus.classList.remove("hidden");

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // [SPEED OPTIMIZATION 2] Downscale max width from 800 to 600 for faster canvas composition & lightweight LocalStorage
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // [SPEED OPTIMIZATION 3] Set JPEG quality to 0.6 for ultra-fast base64 encoding and minimized storage footprints
          const base64Str = canvas.toDataURL("image/jpeg", 0.6);
          uploadImageUrl = base64Str;
          uploadImageName = file.name;
          
          // Smooth swap of raw content to highly optimized base64
          uploadPreviewImg.src = uploadImageUrl;

          // Free temporary DOM memory allocation
          URL.revokeObjectURL(tempUrl);
          
          uploadCompressionStatus.innerText = "초고속 최적화 완료!";
          setTimeout(() => {
            uploadCompressionStatus.classList.add("hidden");
          }, 800);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    clearFormError();
  }

  function showFormError(msg) {
    formErrorMsg.innerText = msg;
    formErrorBox.classList.remove("hidden");
    formSuccessBox.classList.add("hidden");
  }

  function clearFormError() {
    formErrorBox.classList.add("hidden");
  }


  // --- ATTACH EVENT LISTENERS ---
  function registerEvents() {
    
    // Auth Tabs switcher
    tabLogin.addEventListener("click", function () {
      activeAuthTab = "login";
      tabLogin.classList.remove("text-neutral-400");
      tabLogin.classList.add("bg-neutral-900", "text-white");
      tabSignup.classList.remove("bg-neutral-900", "text-white");
      tabSignup.classList.add("text-neutral-400");
      
      authNameContainer.classList.add("hidden");
      authNicknameContainer.classList.add("hidden");
      authSubmitLabel.innerText = "로그인 완료";
      authErrorBox.classList.add("hidden");
    });

    tabSignup.addEventListener("click", function () {
      activeAuthTab = "signup";
      tabSignup.classList.remove("text-neutral-400");
      tabSignup.classList.add("bg-neutral-900", "text-white");
      tabLogin.classList.remove("bg-neutral-900", "text-white");
      tabLogin.classList.add("text-neutral-400");
      
      authNameContainer.classList.remove("hidden");
      authNicknameContainer.classList.remove("hidden");
      authSubmitLabel.innerText = "새로운 계정 등록 완료";
      authErrorBox.classList.add("hidden");
    });

    // Auth Form Logic
    authForm.addEventListener("submit", function (e) {
      e.preventDefault();
      authErrorBox.classList.add("hidden");

      const gStr = authGrade.value.trim();
      const cStr = authClass.value.trim();
      const nStr = authNumber.value.trim();
      const pass = authPassword.value.trim();
      const fullName = authName.value.trim();

      if (!gStr || !cStr || !nStr || !pass) {
        authErrorMsg.innerText = "모든 속성 입력값들을 기입해 주십시오.";
        authErrorBox.classList.remove("hidden");
        return;
      }

      if (pass.length < 4) {
        authErrorMsg.innerText = "보안 비밀번호는 4자리 이상으로 한정됩니다.";
        authErrorBox.classList.remove("hidden");
        return;
      }

      const foundIndex = profiles.findIndex(
        p => p.userInfo.grade === gStr && p.userInfo.classGroup === cStr && p.userInfo.number === nStr
      );

      if (activeAuthTab === "signup") {
        const nick = authNickname.value.trim();
        if (!fullName) {
          authErrorMsg.innerText = "이름을 올바르게 기재해 주십시오 (Leaderboard에는 노출되지 않습니다).";
          authErrorBox.classList.remove("hidden");
          return;
        }

        if (!nick) {
          authErrorMsg.innerText = "랭킹에 표시될 닉네임을 입력해 주십시오.";
          authErrorBox.classList.remove("hidden");
          return;
        }

        if (foundIndex !== -1) {
          authErrorMsg.innerText = "이미 동일 학년, 반, 번호로 등록된 학생이 대시보드에 존재합니다.";
          authErrorBox.classList.remove("hidden");
          return;
        }

        // SignUp New User
        const newId = `user-${Date.now()}`;
        const templateEntries = [
          { id: `${newId}-1`, date: "2026-06-21", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-2`, date: "2026-06-22", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-3`, date: "2026-06-23", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-4`, date: "2026-06-24", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-5`, date: "2026-06-25", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-6`, date: "2026-06-26", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
          { id: `${newId}-7`, date: "2026-06-27", hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" }
        ];

        const newUser = {
          id: newId,
          userInfo: { grade: gStr, classGroup: cStr, number: nStr, name: fullName, nickname: nick, password: pass },
          entries: templateEntries
        };

        profiles.push(newUser);
        currentProfileId = newId;
        saveToLocalStorage();
        
        // Reset inputs
        authNumber.value = "";
        authName.value = "";
        authNickname.value = "";
        authPassword.value = "";

        renderView();
      } else {
        // Login Processing
        if (foundIndex === -1) {
          authErrorMsg.innerText = "가입되어 있지 않은 학년/반/번호 정보입니다. 먼저 가입해주세요.";
          authErrorBox.classList.remove("hidden");
          return;
        }

        const matchUser = profiles[foundIndex];
        if (matchUser.userInfo.password !== pass) {
          authErrorMsg.innerText = "비밀번호 자릿수가 불일치하거나 패스워드가 다릅니다.";
          authErrorBox.classList.remove("hidden");
          return;
        }

        currentProfileId = matchUser.id;
        saveToLocalStorage();
        authNumber.value = "";
        authPassword.value = "";

        renderView();
      }
    });

    // Logout trigger
    if (btnLogout) {
      btnLogout.addEventListener("click", function () {
        currentProfileId = null;
        localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
        renderView();
      });
    }

    // Brand logo click trigger to return to login directly
    document.addEventListener("click", function (e) {
      const targetLogo = e.target && (e.target.id === "brand-logo-btn" || e.target.closest("#brand-logo-btn"));
      if (targetLogo) {
        currentProfileId = null;
        localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
        renderView();
      }
    });

    // Form Dropdowns triggers (automatic reset preset values)
    btnResetFormTime.addEventListener("click", function () {
      formHours.value = "3";
      formMinutes.value = "30";
      clearFormError();
    });

    // Image Upload triggers
    uploaderDropzone.addEventListener("click", function () {
      formFileInput.click();
    });

    formFileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        processAndCompressFile(file);
      }
    });

    // Drag-And-Drop support on Dropzone
    uploaderDropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      uploaderDropzone.classList.remove("border-neutral-800");
      uploaderDropzone.classList.add("border-emerald-500", "bg-emerald-500/5");
    });

    uploaderDropzone.addEventListener("dragleave", function () {
      uploaderDropzone.classList.add("border-neutral-800");
      uploaderDropzone.classList.remove("border-emerald-500", "bg-emerald-500/5");
    });

    uploaderDropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploaderDropzone.classList.add("border-neutral-800");
      uploaderDropzone.classList.remove("border-emerald-500", "bg-emerald-500/5");
      
      const file = e.dataTransfer.files[0];
      if (file) {
        processAndCompressFile(file);
      }
    });

    btnDeleteUploadedImage.addEventListener("click", function () {
      hideUploadedImagePreview();
    });

    // Form Submission Log Entries
    screentimeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormError();
      formSuccessBox.classList.add("hidden");

      if (!uploadImageUrl) {
        showFormError("스마트폰 주간 보고서 평균 수치 증명 스크린샷 첨부 사진이 필수로 인가되어야 기록 제출이 완료됩니다.");
        return;
      }

      const hrs = parseInt(formHours.value, 10) || 0;
      const mins = parseInt(formMinutes.value, 10) || 0;
      const notesVal = formNotes.value.trim();

      // Find user and rewrite all entries
      const uIndex = profiles.findIndex(p => p.id === currentProfileId);
      if (uIndex !== -1) {
        const user = profiles[uIndex];
        const updatedEntries = (user.entries || []).map(item => {
          return {
            ...item,
            hours: hrs,
            minutes: mins,
            notes: notesVal || "하루 평균 스크린타임 기록 완료",
            imageUrl: uploadImageUrl,
            imageName: uploadImageName || "screenshot.jpg"
          };
        });

        profiles[uIndex].entries = updatedEntries;
        saveToLocalStorage();
        
        formSuccessBox.classList.remove("hidden");
        setTimeout(() => {
          formSuccessBox.classList.add("hidden");
        }, 4000);

        renderView();
      }
    });

    // Modal Edit actions
    if (btnEditUser) {
      btnEditUser.addEventListener("click", function () {
        const user = profiles.find(p => p.id === currentProfileId);
        if (user) {
          editGrade.value = user.userInfo.grade;
          editClass.value = user.userInfo.classGroup;
          editNumber.value = user.userInfo.number;
          editName.value = user.userInfo.name || "";
          editNickname.value = user.userInfo.nickname || user.userInfo.name || "";
          editPassword.value = "";
          
          editErrorBox.classList.add("hidden");
          modalEditUser.classList.remove("hidden");
        }
      });
    }

    // Close triggers Modal Edit
    const closeEditModal = () => {
      modalEditUser.classList.add("hidden");
    };
    modalEditClose.addEventListener("click", closeEditModal);
    btnEditCancel.addEventListener("click", closeEditModal);

    modalEditForm.addEventListener("submit", function (e) {
      e.preventDefault();
      editErrorBox.classList.add("hidden");

      const g = editGrade.value.trim();
      const c = editClass.value.trim();
      const n = editNumber.value.trim();
      const fullName = editName.value.trim();
      const nick = editNickname.value.trim();
      const newPass = editPassword.value.trim();

      if (!g || !c || !n || !fullName || !nick) {
        editErrorMsg.innerText = "사용자 필수 정보들을 빠짐없이 기재하세요.";
        editErrorBox.classList.remove("hidden");
        return;
      }

      if (newPass && newPass.length < 4) {
        editErrorMsg.innerText = "안전을 위한 패스워드는 최소 4자 이상이어야 합니다.";
        editErrorBox.classList.remove("hidden");
        return;
      }

      // Check duplicate grade/class/number with other profiles
      const isDuplicate = profiles.some(p => 
        p.id !== currentProfileId &&
        p.userInfo.grade === g &&
        p.userInfo.classGroup === c &&
        p.userInfo.number === n
      );

      if (isDuplicate) {
        editErrorMsg.innerText = "동일 학급 내 동일 고유 번호를 가진 학생이 이미 대시보드에 존재합니다.";
        editErrorBox.classList.remove("hidden");
        return;
      }

      // Save Profile Edit
      const uIndex = profiles.findIndex(p => p.id === currentProfileId);
      if (uIndex !== -1) {
        profiles[uIndex].userInfo.grade = g;
        profiles[uIndex].userInfo.classGroup = c;
        profiles[uIndex].userInfo.number = n;
        profiles[uIndex].userInfo.name = fullName;
        profiles[uIndex].userInfo.nickname = nick;
        if (newPass) {
          profiles[uIndex].userInfo.password = newPass;
        }

        saveToLocalStorage();
        closeEditModal();
        renderView();
      }
    });

    // Lightbox Modal actions
    const openLightbox = () => {
      if (uploadImageUrl) {
        lightboxImg.src = uploadImageUrl;
        lightboxFilename.innerText = uploadImageName || "screenshot.png";
        modalLightbox.classList.remove("hidden");
      }
    };
    btnZoomImage.addEventListener("click", openLightbox);
    btnZoomTextArea.addEventListener("click", openLightbox);

    const closeLightbox = () => {
      modalLightbox.classList.add("hidden");
    };
    lightboxCloseTop.addEventListener("click", closeLightbox);
    btnLightboxClose.addEventListener("click", closeLightbox);
    modalLightbox.addEventListener("click", closeLightbox);

    // --- ADMIN CENTER PORTAL EVENTS ---
    if (btnAdminGate) {
      btnAdminGate.addEventListener("click", function () {
        adminPasswordInput.value = "";
        adminLoginErrorBox.classList.add("hidden");
        modalAdminLogin.classList.remove("hidden");
      });
    }

    if (btnAdminLoginCancel) {
      btnAdminLoginCancel.addEventListener("click", function () {
        modalAdminLogin.classList.add("hidden");
      });
    }

    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        adminLoginErrorBox.classList.add("hidden");
        
        const pw = adminPasswordInput.value.trim();
        const correctPw = localStorage.getItem("screen_time_admin_password_v4") || "resfej40#452";
        if (pw === correctPw) {
          isAdminLoggedIn = true;
          modalAdminLogin.classList.add("hidden");
          adminPasswordInput.value = "";
          renderView();
        } else {
          adminLoginErrorBox.classList.remove("hidden");
        }
      });
    }

    if (btnAdminLogout) {
      btnAdminLogout.addEventListener("click", function () {
        isAdminLoggedIn = false;
        renderView();
      });
    }

    if (btnAdminRefresh) {
      btnAdminRefresh.addEventListener("click", function () {
        renderAdminDatabase();
      });
    }

    // Dynamic event delegation for Admin View actions
    if (adminUserTableBody) {
      adminUserTableBody.addEventListener("click", function (e) {
        // 1. Enter profile action
        const loginAsBtn = e.target.closest(".btn-admin-login-as");
        if (loginAsBtn) {
          const pid = loginAsBtn.getAttribute("data-pid");
          currentProfileId = pid;
          isAdminLoggedIn = false;
          saveToLocalStorage();
          renderView();
          return;
        }


        // 2. Delete profile action
        const deleteBtn = e.target.closest(".btn-admin-delete-user");
        if (deleteBtn) {
          const pid = deleteBtn.getAttribute("data-pid");
          const pname = deleteBtn.getAttribute("data-pname");
          
          if (deleteBtn.classList.contains("primed-delete")) {
            // Second click: perform the deletion
            profiles = profiles.filter(pd => pd.id !== pid);
            if (currentProfileId === pid) {
              currentProfileId = null;
            }
            saveToLocalStorage();
            renderAdminDatabase();
          } else {
            // First click: turn to confirmation mode
            document.querySelectorAll(".btn-admin-delete-user").forEach(b => {
              b.classList.remove("primed-delete", "bg-rose-600", "text-white");
              b.classList.add("text-rose-500", "bg-rose-500/10");
              b.innerText = "삭제";
            });

            deleteBtn.classList.add("primed-delete", "bg-rose-600", "text-white");
            deleteBtn.classList.remove("text-rose-500", "bg-rose-500/10");
            deleteBtn.innerText = "진짜삭제?";

            // Auto-revert back if inactive for 3.5 seconds
            setTimeout(() => {
              if (deleteBtn && deleteBtn.classList.contains("primed-delete") && deleteBtn.innerText === "진짜삭제?") {
                deleteBtn.classList.remove("primed-delete", "bg-rose-600", "text-white");
                deleteBtn.classList.add("text-rose-500", "bg-rose-500/10");
                deleteBtn.innerText = "삭제";
              }
            }, 3500);
          }
          return;
        }
      });
    }


  }

  // --- BOOTSTRAP ---
  document.addEventListener("DOMContentLoaded", function () {
    initData();
    registerEvents();
    renderView();
  });

})();
