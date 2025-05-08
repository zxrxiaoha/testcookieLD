// IndexedDB 相关操作
let db;
const dbName = "CLD";

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = (event) => {
            console.error("数据库错误：", event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains("users")) {
                db.createObjectStore("users", { keyPath: "username" });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
            loadSavedData();
        };
    });
}

// 初始化数据库
initDB().catch(error => console.error("数据库初始化失败：", error));

// 表单提交处理
document.getElementById("indexedDBForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        if (!db) {
            await initDB();
        }
        const username = document.getElementById("indexedDB-username").value;
        const password = document.getElementById("indexedDB-password").value;

        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");
        const request = store.put({ username, password });
        request.onsuccess = () => {
            alert("IndexedDB 登录信息已保存！");
        };

        request.onerror = (event) => {
            console.error("Error saving data:", event.target.error);
            alert("保存失败，请重试");
        };
    } catch (error) {
        console.error("Transaction error:", error);
        alert("操作失败，请重试");
    }
});

document.getElementById("localStorageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("localStorage-username").value;
    const password = document.getElementById("localStorage-password").value;

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    alert("LocalStorage 登录信息已保存！");
});

document.getElementById("cookieForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("cookie-username").value;
    const password = document.getElementById("cookie-password").value;

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 20);
    
    document.cookie = `username=${username}; expires=${expirationDate.toUTCString()}; path=/`;
    document.cookie = `password=${password}; expires=${expirationDate.toUTCString()}; path=/`;

    alert("Cookie 登录信息已保存！");
});

// Function to load saved data
function loadSavedData() {
    // 读取 LocalStorage 数据
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    if (savedUsername) {
        document.getElementById("localStorage-username").value = savedUsername;
        document.getElementById("localStorage-password").value = savedPassword;
    }

    // 读取 Cookie 数据
    document.cookie.split(";").forEach(cookie => {
        const [key, value] = cookie.trim().split("=");
        if (key === "username") {
            document.getElementById("cookie-username").value = value;
        }
        if (key === "password") {
            document.getElementById("cookie-password").value = value;
        }
    });

    // 读取 IndexedDB 数据
    try {
        if (db && db.objectStoreNames.contains("users")) {
            const transaction = db.transaction(["users"], "readonly");
            const store = transaction.objectStore("users");
            const request = store.getAll();

            request.onsuccess = () => {
                if (request.result.length > 0) {
                    const lastUser = request.result[request.result.length - 1];
                    document.getElementById("indexedDB-username").value = lastUser.username;
                    document.getElementById("indexedDB-password").value = lastUser.password;
                }
            };
        }
    } catch (error) {
        console.error("Error loading IndexedDB data:", error);
    }
}