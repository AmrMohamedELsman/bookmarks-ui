



// استيراد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, child, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 🔥 إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBo5aDr2m14hok9Nrt1TyWP8h-vszLiBOE",
    authDomain: "bookmarks-b99bd.firebaseapp.com",
    databaseURL: "https://bookmarks-b99bd-default-rtdb.firebaseio.com",
    projectId: "bookmarks-b99bd",
    storageBucket: "bookmarks-b99bd.appspot.com",
    messagingSenderId: "73882925379",
    appId: "1:73882925379:web:172e69d5f96043467d57f6"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ تحديد عناصر HTML
const bookmarksDiv = document.querySelector(".bookmarks");
const categorySuggestionsContainer = document.querySelector(".category-suggestions div");
const categoryInput = document.querySelector(".category");
const categoryButtonsContainer = document.querySelector(".category-buttons div");

// ✅ حفظ إشارة مرجعية جديدة
window.saveBookmark = saveBookmark;
async function saveBookmark() {
    let title = document.querySelector(".title").value.trim();
    let url = document.querySelector(".url").value.trim();
    let category = document.querySelector(".category").value.trim();

    if (!title || !url || !category) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const newBookmarkRef = push(ref(db, "bookmarks")); // إنشاء مرجع لمكان التخزين
        await set(newBookmarkRef, { title, url, category }); // حفظ البيانات
        document.querySelectorAll("input").forEach(ele => ele.value = "");
        updateUI();
    } catch (error) {
        alert("Error saving bookmark: " + error.message);
    }
}

// ✅ عرض كل الإشارات المرجعية
async function displayBookmarks() {
    const bookmarksRef = ref(db, "bookmarks");
    bookmarksDiv.innerHTML = "";

    get(bookmarksRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                let bookmark = childSnapshot.val();
                let bookmarkElement = document.createElement("div");
                bookmarkElement.innerHTML = `
                    <div class="cat">${bookmark.category}</div>
                    <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
                    <button onclick="deleteBookmark('${childSnapshot.key}')">Delete</button>
                `;
                bookmarksDiv.appendChild(bookmarkElement);
            });
        } else {
            bookmarksDiv.innerHTML = "<p>No bookmarks found.</p>";
        }
    }).catch((error) => {
        console.error("Error fetching bookmarks: ", error);
    });
}

// ✅ عرض الفئات كأزرار
async function displayCategoryButtons() {
    const bookmarksRef = ref(db, "bookmarks");
    let categories = new Set();

    get(bookmarksRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                categories.add(childSnapshot.val().category);
            });

            categoryButtonsContainer.innerHTML = "";

            // ✅ زر "إظهار الكل"
            const allButton = document.createElement("span");
            allButton.textContent = "Show All";
            allButton.classList.add("active");
            allButton.addEventListener("click", async function () {
                await updateUI();
                document.querySelectorAll(".category-buttons span").forEach(button => button.classList.remove("active"));
                this.classList.add("active");
            });
            categoryButtonsContainer.appendChild(allButton);

            // ✅ أزرار الفئات
            categories.forEach(category => {
                const categoryElement = document.createElement("span");
                categoryElement.textContent = category;
                categoryElement.addEventListener("click", async function () {
                    await filterBookmarksByCategory(category);
                });
                categoryButtonsContainer.appendChild(categoryElement);
            });
        }
    }).catch((error) => {
        console.error("Error fetching categories: ", error);
    });
}

// ✅ تصفية الإشارات المرجعية حسب الفئة
async function filterBookmarksByCategory(category) {
    const bookmarksRef = ref(db, "bookmarks");

    get(bookmarksRef).then((snapshot) => {
        bookmarksDiv.innerHTML = "";

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                let bookmark = childSnapshot.val();
                if (bookmark.category === category) {
                    let bookmarkElement = document.createElement("div");
                    bookmarkElement.innerHTML = `
                        <div class="cat">${bookmark.category}</div>
                        <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
                        <button onclick="deleteBookmark('${childSnapshot.key}')">Delete</button>
                    `;
                    bookmarksDiv.appendChild(bookmarkElement);
                }
            });
        } else {
            bookmarksDiv.innerHTML = "<p>No bookmarks found.</p>";
        }
    }).catch((error) => {
        console.error("Error filtering bookmarks: ", error);
    });

    // ✅ تحديث الزر النشط
    document.querySelectorAll(".category-buttons span").forEach(button => button.classList.remove("active"));
    document.querySelector(`[data-category="${category}"]`)?.classList.add("active");
}

// ✅ حذف إشارة مرجعية
async function deleteBookmark(id) {
    try {
        await remove(ref(db, `bookmarks/${id}`));
        updateUI();
    } catch (error) {
        alert("Failed to delete bookmark: " + error.message);
    }
}

// ✅ تحديث الواجهة
async function updateUI() {
    await displayBookmarks();
    await displayCategoryButtons();
}

updateUI();

