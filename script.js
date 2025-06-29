// --- 定数 ---
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const statusFilter = document.getElementById("statusFilter");
const typeFilter = document.getElementById("typeFilter");

const catMessages = ["やったニャ", "お疲れニャ", "頑張ったニャ", "いい調子だニャ", "大したものニャ"];
const catImages = [
  "assets/cats/cat1.jpg",
  "assets/cats/cat2.jpg",
  "assets/cats/cat3.jpg",
  "assets/cats/cat4.jpg",
  "assets/cats/cat5.jpg"
];

// --- 削除確認 ---
let deleteTargetId = null;

// --- イベントリスナー ---
taskForm.addEventListener("submit", addTask);
statusFilter.addEventListener("change", renderTasks);
typeFilter.addEventListener("change", renderTasks);

// --- タスク追加 ---
function addTask(e) {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const type = document.getElementById("taskType").value;

  if (!name || !dueDate || !type) return;

  const task = {
    id: Date.now(),
    name,
    dueDate,
    type,
    completed: false
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  taskForm.reset();
  renderTasks();
}

// --- タスク保存＆取得 ---
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// --- タスク表示 ---
function renderTasks() {
  const tasks = getTasks();
  const status = statusFilter.value;
  const type = typeFilter.value;

  taskList.innerHTML = "";

  // 並び替え（〆切順）
  const sorted = tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  sorted.forEach(task => {
    if (
      (status === "incomplete" && task.completed) ||
      (status === "complete" && !task.completed) ||
      (type !== "all" && task.type !== type)
    ) return;

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    // チェックボックス
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "form-check-input me-2";
    checkbox.addEventListener("change", () => toggleComplete(task.id));

    // --- 種類に応じてタグクラスを決定 ---
    let tagClass = "";
    switch (task.type) {
      case "仕事":
        tagClass = "tag-work";
        break;
      case "家事":
        tagClass = "tag-home";
        break;
      case "資格勉強":
        tagClass = "tag-study";
        break;
      default:
        tagClass = "tag-other";
    }

    // --- 内容表示をタグ付きで表示 ---
    const info = document.createElement("div");
    info.className = "flex-grow-1";
    info.innerHTML = `
      <strong>${task.name}</strong><br>
      <small>${task.dueDate}</small>
      <span class="task-tag ${tagClass} ms-2">${task.type}</span>
    `;



    // 状態に応じた見た目
    if (task.completed) {
      li.classList.add("task-completed");
    } else if (new Date(task.dueDate) < new Date()) {
      li.classList.add("task-overdue");
    }

    // 編集・削除ボタン
    const btnGroup = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.className = "btn btn-sm btn-custom me-2";
    editBtn.addEventListener("click", () => editTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.addEventListener("click", () => confirmDelete(task.id));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btnGroup);
    taskList.appendChild(li);
  });
}

// --- タスク完了切替 ---
function toggleComplete(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks(tasks);
  showCatModal();
  renderTasks();
}

// --- モーダル表示 ---
function showCatModal() {
  const img = catImages[Math.floor(Math.random() * catImages.length)];
  const msg = catMessages[Math.floor(Math.random() * catMessages.length)];
  document.getElementById("catImage").src = img;
  document.getElementById("catMessage").textContent = msg;

  const modal = new bootstrap.Modal(document.getElementById("catModal"));
  modal.show();

  setTimeout(() => modal.hide(), 2000);
}

// --- 編集機能（再入力で上書き）---
function editTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);

  // フォームに既存値をセット
  document.getElementById("editTaskId").value = task.id;
  document.getElementById("editName").value = task.name;
  document.getElementById("editDueDate").value = task.dueDate;
  document.getElementById("editType").value = task.type;

  // モーダル表示
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

document.getElementById("saveEditBtn").addEventListener("click", () => {
  const id = Number(document.getElementById("editTaskId").value);
  const name = document.getElementById("editName").value.trim();
  const dueDate = document.getElementById("editDueDate").value;
  const type = document.getElementById("editType").value;

  if (!name || !dueDate || !type) return;

  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  task.name = name;
  task.dueDate = dueDate;
  task.type = type;

  saveTasks(tasks);
  renderTasks();

  // モーダル閉じる
  const modalEl = document.getElementById("editModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();
});



// --- 削除確認 ---
function confirmDelete(id) {
  deleteTargetId = id;

  // 固定画像と固定メッセージ
  document.getElementById("deleteCatImage").src = "assets/cats/delete_cat.jpg";
  document.getElementById("deleteMessage").textContent = "本当に消すんだニャ？";

  // モーダル表示
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  deleteModal.show();
}

// --- 削除ボタンのイベントリスナー ---
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  if (deleteTargetId !== null) {
    const tasks = getTasks().filter(t => t.id !== deleteTargetId);
    saveTasks(tasks);
    renderTasks();

    // モーダル閉じる
    const modalEl = document.getElementById("deleteModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // 初期化
    deleteTargetId = null;
  }
});


// 初期表示
renderTasks();
